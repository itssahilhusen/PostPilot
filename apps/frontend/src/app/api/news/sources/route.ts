import { NextRequest, NextResponse } from "next/server";
import { NewsSourcesService, NewsSourceItem } from "@/lib/news-sources-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const health = searchParams.get("health") || "all";
    const status = searchParams.get("status") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    let sources = NewsSourcesService.getSources();

    if (category !== "all") {
      sources = sources.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }
    if (health !== "all") {
      sources = sources.filter((s) => s.health_status.toLowerCase() === health.toLowerCase());
    }
    if (status === "active") {
      sources = sources.filter((s) => s.is_active);
    } else if (status === "inactive") {
      sources = sources.filter((s) => !s.is_active);
    }
    if (search) {
      sources = sources.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.website_url.toLowerCase().includes(search) ||
          (s.rss_url && s.rss_url.toLowerCase().includes(search))
      );
    }

    const stats = NewsSourcesService.getStats();

    return NextResponse.json({
      sources,
      total: sources.length,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, website_url, rss_url, category, source_type, fetch_method } = body;

    if (!name || !website_url) {
      return NextResponse.json(
        { error: "Name and website_url are required." },
        { status: 400 }
      );
    }

    const sources = NewsSourcesService.getSources();
    const cleanUrl = website_url.trim().toLowerCase().replace(/\/$/, "");

    const existing = sources.find(
      (s) => s.website_url.toLowerCase().replace(/\/$/, "") === cleanUrl
    );
    if (existing) {
      return NextResponse.json(
        { error: "A source with this website URL already exists." },
        { status: 409 }
      );
    }

    let domain = "";
    try {
      domain = new URL(website_url).hostname.replace(/^www\./, "");
    } catch {}

    const newSource: NewsSourceItem = {
      id: `src_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      website_url: website_url.trim(),
      rss_url: rss_url ? rss_url.trim() : null,
      category: category || "AI & Machine Learning",
      source_type: source_type || "publication",
      fetch_method: fetch_method || (rss_url ? "rss" : "supported_web_extraction"),
      is_active: true,
      trust_level: 85,
      language: "en",
      health_status: rss_url ? "Working" : "Needs Configuration",
      last_fetched_at: null,
      last_successful_fetch_at: null,
      last_error: null,
      favicon_url: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    sources.unshift(newSource);
    NewsSourcesService.saveSources(sources);

    return NextResponse.json({ source: newSource }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

