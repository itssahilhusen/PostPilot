import { NextRequest, NextResponse } from "next/server";
import { rawPrisma } from "@/lib/prisma";
import { getPostWorkspace, postInput, serializePost } from "@/lib/post-api";

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Authentication and workspace required" }, { status: 401 });
    const status = req.nextUrl.searchParams.get("status");
    const posts = await rawPrisma.post.findMany({
      where: { workspaceId, ...(status && status !== "all" ? { status: status.toUpperCase() } : {}) },
      orderBy: { createdAt: "desc" }, include: { variants: true },
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
    const post = await rawPrisma.post.create({ data: {
      workspaceId, title: body.title || content.slice(0, 40) || "Untitled Post", content,
      rawThreads: JSON.stringify(body.rawThreads || []), mediaUrls: JSON.stringify(body.mediaUrls || []),
      platforms: JSON.stringify(body.platforms || []), status,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      variants: { create: (body.platforms || []).map((platform) => ({ platform, tailoredText: content })) },
    }, include: { variants: true } });
    return NextResponse.json({ post: serializePost(post) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts failed", error);
    return NextResponse.json({ error: "Could not create post" }, { status: 500 });
  }
}
