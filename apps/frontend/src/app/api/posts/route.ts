import { NextRequest, NextResponse } from "next/server";
import { rawPrisma } from "@/lib/prisma";
import { getPostWorkspace, postInput, serializePost } from "@/lib/post-api";

import { resolveDestinations, deliverySelection, schedulingError } from "@/lib/destinations";

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Authentication and workspace required" }, { status: 401 });
    const status = req.nextUrl.searchParams.get("status");
    const ids = req.nextUrl.searchParams.getAll("channel_id");
    const posts = await rawPrisma.post.findMany({
      where: { workspaceId, ...(ids.length ? { deliveries: { some: { accountId: { in: ids } } } } : {}), ...(status && status !== "all" ? { status: status.toUpperCase() === "PENDING_APPROVAL" ? { in: ["PENDING_APPROVAL", "PENDING_REVIEW"] } : status.toUpperCase() } : {}) },
      orderBy: { createdAt: "desc" }, include: { variants: true, deliveries: deliverySelection },
    });
    return NextResponse.json({ posts: posts.map(serializePost) });
  } catch (error) {
    console.error("GET /api/posts failed", error);
    return NextResponse.json({ error: "Could not load posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Authentication and workspace required" }, { status: 401 });
    const parsed = postInput.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid post data" }, { status: 400 });
    const body = parsed.data;
    const content = body.content?.trim() || "";
    if (!content && !body.rawThreads?.length) return NextResponse.json({ error: "Content is required" }, { status: 400 });
    const status = body.status || (body.scheduledAt ? "SCHEDULED" : "DRAFT");
    if (status === "CANCELLED") return NextResponse.json({ error: "A new post cannot be cancelled" }, { status: 400 });
    if (status === "SCHEDULED" && (!body.scheduledAt || new Date(body.scheduledAt).getTime() <= Date.now())) {
      return NextResponse.json({ error: "A future scheduled time is required" }, { status: 400 });
    }
    const channels = await resolveDestinations(workspaceId, body.channelIds, body.platforms, status, body.mediaUrls || []);
    const platforms = channels.length ? [...new Set(channels.map(c => c.provider))] : body.platforms || [];
    const post = await rawPrisma.post.create({ data: {
      workspaceId, title: body.title || content.slice(0, 40) || "Untitled Post", content,
      rawThreads: JSON.stringify(body.rawThreads || []), mediaUrls: JSON.stringify(body.mediaUrls || []),
      platforms: JSON.stringify(platforms), status,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      deliveries: { createMany: { data: channels.map(c => ({ accountId: c.id, scheduledAt: status === "SCHEDULED" ? body.scheduledAt : null })) } },
      variants: { create: platforms.map((platform) => ({ platform, tailoredText: content })) },
    }, include: { variants: true, deliveries: deliverySelection } });
    return NextResponse.json({ post: serializePost(post) }, { status: 201 });
  } catch (error) {
    const issue = schedulingError(error);
    if (issue) return issue;
    console.error("POST /api/posts failed", error);
    return NextResponse.json({ error: "Could not create post" }, { status: 500 });
  }
}
