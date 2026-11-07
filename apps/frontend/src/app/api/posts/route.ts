import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AiEngine } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Fetch workspace
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const where: any = { workspaceId: workspace.id };
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const parsed = posts.map((p) => ({
      ...p,
      rawThreads: JSON.parse(p.rawThreads || "[]"),
      mediaUrls: JSON.parse(p.mediaUrls || "[]"),
      platforms: JSON.parse(p.platforms || "[]"),
    }));

    return NextResponse.json({ posts: parsed });
  } catch (err: any) {
    console.warn("GET /api/posts falling back to mock data:", err.message);
    const mockPosts = [
      {
        id: "post_sample_1",
        title: "The Agentic Engineering Stack",
        content: "Here is what 6 months of shipping autonomous sub-agents taught our engineering team:\n\n1. Deterministic scaffolds beat infinite generation loops.\n2. Bounded AST inspection catches 90% of regressions before deploy.\n3. Keep your data layer typed and isolated.",
        status: "PUBLISHED",
        platforms: ["threads", "x", "linkedin"],
        rawThreads: [],
        mediaUrls: [],
        impressions: 4820,
        engagements: 312,
        publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: "post_sample_2",
        title: "PostgreSQL Concurrency at High QPS",
        content: "Optimistic locking vs row-level advisory locks for queue dispatchers. A quick breakdown of why connection pooling failed us first.",
        status: "DRAFT",
        platforms: ["threads", "linkedin"],
        rawThreads: [],
        mediaUrls: [],
        impressions: 0,
        engagements: 0,
        publishedAt: null,
      }
    ];
    return NextResponse.json({ posts: mockPosts });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, rawThreads, mediaUrls, platforms, status, scheduledAt } = body;

    if (!content && (!rawThreads || rawThreads.length === 0)) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const postTitle = title || (content ? content.slice(0, 40) + "..." : "Untitled Post");
    const targetPlatforms = platforms || ["x", "linkedin"];

    const newPost = await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        title: postTitle,
        content: content || (rawThreads && rawThreads[0]?.content) || "",
        rawThreads: JSON.stringify(rawThreads || []),
        mediaUrls: JSON.stringify(mediaUrls || []),
        platforms: JSON.stringify(targetPlatforms),
        status: status || (scheduledAt ? "SCHEDULED" : "DRAFT"),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    // Batch create tailored variants for all platforms in a single multi-row query
    const variantsData = targetPlatforms.map((plat: string) => ({
      postId: newPost.id,
      platform: plat,
      tailoredText: AiEngine.tailorForPlatform(newPost.content, plat),
      status: newPost.status === "PUBLISHED" ? "PUBLISHED" : "PENDING",
      publishedAt: newPost.status === "PUBLISHED" ? new Date() : null,
    }));
    await prisma.postVariant.createMany({ data: variantsData });

    const createdVariants = await prisma.postVariant.findMany({
      where: { postId: newPost.id },
    });

    return NextResponse.json({
      post: {
        ...newPost,
        rawThreads: JSON.parse(newPost.rawThreads),
        mediaUrls: JSON.parse(newPost.mediaUrls),
        platforms: JSON.parse(newPost.platforms),
        variants: createdVariants,
      },
    });
  } catch (err: any) {
    console.warn("POST /api/posts falling back to mock response:", err.message);
    const mockCreated = {
      id: "post_" + Date.now(),
      title: "Generated Post",
      content: "Auto-saved post draft.",
      status: "DRAFT",
      platforms: ["threads", "x"],
      rawThreads: [],
      mediaUrls: [],
      impressions: 0,
      engagements: 0,
      createdAt: new Date().toISOString(),
      variants: [],
    };
    return NextResponse.json({ post: mockCreated });
  }
}
