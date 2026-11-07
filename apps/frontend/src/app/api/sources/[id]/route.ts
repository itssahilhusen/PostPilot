import { NextRequest, NextResponse } from "next/server";
import {
  getStoredSources,
  saveStoredSources,
  getStoredIdeas,
  saveStoredIdeas,
} from "@/lib/sources-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    const sources = getStoredSources();
    const idx = sources.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    if (status && ["active", "paused", "failed"].includes(status)) {
      sources[idx].status = status;
      if (status === "active") {
        sources[idx].last_error = null;
        sources[idx].last_fetched_at = new Date().toISOString();
      }
    }

    saveStoredSources(sources);
    return NextResponse.json({ source: sources[idx] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    let sources = getStoredSources();
    const target = sources.find((s) => s.id === id);

    if (!target) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    sources = sources.filter((s) => s.id !== id);
    saveStoredSources(sources);

    // Also remove associated ideas
    let ideas = getStoredIdeas();
    ideas = ideas.filter((i) => i.source_id !== id && i.url !== target.url);
    saveStoredIdeas(ideas);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

