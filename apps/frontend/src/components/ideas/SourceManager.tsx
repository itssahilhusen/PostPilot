"use client";

import React, { useState } from "react";
import {
  X,
  Rss,
  Plus,
  Trash2,
  Pause,
  Play,
  RotateCw,
  AlertTriangle,
  ChevronDown,
  Loader2,
  Globe,
  Radio,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  SOURCE_PLATFORMS,
  PLATFORM_KIND_BRAND_LABELS,
  PlatformKind,
  PlatformBrandIcon,
  FeedSourceIcon,
  buildSourceUrl,
  getFeedSourceKind,
  getFeedSourceLabel,
  PlatformBadge,
  FeedSourceKindIcon,
} from "./PlatformIconMap";

export interface ContentSourceItem {
  id: string;
  url: string;
  title?: string | null;
  platform?: string | null;
  status: "active" | "paused" | "failed";
  last_fetched_at?: string | null;
  last_error?: string | null;
  favicon_url?: string | null;
  created_at?: string;
}

interface SourceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: ContentSourceItem[];
  onAddSource: (url: string) => Promise<boolean>;
  onUpdateStatus: (sourceId: string, status: "active" | "paused") => Promise<void>;
  onDeleteSource: (sourceId: string) => Promise<void>;
  isAdding?: boolean;
}

export function SourceManager({
  isOpen,
  onClose,
  sources,
  onAddSource,
  onUpdateStatus,
  onDeleteSource,
  isAdding = false,
}: SourceManagerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKind>("web");
  const [inputValue, setInputValue] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "paused">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ContentSourceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [busySourceId, setBusySourceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlatformConfig =
    SOURCE_PLATFORMS.find((p) => p.value === selectedPlatform) || SOURCE_PLATFORMS[0];

  const handleAdd = async () => {
    const fullUrl = buildSourceUrl(selectedPlatform, inputValue);
    if (!fullUrl.trim() || isAdding) return;

    const ok = await onAddSource(fullUrl);
    if (ok) {
      setInputValue("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteSource(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete source");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (source: ContentSourceItem) => {
    const newStatus = source.status === "active" ? "paused" : "active";
    setBusySourceId(source.id);
    try {
      await onUpdateStatus(source.id, newStatus);
    } finally {
      setBusySourceId(null);
    }
  };

  // Filter sources
  const filteredSources = sources.filter((s) => {
    if (filterTab === "active" && s.status !== "active") return false;
    if (filterTab === "paused" && s.status !== "paused") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const label = getFeedSourceLabel(s).toLowerCase();
      const url = s.url.toLowerCase();
      return label.includes(q) || url.includes(q);
    }
    return true;
  });

  const activeCount = sources.filter((s) => s.status === "active").length;
  const pausedCount = sources.filter((s) => s.status === "paused").length;

  return (
    <>
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
              <div className="size-10 rounded-xl bg-gradient-to-tr from-[#c6f432] to-[#d6ff52] text-[#141414] flex items-center justify-center shadow-xs">
                <Radio className="size-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight text-[var(--fg)]">
                    Content Sources & Feeds
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--hover)] text-[var(--fg)] border border-[var(--line)]">
                    {sources.length} Total
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Connect RSS, YouTube, X, Reddit, and blogs to collect stories automatically.
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

          {/* Add Source Section */}
          <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[var(--bg)]/30 space-y-3.5">
            {/* Platform Horizontal Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {SOURCE_PLATFORMS.map((platform) => {
                const isSelected = selectedPlatform === platform.value;
                return (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(platform.value);
                      setInputValue("");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0",
                      isSelected
                        ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                        : "border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
                    )}
                  >
                    <FeedSourceKindIcon kind={platform.value} className="size-3" />
                    <span>{platform.label.replace(/\s*\(.*\)/, "")}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 focus-within:border-[#c6f432] focus-within:ring-1 focus-within:ring-[#c6f432] transition-all">
                {currentPlatformConfig.prefix && (
                  <span className="text-xs font-mono font-semibold text-[var(--muted)] select-none whitespace-nowrap pr-1">
                    {currentPlatformConfig.prefix}
                  </span>
                )}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  disabled={isAdding}
                  placeholder={currentPlatformConfig.placeholder}
                  className="w-full py-2.5 text-xs text-[var(--fg)] placeholder:text-[var(--muted)] bg-transparent outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!inputValue.trim() || isAdding}
                className="px-4 py-2.5 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] disabled:opacity-40 text-[#141414] font-black text-xs inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5 stroke-[2.5]" />
                    <span>Register Source</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-tight">
              {currentPlatformConfig.description}
            </p>
          </div>

          {/* Connected Sources List Controls */}
          <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--line)] flex items-center justify-between gap-3 bg-[var(--panel)]">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filterTab === "all"
                    ? "bg-[var(--fg)] text-[var(--bg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                All ({sources.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("active")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filterTab === "active"
                    ? "bg-[var(--fg)] text-[var(--bg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("paused")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filterTab === "paused"
                    ? "bg-[var(--fg)] text-[var(--bg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                Paused ({pausedCount})
              </button>
            </div>

            {/* Quick search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sources..."
              className="text-xs px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted)] outline-none focus:border-[#c6f432] w-36 sm:w-44"
            />
          </div>

          {/* Sources List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
            {filteredSources.length === 0 ? (
              <div className="py-12 text-center text-[var(--muted)] space-y-2">
                <p className="text-xs font-semibold text-[var(--fg)]">No sources match your filter</p>
                <p className="text-[11px]">Add new channels above to begin tracking posts.</p>
              </div>
            ) : (
              filteredSources.map((source) => {
                const label = getFeedSourceLabel(source);
                const platformKind = getFeedSourceKind(source);
                const isBusy = busySourceId === source.id;
                let lastFetchedText = "Not fetched yet";
                if (source.last_fetched_at) {
                  try {
                    lastFetchedText = formatDistanceToNow(new Date(source.last_fetched_at), { addSuffix: true });
                  } catch {
                    lastFetchedText = source.last_fetched_at;
                  }
                }

                return (
                  <div
                    key={source.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--muted)]/60 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-xl overflow-hidden bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center shrink-0 shadow-2xs">
                        <FeedSourceIcon source={source} className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-[var(--fg)] truncate">
                            {label}
                          </span>
                          <PlatformBadge kind={platformKind} />
                        </div>
                        <p className="text-[11px] text-[var(--muted)] font-mono truncate max-w-sm mt-0.5">
                          {source.url}
                        </p>
                        <p className="text-[10px] text-[var(--muted)] mt-0.5">
                          Last sync: {lastFetchedText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Status pill */}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1",
                          source.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            source.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          )}
                        />
                        <span>{source.status}</span>
                      </span>

                      {/* Pause / Resume Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(source)}
                        disabled={isBusy}
                        className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                        title={source.status === "active" ? "Pause source" : "Resume source"}
                      >
                        {isBusy ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : source.status === "active" ? (
                          <Pause className="size-3.5" />
                        ) : (
                          <Play className="size-3.5" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(source)}
                        className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete source"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-[var(--line)] bg-[var(--bg)]/50 flex items-center justify-between">
            <span className="text-[11px] text-[var(--muted)] font-mono">
              Auto-syncs every 60 minutes
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

      {/* Delete Confirmation Alert Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in select-none font-sans">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[var(--fg)]">
                  Delete Content Source?
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  This will remove the channel and its collected benchmark items.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-mono text-[var(--fg)] truncate">
              {deleteTarget.url}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
