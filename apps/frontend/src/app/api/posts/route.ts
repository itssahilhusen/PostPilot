import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AiEngine } from "@/lib/ai";

// Dynamic reference seed items matching Dribbble design reference
function generateSeedPosts() {
  const today = new Date();
  const currentDay = today.getDay();
  const diffToMon = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diffToMon);

  const makeDate = (dayOffset: number, hours: number, minutes: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayOffset);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: "post_seed_1",
      title: "Meet the new eau de parfum collection",
      content: "Crafted with rare natural essences and cold-pressed botanical oils. Discover our limited series online today.\n\n#newdrop #botanical #fragrance #luxury",
      status: "SCHEDULED",
      platforms: ["threads", "x"],
      scheduledAt: makeDate(0, 9, 0), // Mon 09:00
      mediaUrls: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=450&fit=crop"],
      rawThreads: [],
      impressions: 0,
      engagements: 0,
      authorName: "Nevo David",
      authorHandle: "@nevo_david",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      tag: "#newdrop",
    },
    {
      id: "post_seed_2",
      title: "We're partnering with world-class distillers",
      content: "Amber reserve edition. 100 numbered decanters dropping this Tuesday at 08:30 AM exclusively for members.\n\n#limited #reserve #parfum",
      status: "SCHEDULED",
      platforms: ["threads", "x", "linkedin"],
      scheduledAt: makeDate(1, 8, 30), // Tue 08:30
      mediaUrls: ["https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&h=450&fit=crop"],
      rawThreads: [],
      impressions: 0,
      engagements: 0,
      authorName: "Nevo David",
      authorHandle: "@nevo_david",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      tag: "#limited",
    },
    {
      id: "post_seed_3",
      title: "Discover our new 30-day botanical extract",
      content: "Formulated without synthetic stabilizers. Designed for long-lasting sillage throughout your workday.\n\n#discovery #wellness #cleanbeauty",
      status: "SCHEDULED",
      platforms: ["linkedin", "threads"],
      scheduledAt: makeDate(1, 10, 30), // Tue 10:30
      mediaUrls: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=450&fit=crop"],
      rawThreads: [],
      impressions: 0,
      engagements: 0,
      authorName: "Nova Clay",
      authorHandle: "@nova_clay",
      authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      tag: "#discovery",
    },
    {
      id: "post_seed_4",
      title: "Limited bottle, weekend release exclusive",
      content: "Smoky cedarwood & dark plum. Available at select concept stores across Paris and Tokyo.\n\n#limited #specialedition #tokyo",
      status: "SCHEDULED",
      platforms: ["linkedin", "instagram"],
      scheduledAt: makeDate(2, 11, 0), // Wed 11:00
      mediaUrls: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&h=450&fit=crop"],
      rawThreads: [],
      impressions: 0,
      engagements: 0,
      authorName: "Nova Clay",
      authorHandle: "@nova_clay",
      authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      tag: "#limited",
    },
    {
      id: "post_seed_5",
      title: "New collection drops in flagship stores",
      content: "Experience the complete fragrance bar at Acme Co flagship locations starting this Thursday.\n\n#teaser #design #architecture",
      status: "SCHEDULED",
      platforms: ["x", "threads"],
      scheduledAt: makeDate(3, 9, 30), // Thu 09:30
      mediaUrls: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=450&fit=crop"],
      rawThreads: [],
      impressions: 0,
      engagements: 0,
      authorName: "Acme Co",
      authorHandle: "@acme_co",
      authorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
      tag: "#teaser",
    },
    {
      id: "post_sample_1",
      title: "The Agentic Engineering Stack",
      content: "Here is what 6 months of shipping autonomous sub-agents taught our engineering team:\n\n1. Deterministic scaffolds beat infinite generation loops.\n2. Bounded AST inspection catches 90% of regressions before deploy.\n3. Keep your data layer typed and isolated.",
      status: "PUBLISHED",
      platforms: ["threads", "x", "linkedin"],
      rawThreads: [],
      mediaUrls: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=450&fit=crop"],
      impressions: 4820,
      engagements: 312,
      scheduledAt: makeDate(4, 13, 30), // Fri 13:30
      publishedAt: makeDate(4, 13, 30),
      authorName: "Nevo David",
      authorHandle: "@nevo_david",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      tag: "#published",
    },
  ];
}

// In-memory fallback registry to preserve client additions during server runtime
let inMemoryPosts = generateSeedPosts();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Fetch workspace
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      const filtered = status && status !== "all"
        ? inMemoryPosts.filter((p) => p.status.toUpperCase() === status.toUpperCase())
        : inMemoryPosts;
      return NextResponse.json({ posts: filtered });
    }

    const where: any = { workspaceId: workspace.id };
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (posts.length === 0) {
      return NextResponse.json({ posts: inMemoryPosts });
    }

    const parsed = posts.map((p) => ({
      ...p,
      rawThreads: JSON.parse(p.rawThreads || "[]"),
      mediaUrls: JSON.parse(p.mediaUrls || "[]"),
      platforms: JSON.parse(p.platforms || "[]"),
    }));

    return NextResponse.json({ posts: parsed });
  } catch (err: any) {
    console.warn("GET /api/posts falling back to in-memory seed schedule:", err.message);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const filtered = status && status !== "all"
      ? inMemoryPosts.filter((p) => p.status.toUpperCase() === status.toUpperCase())
      : inMemoryPosts;
    return NextResponse.json({ posts: filtered });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, rawThreads, mediaUrls, platforms, status, scheduledAt } = body;

    if (!content && (!rawThreads || rawThreads.length === 0)) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const targetPlatforms = platforms || ["x", "linkedin"];
    const postTitle = title || (content ? content.slice(0, 40) + "..." : "Untitled Post");

    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      // In-memory fallback creation
      const mockCreated = {
        id: "post_" + Date.now(),
        title: postTitle,
        content: content || (rawThreads && rawThreads[0]?.content) || "",
        status: status || (scheduledAt ? "SCHEDULED" : "DRAFT"),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
        publishedAt: status === "PUBLISHED" ? new Date().toISOString() : null,
        platforms: targetPlatforms,
        rawThreads: rawThreads || [],
        mediaUrls: mediaUrls || ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=450&fit=crop"],
        impressions: 0,
        engagements: 0,
        authorName: "Nevo David",
        authorHandle: "@nevo_david",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        tag: "#newdrop",
        createdAt: new Date().toISOString(),
        variants: targetPlatforms.map((p: string) => ({
          platform: p,
          tailoredText: content,
          status: status || "SCHEDULED",
        })),
      };
      inMemoryPosts.unshift(mockCreated);
      return NextResponse.json({ post: mockCreated });
    }

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
    console.warn("POST /api/posts fallback to in-memory:", err.message);
    const body = await req.json().catch(() => ({}));
    const mockCreated = {
      id: "post_" + Date.now(),
      title: body.title || "Scheduled Slot",
      content: body.content || "Automated scheduled release.",
      status: body.status || (body.scheduledAt ? "SCHEDULED" : "DRAFT"),
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt).toISOString() : new Date().toISOString(),
      publishedAt: body.status === "PUBLISHED" ? new Date().toISOString() : null,
      platforms: body.platforms || ["x", "linkedin"],
      rawThreads: body.rawThreads || [],
      mediaUrls: body.mediaUrls || ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=450&fit=crop"],
      impressions: 0,
      engagements: 0,
      authorName: "Nevo David",
      authorHandle: "@nevo_david",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      tag: "#newdrop",
      createdAt: new Date().toISOString(),
      variants: [],
    };
    inMemoryPosts.unshift(mockCreated);
    return NextResponse.json({ post: mockCreated });
  }
}
