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
    const { topic, url, text } = body;

    const voice = await prisma.brandVoice.findFirst({
      where: { workspaceId: workspace.id, isDefault: true },
    });

    const planned = await AiEngine.planCarousel({
      topic,
      url,
      text,
      brandVoice: voice || undefined,
    });

    return NextResponse.json(planned);
  } catch (err: any) {
    console.error("POST /api/carousel/plan error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
