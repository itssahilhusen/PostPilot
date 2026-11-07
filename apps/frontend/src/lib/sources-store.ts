import fs from "fs";
import path from "path";

export interface StoredSource {
  id: string;
  url: string;
  title: string;
  platform: string;
  status: "active" | "paused" | "failed";
  last_fetched_at: string | null;
  last_error: string | null;
  favicon_url: string | null;
  created_at: string;
}

export interface StoredIdea {
  id: string;
  source_id: string;
  title: string;
  url: string;
  published_at: string;
  source_title: string;
  source_favicon_url: string | null;
  thumbnail_url: string | null;
  excerpt: string;
  content?: string;
  author: string;
}

export interface RecommendedSourceDef {
  id: string;
  label: string;
  url: string;
  category: string;
}

export interface RecommendedCategoryDef {
  id: string;
  nameEn: string;
  nameKo?: string;
  sources: {
    id: string;
    label: string;
    url: string;
    subscribed?: boolean;
    contentSourceId?: string | null;
  }[];
}

function resolveStorePath(filename: string): string {
  const candidates = [
    path.join(process.cwd(), "apps/frontend/src/lib", filename),
    path.join(process.cwd(), "src/lib", filename),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
    if (fs.existsSync(path.dirname(c))) return c;
  }
  return candidates[0];
}

const SOURCES_FILE = resolveStorePath("sources-store.json");
const IDEAS_FILE = resolveStorePath("ideas-store.json");

// No static/mock sources or ideas by default
const DEFAULT_SOURCES: StoredSource[] = [];
const DEFAULT_IDEAS: StoredIdea[] = [];

export const RECOMMENDED_PRESETS: RecommendedCategoryDef[] = [
  {
    id: "tech",
    nameEn: "Tech & AI",
    nameKo: "테크 & AI",
    sources: [
      { id: "rec_openai", label: "OpenAI Research & News", url: "https://openai.com/news/rss.xml" },
      { id: "rec_anthropic", label: "Anthropic Engineering Updates", url: "https://www.anthropic.com/news/rss" },
      { id: "rec_techcrunch", label: "TechCrunch AI & Robotics", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
      { id: "rec_simon", label: "Simon Willison Weblog", url: "https://simonwillison.net/atom/everything/" },
      { id: "rec_hn", label: "Hacker News Top Stories", url: "https://news.ycombinator.com/rss" },
      { id: "rec_verge", label: "The Verge Tech & AI", url: "https://www.theverge.com/rss/index.xml" },
    ],
  },
  {
    id: "marketing",
    nameEn: "Marketing & Growth",
    nameKo: "마케팅 & 성장",
    sources: [
      { id: "rec_lenny", label: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/feed" },
      { id: "rec_marketingbrew", label: "Marketing Brew Daily", url: "https://www.morningbrew.com/marketing/feed" },
      { id: "rec_ahrefs", label: "Ahrefs SEO & Growth Blog", url: "https://ahrefs.com/blog/feed/" },
      { id: "rec_demandcurve", label: "Demand Curve Growth Insights", url: "https://www.demandcurve.com/feed" },
      { id: "rec_sparktoro", label: "SparkToro Audience Research", url: "https://sparktoro.com/blog/feed/" },
    ],
  },
  {
    id: "founders",
    nameEn: "Founders & Creators",
    nameKo: "창업가 & 크리에이터",
    sources: [
      { id: "rec_paulgraham", label: "Paul Graham Essays", url: "http://www.paulgraham.com/rss.html" },
      { id: "rec_levelsio", label: "Pieter Levels (@levelsio)", url: "https://x.com/levelsio" },
      { id: "rec_sahil", label: "Sahil Lavingia Writings", url: "https://sahillavingia.com/feed.xml" },
      { id: "rec_indiehackers", label: "Indie Hackers Popular Stories", url: "https://feed.indiehackers.world/" },
      { id: "rec_mkbhd", label: "Marques Brownlee (@mkbhd)", url: "https://youtube.com/@mkbhd" },
    ],
  },
  {
    id: "design",
    nameEn: "Design & UX",
    nameKo: "디자인 & UX",
    sources: [
      { id: "rec_smashing", label: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/" },
      { id: "rec_uxcollective", label: "UX Collective Trends", url: "https://uxdesign.cc/feed" },
      { id: "rec_sidebar", label: "Sidebar Design Links", url: "https://sidebar.io/feed.xml" },
      { id: "rec_alistapart", label: "A List Apart", url: "https://alistapart.com/main/feed/" },
    ],
  },
  {
    id: "social",
    nameEn: "Social & Reddit",
    nameKo: "소셜 & 커뮤니티",
    sources: [
      { id: "rec_reddit_saas", label: "r/SaaS Entrepreneur Community", url: "https://reddit.com/r/SaaS" },
      { id: "rec_reddit_sideproject", label: "r/SideProject Builds", url: "https://reddit.com/r/SideProject" },
      { id: "rec_github_trending", label: "GitHub Trending Repositories", url: "https://github.com/trending" },
      { id: "rec_naval", label: "Naval Ravikant (@naval)", url: "https://x.com/naval" },
    ],
  },
];

let cachedSources: StoredSource[] | null = null;
let cachedSourcesMtime = 0;

export function getStoredSources(): StoredSource[] {
  try {
    if (!fs.existsSync(SOURCES_FILE)) {
      saveStoredSources(DEFAULT_SOURCES);
      return DEFAULT_SOURCES;
    }
    const stat = fs.statSync(SOURCES_FILE);
    if (cachedSources && stat.mtimeMs === cachedSourcesMtime) {
      return cachedSources;
    }
    const data = JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8"));
    cachedSources = Array.isArray(data) ? data : DEFAULT_SOURCES;
    cachedSourcesMtime = stat.mtimeMs;
    return cachedSources;
  } catch {
    return DEFAULT_SOURCES;
  }
}

export function saveStoredSources(sources: StoredSource[]) {
  try {
    const dir = path.dirname(SOURCES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cachedSources = sources;
    fs.writeFileSync(SOURCES_FILE, JSON.stringify(sources), "utf-8");
    try {
      cachedSourcesMtime = fs.statSync(SOURCES_FILE).mtimeMs;
    } catch {}
  } catch (err) {
    console.error("Failed to save sources store:", err);
  }
}

let cachedIdeas: StoredIdea[] | null = null;
let cachedIdeasMtime = 0;

export function getStoredIdeas(): StoredIdea[] {
  try {
    if (!fs.existsSync(IDEAS_FILE)) {
      saveStoredIdeas(DEFAULT_IDEAS);
      return DEFAULT_IDEAS;
    }
    const stat = fs.statSync(IDEAS_FILE);
    if (cachedIdeas && stat.mtimeMs === cachedIdeasMtime) {
      return cachedIdeas;
    }
    const data = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
    cachedIdeas = Array.isArray(data) ? data : DEFAULT_IDEAS;
    cachedIdeasMtime = stat.mtimeMs;
    return cachedIdeas;
  } catch {
    return DEFAULT_IDEAS;
  }
}

export function saveStoredIdeas(ideas: StoredIdea[]) {
  try {
    const dir = path.dirname(IDEAS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cachedIdeas = ideas;
    fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas), "utf-8");
    try {
      cachedIdeasMtime = fs.statSync(IDEAS_FILE).mtimeMs;
    } catch {}
  } catch (err) {
    console.error("Failed to save ideas store:", err);
  }
}

export function detectPlatformFromUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
    if (host.includes("x.com") || host.includes("twitter.com")) return "x";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("threads.net") || host.includes("threads.com")) return "threads";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("reddit.com")) return "reddit";
    if (host.includes("github.com")) return "github";
    if (host === "t.me" || host.includes("telegram.me")) return "telegram";
    return "web";
  } catch {
    return "web";
  }
}

export function deriveTitleFromUrl(rawUrl: string, platform: string): string {
  try {
    const url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (host.includes("feedly.com")) return "Feedly News";
    if (host.includes("tldr.tech")) return "TLDR Tech";
    if (host.includes("techcrunch.com")) return "TechCrunch";
    if (platform === "x" && pathParts[0]) return `@${pathParts[0]}`;
    if (platform === "instagram" && pathParts[0]) return `@${pathParts[0]}`;
    if (platform === "threads" && pathParts[0]) return `@${pathParts[0].replace(/^@/, "")}`;
    if (platform === "reddit" && pathParts[1]) return `r/${pathParts[1]}`;
    if (platform === "github" && pathParts.length >= 2) return `${pathParts[0]}/${pathParts[1]}`;
    if (platform === "telegram" && pathParts[0]) return `t.me/${pathParts[0]}`;
    if (platform === "youtube" && pathParts[0]) return pathParts[0].startsWith("@") ? pathParts[0] : `YouTube Channel (${pathParts[0]})`;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
}
