import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AiEngine } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const body = await req.json();
    const { topic } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const voice = await prisma.brandVoice.findFirst({
      where: { workspaceId: workspace.id, isDefault: true },
    });

    const generated = await AiEngine.generateIdeas({
      topic,
      brandVoice: voice || undefined,
    });

    const createdIdeas = [];
    for (const item of generated) {
      const created = await prisma.idea.create({
        data: {
          workspaceId: workspace.id,
          title: item.title,
          excerpt: item.excerpt,
          sourceType: item.sourceType,
          viralityScore: item.viralityScore,
          tags: JSON.stringify(item.tags),
        },
      });
      createdIdeas.push({
        ...created,
        tags: JSON.parse(created.tags),
      });
    }

    return NextResponse.json({ ideas: createdIdeas });
  } catch (err: any) {
    console.error("POST /api/ideas/generate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
