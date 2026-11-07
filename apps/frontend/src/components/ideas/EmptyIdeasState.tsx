"use client";

import React from "react";
import {
  Rss,
  Inbox,
  Plus,
  Sparkles,
  Flame,
  RotateCw,
  ArrowRight,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyIdeasStateProps {
  hasSources: boolean;
  onAddSource: () => void;
  onOpenRecommended?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const STARTER_PRESETS = [
  { label: "OpenAI Research", kind: "Tech & AI", url: "https://openai.com/news/rss.xml" },
  { label: "Lenny's Newsletter", kind: "Growth", url: "https://www.lennysnewsletter.com/feed" },
  { label: "Paul Graham Essays", kind: "Founders", url: "http://www.paulgraham.com/rss.html" },
  { label: "TechCrunch AI", kind: "Tech", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
];

export function EmptyIdeasState({
  hasSources,
  onAddSource,
  onOpenRecommended,
  onRefresh,
  isRefreshing = false,
}: EmptyIdeasStateProps) {
  if (hasSources) {
    return (
      <div className="p-12 text-center bg-[var(--panel)] rounded-2xl border border-dashed border-[var(--line)] space-y-4 max-w-lg mx-auto my-12 font-sans select-none">
        <div className="size-16 rounded-2xl bg-[var(--hover)] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] mx-auto shadow-xs">
          <Inbox className="size-8 opacity-80" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-base text-[var(--fg)]">
            No posts collected yet
          </h4>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            Your connected sources haven&apos;t pulled new items yet, or are still syncing. Click Refresh below to check for the latest stories immediately.
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl bg-[var(--fg)] text-[var(--bg)] text-xs font-bold inline-flex items-center gap-2 transition-all hover:opacity-90 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Fetching feeds..." : "Refresh Feeds Now"}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-12 text-center bg-[var(--panel)] rounded-2xl border border-dashed border-[var(--line)] space-y-6 max-w-xl mx-auto my-8 sm:my-12 font-sans select-none">
      {/* Icon */}
      <div className="size-16 rounded-2xl bg-gradient-to-tr from-[#c6f432] to-[#d6ff52] text-[#141414] flex items-center justify-center mx-auto shadow-md">
        <Sparkles className="size-8 stroke-[2.5]" />
      </div>

      {/* Headings */}
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-extrabold text-[var(--fg)] tracking-tight">
          Supercharge your content pipeline
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
          Add the blogs, YouTube channels, X creators, Reddit communities, and newsletters you check regularly. We&apos;ll automatically collect their latest stories and turn anything worth benchmarking into a draft.
        </p>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onAddSource}
          className="px-5 py-2.5 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="size-4 stroke-[2.5]" />
          <span>Add Your First Source</span>
        </button>

        {onOpenRecommended && (
          <button
            type="button"
            onClick={onOpenRecommended}
            className="px-4 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--hover)] text-[var(--fg)] text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Compass className="size-4 text-[#4f7a00] dark:text-[#c6f432]" />
            <span>Browse Curated Sources</span>
          </button>
        )}
      </div>

      {/* Popular Starters */}
      <div className="pt-4 border-t border-[var(--line)] space-y-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
          Recommended Starter Sources
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {STARTER_PRESETS.map((starter) => (
            <button
              key={starter.label}
              type="button"
              onClick={onOpenRecommended || onAddSource}
              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[#c6f432] hover:bg-[var(--hover)] text-[var(--fg)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Flame className="size-3 text-amber-500 fill-amber-500" />
              <span>{starter.label}</span>
              <span className="text-[10px] text-[var(--muted)] font-mono">({starter.kind})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
