import { NextRequest, NextResponse } from "next/server";
import {
  getStoredSources,
  saveStoredSources,
  getStoredIdeas,
  saveStoredIdeas,
  StoredIdea,
} from "@/lib/sources-store";
import { fetchUniversalFeed } from "@/lib/feed-parser";

export async function POST(req: NextRequest) {
  try {
    const sources = getStoredSources();
    const ideas = getStoredIdeas();

    const activeSources = sources.filter((s) => s.status === "active");
    if (activeSources.length === 0) {
      return NextResponse.json({
        newItems: 0,
        total: ideas.length,
        message: "No active sources found to refresh.",
      });
    }

    const now = new Date();
    const existingUrls = new Set(ideas.map((i) => i.url.toLowerCase()));
    let newItemsCount = 0;
    const freshlyFetched: StoredIdea[] = [];

    // Fetch live feeds across all active sources concurrently
    await Promise.all(
      activeSources.map(async (source) => {
        try {
          source.last_fetched_at = now.toISOString();
          const result = await fetchUniversalFeed(source.url, source.title);
          source.last_error = null;

          if (result.resolvedTitle && result.resolvedTitle !== source.url && source.title === source.url) {
            source.title = result.resolvedTitle;
          }
          if (result.faviconUrl && !source.favicon_url) {
            source.favicon_url = result.faviconUrl;
          }

          for (const item of result.items) {
            if (!existingUrls.has(item.url.toLowerCase())) {
              existingUrls.add(item.url.toLowerCase());
              newItemsCount++;
              freshlyFetched.push({
                ...item,
                source_id: source.id,
              });
            }
          }
        } catch (err: any) {
          source.last_error = err.message || "Failed to fetch feed";
        }
      })
    );

    // Save updated source timestamps
    saveStoredSources(sources);

    // If new live items were pulled, prepend them to the store
    if (freshlyFetched.length > 0) {
      saveStoredIdeas([...freshlyFetched, ...ideas]);
    }

    return NextResponse.json({
      newItems: newItemsCount,
      total: ideas.length + newItemsCount,
      refreshedAt: now.toISOString(),
      message: newItemsCount > 0 ? `Fetched ${newItemsCount} new stories` : "All sources are up to date",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
