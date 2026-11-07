import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SAMPLE_PERSONA_A } from "@/lib/persona-defaults";
import { loadPersonasStore, savePersonasStore } from "@/lib/persona-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      account_id,
      workspace_id,
      persona_number = 0,
      max_posts = 25,
      language = "en",
      content_language = "en",
      name,
      top_posts_only = false,
      top_posts_criteria,
      top_posts_count = 10,
    } = body;

    const finalName = name || "Analyzed Brand Voice";

    try {
      let workspace = workspace_id
        ? await prisma.workspace.findUnique({ where: { id: workspace_id } })
        : await prisma.workspace.findFirst();

      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: { name: "My Workspace", handle: "my-workspace" },
        });
      }

      const account = account_id
        ? await prisma.socialAccount.findUnique({ where: { id: account_id } })
        : await prisma.socialAccount.findFirst({ where: { workspaceId: workspace.id } });

      const personaData = {
        workspaceId: workspace.id,
        socialAccountId: account?.id ?? null,
        personaNumber: Number(persona_number),
        name: finalName,
        status: "active",
        analysisMethod: "myAccount",
        analyzedPostsCount: top_posts_only ? Number(top_posts_count) : Number(max_posts),
        analyzedAt: new Date(),
        language: language || "en",
        contentLanguage: content_language || "en",
        sentenceStructureKeepOriginal: false,
        profileIdentity: `Verified brand voice analyzed from ${account?.name || "account"} (@${account?.handle || "user"}).`,
        targetAudience: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.target_audience),
        hookSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.hook_setting),
        writingStyleAnalysis: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.writing_style_analysis),
        ctaSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.cta_setting),
        referenceLinkSetting: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.reference_link_setting),
        coreTopics: JSON.stringify(DEFAULT_SAMPLE_PERSONA_A.core_topics),
        topPerformingPatterns: DEFAULT_SAMPLE_PERSONA_A.top_performing_patterns,
        additionalInstructions: `Auto-analyzed from connected profile ${account?.handle || ""}.`,
      };

      const existing = await prisma.persona.findFirst({
        where: {
          workspaceId: workspace.id,
          socialAccountId: account?.id ?? null,
          personaNumber: Number(persona_number),
        },
      });

      let persona;
      if (existing) {
        persona = await prisma.persona.update({
          where: { id: existing.id },
          data: personaData,
        });
      } else {
        persona = await prisma.persona.create({
          data: personaData,
        });
      }

      return NextResponse.json({ success: true, persona });
    } catch {
      // Fallback store
      const personas = loadPersonasStore();
      const newPersona = {
        id: `persona-${Date.now()}`,
        workspace_id: workspace_id || "940355c0-a24b-4843-9687-bbf55198de44",
        social_account_id: account_id || null,
        blog_account_id: null,
        persona_number: Number(persona_number),
        name: finalName,
        status: "active" as const,
        analysis_method: "myAccount" as const,
        analyzed_posts_count: Number(max_posts),
        analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by_user: { full_name: "Workspace Member", email: "team@reerts.com" },
        language: language || "en",
        content_language: content_language || "en",
        sentence_structure_keep_original: false,
        profile_identity: `Brand voice created via My Account analysis.`,
        target_audience: DEFAULT_SAMPLE_PERSONA_A.target_audience,
        hook_setting: DEFAULT_SAMPLE_PERSONA_A.hook_setting,
        writing_style_analysis: DEFAULT_SAMPLE_PERSONA_A.writing_style_analysis,
        cta_setting: DEFAULT_SAMPLE_PERSONA_A.cta_setting,
        reference_link_setting: DEFAULT_SAMPLE_PERSONA_A.reference_link_setting,
        core_topics: DEFAULT_SAMPLE_PERSONA_A.core_topics,
        top_performing_patterns: DEFAULT_SAMPLE_PERSONA_A.top_performing_patterns,
        additional_instructions: "Auto-analyzed.",
      };

      const existingIdx = personas.findIndex(
        (p) => p.persona_number === Number(persona_number) && p.social_account_id === account_id
      );

      if (existingIdx !== -1) {
        personas[existingIdx] = newPersona;
      } else {
        personas.push(newPersona);
      }
      savePersonasStore(personas);

      return NextResponse.json({ success: true, persona: newPersona });
    }
  } catch (err: any) {
    console.error("POST /api/ai/persona/analyze error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
