import { NewsSourcesService, NewsSourceItem, NewsArticleItem, normalizeCanonicalUrl, computeContentHash } from "./news-sources-service";
import { NewsAIProcessor } from "./news-ai-processor";
import { parseFeedXml, ParsedFeedItem } from "./feed-parser";

export interface IngestionReport {
  timestamp: string;
  total_sources_attempted: number;
  successful_sources: number;
  failed_sources: number;
  articles_fetched: number;
  new_articles_added: number;
  duration_ms: number;
}

export class NewsIngestionEngine {
  /**
   * Fetch news from a single source with retry, timeout, deduplication, and AI processing
   */
  static async fetchSource(source: NewsSourceItem): Promise<{
    success: boolean;
    fetched: number;
    added: number;
    error: string | null;
  }> {
    const startTime = Date.now();
    let fetched = 0;
    let added = 0;
    let lastError: string | null = null;

    // Retry with exponential backoff (up to 2 attempts)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (source.fetch_method === "rss" && source.rss_url) {
          const rawItems = await this.fetchRssFeed(source.rss_url, source.name);
          fetched = rawItems.length;

          if (fetched > 0) {
            const articleItems: NewsArticleItem[] = [];

            for (const item of rawItems) {
              const canonical = normalizeCanonicalUrl(item.url || source.website_url);
              const content = item.content || item.excerpt || "";
              const hash = computeContentHash(item.title, content);

              // Quick preliminary AI analysis
              const aiData = await NewsAIProcessor.processArticle({
                title: item.title,
                description: item.excerpt || item.title,
                article_content: content,
                source_name: source.name,
                category: source.category,
              });

              articleItems.push({
                id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                source_id: source.id,
                source_name: source.name,
                source_favicon_url: source.favicon_url,
                title: item.title,
                original_url: item.url,
                canonical_url: canonical,
                author: item.author || source.name,
                published_at: item.published_at || new Date().toISOString(),
                fetched_at: new Date().toISOString(),
                description: item.excerpt || item.title,
                article_content: content,
                image_url: item.thumbnail_url || null,
                category: source.category,
                tags: [source.category.toLowerCase().replace(/\s+/g, "-")],
                language: source.language || "en",
                content_hash: hash,
                importance_score: aiData.importance_score,
                credibility_score: aiData.credibility_score,
                verification_status: aiData.verification_status,
                processing_status: "processed",
                ai_summary: aiData.ai_summary,
                main_event: aiData.main_event,
                announcement_type: aiData.announcement_type,
                extracted_entities: aiData.extracted_entities,
                potential_concerns: aiData.potential_concerns,
                created_at: new Date().toISOString(),
              });
            }

            const res = NewsSourcesService.addArticles(articleItems);
            added = res.added;
          }
        } else if (source.fetch_method === "supported_web_extraction") {
          // Web extraction fallback via reader proxy
          const rawArticles = await this.extractFromWebsite(source.website_url, source);
          fetched = rawArticles.length;
          if (fetched > 0) {
            const res = NewsSourcesService.addArticles(rawArticles);
            added = res.added;
          }
        } else {
          // Manual or unsupported
          return {
            success: false,
            fetched: 0,
            added: 0,
            error: "Source requires manual RSS feed or API key configuration",
          };
        }

        // Success!
        const duration = Date.now() - startTime;
        NewsSourcesService.updateSource(source.id, {
          health_status: "Working",
          last_fetched_at: new Date().toISOString(),
          last_successful_fetch_at: new Date().toISOString(),
          last_error: null,
        });

        NewsSourcesService.addLog({
          source_id: source.id,
          status: "success",
          items_fetched: fetched,
          new_items_added: added,
          duration_ms: duration,
          message: `Fetched ${fetched} items, added ${added} new stories.`,
        });

        return { success: true, fetched, added, error: null };
      } catch (err: any) {
        lastError = err.message || "Fetch failed";
        if (attempt < 2) {
          // Exponential backoff wait (500ms)
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    // All retries failed
    const duration = Date.now() - startTime;
    NewsSourcesService.updateSource(source.id, {
      health_status: "Temporarily Unavailable",
      last_fetched_at: new Date().toISOString(),
      last_error: lastError,
    });

    NewsSourcesService.addLog({
      source_id: source.id,
      status: "error",
      items_fetched: 0,
      new_items_added: 0,
      duration_ms: duration,
      message: `Fetch failed: ${lastError}`,
    });

    return { success: false, fetched: 0, added: 0, error: lastError };
  }

  /**
   * Safe RSS fetch with browser headers and XML validation
   */
  private static async fetchRssFeed(rssUrl: string, sourceName: string): Promise<ParsedFeedItem[]> {
    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 (The AI Seed News Intelligence)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Feed HTTP status ${res.status} (${res.statusText || "Error"})`);
    }

    const xml = await res.text();
    if (!xml || xml.length < 50) {
      throw new Error("Feed returned empty payload");
    }

    return parseFeedXml(xml, rssUrl, sourceName);
  }

  /**
   * Web extraction for sources without direct RSS feeds
   */
  private static async extractFromWebsite(websiteUrl: string, source: NewsSourceItem): Promise<NewsArticleItem[]> {
    const jinaUrl = `https://r.jina.ai/${websiteUrl}`;
    const res = await fetch(jinaUrl, {
      headers: {
        "User-Agent": "PostPilot/1.0",
        Accept: "text/markdown, text/plain, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`Web extraction proxy returned status ${res.status}`);
    }

    const text = await res.text();
    const titleMatch = text.match(/^Title:\s*(.+)$/m);
    const contentMatch = text.match(/Markdown Content:\s*([\s\S]+)$/);
    const title = titleMatch ? titleMatch[1].trim() : `${source.name} Update`;
    const body = contentMatch ? contentMatch[1].trim().slice(0, 1000) : text.slice(0, 1000);

    const canonical = normalizeCanonicalUrl(websiteUrl);
    const hash = computeContentHash(title, body);

    const aiData = await NewsAIProcessor.processArticle({
      title,
      description: body.slice(0, 240),
      article_content: body,
      source_name: source.name,
      category: source.category,
    });

    return [
      {
        id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        source_id: source.id,
        source_name: source.name,
        source_favicon_url: source.favicon_url,
        title,
        original_url: websiteUrl,
        canonical_url: canonical,
        author: source.name,
        published_at: new Date().toISOString(),
        fetched_at: new Date().toISOString(),
        description: body.slice(0, 240),
        article_content: body,
        image_url: null,
        category: source.category,
        tags: [source.category.toLowerCase().replace(/\s+/g, "-")],
        language: "en",
        content_hash: hash,
        importance_score: aiData.importance_score,
        credibility_score: aiData.credibility_score,
        verification_status: aiData.verification_status,
        processing_status: "processed",
        ai_summary: aiData.ai_summary,
        main_event: aiData.main_event,
        announcement_type: aiData.announcement_type,
        extracted_entities: aiData.extracted_entities,
        potential_concerns: aiData.potential_concerns,
        created_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Ingest across all active sources with concurrency pooling (rate limited to 5 concurrent)
   */
  static async fetchAllActiveSources(options?: {
    category?: string;
    concurrency?: number;
    limit?: number;
  }): Promise<IngestionReport> {
    const startTime = Date.now();
    const sources = NewsSourcesService.getSources().filter(
      (s) => s.is_active && s.health_status !== "Disabled"
    );

    const filtered = options?.category && options.category !== "all"
      ? sources.filter((s) => s.category === options.category)
      : sources;

    const toProcess = options?.limit ? filtered.slice(0, options.limit) : filtered;
    const concurrency = options?.concurrency ?? 5;

    let successful = 0;
    let failed = 0;
    let totalFetched = 0;
    let totalAdded = 0;

    for (let i = 0; i < toProcess.length; i += concurrency) {
      const batch = toProcess.slice(i, i + concurrency);
      const results = await Promise.all(batch.map((s) => this.fetchSource(s)));

      for (const res of results) {
        if (res.success) {
          successful++;
          totalFetched += res.fetched;
          totalAdded += res.added;
        } else {
          failed++;
        }
      }
    }

    const duration = Date.now() - startTime;
    return {
      timestamp: new Date().toISOString(),
      total_sources_attempted: toProcess.length,
      successful_sources: successful,
      failed_sources: failed,
      articles_fetched: totalFetched,
      new_articles_added: totalAdded,
      duration_ms: duration,
    };
  }
}

