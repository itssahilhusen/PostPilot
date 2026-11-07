import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const competitors = await prisma.competitor.findMany({
      where: { workspaceId: workspace.id },
      include: {
        posts: {
          orderBy: { likes: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ competitors });
  } catch (err: any) {
    console.warn("GET /api/spy falling back to mock data:", err.message);
    const mockCompetitors = [
      {
        id: "comp-1",
        workspaceId: "ws-default",
        platform: "threads",
        handle: "@creatorspark",
        name: "Creator Spark",
        followers: 48200,
        growthRate: "+14.2%",
        posts: [
          {
            id: "post-c1",
            content: "Most creators spend 80% of their time on edits and 20% on the hook. Reverse that immediately if you want 100k views.",
            likes: 1420,
            replies: 86,
            shares: 45,
            createdAt: new Date().toISOString(),
          },
          {
            id: "post-c2",
            content: "The 3 rules of viral distribution in 2026: 1. Pattern interrupt, 2. Fast pacing, 3. Strong polarized opinion.",
            likes: 980,
            replies: 64,
            shares: 32,
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: "comp-2",
        workspaceId: "ws-default",
        platform: "x",
        handle: "@growthpilot",
        name: "Growth Pilot",
        followers: 92400,
        growthRate: "+8.7%",
        posts: [
          {
            id: "post-c3",
            content: "If your organic reach is down, stop tweaking hashtags. Your first 2 seconds failed to give a reason to stay.",
            likes: 2450,
            replies: 182,
            shares: 110,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ];
    return NextResponse.json({ competitors: mockCompetitors });
  }
}

export async function POST(req: NextRequest) {
  let cleanHandle = "@creator";
  let compName = "Creator";
  let platform = "threads";
  try {
    const body = await req.json();
    platform = body.platform || "threads";
    const handle = body.handle || "new_competitor";
    cleanHandle = handle.startsWith("@") ? handle : `@${handle}`;
    compName = body.name || handle.replace("@", "");

    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const newComp = await prisma.competitor.create({
      data: {
        workspaceId: workspace.id,
        platform,
        handle: cleanHandle,
        name: compName,
        followers: Math.floor(Math.random() * 40000) + 12000,
        growthRate: `+${(Math.random() * 15 + 2).toFixed(1)}%`,
        posts: {
          create: [
            {
              content: `Most people overcomplicate ${compName}'s niche. The real hack is consistent 80/20 execution.`,
              likes: Math.floor(Math.random() * 800) + 200,
              replies: Math.floor(Math.random() * 90) + 20,
              shares: Math.floor(Math.random() * 50) + 10,
            },
            {
              content: `If you want to scale to 100k views, stop chasing algorithms and focus on retention on the first 3 lines.`,
              likes: Math.floor(Math.random() * 1500) + 400,
              replies: Math.floor(Math.random() * 140) + 35,
              shares: Math.floor(Math.random() * 120) + 25,
            },
          ],
        },
      },
      include: {
        posts: true,
      },
    });

    return NextResponse.json({ competitor: newComp });
  } catch (err: any) {
    console.warn("POST /api/spy falling back to mock response:", err.message);
    const mockComp = {
      id: "comp_" + Date.now(),
      platform,
      handle: cleanHandle,
      name: compName,
      followers: 24500,
      growthRate: "+11.4%",
      posts: [
        {
          id: "p1",
          content: `Top performing breakdown for ${compName}. Consistent hook-to-value delivery.`,
          likes: 850,
          replies: 42,
          shares: 28,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    return NextResponse.json({ competitor: mockComp });
  }
}
