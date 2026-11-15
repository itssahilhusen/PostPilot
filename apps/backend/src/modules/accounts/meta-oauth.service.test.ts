import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  verification: { create: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn() },
  user: { findUnique: vi.fn() },
  socialAccount: { upsert: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn(), update: vi.fn() },
}));
vi.mock("@reerts/database", () => ({ prisma: db }));
import { MetaOAuthService } from "./meta-oauth.service";

const identity = { userId: "user-1", workspaceId: "workspace-1" };
const env = { META_APP_ID: "app-id", META_APP_SECRET: "app-secret", META_LOGIN_CONFIG_ID: "business-config-id", META_REDIRECT_URI: "http://localhost:3001/api/integrations/meta/callback", META_GRAPH_API_VERSION: "v27.0", ENCRYPTION_SECRET: "test-secret-not-for-production-32-chars", BETTER_AUTH_URL: "http://localhost:3000" };

describe("Meta OAuth foundation", () => {
  const service = new MetaOAuthService();
  beforeEach(() => { Object.assign(process.env, env); vi.clearAllMocks(); });
  afterEach(() => vi.unstubAllGlobals());

  it("generates an OAuth URL and stores a short-lived state bound to user and workspace", async () => {
    const url = new URL(await service.connect(identity));
    expect(url.hostname).toBe("www.facebook.com");
    expect(url.searchParams.get("redirect_uri")).toBe(env.META_REDIRECT_URI);
    expect(url.searchParams.get("config_id")).toBe(env.META_LOGIN_CONFIG_ID);
    expect(url.searchParams.has("scope")).toBe(false);
    expect(url.searchParams.get("state")?.length).toBeGreaterThan(40);
    expect(db.verification.create).toHaveBeenCalledOnce();
    const stored = db.verification.create.mock.calls[0][0].data;
    expect(stored.value).toContain(identity.workspaceId);
    expect(stored.identifier).not.toContain(url.searchParams.get("state"));
    expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("stores only an allowlisted calendar return path", async () => {
    await service.connect(identity, "calendar");
    expect(JSON.parse(db.verification.create.mock.calls[0][0].data.value).returnTo).toBe("calendar");
    await service.connect(identity, "https://untrusted.example/path");
    expect(JSON.parse(db.verification.create.mock.calls[1][0].data.value).returnTo).toBeUndefined();
  });

  it("uses the existing local backend callback when optional Meta settings are absent", async () => {
    delete process.env.META_REDIRECT_URI;
    delete process.env.META_GRAPH_API_VERSION;
    delete process.env.ENCRYPTION_SECRET;
    process.env.BETTER_AUTH_SECRET = "a-strong-existing-better-auth-secret-with-32-characters";
    const url = new URL(await service.connect(identity));
    expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:3001/api/integrations/meta/callback");
    expect(url.pathname).toBe("/v27.0/dialog/oauth");
  });

  it("rejects invalid, expired, and replayed state", async () => {
    await expect(service.consumeState("bad")).rejects.toThrow();
    db.verification.findFirst.mockResolvedValueOnce(null);
    await expect(service.consumeState("a".repeat(43))).rejects.toThrow();
    db.verification.findFirst.mockResolvedValueOnce({ id: "state-1", value: JSON.stringify(identity) });
    db.verification.deleteMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.consumeState("a".repeat(43))).rejects.toThrow();
  });

  it("checks the current workspace when consuming state", async () => {
    db.verification.findFirst.mockResolvedValue({ id: "state-1", value: JSON.stringify(identity) });
    db.verification.deleteMany.mockResolvedValue({ count: 1 });
    db.user.findUnique.mockResolvedValue({ workspaceId: "another-workspace" });
    await expect(service.consumeState("a".repeat(43))).rejects.toThrow();
  });

  it("exchanges a code, discovers Page and Instagram accounts, and encrypts stored tokens", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: URL) => {
      const url = new URL(input);
      const payload = url.pathname.endsWith("/oauth/access_token")
        ? url.searchParams.has("code") ? { access_token: "short-secret" } : { access_token: "long-secret", expires_in: 3600 }
        : url.pathname.endsWith("/me/permissions") ? { data: [{ permission: "pages_show_list", status: "granted" }] }
        : url.pathname.endsWith("/me") ? { id: "facebook-user-1" }
        : url.pathname.endsWith("/me/accounts") ? { data: [{ id: "page-1", name: "My Page", access_token: "page-secret", instagram_business_account: { id: "ig-1" } }] }
        : url.pathname.endsWith("/debug_token") ? { data: { is_valid: true, expires_at: 2000000000 } }
        : { id: "ig-1", username: "my_ig" };
      return { ok: true, json: async () => payload };
    }));
    expect(await service.complete("auth-code", identity)).toBe(2);
    expect(db.socialAccount.upsert).toHaveBeenCalledTimes(2);
    const page = db.socialAccount.upsert.mock.calls[0][0];
    expect(page.create.workspaceId).toBe(identity.workspaceId);
    expect(page.create.accessToken).not.toContain("page-secret");
    expect(page.create.refreshToken).not.toContain("long-secret");
    expect(page.create.expiresAt).toEqual(new Date(2000000000 * 1000));
    expect(JSON.parse(page.create.metadata).scopes).toContain("pages_show_list");
    expect(JSON.parse(page.create.metadata).facebookUserId).toBe("facebook-user-1");
    expect(db.socialAccount.upsert.mock.calls[1][0].create.provider).toBe("instagram");
  });

  it("fails on Meta code exchange errors and scopes disconnection", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));
    await expect(service.complete("bad-code", identity)).rejects.toThrow();
    db.socialAccount.deleteMany.mockResolvedValue({ count: 1 });
    await service.disconnect(identity, "account-1");
    expect(db.socialAccount.deleteMany.mock.calls[0][0].where.workspaceId).toBe(identity.workspaceId);
  });

  it("does not treat a profile-only Meta login as a connected Page", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: URL) => {
      const url = new URL(input);
      const payload = url.pathname.endsWith("/oauth/access_token") ? { access_token: "user-token", expires_in: 3600 }
        : url.pathname.endsWith("/me/permissions") ? { data: [{ permission: "public_profile", status: "granted" }] }
        : { id: "facebook-user-1" };
      return { ok: true, json: async () => payload };
    }));
    await expect(service.complete("code", identity)).rejects.toThrow("META_PAGES_SHOW_LIST_MISSING");
    expect(db.socialAccount.upsert).not.toHaveBeenCalled();
  });

  it("distinguishes a listed Page without a usable Page token", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: URL) => {
      const url = new URL(input);
      const payload = url.pathname.endsWith("/oauth/access_token") ? { access_token: "user-token", expires_in: 3600 }
        : url.pathname.endsWith("/me/permissions") ? { data: [{ permission: "pages_show_list", status: "granted" }] }
        : url.pathname.endsWith("/me/accounts") ? { data: [{ id: "page-1", name: "Page without token" }] }
        : { id: "facebook-user-1" };
      return { ok: true, json: async () => payload };
    }));
    await expect(service.complete("code", identity)).rejects.toThrow("META_PAGE_ACCESS_MISSING");
    expect(db.socialAccount.upsert).not.toHaveBeenCalled();
  });

  it("keeps a Page when no Instagram account is linked", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: URL) => {
      const url = new URL(input);
      const payload = url.pathname.endsWith("/oauth/access_token") ? { access_token: "user-token", expires_in: 3600 }
        : url.pathname.endsWith("/me") ? { id: "facebook-user-1" }
        : url.pathname.endsWith("/me/permissions") ? { data: [{ permission: "pages_show_list", status: "granted" }] }
        : url.pathname.endsWith("/me/accounts") ? { data: [{ id: "page-1", name: "Page", access_token: "page-token" }] }
        : { data: { is_valid: true, expires_at: 0 } };
      return { ok: true, json: async () => payload };
    }));
    expect(await service.complete("code", identity)).toBe(1);
    expect(db.socialAccount.upsert).toHaveBeenCalledOnce();
  });

  it("validates Better Auth session and workspace ownership", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ user: { id: "user-1" } }) })));
    db.user.findUnique.mockResolvedValue({ workspaceId: "workspace-1", role: "OWNER" });
    await expect(service.identity("better-auth.session_token=token")).resolves.toEqual(identity);
    db.user.findUnique.mockResolvedValue({ workspaceId: "workspace-2", role: "MEMBER" });
    await expect(service.identity("better-auth.session_token=token")).rejects.toThrow();
  });

  it("lists accounts without tokens and rejects cross-workspace disconnection", async () => {
    db.socialAccount.findMany.mockResolvedValue([{ id: "account-1", provider: "facebook", name: "Page", handle: "page-1", status: "active", expiresAt: null, metadata: "{}" }]);
    const accounts = await service.accounts(identity);
    expect(accounts[0]).not.toHaveProperty("accessToken");
    expect(db.socialAccount.findMany.mock.calls[0][0].where.workspaceId).toBe(identity.workspaceId);
    db.socialAccount.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.disconnect(identity, "someone-elses-account")).rejects.toThrow();
  });
});
