"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Shuffle,
  Copy,
  Check,
  BookOpen,
  Clock,
  User,
  Sparkles,
  ArrowUpRight,
  Bookmark,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IdeaItem } from "./IdeaItemCard";
import {
  getFeedSourceLabel,
  getFeedSourceKind,
  PlatformBadge,
  FeedSourceIcon,
} from "./PlatformIconMap";

interface IdeaDetailDialogProps {
  item: IdeaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateContent: (item: IdeaItem) => void;
  onGenerateCarousel?: (item: IdeaItem, theme?: string) => void;
  onToggleBookmark?: (item: IdeaItem) => void;
}

export function IdeaDetailDialog({
  item,
  isOpen,
  onClose,
  onCreateContent,
  onGenerateCarousel,
  onToggleBookmark,
}: IdeaDetailDialogProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("futuretech");

  if (!isOpen || !item) return null;

  const channelLabel = getFeedSourceLabel({ url: item.url, title: item.source_title });
  const platformKind = getFeedSourceKind({ url: item.url });
  const rawBody = (item.content || item.excerpt || "").trim();
  const paragraphs = rawBody
    ? rawBody.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  const wordCount = rawBody ? rawBody.split(/\s+/).length : 60;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));

  let formattedDate = "";
  let relativeTime = "";
  try {
    const d = new Date(item.published_at);
    formattedDate = format(d, "MMM d, yyyy · h:mm a");
    relativeTime = formatDistanceToNow(d, { addSuffix: true });
  } catch {
    formattedDate = item.published_at;
  }

  const handleCopy = () => {
    const textToCopy = `${item.title}\n\n${rawBody}\n\nSource: ${item.url}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Article copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRepurpose = () => {
    onCreateContent(item);
    onClose();
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
        className="w-full max-w-3xl max-h-[88vh] bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 select-text"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5 bg-[var(--bg)]/60 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            {item.source_favicon_url ? (
              <img
                src={item.source_favicon_url}
                alt=""
                className="size-5 shrink-0 rounded-xs object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <FeedSourceIcon source={{ url: item.url }} className="size-5 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-[var(--fg)] truncate block">
                  {channelLabel}
                </span>
                <PlatformBadge kind={platformKind} />
              </div>
              <span className="text-[11px] text-[var(--muted)] font-mono flex items-center gap-1.5">
                <span>{formattedDate}</span>
                {relativeTime && <span>({relativeTime})</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(item)}
                className="p-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[#c6f432] transition-colors cursor-pointer"
                title={item.isBookmarked ? "Saved" : "Save story"}
              >
                <Bookmark className={cn("size-3.5", item.isBookmarked && "fill-[#c6f432] text-[#c6f432]")} />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors shadow-2xs cursor-pointer"
              title="Copy article text"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              title="Open original website"
            >
              <ArrowUpRight className="size-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {/* Headline Title */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--fg)] leading-snug">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)] pt-1 font-mono">
              {item.author && (
                <span className="flex items-center gap-1 text-[var(--fg)] font-semibold">
                  <User className="size-3.5" />
                  <span>{item.author}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                <span>{estimatedReadMinutes} min read</span>
              </span>
            </div>
          </div>

          {/* Featured Image Banner */}
          {item.thumbnail_url && (
            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--hover)]">
              <img
                src={item.thumbnail_url}
                alt=""
                className="w-full max-h-[380px] object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Article Text Content */}
          <div className="space-y-4 pt-1">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-sm sm:text-base leading-relaxed text-[var(--fg)]/90 font-sans tracking-normal"
                >
                  {para}
                </p>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-[var(--muted)] bg-[var(--bg)]">
                <p className="text-sm font-semibold text-[var(--fg)]">No full-text preview available</p>
                <p className="text-xs mt-1">
                  Click &quot;Read original website&quot; below to explore the complete article on the source channel.
                </p>
              </div>
            )}
          </div>

          {/* Source Link Banner */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--fg)]">Original Source URL</p>
              <p className="text-xs text-[var(--muted)] font-mono truncate max-w-md">{item.url}</p>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] px-3 py-1.5 text-xs font-bold text-[var(--fg)] transition-colors shadow-2xs"
            >
              <span>Read on {channelLabel}</span>
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          {/* Faceless Theme Selector */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 select-none space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-[#c6f432]" />
                <span>Faceless Theme Preset</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--muted)]">4:5 High-Retention Decks</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "futuretech", label: "FutureTech", badge: "Cyan/Blue", desc: "Tech/AI Breakout" },
                { id: "aipagedaily", label: "AI Page Daily", badge: "Void Black", desc: "Minimal Clean" },
                { id: "tyches", label: "Tyches Glow", badge: "Cyberpunk", desc: "Curiosity Hook" },
                { id: "inventionshark", label: "InventionShark", badge: "Editorial", desc: "Deep Dossier" },
              ].map((thm) => (
                <button
                  key={thm.id}
                  type="button"
                  onClick={() => setSelectedTheme(thm.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1",
                    selectedTheme === thm.id
                      ? "border-[#c6f432] bg-[#c6f432]/10 ring-1 ring-[#c6f432]"
                      : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--muted)]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold text-[var(--fg)]">{thm.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--hover)] font-mono text-[var(--muted)]">
                      {thm.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] truncate">{thm.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3.5 bg-[var(--bg)]/50 select-none">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <span>Open external link</span>
            <ExternalLink className="size-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3.5 py-1.5 text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleRepurpose}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] px-3 py-1.5 text-xs font-bold text-[var(--fg)] shadow-xs transition-all cursor-pointer"
            >
              <span>Draft Post</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onGenerateCarousel) {
                  onGenerateCarousel(item, selectedTheme);
                } else {
                  handleRepurpose();
                }
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] px-4 py-1.5 text-xs font-black text-[#141414] shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="size-3.5 fill-[#141414]" />
              <span>Generate Carousel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
