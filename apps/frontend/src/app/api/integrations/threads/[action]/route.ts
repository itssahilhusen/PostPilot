import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EncryptionHelper } from "@reerts/helpers";
import { auth } from "@/lib/auth";
import { rawPrisma } from "@/lib/prisma";

const cookie = "postpilot_threads_state";
const callbackPath = "/api/integrations/threads/callback";
const stateKey = (state: string) => "threads:" + createHash("sha256").update(state).digest("hex");
async function graph(url: URL, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, { ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Threads authorization failed");
  return response.json();
}

export async function GET(req: NextRequest, { params }: { params: { action: string } }) {
  const origin = process.env.BETTER_AUTH_URL || req.nextUrl.origin;
  const back = (result: string) => {
    const response = NextResponse.redirect(new URL("/calendar?threads=" + result, origin));
    response.cookies.set(cookie, "", { path: callbackPath, maxAge: 0 });
    return response;
  };
  const clientId = process.env.THREADS_APP_ID;
  const secret = process.env.THREADS_APP_SECRET;
  if (!clientId || !secret || (process.env.ENCRYPTION_SECRET || "").length < 32) return back("unconfigured");
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user.id) return back("denied");
    const user = await rawPrisma.user.findUnique({ where: { id: session.user.id }, select: { workspaceId: true, role: true } });
    if (!user?.workspaceId || !["OWNER", "ADMIN"].includes(user.role)) return back("denied");
    const owner = JSON.stringify([session.user.id, user.workspaceId]);
    const redirect = new URL(callbackPath, origin).href;
    if (params.action === "connect") {
      const state = randomBytes(32).toString("base64url");
      await rawPrisma.verification.create({ data: { identifier: stateKey(state), value: owner, expiresAt: new Date(Date.now() + 600000) } });
      const url = new URL("https://threads.com/oauth/authorize");
      url.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirect, response_type: "code", scope: "threads_basic,threads_content_publish", state }).toString();
      const response = NextResponse.redirect(url);
      response.cookies.set(cookie, state, { httpOnly: true, secure: redirect.startsWith("https:"), sameSite: "lax", maxAge: 600, path: callbackPath });
      return response;
    }
    if (params.action !== "callback") return NextResponse.json({ error: "Unknown action" }, { status: 404 });
    const state = req.nextUrl.searchParams.get("state");
    if (!state || state !== req.cookies.get(cookie)?.value) return back("denied");
    const consumed = await rawPrisma.verification.deleteMany({ where: { identifier: stateKey(state), value: owner, expiresAt: { gt: new Date() } } });
    const code = req.nextUrl.searchParams.get("code");
    if (consumed.count !== 1 || !code) return back("denied");
    const short = z.object({ access_token: z.string().min(1) }).parse(await graph(new URL("https://graph.threads.com/oauth/access_token"), {
      method: "POST", body: new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, client_secret: secret, redirect_uri: redirect, code }),
    }));
    const exchange = new URL("https://graph.threads.com/access_token");
    exchange.search = new URLSearchParams({ grant_type: "th_exchange_token", client_secret: secret, access_token: short.access_token }).toString();
    const long = z.object({ access_token: z.string().min(1), expires_in: z.number().positive() }).parse(await graph(exchange));
    const profile = z.object({ id: z.string().regex(/^\d+$/), username: z.string().min(1) }).parse(await graph(new URL("https://graph.threads.com/v1.0/me?fields=id,username"), { headers: { Authorization: "Bearer " + long.access_token } }));
    const identity = { workspaceId: user.workspaceId, provider: "threads", handle: profile.id };
    const data = { name: "@" + profile.username, accessToken: EncryptionHelper.encrypt(long.access_token), expiresAt: new Date(Date.now() + long.expires_in * 1000), metadata: JSON.stringify({ externalId: profile.id, username: profile.username }), status: "active" };
    await rawPrisma.channel.upsert({ where: { workspaceId_provider_handle: identity }, update: data, create: { ...identity, ...data } });
    return back("connected");
  } catch { return back("error"); }
}
