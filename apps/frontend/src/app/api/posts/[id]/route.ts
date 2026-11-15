import { NextRequest, NextResponse } from "next/server";
import { rawPrisma } from "@/lib/prisma";
import { getPostWorkspace, postInput, serializePost } from "@/lib/post-api";

const editableStatuses = ["DRAFT", "SCHEDULED", "PENDING_APPROVAL", "CANCELLED"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workspaceId = await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Authentication and workspace required" }, { status: 401 });
    const parsed = postInput.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid post data" }, { status: 400 });
    const body = parsed.data;
    const existing = await rawPrisma.post.findFirst({ where: { id: params.id, workspaceId }, include: { variants: true } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (!editableStatuses.includes(existing.status)) return NextResponse.json({ error: "This post cannot be edited in its current status" }, { status: 409 });
    const status = body.status ?? existing.status;
    const transitions: Record<string, string[]> = {
      DRAFT: ["DRAFT", "SCHEDULED", "PENDING_APPROVAL"],
      SCHEDULED: ["SCHEDULED", "DRAFT", "CANCELLED"],
      PENDING_APPROVAL: ["PENDING_APPROVAL", "DRAFT"],
      CANCELLED: ["CANCELLED", "DRAFT", "SCHEDULED"],
    };
    if (!transitions[existing.status]?.includes(status)) return NextResponse.json({ error: "Invalid status transition" }, { status: 409 });
    const variantsChanged = body.platforms !== undefined || body.content !== undefined;
    if (variantsChanged && existing.variants.some((variant) => variant.status !== "PENDING")) {
      return NextResponse.json({ error: "Posts with publishing history cannot be changed" }, { status: 409 });
    }
    const scheduledAt = body.scheduledAt === undefined ? existing.scheduledAt : body.scheduledAt ? new Date(body.scheduledAt) : null;
    if (status === "SCHEDULED" && (!scheduledAt || scheduledAt.getTime() <= Date.now())) return NextResponse.json({ error: "A future scheduled time is required" }, { status: 400 });
    const result = await rawPrisma.$transaction(async (tx) => {
      const changed = await tx.post.updateMany({ where: { id: params.id, workspaceId, status: existing.status, updatedAt: existing.updatedAt }, data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.scheduledAt !== undefined && { scheduledAt }),
      ...(body.platforms !== undefined && { platforms: JSON.stringify(body.platforms) }),
      ...(body.rawThreads !== undefined && { rawThreads: JSON.stringify(body.rawThreads) }),
      ...(body.mediaUrls !== undefined && { mediaUrls: JSON.stringify(body.mediaUrls) }),
      } });
      if (changed.count && variantsChanged) {
        await tx.postVariant.deleteMany({ where: { postId: existing.id, status: "PENDING" } });
        const platforms: string[] = body.platforms ?? JSON.parse(existing.platforms || "[]");
        if (platforms.length) await tx.postVariant.createMany({ data: platforms.map((platform) => ({
          postId: existing.id, platform, tailoredText: body.content ?? existing.content,
        })) });
      }
      return changed;
    });
    if (!result.count) return NextResponse.json({ error: "Post changed; refresh and try again" }, { status: 409 });
    const updated = await rawPrisma.post.findFirst({ where: { id: params.id, workspaceId }, include: { variants: true } });
    if (!updated) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post: serializePost(updated) });
  } catch (error) {
    console.error("PATCH /api/posts/[id] failed", error);
    return NextResponse.json({ error: "Could not update post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workspaceId = await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Authentication and workspace required" }, { status: 401 });
    const existing = await rawPrisma.post.findFirst({ where: { id: params.id, workspaceId }, select: { status: true } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (existing.status !== "DRAFT") return NextResponse.json({ error: "Only drafts can be deleted" }, { status: 409 });
    const result = await rawPrisma.post.deleteMany({ where: { id: params.id, workspaceId, status: "DRAFT" } });
    if (!result.count) return NextResponse.json({ error: "Post changed; refresh and try again" }, { status: 409 });
    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error) {
    console.error("DELETE /api/posts/[id] failed", error);
    return NextResponse.json({ error: "Could not delete post" }, { status: 500 });
  }
}
