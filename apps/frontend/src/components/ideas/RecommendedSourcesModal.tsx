"use client";

import React, { useState } from "react";
import { X, Flame, Plus, Check, Loader2, Sparkles, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedSourceIcon, PlatformBadge, getFeedSourceKind } from "./PlatformIconMap";

export interface RecommendedSource {
  id: string;
  label: string;
  url: string;
  subscribed?: boolean;
  contentSourceId?: string | null;
}

export interface RecommendedCategory {
  id: string;
  nameEn: string;
  nameKo?: string;
  sources: RecommendedSource[];
}

interface RecommendedSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: RecommendedCategory[];
  isLoading?: boolean;
  onToggleSource: (source: RecommendedSource) => Promise<void>;
}

export function RecommendedSourcesModal({
  isOpen,
  onClose,
  categories,
  isLoading = false,
  onToggleSource,
}: RecommendedSourcesModalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || "tech");
  const [busySourceId, setBusySourceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategory =
    categories.find((c) => c.id === activeCategoryId) || categories[0] || { sources: [] };

  const handleAction = async (source: RecommendedSource) => {
    setBusySourceId(source.id);
    try {
      await onToggleSource(source);
    } finally {
      setBusySourceId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--bg)]/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-black flex items-center justify-center shadow-xs">
              <Flame className="size-5 stroke-[2.5] fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-[var(--fg)]">
                  Curated Recommended Sources
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#c6f432] text-[#141414]">
                  CURATED
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Hand-picked top newsletters, tech research feeds, and creator benchmarks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--line)] bg-[var(--panel)] flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  isSelected
                    ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                    : "border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
                )}
              >
                <span>{cat.nameEn}</span>
                <span className="ml-1 text-[10px] opacity-70 font-mono">({cat.sources.length})</span>
              </button>
            );
          })}
        </div>

        {/* Sources Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentCategory.sources.map((source) => {
            const isSubscribed = !!source.subscribed;
            const isBusy = busySourceId === source.id;
            const platformKind = getFeedSourceKind({ url: source.url });

            return (
              <div
                key={source.id}
                className={cn(
                  "p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all",
                  isSubscribed
                    ? "border-[#c6f432] bg-[#c6f432]/5 shadow-2xs"
                    : "border-[var(--line)] bg-[var(--bg)] hover:border-[var(--muted)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl overflow-hidden bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center shrink-0 shadow-2xs">
                    <FeedSourceIcon source={{ url: source.url }} className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-[var(--fg)] truncate">
                        {source.label}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[var(--muted)] truncate mt-0.5">
                      {source.url}
                    </p>
                    <div className="mt-1.5">
                      <PlatformBadge kind={platformKind} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--line)]/50 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--muted)] font-mono">
                    {isSubscribed ? "Active in your feed" : "Not subscribed"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAction(source)}
                    disabled={isBusy}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50",
                      isSubscribed
                        ? "border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        : "bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black"
                    )}
                  >
                    {isBusy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isSubscribed ? (
                      <>
                        <Check className="size-3 stroke-[2.5]" />
                        <span>Subscribed</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3 stroke-[2.5]" />
                        <span>Subscribe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[var(--line)] bg-[var(--bg)]/50 flex items-center justify-between">
          <span className="text-[11px] text-[var(--muted)] font-mono">
            New sources added appear in your feed immediately
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--fg)] text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
