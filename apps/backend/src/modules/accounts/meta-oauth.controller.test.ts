import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { MetaOAuthController } from "./meta-oauth.controller";

const state = "a".repeat(43);
const cookie = createHash("sha256").update(state).digest("hex");
const response = () => ({ clearCookie: vi.fn(), redirect: vi.fn((url: string) => url) });

describe("Meta OAuth callback", () => {
  it("rejects missing or mismatched browser state", async () => {
    const service = { consumeState: vi.fn() } as any;
    const controller = new MetaOAuthController(service);
    await expect(controller.callback(state, "code", undefined, { cookies: { meta_oauth_state: "b".repeat(64) } } as any, response() as any)).rejects.toThrow();
    expect(service.consumeState).not.toHaveBeenCalled();
  });

  it("consumes state and returns authorization denial to settings", async () => {
    const service = { consumeState: vi.fn().mockResolvedValue({ userId: "u", workspaceId: "w" }), complete: vi.fn() } as any;
    const controller = new MetaOAuthController(service);
    const res = response();
    await controller.callback(state, undefined, "access_denied", { cookies: { meta_oauth_state: cookie } } as any, res as any);
    expect(service.consumeState).toHaveBeenCalledWith(state);
    expect(service.complete).not.toHaveBeenCalled();
    expect(new URL(res.redirect.mock.calls[0][0]).searchParams.get("meta")).toBe("denied");
  });

  it("returns to the calendar when authorization started there", async () => {
    const service = { consumeState: vi.fn().mockResolvedValue({ userId: "u", workspaceId: "w", returnTo: "calendar" }), complete: vi.fn().mockResolvedValue(2) } as any;
    const controller = new MetaOAuthController(service);
    const res = response();
    await controller.callback(state, "code", undefined, { cookies: { meta_oauth_state: cookie } } as any, res as any);
    const redirect = new URL(res.redirect.mock.calls[0][0]);
    expect(redirect.pathname).toBe("/calendar");
    expect(redirect.searchParams.get("meta")).toBe("connected");
  });

  it("reports a missing Page-list permission separately from an empty Page list", async () => {
    const service = { consumeState: vi.fn().mockResolvedValue({ userId: "u", workspaceId: "w", returnTo: "calendar" }), complete: vi.fn().mockRejectedValue(new Error("META_PAGES_SHOW_LIST_MISSING")) } as any;
    const controller = new MetaOAuthController(service);
    const res = response();
    await controller.callback(state, "code", undefined, { cookies: { meta_oauth_state: cookie } } as any, res as any);
    expect(new URL(res.redirect.mock.calls[0][0]).searchParams.get("meta")).toBe("missing_pages_permission");
  });

  it("rejects cross-origin account mutations", async () => {
    const service = { identity: vi.fn(), disconnect: vi.fn() } as any;
    const controller = new MetaOAuthController(service);
    await expect(controller.disconnect("account-1", { headers: { origin: "https://other.example" } } as any)).rejects.toThrow();
    expect(service.identity).not.toHaveBeenCalled();
  });
});
