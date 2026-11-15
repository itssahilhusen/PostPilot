import { Injectable, UnauthorizedException, BadRequestException, ServiceUnavailableException } from "@nestjs/common";
import { prisma } from "@reerts/database";
import { createHash, randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

type Identity = { userId: string; workspaceId: string; returnTo?: "calendar" };
type MetaPage = { id: string; name: string; username?: string; access_token: string; instagram_business_account?: { id: string }; };

@Injectable()
export class MetaOAuthService {
  private get config() {
    const { META_APP_ID, META_APP_SECRET, META_LOGIN_CONFIG_ID, BETTER_AUTH_URL } = process.env;
    const redirect = process.env.META_REDIRECT_URI || (process.env.NODE_ENV === "production" ? "" : `http://localhost:${process.env.PORT || process.env.BACKEND_PORT || "3001"}/api/integrations/meta/callback`);
    const version = process.env.META_GRAPH_API_VERSION || "v27.0";
    const encryption = process.env.ENCRYPTION_SECRET || (process.env.BETTER_AUTH_SECRET ? `meta-oauth:${process.env.BETTER_AUTH_SECRET}` : "");
    if (!META_APP_ID || !META_APP_SECRET || !META_LOGIN_CONFIG_ID || !redirect || !BETTER_AUTH_URL || encryption.length < 32 || (!process.env.ENCRYPTION_SECRET && (process.env.BETTER_AUTH_SECRET || "").length < 32) || !/^v\d+\.\d+$/.test(version)) {
      throw new ServiceUnavailableException("Meta OAuth is not configured");
    }
    return { appId: META_APP_ID, secret: META_APP_SECRET, configId: META_LOGIN_CONFIG_ID, redirect, version, encryption, authUrl: BETTER_AUTH_URL };
  }

  async identity(cookie: string | undefined): Promise<Identity> {
    if (!cookie) throw new UnauthorizedException();
    const response = await fetch(new URL("/api/auth/get-session", this.config.authUrl), { headers: { cookie }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new UnauthorizedException();
    const session = await response.json() as { user?: { id?: string } };
    if (!session.user?.id) throw new UnauthorizedException();
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { workspaceId: true, role: true } });
    if (!user?.workspaceId || !["OWNER", "ADMIN"].includes(user.role)) throw new UnauthorizedException();
    return { userId: session.user.id, workspaceId: user.workspaceId };
  }

  async connect(identity: Identity, returnTo?: string): Promise<string> {
    const state = randomBytes(32).toString("base64url");
    const identifier = `meta-oauth:${createHash("sha256").update(state).digest("hex")}`;
    await prisma.verification.create({ data: { identifier, value: JSON.stringify({ ...identity, returnTo: returnTo === "calendar" ? "calendar" : undefined }), expiresAt: new Date(Date.now() + 10 * 60_000) } });
    const query = new URLSearchParams({ client_id: this.config.appId, redirect_uri: this.config.redirect, response_type: "code", state, config_id: this.config.configId });
    return `https://www.facebook.com/${this.config.version}/dialog/oauth?${query}`;
  }

  async consumeState(state: string): Promise<Identity> {
    if (!/^[A-Za-z0-9_-]{40,100}$/.test(state)) throw new BadRequestException("Invalid OAuth state");
    const identifier = `meta-oauth:${createHash("sha256").update(state).digest("hex")}`;
    const record = await prisma.verification.findFirst({ where: { identifier, expiresAt: { gt: new Date() } } });
    if (!record) throw new BadRequestException("Invalid or expired OAuth state");
    const consumed = await prisma.verification.deleteMany({ where: { id: record.id, identifier, expiresAt: { gt: new Date() } } });
    if (consumed.count !== 1) throw new BadRequestException("OAuth state already used");
    const identity = JSON.parse(record.value) as Identity;
    const user = await prisma.user.findUnique({ where: { id: identity.userId }, select: { workspaceId: true, role: true } });
    if (!user || user.workspaceId !== identity.workspaceId || !["OWNER", "ADMIN"].includes(user.role)) throw new UnauthorizedException();
    return identity;
  }

  private async graph<T>(path: string, parameters: Record<string, string>): Promise<T> {
    const url = new URL(`https://graph.facebook.com/${this.config.version}/${path}`);
    for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new BadRequestException("Meta authorization or account discovery failed");
    return response.json() as Promise<T>;
  }

  private async accessiblePages(userToken: string): Promise<MetaPage[]> {
    let result = await this.graph<{ data: MetaPage[]; paging?: { next?: string } }>("me/accounts", { fields: "id,name,username,access_token,instagram_business_account", limit: "100", access_token: userToken });
    const pages = [...result.data];
    for (let pageNumber = 1; result.paging?.next && pageNumber < 50; pageNumber++) {
      const next = new URL(result.paging.next);
      if (next.protocol !== "https:" || next.hostname !== "graph.facebook.com" || !next.pathname.startsWith(`/${this.config.version}/me/accounts`)) {
        throw new BadRequestException("Unexpected Meta pagination URL");
      }
      const response = await fetch(next, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new BadRequestException("Meta account discovery failed");
      result = await response.json() as { data: MetaPage[]; paging?: { next?: string } };
      pages.push(...result.data);
    }
    if (result.paging?.next) throw new BadRequestException("Meta returned too many account pages");
    return pages;
  }

  private encrypt(token: string): string {
    const key = createHash("sha256").update(this.config.encryption).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    return `${iv.toString("hex")}:${Buffer.concat([cipher.update(token), cipher.final()]).toString("hex")}:${cipher.getAuthTag().toString("hex")}`;
  }

  private decrypt(value: string): string {
    const [iv, ciphertext, tag] = value.split(":");
    if (!iv || !ciphertext || !tag) throw new BadRequestException("Stored Meta token is invalid");
    const key = createHash("sha256").update(this.config.encryption).digest();
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(tag, "hex"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, "hex")), decipher.final()]).toString();
  }

  async complete(code: string, identity: Identity): Promise<number> {
    let short: { access_token: string };
    let long: { access_token: string; expires_in?: number };
    try {
      short = await this.graph("oauth/access_token", { client_id: this.config.appId, client_secret: this.config.secret, redirect_uri: this.config.redirect, code });
      long = await this.graph("oauth/access_token", { grant_type: "fb_exchange_token", client_id: this.config.appId, client_secret: this.config.secret, fb_exchange_token: short.access_token });
    } catch { throw new BadRequestException("META_CODE_EXCHANGE_FAILED"); }
    const facebookUser = await this.graph<{ id: string }>("me", { fields: "id", access_token: long.access_token });
    if (!facebookUser.id) throw new BadRequestException("Meta user identity was not returned");
    const granted = await this.graph<{ data: { permission: string; status: string }[] }>("me/permissions", { access_token: long.access_token });
    const scopes = granted.data.filter((item) => item.status === "granted").map((item) => item.permission);
    if (!scopes.includes("pages_show_list")) throw new BadRequestException("META_PAGES_SHOW_LIST_MISSING");
    const pages = await this.accessiblePages(long.access_token);
    const userTokenExpiresAt = long.expires_in ? new Date(Date.now() + long.expires_in * 1000) : null;
    let count = 0;
    for (const page of pages) {
      if (!page.id || !page.access_token) continue;
      const debug = await this.graph<{ data: { expires_at?: number; is_valid: boolean } }>("debug_token", { input_token: page.access_token, access_token: `${this.config.appId}|${this.config.secret}` });
      if (!debug.data.is_valid) continue;
      const pageExpiresAt = debug.data.expires_at ? new Date(debug.data.expires_at * 1000) : null;
      await this.saveAccount(identity, "facebook", page.id, page.name, page.username || null, page.access_token, scopes, facebookUser.id, null, long.access_token, userTokenExpiresAt, pageExpiresAt);
      count++;
      if (page.instagram_business_account?.id) {
        let ig: { id: string; username?: string; name?: string } | null = null;
        try {
          ig = await this.graph(page.instagram_business_account.id, { fields: "id,username,name", access_token: page.access_token });
        } catch {
          // The Page connection remains valid when Instagram discovery is unavailable.
        }
        if (ig?.id) {
          await this.saveAccount(identity, "instagram", ig.id, ig.name || ig.username || ig.id, ig.username || null, page.access_token, scopes, facebookUser.id, page.id, long.access_token, userTokenExpiresAt, pageExpiresAt);
          count++;
        }
      }
    }
    if (pages.length && !count) throw new BadRequestException("META_PAGE_ACCESS_MISSING");
    return count;
  }

  private async saveAccount(identity: Identity, provider: string, externalId: string, name: string, username: string | null, token: string, scopes: string[], facebookUserId: string, pageId: string | null, userToken: string, userTokenExpiresAt: Date | null, pageExpiresAt: Date | null) {
    const metadata = JSON.stringify({ externalId, username, facebookUserId, connectedByUserId: identity.userId, scopes, pageId, userTokenExpiresAt: userTokenExpiresAt?.toISOString() || null });
    // The existing schema's unique handle stores the stable Meta account ID; display name remains separate.
    await prisma.socialAccount.upsert({ where: { workspaceId_provider_handle: { workspaceId: identity.workspaceId, provider, handle: externalId } }, update: { name, accessToken: this.encrypt(token), refreshToken: this.encrypt(userToken), metadata, status: "active", expiresAt: pageExpiresAt }, create: { workspaceId: identity.workspaceId, provider, handle: externalId, name, accessToken: this.encrypt(token), refreshToken: this.encrypt(userToken), metadata, status: "active", expiresAt: pageExpiresAt } });
  }

  async accounts(identity: Identity) {
    const accounts = await prisma.socialAccount.findMany({ where: { workspaceId: identity.workspaceId, provider: { in: ["facebook", "instagram"] } }, select: { id: true, provider: true, name: true, handle: true, status: true, expiresAt: true, metadata: true } });
    return accounts.map(({ metadata, ...account }) => ({ ...account, status: account.expiresAt && account.expiresAt <= new Date() ? "expired" : account.status, details: JSON.parse(metadata || "{}") }));
  }

  async disconnect(identity: Identity, id: string) {
    const result = await prisma.socialAccount.deleteMany({ where: { id, workspaceId: identity.workspaceId, provider: { in: ["facebook", "instagram"] } } });
    if (!result.count) throw new BadRequestException("Account not found");
  }


  async refresh(identity: Identity, id: string) {
    const account = await prisma.socialAccount.findFirst({ where: { id, workspaceId: identity.workspaceId, provider: { in: ["facebook", "instagram"] } } });
    if (!account?.refreshToken) throw new BadRequestException("Reconnect this account through Meta");
    const existingUserToken = this.decrypt(account.refreshToken);
    const renewed = await this.graph<{ access_token: string; expires_in?: number }>("oauth/access_token", { grant_type: "fb_exchange_token", client_id: this.config.appId, client_secret: this.config.secret, fb_exchange_token: existingUserToken });
    const pages = await this.accessiblePages(renewed.access_token);
    const details = JSON.parse(account.metadata || "{}");
    const page = pages.find((item) => item.id === (account.provider === "facebook" ? details.externalId : details.pageId));
    if (!page?.access_token) throw new BadRequestException("Meta access was removed; reconnect this account");
    const debug = await this.graph<{ data: { expires_at?: number; is_valid: boolean } }>("debug_token", { input_token: page.access_token, access_token: `${this.config.appId}|${this.config.secret}` });
    if (!debug.data.is_valid) throw new BadRequestException("Meta token is invalid; reconnect this account");
    await prisma.socialAccount.update({ where: { id }, data: { accessToken: this.encrypt(page.access_token), refreshToken: this.encrypt(renewed.access_token), expiresAt: debug.data.expires_at ? new Date(debug.data.expires_at * 1000) : null, status: "active" } });
    return { success: true };
  }
}
