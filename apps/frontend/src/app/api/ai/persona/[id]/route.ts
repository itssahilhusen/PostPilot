import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadPersonasStore, savePersonasStore } from "@/lib/persona-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { section, data } = body;

    try {
      const existing = await prisma.persona.findUnique({ where: { id } });
      if (!existing) {
        throw new Error("Persona not found in DB");
      }

      const updatePayload: any = {};
      switch (section) {
        case "name":
          updatePayload.name = String(data);
          break;
        case "content_language":
          updatePayload.contentLanguage = String(data);
          break;
        case "sentence_structure_keep_original":
          updatePayload.sentenceStructureKeepOriginal = Boolean(data);
          break;
        case "profile_identity":
          updatePayload.profileIdentity = String(data);
          break;
        case "target_audience":
          updatePayload.targetAudience = typeof data === "string" ? data : JSON.stringify(data);
          break;
        case "hook_setting":
          updatePayload.hookSetting = typeof data === "string" ? data : JSON.stringify(data);
          break;
        case "writing_style_analysis":
          updatePayload.writingStyleAnalysis = typeof data === "string" ? data : JSON.stringify(data);
          break;
        case "cta_setting":
          updatePayload.ctaSetting = typeof data === "string" ? data : JSON.stringify(data);
          break;
        case "reference_link_setting":
          updatePayload.referenceLinkSetting = typeof data === "string" ? data : JSON.stringify(data);
          break;
        case "core_topics":
          updatePayload.coreTopics = Array.isArray(data) ? JSON.stringify(data) : String(data);
          break;
        case "top_performing_patterns":
          updatePayload.topPerformingPatterns = String(data);
          break;
        case "additional_instructions":
          updatePayload.additionalInstructions = String(data);
          break;
        default:
          if (section.startsWith("ws_")) {
            let curr = {};
            try { curr = existing.writingStyleAnalysis ? JSON.parse(existing.writingStyleAnalysis) : {}; } catch {}
            curr = { ...curr, ...data };
            updatePayload.writingStyleAnalysis = JSON.stringify(curr);
          }
          break;
      }

      const updated = await prisma.persona.update({
        where: { id },
        data: updatePayload,
      });

      return NextResponse.json({ success: true, persona: updated });
    } catch (dbErr) {
      // Fallback in-memory / JSON store
      const personas = loadPersonasStore();
      const idx = personas.findIndex((p) => p.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: "Persona not found" }, { status: 404 });
      }

      const p = personas[idx];
      switch (section) {
        case "name":
          p.name = String(data);
          break;
        case "content_language":
          p.content_language = String(data);
          break;
        case "sentence_structure_keep_original":
          p.sentence_structure_keep_original = Boolean(data);
          break;
        case "profile_identity":
          p.profile_identity = String(data);
          break;
        case "target_audience":
          p.target_audience = data;
          break;
        case "hook_setting":
          p.hook_setting = data;
          break;
        case "writing_style_analysis":
          p.writing_style_analysis = data;
          break;
        case "cta_setting":
          p.cta_setting = data;
          break;
        case "reference_link_setting":
          p.reference_link_setting = data;
          break;
        case "core_topics":
          p.core_topics = data;
          break;
        case "top_performing_patterns":
          p.top_performing_patterns = String(data);
          break;
        case "additional_instructions":
          p.additional_instructions = String(data);
          break;
        default:
          if (section.startsWith("ws_")) {
            p.writing_style_analysis = {
              ...p.writing_style_analysis,
              ...data,
            };
          }
          break;
      }
      p.updated_at = new Date().toISOString();
      personas[idx] = p;
      savePersonasStore(personas);

      return NextResponse.json({ success: true, persona: p });
    }
  } catch (err: any) {
    console.error("PATCH /api/ai/persona/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    try {
      await prisma.persona.delete({ where: { id } });
    } catch {
      const personas = loadPersonasStore();
      const filtered = personas.filter((p) => p.id !== id);
      savePersonasStore(filtered);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("DELETE /api/ai/persona/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
