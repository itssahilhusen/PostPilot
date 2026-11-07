"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  BookOpen,
  Shuffle,
  Sparkles,
  Bookmark,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  FeedSourceIcon,
  getFeedSourceLabel,
  getFeedSourceKind,
  PlatformBadge,
  FeedSourceKindIcon,
} from "./PlatformIconMap";

export interface IdeaItem {
  id: string;
  source_id?: string;
  title: string;
  url: string;
  published_at: string;
  source_title?: string | null;
  source_favicon_url?: string | null;
  thumbnail_url?: string | null;
  excerpt?: string | null;
  content?: string | null;
  author?: string | null;
  isBookmarked?: boolean;
}

interface IdeaItemCardProps {
  item: IdeaItem;
  onCreateContent: (item: IdeaItem) => void;
  onGenerateCarousel?: (item: IdeaItem, theme?: string) => void;
  onViewDetail?: (item: IdeaItem) => void;
  onToggleBookmark?: (item: IdeaItem) => void;
  isBookmarked?: boolean;
  className?: string;
  badge?: React.ReactNode;
}

export function IdeaItemCard({
  item,
  onCreateContent,
  onGenerateCarousel,
  onViewDetail,
  onToggleBookmark,
  isBookmarked = false,
  className,
  badge,
}: IdeaItemCardProps) {
  const [imgError, setImgError] = useState(false);
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked || item.isBookmarked || false);

  const channelLabel = getFeedSourceLabel({ url: item.url, title: item.source_title });
  const platformKind = getFeedSourceKind({ url: item.url });
  const hasValidThumbnail = !!item.thumbnail_url && !imgError;
  const displayTitle = item.title || item.url;

  // Estimated reading time
  const rawBody = (item.content || item.excerpt || "").trim();
  const wordCount = rawBody ? rawBody.split(/\s+/).length : 50;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));

  let relativeTime = "";
  try {
    relativeTime = formatDistanceToNow(new Date(item.published_at), { addSuffix: true });
  } catch {
    relativeTime = "Recently";
  }

  const handleCardClick = () => {
    if (onViewDetail) {
      onViewDetail(item);
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !localBookmarked;
    setLocalBookmarked(nextState);
    if (onToggleBookmark) {
      onToggleBookmark({ ...item, isBookmarked: nextState });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--muted)]/60 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer select-none font-sans",
        className
      )}
    >
      {/* 1. Header Media Region (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--hover)]">
        {hasValidThumbnail ? (
          <>
            <img
              src={item.thumbnail_url!}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {/* Dark gradient scrim at top and bottom for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          </>
        ) : (
          <div className="relative size-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[var(--hover)] via-[var(--panel)] to-[var(--bg)] border-b border-[var(--line)] group-hover:brightness-95 transition-all">
            <div className="size-12 rounded-2xl bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FeedSourceKindIcon kind={platformKind} className="size-6" />
            </div>
            <span className="mt-2 text-[11px] font-mono font-bold text-[var(--muted)] truncate max-w-[85%] text-center">
              {channelLabel}
            </span>
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <PlatformBadge kind={platformKind} />

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Reading Time Tag */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-black/60 text-white backdrop-blur-md shadow-xs">
              <Clock className="size-2.5 opacity-80" />
              <span>{readMinutes}m</span>
            </span>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={cn(
                "size-7 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xs",
                localBookmarked
                  ? "bg-[#c6f432] text-[#141414]"
                  : "bg-black/50 hover:bg-black/80 text-white/90"
              )}
              title={localBookmarked ? "Remove bookmark" : "Save idea"}
            >
              <Bookmark className={cn("size-3.5", localBookmarked && "fill-current")} />
            </button>
          </div>
        </div>

        {/* Hover Quick Read pill banner */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--panel)]/95 text-[var(--fg)] px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <BookOpen className="size-3.5 text-[#4f7a00] dark:text-[#c6f432]" />
            <span>Read full story</span>
          </span>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Source info row */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-2">
          {item.source_favicon_url ? (
            <img
              src={item.source_favicon_url}
              alt=""
              className="size-3.5 shrink-0 rounded-xs object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <FeedSourceIcon source={{ url: item.url }} className="size-3.5 shrink-0" />
          )}
          <span className="font-semibold text-[var(--fg)] truncate max-w-[140px]">
            {channelLabel}
          </span>
          <span className="text-[var(--muted)] font-mono text-[10px]">•</span>
          <span className="text-[11px] text-[var(--muted)] font-mono shrink-0">
            {relativeTime}
          </span>
          {badge && <span className="ml-auto shrink-0">{badge}</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-extrabold leading-snug text-[var(--fg)] line-clamp-2 group-hover:text-[#4f7a00] dark:group-hover:text-[#c6f432] transition-colors">
          {displayTitle}
        </h3>

        {/* Excerpt */}
        {item.excerpt && (
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)] line-clamp-2">
            {item.excerpt}
          </p>
        )}

        {/* 3. Action Footer */}
        <div className="mt-auto pt-3.5 flex items-center justify-between gap-2 border-t border-[var(--line)]/60">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewDetail) onViewDetail(item);
              }}
              className="px-2 py-1 rounded-lg border border-[var(--line)] bg-[var(--hover)] hover:bg-[var(--line)] text-[var(--fg)] text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="size-3 text-[var(--muted)]" />
              <span>Read</span>
            </button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-lg border border-transparent hover:border-[var(--line)] hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-all cursor-pointer"
              title="Open original website"
            >
              <ArrowUpRight className="size-3" />
            </a>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Draft in Composer */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateContent(item);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--fg)] font-bold text-xs inline-flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
              title="Open text composer"
            >
              <span>Draft</span>
            </button>

            {/* Direct Carousel Deck Generation */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onGenerateCarousel) {
                  onGenerateCarousel(item, "futuretech");
                } else {
                  onCreateContent(item);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Generate 4:5 Faceless Carousel deck in Studio"
            >
              <Sparkles className="size-3 fill-[#141414]" />
              <span>Carousel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
