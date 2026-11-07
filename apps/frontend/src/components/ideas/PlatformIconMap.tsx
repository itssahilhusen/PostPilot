"use client";

import React, { useState } from "react";
import {
  Globe,
  Youtube,
  Twitter,
  Instagram,
  MessageCircle,
  Share2,
  Linkedin,
  Github,
  Search,
  Rss,
  Video,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PlatformKind =
  | "web"
  | "youtube"
  | "x"
  | "reddit"
  | "github"
  | "instagram"
  | "telegram"
  | "threads"
  | "linkedin"
  | "tiktok"
  | "search";

export interface SourcePlatformConfig {
  value: PlatformKind;
  label: string;
  iconUrl: string;
  prefix: string;
  placeholder: string;
  description: string;
}

export const SOURCE_PLATFORMS: SourcePlatformConfig[] = [
  {
    value: "web",
    label: "Direct input (RSS/URL)",
    iconUrl: "https://example.com",
    prefix: "",
    placeholder: "https://example.com",
    description: "Enter an RSS feed URL or the homepage of a blog or news site. Links to individual articles can't be used as a source.",
  },
  {
    value: "x",
    label: "X",
    iconUrl: "https://x.com",
    prefix: "x.com/",
    placeholder: "username",
    description: "Enter the account username (without @). Sources are registered per account, not per post.",
  },
  {
    value: "instagram",
    label: "Instagram",
    iconUrl: "https://instagram.com",
    prefix: "instagram.com/",
    placeholder: "username",
    description: "Enter the account username. Sources are registered per account, not per post.",
  },
  {
    value: "tiktok",
    label: "TikTok",
    iconUrl: "https://tiktok.com",
    prefix: "tiktok.com/@",
    placeholder: "username",
    description: "Enter the account username. Sources are registered per account, not per video.",
  },
  {
    value: "youtube",
    label: "YouTube",
    iconUrl: "https://youtube.com",
    prefix: "youtube.com/",
    placeholder: "@handle or channel URL",
    description: "Enter the channel handle (@handle) or channel ID. Sources are registered per channel; paste a video link and its channel is added.",
  },
  {
    value: "threads",
    label: "Threads",
    iconUrl: "https://threads.com",
    prefix: "threads.com/@",
    placeholder: "username",
    description: "Enter the account username. Sources are registered per account, not per post.",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    iconUrl: "https://linkedin.com",
    prefix: "linkedin.com/company/",
    placeholder: "company name",
    description: "Enter the company page name. Personal profiles and individual post links can't be added.",
  },
  {
    value: "reddit",
    label: "Reddit",
    iconUrl: "https://reddit.com",
    prefix: "reddit.com/r/",
    placeholder: "subreddit",
    description: "Enter the subreddit name. Sources are registered per subreddit, not per post.",
  },
  {
    value: "github",
    label: "GitHub",
    iconUrl: "https://github.com",
    prefix: "github.com/",
    placeholder: "owner/repo",
    description: "Enter owner/repo to collect new releases. Enter trending to collect popular repositories.",
  },
  {
    value: "telegram",
    label: "Telegram",
    iconUrl: "https://t.me",
    prefix: "t.me/",
    placeholder: "channel",
    description: "Enter the public channel name. Sources are registered per channel, not per message.",
  },
];

export const PLATFORM_KIND_BRAND_LABELS: Record<string, string> = {
  web: "Web",
  youtube: "YouTube",
  x: "X",
  reddit: "Reddit",
  github: "GitHub",
  instagram: "Instagram",
  telegram: "Telegram",
  threads: "Threads",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  search: "Google Search",
};

export const PLATFORM_KIND_ORDER: PlatformKind[] = [
  "web",
  "youtube",
  "x",
  "reddit",
  "github",
  "instagram",
  "telegram",
  "threads",
  "linkedin",
  "tiktok",
  "search",
];

export function parseUrlLoose(rawUrl: string): URL | null {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

export function brandFaviconUrl(rawUrl: string): string | null {
  const parsed = parseUrlLoose(rawUrl);
  if (!parsed?.hostname) return null;
  return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
}

export function getFeedSourceKind(source: { url: string; platform?: string | null }): PlatformKind {
  if (source.platform && PLATFORM_KIND_BRAND_LABELS[source.platform]) {
    return source.platform as PlatformKind;
  }
  const parsed = parseUrlLoose(source.url);
  if (!parsed) return "web";
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "youtube";
  if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) return "x";
  if (host === "reddit.com" || host.endsWith(".reddit.com")) return "reddit";
  if (host === "github.com" || host.endsWith(".github.com")) return "github";
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "t.me" || host.endsWith(".t.me") || host === "telegram.me") return "telegram";
  if (host === "threads.net" || host.endsWith(".threads.net") || host === "threads.com" || host.endsWith(".threads.com")) return "threads";
  if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
  if (host === "google.com" || host.endsWith(".google.com")) return "search";

  return "web";
}

export function getFeedSourceLabel(source: { url: string; title?: string | null; source_title?: string | null; platform?: string | null }): string {
  const explicit = source.source_title || source.title;
  if (explicit && explicit.trim()) {
    let t = explicit.trim();
    const kind = getFeedSourceKind(source);
    if (kind === "x") return t.replace(/^Twitter\s+/i, "").trim() || t;
    if (kind === "instagram") return t.replace(/\s*[-·]\s*Picnob\s*$/i, "").replace(/\s+public posts\s*$/i, "").trim() || t;
    if (kind === "telegram") return t.replace(/\s*-\s*Telegram Channel\s*$/i, "").trim() || t;
    if (kind === "threads") return t.replace(/\s*on Threads\s*$/i, "").trim() || t;
    if (kind === "linkedin") return t.replace(/^LinkedIn\s*[-–]\s*/i, "").replace(/['’]s\s+Posts\s*$/i, "").trim() || t;
    return t;
  }

  const parsed = parseUrlLoose(source.url);
  if (!parsed) return source.url;

  const kind = getFeedSourceKind(source);
  const pathParts = parsed.pathname.split("/").filter(Boolean);

  if (kind === "youtube") {
    if (pathParts[0]?.startsWith("@")) return pathParts[0];
    if (pathParts[0] === "channel" && pathParts[1]) return `Channel ${pathParts[1].slice(0, 8)}...`;
    return "YouTube";
  }
  if (kind === "x" && pathParts[0]) return `@${pathParts[0].replace(/^@/, "")}`;
  if (kind === "instagram" && pathParts[0]) return `@${pathParts[0].replace(/^@/, "")}`;
  if (kind === "threads" && pathParts[0]) return `@${pathParts[0].replace(/^@/, "")}`;
  if (kind === "reddit" && pathParts[1]) return `r/${pathParts[1]}`;
  if (kind === "telegram" && pathParts[0]) return `@${pathParts[0].replace(/^s\//, "")}`;
  if (kind === "github" && pathParts[0]) return pathParts.slice(0, 2).join("/");

  return parsed.hostname.replace(/^www\./, "");
}

export function buildSourceUrl(platform: PlatformKind, rawInput: string): string {
  const s = rawInput.trim();
  if (!s || platform === "web" || /^https?:\/\//i.test(s) || /^[a-z0-9-]+(\.[a-z0-9-]+)+[/?]/i.test(s)) {
    return s;
  }
  switch (platform) {
    case "x":
      return `https://x.com/${s.replace(/^@/, "")}`;
    case "instagram":
      return `https://instagram.com/${s.replace(/^@/, "")}`;
    case "tiktok":
      return `https://www.tiktok.com/@${s.replace(/^@/, "")}`;
    case "telegram":
      return `https://t.me/${s.replace(/^@/, "")}`;
    case "threads":
      return `https://www.threads.com/@${s.replace(/^@/, "")}`;
    case "linkedin":
      return `https://www.linkedin.com/company/${s.replace(/^\/?(company\/)?/i, "")}`;
    case "reddit":
      return `https://reddit.com/r/${s.replace(/^\/?(r\/)?/i, "")}`;
    case "github":
      return `https://github.com/${s.replace(/^\//, "")}`;
    case "youtube": {
      const clean = s.replace(/^\//, "");
      return /^UC[\w-]{20,}$/.test(clean)
        ? `https://www.youtube.com/channel/${clean}`
        : `https://www.youtube.com/@${clean.replace(/^@/, "")}`;
    }
    default:
      return s;
  }
}

// Fallback icon component for each platform
export function FeedSourceKindIcon({ kind, className }: { kind: PlatformKind; className?: string }) {
  const common = cn("size-4 shrink-0", className);
  switch (kind) {
    case "youtube":
      return <Youtube className={cn(common, "text-red-500")} />;
    case "x":
      return <Twitter className={cn(common, "text-foreground")} />;
    case "instagram":
      return <Instagram className={cn(common, "text-pink-500")} />;
    case "threads":
      return <MessageCircle className={cn(common, "text-foreground")} />;
    case "reddit":
      return <Share2 className={cn(common, "text-orange-500")} />;
    case "telegram":
      return <Send className={cn(common, "text-sky-500")} />;
    case "tiktok":
      return <Video className={cn(common, "text-foreground")} />;
    case "linkedin":
      return <Linkedin className={cn(common, "text-blue-600")} />;
    case "github":
      return <Github className={cn(common, "text-foreground")} />;
    case "search":
      return <Search className={cn(common, "text-emerald-500")} />;
    case "web":
    default:
      return <Globe className={cn(common, "text-muted-foreground")} />;
  }
}

export function FeedSourceIcon({
  source,
  className,
}: {
  source: { url: string; favicon_url?: string | null; platform?: string | null };
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const favicon = source.favicon_url || brandFaviconUrl(source.url);

  if (favicon && !imgError) {
    return (
      <img
        src={favicon}
        alt=""
        className={cn("size-4 shrink-0 rounded-xs object-contain", className)}
        onError={() => setImgError(true)}
      />
    );
  }

  const kind = getFeedSourceKind(source);
  return <FeedSourceKindIcon kind={kind} className={className} />;
}

export function PlatformBrandIcon({ url, className }: { url: string; className?: string }) {
  return <FeedSourceIcon source={{ url }} className={className} />;
}

export const PLATFORM_BADGE_STYLES: Record<PlatformKind, { bg: string; text: string; border: string; dot: string }> = {
  youtube: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/20", dot: "bg-red-500" },
  x: { bg: "bg-zinc-500/10", text: "text-zinc-800 dark:text-zinc-200", border: "border-zinc-500/20", dot: "bg-zinc-500" },
  reddit: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20", dot: "bg-orange-500" },
  github: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20", dot: "bg-purple-500" },
  instagram: { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", border: "border-pink-500/20", dot: "bg-pink-500" },
  tiktok: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/20", dot: "bg-cyan-500" },
  threads: { bg: "bg-zinc-500/10", text: "text-zinc-900 dark:text-zinc-100", border: "border-zinc-500/20", dot: "bg-zinc-500" },
  telegram: { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", border: "border-sky-500/20", dot: "bg-sky-500" },
  linkedin: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20", dot: "bg-blue-500" },
  search: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500" },
  web: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500" },
};

export function PlatformBadge({ kind, className }: { kind: PlatformKind; className?: string }) {
  const style = PLATFORM_BADGE_STYLES[kind] || PLATFORM_BADGE_STYLES.web;
  const label = PLATFORM_KIND_BRAND_LABELS[kind] || "Web";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-2xs backdrop-blur-md",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", style.dot)} />
      <FeedSourceKindIcon kind={kind} className="size-3" />
      <span>{label}</span>
    </span>
  );
}
