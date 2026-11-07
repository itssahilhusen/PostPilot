import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SAMPLE_PERSONA_B } from "@/lib/persona-defaults";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      handle = "competitor",
      platform = "threads",
      workspace_id,
      persona_number = 1,
      name,
      max_posts = 25,
      language = "en",
      content_language = "en",
    } = body;

    let workspace = workspace_id
      ? await prisma.workspace.findUnique({ where: { id: workspace_id } })
      : await prisma.workspace.findFirst();

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "My Workspace", handle: "my-workspace" },
      });
    }

    const cleanHandle = handle.replace(/^@/, "");
    const finalName = name || `@${cleanHandle} Reference Voice`;

    const persona = await prisma.persona.create({
      data: {
        workspaceId: workspace.id,
        socialAccountId: null,
        personaNumber: Number(persona_number),
        name: finalName,
        status: "active",
        analysisMethod: "reference",
        analyzedPostsCount: Number(max_posts),
        analyzedAt: new Date(),
        language: language || "en",
        contentLanguage: content_language || "en",
        sentenceStructureKeepOriginal: false,
        profileIdentity: `Reference brand voice bench-marked from @${cleanHandle} on ${platform}.
Emulates high-performing narrative structures, hook techniques, and engagement drivers observed in their viral post history.`,
        targetAudience: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.target_audience),
        hookSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.hook_setting),
        writingStyleAnalysis: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.writing_style_analysis),
        ctaSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.cta_setting),
        referenceLinkSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.reference_link_setting),
        coreTopics: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.core_topics),
        topPerformingPatterns: DEFAULT_SAMPLE_PERSONA_B.top_performing_patterns,
        additionalInstructions: `Benchmarked from ${platform} handle @${cleanHandle}. Emulate their pacing and sentence cadence.`,
      },
    });

    return NextResponse.json({ success: true, persona });
  } catch (err: any) {
    console.error("POST /api/ai/persona/reference error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
