import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      source_persona_id,
      account_id,
      workspace_id,
      persona_number = 1,
      name,
    } = body;

    const source = await prisma.persona.findUnique({
      where: { id: source_persona_id },
    });

    if (!source) {
      return NextResponse.json({ error: "Source persona not found" }, { status: 404 });
    }

    let workspace = workspace_id
      ? await prisma.workspace.findUnique({ where: { id: workspace_id } })
      : await prisma.workspace.findFirst();

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "My Workspace", handle: "my-workspace" },
      });
    }

    const cloned = await prisma.persona.create({
      data: {
        workspaceId: workspace.id,
        socialAccountId: account_id || null,
        personaNumber: Number(persona_number),
        name: name || `${source.name} (Copy)`,
        status: "active",
        analysisMethod: "load",
        analyzedPostsCount: source.analyzedPostsCount,
        analyzedAt: source.analyzedAt,
        language: source.language,
        contentLanguage: source.contentLanguage,
        sentenceStructureKeepOriginal: source.sentenceStructureKeepOriginal,
        profileIdentity: source.profileIdentity,
        targetAudience: source.targetAudience,
        hookSetting: source.hookSetting,
        writingStyleAnalysis: source.writingStyleAnalysis,
        ctaSetting: source.ctaSetting,
        referenceLinkSetting: source.referenceLinkSetting,
        coreTopics: source.coreTopics,
        topPerformingPatterns: source.topPerformingPatterns,
        additionalInstructions: source.additionalInstructions,
      },
    });

    return NextResponse.json({ success: true, persona: cloned });
  } catch (err: any) {
    console.error("POST /api/ai/persona/clone error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
