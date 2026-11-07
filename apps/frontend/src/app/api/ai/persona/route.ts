import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SAMPLE_PERSONA_A, DEFAULT_SAMPLE_PERSONA_B } from "@/lib/persona-defaults";
import { loadPersonasStore, savePersonasStore } from "@/lib/persona-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get("workspace_id");

    try {
      // Try DB first
      let workspace = workspaceIdParam
        ? await prisma.workspace.findUnique({ where: { id: workspaceIdParam } })
        : await prisma.workspace.findFirst();

      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: {
            name: "My Workspace",
            handle: "my-workspace",
          },
        });
      }

      let personas = await prisma.persona.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { personaNumber: "asc" },
      });

      if (personas.length === 0) {
        const socialAccount = await prisma.socialAccount.findFirst({
          where: { workspaceId: workspace.id },
        });

        const personaA = await prisma.persona.create({
          data: {
            workspaceId: workspace.id,
            socialAccountId: socialAccount?.id ?? null,
            personaNumber: 0,
            name: DEFAULT_SAMPLE_PERSONA_A.name,
            status: "active",
            analysisMethod: DEFAULT_SAMPLE_PERSONA_A.analysis_method,
            analyzedPostsCount: DEFAULT_SAMPLE_PERSONA_A.analyzed_posts_count,
            analyzedAt: new Date(DEFAULT_SAMPLE_PERSONA_A.analyzed_at),
            language: DEFAULT_SAMPLE_PERSONA_A.language,
            contentLanguage: DEFAULT_SAMPLE_PERSONA_A.content_language,
            sentenceStructureKeepOriginal: DEFAULT_SAMPLE_PERSONA_A.sentence_structure_keep_original,
            profileIdentity: DEFAULT_SAMPLE_PERSONA_A.profile_identity,
            targetAudience: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.target_audience),
            hookSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.hook_setting),
            writingStyleAnalysis: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.writing_style_analysis),
            ctaSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.cta_setting),
            referenceLinkSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.reference_link_setting),
            coreTopics: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.core_topics),
            topPerformingPatterns: DEFAULT_SAMPLE_PERSONA_A.top_performing_patterns,
            additionalInstructions: DEFAULT_SAMPLE_PERSONA_A.additional_instructions,
          },
        });

        const personaB = await prisma.persona.create({
          data: {
            workspaceId: workspace.id,
            socialAccountId: socialAccount?.id ?? null,
            personaNumber: 1,
            name: DEFAULT_SAMPLE_PERSONA_B.name,
            status: "active",
            analysisMethod: DEFAULT_SAMPLE_PERSONA_B.analysis_method,
            analyzedPostsCount: DEFAULT_SAMPLE_PERSONA_B.analyzed_posts_count,
            analyzedAt: new Date(DEFAULT_SAMPLE_PERSONA_B.analyzed_at),
            language: DEFAULT_SAMPLE_PERSONA_B.language,
            contentLanguage: DEFAULT_SAMPLE_PERSONA_B.content_language,
            sentenceStructureKeepOriginal: DEFAULT_SAMPLE_PERSONA_B.sentence_structure_keep_original,
            profileIdentity: DEFAULT_SAMPLE_PERSONA_B.profile_identity,
            targetAudience: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.target_audience),
            hookSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.hook_setting),
            writingStyleAnalysis: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.writing_style_analysis),
            ctaSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.cta_setting),
            referenceLinkSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.reference_link_setting),
            coreTopics: JSON.stringify(DEFAULT_SAMPLE_PERSONA_B.core_topics),
            topPerformingPatterns: DEFAULT_SAMPLE_PERSONA_B.top_performing_patterns,
            additionalInstructions: DEFAULT_SAMPLE_PERSONA_B.additional_instructions,
          },
        });

        personas = [personaA, personaB];
      }

      const formatted = personas.map((p) => {
        let targetAudience = {};
        let hookSetting = {};
        let writingStyleAnalysis = {};
        let ctaSetting = { items: [] };
        let referenceLinkSetting = { enabled: false, format: "", placement_note: null };
        let coreTopics = [];

        try { targetAudience = p.targetAudience ? JSON.parse(p.targetAudience) : {}; } catch {}
        try { hookSetting = p.hookSetting ? JSON.parse(p.hookSetting) : {}; } catch {}
        try { writingStyleAnalysis = p.writingStyleAnalysis ? JSON.parse(p.writingStyleAnalysis) : {}; } catch {}
        try { ctaSetting = p.ctaSetting ? JSON.parse(p.ctaSetting) : { items: [] }; } catch {}
        try { referenceLinkSetting = p.referenceLinkSetting ? JSON.parse(p.referenceLinkSetting) : { enabled: false, format: "", placement_note: null }; } catch {}
        try { coreTopics = p.coreTopics ? JSON.parse(p.coreTopics) : []; } catch {}

        return {
          id: p.id,
          workspace_id: p.workspaceId,
          social_account_id: p.socialAccountId,
          blog_account_id: p.blogAccountId,
          persona_number: p.personaNumber,
          name: p.name,
          status: p.status,
          analysis_method: p.analysisMethod,
          analyzed_posts_count: p.analyzedPostsCount,
          analyzed_at: p.analyzedAt ? p.analyzedAt.toISOString() : null,
          updated_at: p.updatedAt.toISOString(),
          updated_by_user: { full_name: "Workspace Member", email: "team@reerts.com" },
          language: p.language,
          content_language: p.contentLanguage,
          sentence_structure_keep_original: p.sentenceStructureKeepOriginal,
          profile_identity: p.profileIdentity,
          target_audience: targetAudience,
          hook_setting: hookSetting,
          writing_style_analysis: writingStyleAnalysis,
          cta_setting: ctaSetting,
          reference_link_setting: referenceLinkSetting,
          core_topics: coreTopics,
          top_performing_patterns: p.topPerformingPatterns,
          additional_instructions: p.additionalInstructions ?? "",
        };
      });

      return NextResponse.json({ personas: formatted });
    } catch (dbErr) {
      // Fallback to local store when PostgreSQL service is not running
      const personas = loadPersonasStore();
      return NextResponse.json({ personas });
    }
  } catch (err: any) {
    console.error("GET /api/ai/persona error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
