"use client";

import React, { useState } from "react";
import {
  Rss,
  Settings,
  Flame,
  FileSpreadsheet,
  RotateCw,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentSourceItem } from "./SourceManager";
import {
  PLATFORM_KIND_BRAND_LABELS,
  PlatformKind,
  FeedSourceIcon,
  FeedSourceKindIcon,
  getFeedSourceKind,
  getFeedSourceLabel,
  PlatformBadge,
} from "./PlatformIconMap";

interface IdeasTabsProps {
  sources: ContentSourceItem[];
  selectedFilter: string; // "all", "platform:<kind>", or sourceId
  onSelectFilter: (val: string) => void;
  onOpenManageSources: () => void;
  onOpenRecommended: () => void;
  onTriggerOpml: () => void;
  viewMode: "grid" | "table";
  onChangeViewMode: (mode: "grid" | "table") => void;
  lastRefreshedText: string | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function IdeasTabs({
  sources,
  selectedFilter,
  onSelectFilter,
  onOpenManageSources,
  onOpenRecommended,
  onTriggerOpml,
  viewMode,
  onChangeViewMode,
  lastRefreshedText,
  onRefresh,
  isRefreshing = false,
}: IdeasTabsProps) {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Group sources by kind for filter dropdown
  const grouped: Record<string, ContentSourceItem[]> = {};
  sources.forEach((s) => {
    const k = getFeedSourceKind(s);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(s);
  });
  const groupedEntries = Object.entries(grouped);

  // Label for active filter
  const getActiveFilterLabel = () => {
    if (selectedFilter === "all") return "All sources";
    if (selectedFilter.startsWith("platform:")) {
      const p = selectedFilter.replace("platform:", "");
      return PLATFORM_KIND_BRAND_LABELS[p] || p;
    }
    const found = sources.find((s) => s.id === selectedFilter);
    return found ? getFeedSourceLabel(found) : "All sources";
  };

  return (
    <div className="space-y-3 font-sans select-none">
      {/* 1. Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        {/* Source Filter Dropdown (if sources exist) */}
        {sources.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="inline-flex h-9 w-48 sm:w-56 items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs font-semibold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors shadow-2xs cursor-pointer"
            >
              <span className="truncate">{getActiveFilterLabel()}</span>
              <ChevronDown className="size-3.5 text-[var(--muted)] shrink-0" />
            </button>

            {isFilterDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 z-50 mt-1 w-56 max-h-72 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1.5 shadow-xl text-left animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFilter("all");
                      setIsFilterDropdownOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer",
                      selectedFilter === "all" && "bg-[var(--hover)] font-bold text-[#4f7a00] dark:text-[#c6f432]"
                    )}
                  >
                    <span>All sources</span>
                  </button>

                  {groupedEntries.map(([kind, kSources]) => (
                    <div key={kind} className="pt-1 border-t border-[var(--line)] mt-1">
                      {kSources.length >= 2 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectFilter(`platform:${kind}`);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] cursor-pointer",
                              selectedFilter === `platform:${kind}` && "bg-[var(--hover)]"
                            )}
                          >
                            <FeedSourceKindIcon kind={kind as PlatformKind} className="size-3.5 shrink-0" />
                            <span>{PLATFORM_KIND_BRAND_LABELS[kind] || kind}</span>
                          </button>
                          {kSources.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                onSelectFilter(s.id);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-lg pl-6 pr-2.5 py-1 text-xs text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-colors cursor-pointer",
                                selectedFilter === s.id && "bg-[var(--hover)] text-[var(--fg)] font-bold"
                              )}
                            >
                              <FeedSourceIcon source={s} className="size-3 shrink-0" />
                              <span className="truncate">{getFeedSourceLabel(s)}</span>
                            </button>
                          ))}
                        </>
                      ) : (
                        kSources.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              onSelectFilter(s.id);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--fg)] hover:bg-[var(--hover)] cursor-pointer",
                              selectedFilter === s.id && "bg-[var(--hover)] font-bold"
                            )}
                          >
                            <FeedSourceIcon source={s} className="size-3.5 shrink-0" />
                            <span className="truncate">{getFeedSourceLabel(s)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab Action 1: Manage Sources Button */}
        <button
          type="button"
          onClick={onOpenManageSources}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-all shadow-2xs cursor-pointer"
        >
          <Settings className="size-3.5 text-[var(--muted)]" />
          <span>Manage Sources</span>
        </button>

        {/* Tab Action 2: Recommended Sources Button */}
        <button
          type="button"
          onClick={onOpenRecommended}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-all shadow-2xs cursor-pointer"
        >
          <Flame className="size-3.5 text-amber-500 fill-amber-500" />
          <span>Curated Feeds</span>
        </button>

        {/* Tab Action 3: Import from OPML Button */}
        <button
          type="button"
          onClick={onTriggerOpml}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-all shadow-2xs cursor-pointer"
        >
          <FileSpreadsheet className="size-3.5 text-emerald-500" />
          <span>Import OPML</span>
        </button>

        {/* Right Status & Refresh Section */}
        <div className="order-first flex w-full items-center justify-end gap-3 sm:order-none sm:ml-auto sm:w-auto">
          <div className="flex flex-col items-end text-[11px] text-[var(--muted)] font-mono">
            <span>Last sync</span>
            <span className="font-bold text-[var(--fg)]">
              {lastRefreshedText || "Just now"}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Fetch latest posts from all active sources"
          >
            <RotateCw className={cn("size-3.5", isRefreshing && "animate-spin text-[#4f7a00] dark:text-[#c6f432]")} />
            <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {/* 2. View Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--bg)] p-0.5 text-xs font-semibold shadow-2xs">
          <button
            type="button"
            onClick={() => onChangeViewMode("grid")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              viewMode === "grid"
                ? "bg-[var(--hover)] text-[var(--fg)] shadow-2xs"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            )}
          >
            <LayoutGrid className="size-3.5" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode("table")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              viewMode === "table"
                ? "bg-[var(--hover)] text-[var(--fg)] shadow-2xs"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            )}
          >
            <TableIcon className="size-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>
    </div>
  );
}
