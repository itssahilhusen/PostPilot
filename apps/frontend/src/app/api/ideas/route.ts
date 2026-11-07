import { NextRequest, NextResponse } from "next/server";
import { getStoredIdeas, saveStoredIdeas, StoredIdea } from "@/lib/sources-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get("source_id");
    const platform = searchParams.get("platform");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let ideas = getStoredIdeas();

    if (sourceId && sourceId !== "all") {
      const sourceIds = sourceId.split(",").map((s) => s.trim());
      ideas = ideas.filter((item) => sourceIds.includes(item.source_id));
    }

    if (platform && platform !== "all") {
      ideas = ideas.filter((item) => {
        const u = item.url.toLowerCase();
        if (platform === "youtube") return u.includes("youtube.com") || u.includes("youtu.be");
        if (platform === "x") return u.includes("x.com") || u.includes("twitter.com");
        if (platform === "reddit") return u.includes("reddit.com");
        if (platform === "github") return u.includes("github.com");
        if (platform === "instagram") return u.includes("instagram.com");
        if (platform === "threads") return u.includes("threads.net") || u.includes("threads.com");
        if (platform === "linkedin") return u.includes("linkedin.com");
        if (platform === "telegram") return u.includes("t.me");
        return true;
      });
    }

    const items = ideas.slice(0, limit);

    // Format for StudioView compatibility as well
    const studioCompatibleIdeas = items.map((i) => ({
      id: i.id,
      title: i.title,
      excerpt: i.excerpt,
      content: i.content,
      sourceType: i.source_title || "Web",
      viralityScore: 94,
      tags: ["Trending", "Benchmark"],
      createdAt: i.published_at,
      url: i.url,
      thumbnail_url: i.thumbnail_url,
    }));

    return NextResponse.json({
      items,
      ideas: studioCompatibleIdeas,
      total: ideas.length,
      nextCursor: ideas.length > limit ? "next" : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, excerpt, source_id, url, source_title, thumbnail_url } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const ideas = getStoredIdeas();
    const newIdea: StoredIdea = {
      id: `idea_${Date.now()}`,
      source_id: source_id || "custom",
      title,
      url: url || "https://example.com",
      published_at: new Date().toISOString(),
      source_title: source_title || "Manual Source",
      source_favicon_url: null,
      thumbnail_url: thumbnail_url || null,
      excerpt: excerpt || "",
      author: "Editor",
    };

    ideas.unshift(newIdea);
    saveStoredIdeas(ideas);

    return NextResponse.json({ item: newIdea, idea: newIdea }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
