import { randomUUID } from "node:crypto";
import { AwsClient } from "aws4fetch";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPostWorkspace } from "@/lib/post-api";

const extensions = { "image/jpeg": "jpg", "image/png": "png", "video/mp4": "mp4", "video/quicktime": "mov" } as const;
const upload = z.object({ type: z.enum(["image/jpeg", "image/png", "video/mp4", "video/quicktime"]), bytes: z.number().int().positive().max(100 * 1024 * 1024) });

export async function POST(req: Request) {
  const workspace = await getPostWorkspace(req);
  if (!workspace) return NextResponse.json({ error: "Sign in to attach media" }, { status: 401 });
  const input = upload.safeParse(await req.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Choose a JPEG, PNG, MP4 or MOV under 100 MiB" }, { status: 400 });
  const { MEDIA_BUCKET_URL, MEDIA_PUBLIC_URL, MEDIA_ACCESS_KEY_ID, MEDIA_SECRET_ACCESS_KEY, MEDIA_REGION } = process.env;
  if (!MEDIA_BUCKET_URL?.startsWith("https://") || !MEDIA_PUBLIC_URL?.startsWith("https://") || !MEDIA_ACCESS_KEY_ID || !MEDIA_SECRET_ACCESS_KEY || !MEDIA_REGION) {
    return NextResponse.json({ error: "File uploads need a media bucket. You can also attach a public HTTPS URL." }, { status: 503 });
  }
  const key = encodeURIComponent(workspace) + "/" + randomUUID() + "." + extensions[input.data.type];
  const target = new URL(MEDIA_BUCKET_URL.replace(/\/$/, "") + "/" + key);
  target.searchParams.set("X-Amz-Expires", "300");
  const signer = new AwsClient({ service: "s3", region: MEDIA_REGION, accessKeyId: MEDIA_ACCESS_KEY_ID, secretAccessKey: MEDIA_SECRET_ACCESS_KEY });
  const signed = await signer.sign(target, { method: "PUT", headers: { "Content-Type": input.data.type, "Content-Length": String(input.data.bytes) }, aws: { signQuery: true, allHeaders: true } });
  return NextResponse.json({ uploadUrl: signed.url, publicUrl: MEDIA_PUBLIC_URL.replace(/\/$/, "") + "/" + key }, { headers: { "Cache-Control": "no-store" } });
}

