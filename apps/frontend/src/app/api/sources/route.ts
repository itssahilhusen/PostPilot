import { NextRequest, NextResponse } from "next/server";
import {
  getStoredSources,
  saveStoredSources,
  getStoredIdeas,
  saveStoredIdeas,
  detectPlatformFromUrl,
  deriveTitleFromUrl,
  StoredSource,
} from "@/lib/sources-store";
import { fetchUniversalFeed } from "@/lib/feed-parser";

export async function GET(req: NextRequest) {
  try {
    const sources = getStoredSources();
    return NextResponse.json({ sources });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const cleanUrl = url.trim();
    const sources = getStoredSources();

    // Check duplicate
    const exists = sources.find(
      (s) => s.url.toLowerCase().replace(/\/$/, "") === cleanUrl.toLowerCase().replace(/\/$/, "")
    );
    if (exists) {
      return NextResponse.json(
        { error: "duplicate_source", message: "This source is already registered" },
        { status: 409 }
      );
    }

    const initialPlatform = detectPlatformFromUrl(cleanUrl);
    const initialTitle = deriveTitleFromUrl(cleanUrl, initialPlatform);

    // Universal multi-platform feed resolver (Feedly, TLDR, TechCrunch, Reddit, X, etc.)
    let universalResult = {
      items: [] as any[],
      resolvedTitle: initialTitle,
      resolvedPlatform: initialPlatform,
      faviconUrl: null as string | null,
    };

    try {
      universalResult = await fetchUniversalFeed(cleanUrl, initialTitle);
    } catch (err: any) {
      console.warn("Universal feed fetch warning:", err.message);
    }

    const platform = universalResult.resolvedPlatform || initialPlatform;
    const title = universalResult.resolvedTitle || initialTitle;
    let faviconUrl = universalResult.faviconUrl;
    if (!faviconUrl) {
      try {
        const u = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
        faviconUrl = `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
      } catch {
        faviconUrl = "https://www.google.com/s2/favicons?domain=example.com&sz=64";
      }
    }

    const newSource: StoredSource = {
      id: `src_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url: cleanUrl,
      title,
      platform,
      status: "active",
      last_fetched_at: new Date().toISOString(),
      last_error: null,
      favicon_url: faviconUrl,
      created_at: new Date().toISOString(),
    };

    sources.unshift(newSource);
    saveStoredSources(sources);

    // Save newly fetched stories immediately so they appear at the top of the ideas feed
    let itemsCount = 0;
    if (universalResult.items && universalResult.items.length > 0) {
      const ideas = getStoredIdeas();
      const existingUrls = new Set(ideas.map((i) => i.url.toLowerCase()));
      const uniqueFeedItems = universalResult.items
        .filter((i) => !existingUrls.has(i.url.toLowerCase()))
        .map((i) => ({ ...i, source_id: newSource.id }));

      if (uniqueFeedItems.length > 0) {
        saveStoredIdeas([...uniqueFeedItems, ...ideas]);
        itemsCount = uniqueFeedItems.length;
      }
    }

    return NextResponse.json(
      {
        source: newSource,
        itemsCount,
        items: universalResult.items,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
