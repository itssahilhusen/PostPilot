import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';

export interface Article {
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
}

// Custom RSS Item type reflecting fields returned by rss-parser for TLDR
interface CustomFeedItem extends Parser.Item {
  isoDate?: string;
  contentSnippet?: string;
  summary?: string;
  content?: string;
}

@Injectable()
export class TldrService {
  private readonly logger = new Logger(TldrService.name);
  private readonly parser: Parser<object, CustomFeedItem>;

  // TLDR target feeds
  private readonly feedUrls = {
    tech: 'https://tldr.tech/api/rss/tech',
    ai: 'https://tldr.tech/api/rss/ai',
  };

  constructor() {
    this.parser = new Parser<object, CustomFeedItem>({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      timeout: 15000,
    });
  }

  /**
   * Fetches, parses, filters, and maps TLDR RSS articles from Tech & AI feeds
   * returning only items published in the last 24 hours.
   */
  async fetchLatestArticles(): Promise<Article[]> {
    this.logger.log('Starting ingestion of TLDR Tech and AI feeds...');

    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    // Fetch both feeds concurrently with Promise.allSettled to isolate failures
    const results = await Promise.allSettled([
      this.fetchFeed(this.feedUrls.tech, 'Tech'),
      this.fetchFeed(this.feedUrls.ai, 'AI'),
    ]);

    const allArticles: Article[] = [];
    const seenLinks = new Set<string>();

    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          if (!item.isoDate) continue;

          const publishedTime = new Date(item.isoDate).getTime();

          // 4. Filter: only return articles published within the last 24 hours
          if (!isNaN(publishedTime) && publishedTime >= twentyFourHoursAgo && publishedTime <= now) {
            const link = item.link?.trim() ?? '';
            
            // Deduplicate across Tech & AI feeds if an item was cross-posted
            if (link && seenLinks.has(link.toLowerCase())) {
              continue;
            }
            if (link) seenLinks.add(link.toLowerCase());

            // 5. Map to clean Article interface
            allArticles.push({
              title: item.title?.trim() ?? 'Untitled',
              link,
              summary: (item.contentSnippet || item.summary || item.content || '').trim(),
              publishedAt: new Date(publishedTime).toISOString(),
            });
          }
        }
      }
    }

    this.logger.log(
      `Ingestion completed: ${allArticles.length} articles filtered within the last 24 hours.`,
    );

    return allArticles;
  }

  /**
   * Safe individual feed parser that catches errors without throwing.
   */
  private async fetchFeed(url: string, feedLabel: string): Promise<CustomFeedItem[]> {
    try {
      this.logger.debug(`Fetching ${feedLabel} feed from ${url}...`);
      const feed = await this.parser.parseURL(url);
      return feed.items ?? [];
    } catch (error: unknown) {
      // 6. Graceful Error Handling: Log error and return empty array to prevent crashing worker
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to fetch or parse TLDR ${feedLabel} feed at ${url}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return [];
    }
  }
}

