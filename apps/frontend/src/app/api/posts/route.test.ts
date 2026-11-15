import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ workspace: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn(), variantDelete: vi.fn(), variantCreate: vi.fn(), transaction: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("@/lib/prisma", () => ({ rawPrisma: { post: { findMany: mocks.findMany, findFirst: mocks.findFirst, create: mocks.create, updateMany: mocks.updateMany, deleteMany: mocks.deleteMany }, $transaction: mocks.transaction } }));
vi.mock("@/lib/post-api", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/post-api")>()), getPostWorkspace: mocks.workspace }));
import { GET, POST } from "./route";
import { PATCH, DELETE } from "./[id]/route";

const req = (method: string, body?: unknown) => new NextRequest("http://localhost/api/posts", { method, ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { "content-type": "application/json" } }) });
const params = { params: { id: "post-1" } };

describe("posts routes", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.workspace.mockResolvedValue("workspace-a"); });
  it("requires a session before reading or creating", async () => {
    mocks.workspace.mockResolvedValue(null);
    expect((await GET(req("GET"))).status).toBe(401);
    expect((await POST(req("POST", { content: "hello" }))).status).toBe(401);
    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("returns an empty list scoped to the workspace", async () => {
    mocks.findMany.mockResolvedValue([]);
    const response = await GET(req("GET"));
    expect(await response.json()).toEqual({ posts: [] });
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { workspaceId: "workspace-a" } }));
  });
  it("does not report success when the database fails", async () => {
    mocks.findMany.mockRejectedValue(new Error("offline"));
    expect((await GET(req("GET"))).status).toBe(500);
    mocks.create.mockRejectedValue(new Error("offline"));
    expect((await POST(req("POST", { content: "hello" }))).status).toBe(500);
  });
  it("rejects client claims of publication", async () => {
    expect((await POST(req("POST", { content: "hello", status: "PUBLISHED" }))).status).toBe(400);
    expect((await PATCH(req("PATCH", { status: "PUBLISHED" }), params)).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });
  it("does not edit or delete another workspace's post", async () => {
    mocks.findFirst.mockResolvedValue(null);
    expect((await PATCH(req("PATCH", { content: "new" }), params)).status).toBe(404);
    expect((await DELETE(req("DELETE"), params)).status).toBe(404);
    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "post-1", workspaceId: "workspace-a" } }));
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });
  it("does not edit published posts or delete scheduled posts", async () => {
    mocks.findFirst.mockResolvedValueOnce({ status: "PUBLISHED" }).mockResolvedValueOnce({ status: "SCHEDULED" });
    expect((await PATCH(req("PATCH", { content: "new" }), params)).status).toBe(409);
    expect((await DELETE(req("DELETE"), params)).status).toBe(409);
  });
  it("does not let pending approval bypass approval", async () => {
    mocks.findFirst.mockResolvedValue({ status: "PENDING_APPROVAL", variants: [] });
    expect((await PATCH(req("PATCH", { status: "SCHEDULED", scheduledAt: "2099-01-01T00:00:00Z" }), params)).status).toBe(409);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("updates post content and pending variants in one transaction", async () => {
    const post = { id: "post-1", status: "DRAFT", updatedAt: new Date(), scheduledAt: null, variants: [], platforms: '["x"]', content: "old", rawThreads: "[]", mediaUrls: "[]" };
    mocks.findFirst.mockResolvedValue(post);
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.transaction.mockImplementation((callback) => callback({ post: { updateMany: mocks.updateMany }, postVariant: { deleteMany: mocks.variantDelete, createMany: mocks.variantCreate } }));
    expect((await PATCH(req("PATCH", { content: "new", platforms: ["linkedin"] }), params)).status).toBe(200);
    expect(mocks.variantDelete).toHaveBeenCalledWith({ where: { postId: "post-1", status: "PENDING" } });
    expect(mocks.variantCreate).toHaveBeenCalledWith({ data: [{ postId: "post-1", platform: "linkedin", tailoredText: "new" }] });
  });
});
