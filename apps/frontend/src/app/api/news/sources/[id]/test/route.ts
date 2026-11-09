import { NextRequest, NextResponse } from "next/server";
import { NewsSourcesService } from "@/lib/news-sources-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const source = NewsSourcesService.getSourceById(params.id);
    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    const testUrl = source.rss_url || source.website_url;
    const startTime = Date.now();

    const response = await fetch(testUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 (PostPilot Test Connection)",
        Accept: source.rss_url
          ? "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
          : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    const duration = Date.now() - startTime;
    const ok = response.ok;
    const status = response.status;
    const contentType = response.headers.get("content-type") || "";

    let hasArticles = false;
    let sampleTitle: string | null = null;
    let itemCount = 0;

    if (ok) {
      const text = await response.text();
      itemCount = (text.match(/<(?:item|entry)[\s>]/gi) || []).length;
      hasArticles = itemCount > 0;
      const titleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      sampleTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : null;
    }

    return NextResponse.json({
      reachable: ok,
      status_code: status,
      duration_ms: duration,
      content_type: contentType,
      is_feed: contentType.includes("xml") || contentType.includes("rss") || contentType.includes("atom"),
      has_article_entries: hasArticles,
      item_count: itemCount,
      sample_title: sampleTitle,
    });
  } catch (err: any) {
    return NextResponse.json({
      reachable: false,
      error: err.message || "Connection timed out",
    }, { status: 200 });
  }
}

