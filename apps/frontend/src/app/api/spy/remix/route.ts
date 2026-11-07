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
    const { originalContent } = body;

    if (!originalContent) {
      return NextResponse.json({ error: "originalContent is required" }, { status: 400 });
    }

    const voice = await prisma.brandVoice.findFirst({
      where: { workspaceId: workspace.id, isDefault: true },
    });

    const remixed = AiEngine.remixPost(originalContent, voice || undefined);

    return NextResponse.json({
      original: originalContent,
      remixed,
    });
  } catch (err: any) {
    console.error("POST /api/spy/remix error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
