import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SAMPLE_PERSONA_A } from "@/lib/persona-defaults";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      brand_name,
      brand_description,
      samples = [],
      name,
      language = "en",
      content_language = "en",
      workspace_id,
    } = body;

    let workspace = workspace_id
      ? await prisma.workspace.findUnique({ where: { id: workspace_id } })
      : await prisma.workspace.findFirst();

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "My Workspace", handle: "my-workspace" },
      });
    }

    const finalName = name || (brand_name ? `${brand_name} Brand Voice` : "AI Generated Voice");

    const persona = await prisma.persona.create({
      data: {
        workspaceId: workspace.id,
        socialAccountId: null,
        personaNumber: 0,
        name: finalName,
        status: "active",
        analysisMethod: "aiGenerate",
        analyzedPostsCount: samples.length > 0 ? samples.length * 5 : 15,
        analyzedAt: new Date(),
        language: language || "en",
        contentLanguage: content_language || "en",
        sentenceStructureKeepOriginal: false,
        profileIdentity: `Generated brand voice for "${brand_name || "Modern Brand"}".
Description: ${brand_description || "Dynamic modern technology brand."}
Tuned for authentic storytelling and clear conversion-oriented copy across all social channels.`,
        targetAudience: JSON.stringify({
          ...DEFAULT_SAMPLE_PERSONA_A.target_audience,
          demographic_profile: `Target audience for ${brand_name || "our products"} seeking high-quality solutions.`,
        }),
        hookSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.hook_setting),
        writingStyleAnalysis: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.writing_style_analysis),
        ctaSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.cta_setting),
        referenceLinkSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.reference_link_setting),
        coreTopics: JSON.stringify([brand_name || "Brand", "Industry Insights", "Customer Stories", "Innovation"]),
        topPerformingPatterns: DEFAULT_SAMPLE_PERSONA_A.top_performing_patterns,
        additionalInstructions: `Generated from brand description. Writing samples evaluated: ${samples.length}.`,
      },
    });

    return NextResponse.json({ success: true, persona });
  } catch (err: any) {
    console.error("POST /api/ai/persona/generate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
