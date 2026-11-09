import fs from "fs";
import path from "path";
import crypto from "crypto";
import { INITIAL_100_SOURCES, NewsSourceItem } from "./news-sources-data";
export type { NewsSourceItem };

export interface NewsArticleItem {
  id: string;
  source_id: string;
  source_name: string;
  source_favicon_url: string | null;
  title: string;
  original_url: string;
  canonical_url: string;
  author: string | null;
  published_at: string;
  fetched_at: string;
  description: string;
  article_content: string;
  image_url: string | null;
  category: string;
  tags: string[];
  language: string;
  content_hash: string;
  importance_score: number; // 1-100
  credibility_score: number; // 1-100
  verification_status: "verified" | "unverified" | "disputed";
  processing_status: "pending" | "processed" | "failed";
  ai_summary: string | null;
  main_event: string | null;
  announcement_type: "product_launch" | "funding" | "research_breakthrough" | "acquisition" | "update" | "industry_development" | "other" | null;
  extracted_entities: {
    companies?: string[];
    products?: string[];
    people?: string[];
  };
  potential_concerns: string | null;
  created_at: string;
}

export interface FetchLogEntry {
  id: string;
  source_id: string;
  timestamp: string;
  status: "success" | "error" | "skipped";
  items_fetched: number;
  new_items_added: number;
  duration_ms: number;
  message: string;
}

function resolveStorePath(filename: string): string {
  const candidates = [
    path.join(process.cwd(), "apps/frontend/src/lib", filename),
    path.join(process.cwd(), "src/lib", filename),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) || fs.existsSync(path.dirname(c))) return c;
  }
  return candidates[0];
}

const SOURCES_FILE = resolveStorePath("news-sources-data.json");
const ARTICLES_FILE = resolveStorePath("news-articles-data.json");
const LOGS_FILE = resolveStorePath("news-fetch-logs.json");

// In-Memory Caches
let cachedSources: NewsSourceItem[] | null = null;
let cachedArticles: NewsArticleItem[] | null = null;
let cachedLogs: FetchLogEntry[] | null = null;

// Normalize URL for canonical comparison and deduplication
export function normalizeCanonicalUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    const tracking = [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "fbclid", "gclid", "ref", "source", "feed"
    ];
    tracking.forEach(p => u.searchParams.delete(p));
    let cleaned = u.toString().replace(/\/$/, "");
    return cleaned;
  } catch {
    return urlStr.trim().toLowerCase().replace(/\/$/, "");
  }
}

// Compute 256-bit hash of content + title for robust duplicate detection
export function computeContentHash(title: string, content: string): string {
  const normalized = `${title.toLowerCase().trim()}|${content.toLowerCase().slice(0, 300).trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export class NewsSourcesService {
  // Load Sources
  static getSources(): NewsSourceItem[] {
    if (cachedSources) return cachedSources;
    try {
      if (fs.existsSync(SOURCES_FILE)) {
        const raw = fs.readFileSync(SOURCES_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedSources = parsed;
          return cachedSources;
        }
      }
    } catch (e) {
      console.warn("Could not read news sources file, using initial presets:", e);
    }

    // Default to Initial 100 Sources
    cachedSources = [...INITIAL_100_SOURCES];
    this.saveSources(cachedSources);
    return cachedSources;
  }

  // Save Sources
  static saveSources(sources: NewsSourceItem[]) {
    cachedSources = sources;
    try {
      const dir = path.dirname(SOURCES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SOURCES_FILE, JSON.stringify(sources, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save news sources file:", e);
    }
  }

  static getSourceById(id: string): NewsSourceItem | null {
    const sources = this.getSources();
    return sources.find(s => s.id === id) || null;
  }

  static updateSource(id: string, updates: Partial<NewsSourceItem>): NewsSourceItem | null {
    const sources = this.getSources();
    const idx = sources.findIndex(s => s.id === id);
    if (idx === -1) return null;

    sources[idx] = {
      ...sources[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveSources(sources);
    return sources[idx];
  }

  static toggleActive(id: string, is_active: boolean): NewsSourceItem | null {
    return this.updateSource(id, { is_active });
  }

  // Load Articles
  static getArticles(): NewsArticleItem[] {
    if (cachedArticles) return cachedArticles;
    try {
      if (fs.existsSync(ARTICLES_FILE)) {
        const raw = fs.readFileSync(ARTICLES_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cachedArticles = parsed;
          return cachedArticles;
        }
      }
    } catch (e) {
      console.warn("Could not read news articles file:", e);
    }
    cachedArticles = [];
    return cachedArticles;
  }

  // Save Articles
  static saveArticles(articles: NewsArticleItem[]) {
    cachedArticles = articles;
    try {
      const dir = path.dirname(ARTICLES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save news articles file:", e);
    }
  }

  // Add Articles with Deduplication
  static addArticles(newArticles: NewsArticleItem[]): { added: number; skipped: number } {
    const articles = this.getArticles();
    const existingCanonicals = new Set(articles.map(a => a.canonical_url.toLowerCase()));
    const existingHashes = new Set(articles.map(a => a.content_hash));

    const toInsert: NewsArticleItem[] = [];
    let skipped = 0;

    for (const a of newArticles) {
      const canonicalKey = a.canonical_url.toLowerCase();
      if (existingCanonicals.has(canonicalKey) || existingHashes.has(a.content_hash)) {
        skipped++;
        continue;
      }
      existingCanonicals.add(canonicalKey);
      existingHashes.add(a.content_hash);
      toInsert.push(a);
    }

    if (toInsert.length > 0) {
      // Prepend newest articles
      const updated = [...toInsert, ...articles].slice(0, 5000); // retain up to 5,000 articles
      this.saveArticles(updated);
    }

    return { added: toInsert.length, skipped };
  }

  static getArticleById(id: string): NewsArticleItem | null {
    const articles = this.getArticles();
    return articles.find(a => a.id === id) || null;
  }

  static updateArticle(id: string, updates: Partial<NewsArticleItem>): NewsArticleItem | null {
    const articles = this.getArticles();
    const idx = articles.findIndex(a => a.id === id);
    if (idx === -1) return null;

    articles[idx] = {
      ...articles[idx],
      ...updates,
    };
    this.saveArticles(articles);
    return articles[idx];
  }

  // Logs
  static getLogs(): FetchLogEntry[] {
    if (cachedLogs) return cachedLogs;
    try {
      if (fs.existsSync(LOGS_FILE)) {
        const raw = fs.readFileSync(LOGS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cachedLogs = parsed;
          return cachedLogs;
        }
      }
    } catch {}
    cachedLogs = [];
    return cachedLogs;
  }

  static addLog(entry: Omit<FetchLogEntry, "id" | "timestamp">) {
    const logs = this.getLogs();
    const newLog: FetchLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    logs.unshift(newLog);
    // keep latest 200 logs
    const trimmed = logs.slice(0, 200);
    cachedLogs = trimmed;
    try {
      fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
    } catch {}
    return newLog;
  }

  // System Statistics
  static getStats() {
    const sources = this.getSources();
    const articles = this.getArticles();

    const working = sources.filter(s => s.health_status === "Working").length;
    const needsConfig = sources.filter(s => s.health_status === "Needs Configuration").length;
    const unavailable = sources.filter(s => s.health_status === "Temporarily Unavailable").length;
    const disabled = sources.filter(s => !s.is_active || s.health_status === "Disabled").length;

    const rssCount = sources.filter(s => s.fetch_method === "rss").length;
    const webExtractCount = sources.filter(s => s.fetch_method === "supported_web_extraction").length;
    const apiCount = sources.filter(s => s.fetch_method === "api").length;

    const highImportance = articles.filter(a => a.importance_score >= 75).length;
    const processedAI = articles.filter(a => a.processing_status === "processed").length;

    return {
      total_sources: sources.length,
      working_sources: working,
      needs_config_sources: needsConfig,
      unavailable_sources: unavailable,
      disabled_sources: disabled,
      rss_count: rssCount,
      web_extract_count: webExtractCount,
      api_count: apiCount,
      total_articles: articles.length,
      high_importance_articles: highImportance,
      processed_ai_articles: processedAI,
    };
  }
}

