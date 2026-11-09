import { NextRequest, NextResponse } from "next/server";
import { NewsSourcesService } from "@/lib/news-sources-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const sourceId = searchParams.get("sourceId") || "all";
    const importance = searchParams.get("importance") || "all"; // high (>=75), medium (>=50), all
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const limit = parseInt(searchParams.get("limit") || "40", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let articles = NewsSourcesService.getArticles();

    if (category !== "all") {
      articles = articles.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }
    if (sourceId !== "all") {
      articles = articles.filter((a) => a.source_id === sourceId);
    }
    if (importance === "high") {
      articles = articles.filter((a) => a.importance_score >= 75);
    } else if (importance === "medium") {
      articles = articles.filter((a) => a.importance_score >= 50 && a.importance_score < 75);
    }
    if (search) {
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search) ||
          a.source_name.toLowerCase().includes(search) ||
          (a.ai_summary && a.ai_summary.toLowerCase().includes(search))
      );
    }

    // Sort by newest published date
    articles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    const total = articles.length;
    const paginated = articles.slice(offset, offset + limit);

    return NextResponse.json({
      articles: paginated,
      total,
      limit,
      offset,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

