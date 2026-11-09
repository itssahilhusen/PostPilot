"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "./StatusBadge";

export interface FeedStory {
  id: string;
  category: string;
  source: string;
  sourceDotColor?: string;
  readDuration: string;
  isSaved?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  topicTag?: string;
  conceptPreview?: {
    type: "icon" | "badge" | "narrative";
    badgeText?: string;
    sublabel?: string;
    hookText?: string;
    takeawayText?: string;
    progressPercent?: number;
    platformPills?: string;
  };
  metaLine: string;
  title: string;
  description: string;
  isAiSynthesis?: boolean;
}

interface FeedStoryCardProps {
  story: FeedStory;
  onBookmarkToggle?: (id: string, e: React.MouseEvent) => void;
  onRead?: (story: FeedStory) => void;
  onDraft?: (story: FeedStory) => void;
  onAction?: (story: FeedStory) => void;
  onMenuClick?: (story: FeedStory, e: React.MouseEvent) => void;
  className?: string;
}

export function FeedStoryCard({
  story,
  onBookmarkToggle,
  onRead,
  onDraft,
  onAction,
  onMenuClick,
  className,
}: FeedStoryCardProps) {
  const [isSaved, setIsSaved] = useState(!!story.isSaved);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onBookmarkToggle?.(story.id, e);
  };

  const isHighlighted = story.isAiSynthesis;

  return (
    <article
      onClick={() => onRead?.(story)}
      style={
        isHighlighted
          ? {
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(197, 245, 42, 0.35)",
              boxShadow:
                "rgba(0, 0, 0, 0.35) 0px 8px 24px, rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
            }
          : {
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              boxShadow:
                "rgba(0, 0, 0, 0.35) 0px 8px 24px, rgba(255, 255, 255, 0.1) 0px 1px 1px inset",
            }
      }
      className={cn(
        "group flex flex-col justify-between overflow-hidden rounded-[20px] p-2.5 transition-transform duration-200 hover:-translate-y-1 cursor-pointer select-none",
        className
      )}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-2.5 px-1 pt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <CategoryBadge category={story.category} />
            <div
              className={cn(
                "flex items-center gap-1 text-[10px] truncate",
                isHighlighted ? "text-brand-lime font-medium" : "text-neutral-300"
              )}
            >
              {story.sourceDotColor && (
                <span
                  className={cn("w-1.5 h-1.5 rounded-full shrink-0", story.sourceDotColor)}
                />
              )}
              <span className="truncate">{story.source}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                "text-[10px] font-mono",
                isHighlighted ? "text-neutral-300" : "text-neutral-400"
              )}
            >
              {story.readDuration}
            </span>
            <button
              type="button"
              onClick={handleBookmark}
              className={cn(
                "p-1 rounded-lg transition-colors hover:bg-white/10",
                isSaved ? "text-brand-lime" : "text-neutral-400 hover:text-brand-lime"
              )}
              title={isSaved ? "Remove bookmark" : "Save bookmark"}
            >
              {isSaved ? (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Media / Concept Preview Container (155px) */}
        {story.imageUrl ? (
          <div
            className="relative w-full h-[155px] rounded-[16px] overflow-hidden shrink-0 mb-2.5"
            style={{
              background: "rgba(8, 14, 15, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <img
              alt={story.imageAlt || story.title}
              className="w-full h-full object-cover"
              src={story.imageUrl}
              loading="lazy"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(story, e);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center text-white/90 hover:text-white transition-colors hover:bg-white/20"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              }}
              title="More options"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>

            {story.topicTag && (
              <div
                className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg text-[10px] font-medium text-white/90"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                }}
              >
                {story.topicTag}
              </div>
            )}
          </div>
        ) : story.conceptPreview?.type === "narrative" ? (
          /* Card 8 AI Synthesis Narrative Box */
          <div
            className="relative w-full h-[155px] rounded-[16px] overflow-hidden shrink-0 mb-2.5 p-3 flex flex-col justify-between"
            style={{
              background: "rgba(5, 10, 8, 0.85)",
              border: "1px solid rgba(197, 245, 42, 0.25)",
            }}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-brand-lime">
              <span>5-Slide Narrative</span>
              <span>LinkedIn / X</span>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime shrink-0" />
                <span className="line-clamp-1">{story.conceptPreview.hookText}</span>
              </div>
              <div className="text-[10px] text-neutral-400 line-clamp-1">
                {story.conceptPreview.takeawayText}
              </div>
            </div>
            <div
              className="w-full rounded-full h-1 overflow-hidden"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}
            >
              <div
                className="bg-brand-lime h-full"
                style={{ width: `${story.conceptPreview.progressPercent || 80}%` }}
              />
            </div>
          </div>
        ) : story.conceptPreview?.type === "icon" ? (
          /* Card 6 OpenAI Systems Box */
          <div
            className="relative w-full h-[155px] rounded-[16px] overflow-hidden shrink-0 mb-2.5 flex items-center justify-center"
            style={{
              background: "rgba(9, 21, 16, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="relative z-10 flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-brand-lime mb-1.5"
                style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-brand-lime">
                {story.conceptPreview.sublabel || "o1 Systems Release"}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(story, e);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center text-white/90 hover:text-white transition-colors hover:bg-white/20"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              }}
              title="More options"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>
          </div>
        ) : (
          /* Card 7 TL;DR Founders Box */
          <div
            className="relative w-full h-[155px] rounded-[16px] overflow-hidden shrink-0 mb-2.5 flex items-center justify-center"
            style={{
              background: "rgba(22, 13, 19, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="relative z-10 flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-pink-400 mb-1.5 font-mono text-xs font-bold"
                style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
              >
                {story.conceptPreview?.badgeText || "TL;DR"}
              </div>
              <span className="text-[11px] font-medium text-pink-400">
                {story.conceptPreview?.sublabel || "Founder Playbooks"}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(story, e);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center text-white/90 hover:text-white transition-colors hover:bg-white/20"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              }}
              title="More options"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>
          </div>
        )}

        {/* Text Details */}
        <div className="space-y-1 px-1">
          <div
            className={cn(
              "text-[10px] font-mono",
              isHighlighted ? "text-brand-lime" : "text-neutral-400"
            )}
          >
            {story.metaLine}
          </div>
          <h3 className="text-xs font-semibold text-white group-hover:text-brand-lime transition-colors line-clamp-2 leading-snug">
            {story.title}
          </h3>
          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
            {story.description}
          </p>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div
        className="mt-3 pt-2.5 flex items-center gap-1.5 px-1"
        style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onRead?.(story)}
          className="flex-1 py-1.5 rounded-xl text-white/90 hover:text-white text-[11px] font-medium transition-colors text-center hover:bg-white/10 cursor-pointer"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
          }}
        >
          {isHighlighted ? "Inspect" : "Read"}
        </button>

        <button
          type="button"
          onClick={() => onDraft?.(story)}
          className="flex-1 py-1.5 rounded-xl text-white/90 hover:text-white text-[11px] font-medium transition-colors text-center hover:bg-white/10 cursor-pointer"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
          }}
        >
          {isHighlighted ? "Edit" : "Draft"}
        </button>

        <button
          type="button"
          onClick={() => onAction?.(story)}
          className="flex-1 py-1.5 rounded-xl bg-brand-lime text-black hover:bg-brand-limeHover text-[11px] font-bold transition-all text-center shadow-sm cursor-pointer"
        >
          {isHighlighted ? "Publish" : "Carousel"}
        </button>
      </div>
    </article>
  );
}

