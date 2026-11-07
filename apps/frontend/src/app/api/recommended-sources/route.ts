import { NextRequest, NextResponse } from "next/server";
import {
  getStoredSources,
  RECOMMENDED_PRESETS,
  RecommendedCategoryDef,
} from "@/lib/sources-store";

export async function GET(req: NextRequest) {
  try {
    const sources = getStoredSources();

    // Map existing URLs to their source ID
    const urlMap = new Map<string, string>();
    for (const s of sources) {
      urlMap.set(s.url.toLowerCase().replace(/\/$/, ""), s.id);
    }

    const categoriesWithSubscription: RecommendedCategoryDef[] = RECOMMENDED_PRESETS.map((cat) => ({
      ...cat,
      sources: cat.sources.map((rec) => {
        const normUrl = rec.url.toLowerCase().replace(/\/$/, "");
        const contentSourceId = urlMap.get(normUrl) || null;
        return {
          ...rec,
          subscribed: !!contentSourceId,
          contentSourceId,
        };
      }),
    }));

    return NextResponse.json({ categories: categoriesWithSubscription });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

