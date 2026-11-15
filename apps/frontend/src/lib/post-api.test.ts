import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getSession: vi.fn(), findUnique: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock("@/lib/prisma", () => ({ rawPrisma: { user: { findUnique: mocks.findUnique } } }));
import { getPostWorkspace } from "./post-api";
describe("post workspace resolution", () => {
  beforeEach(() => vi.resetAllMocks());
  it("rejects unauthenticated requests", async () => {
    mocks.getSession.mockResolvedValue(null);
    expect(await getPostWorkspace(new Request("http://localhost"))).toBeNull();
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });
  it("loads workspace membership from the authenticated user record", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user-a", workspaceId: "forged" } });
    mocks.findUnique.mockResolvedValue({ workspaceId: "workspace-a" });
    expect(await getPostWorkspace(new Request("http://localhost"))).toBe("workspace-a");
    expect(mocks.findUnique).toHaveBeenCalledWith({ where: { id: "user-a" }, select: { workspaceId: true } });
  });
});
