"use client";

import React from "react";
import { Modal } from "@/components/design-system/Modal";
import { PrimaryButton, SecondaryGlassButton } from "@/components/design-system/Buttons";
import { FeedStory } from "@/components/design-system/FeedStoryCard";
import { CategoryBadge } from "@/components/design-system/StatusBadge";
import { ExternalLink, Copy, Sparkles, Wand2 } from "lucide-react";

interface ArticleReaderModalProps {
  story: FeedStory | null;
  onClose: () => void;
  onGenerateCarousel?: (story: FeedStory) => void;
  onSendDraft?: (story: FeedStory) => void;
  onCopyLink?: (story: FeedStory) => void;
}

export function ArticleReaderModal({
  story,
  onClose,
  onGenerateCarousel,
  onSendDraft,
  onCopyLink,
}: ArticleReaderModalProps) {
  if (!story) return null;

  return (
    <Modal
      isOpen={!!story}
      onClose={onClose}
      title={story.title}
      description={story.metaLine}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <SecondaryGlassButton
              type="button"
              onClick={() => onCopyLink?.(story)}
              icon={<Copy className="w-3.5 h-3.5" />}
            >
              Copy Link
            </SecondaryGlassButton>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryGlassButton
              type="button"
              onClick={() => onSendDraft?.(story)}
            >
              Send to Draft
            </SecondaryGlassButton>
            <PrimaryButton
              type="button"
              onClick={() => onGenerateCarousel?.(story)}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Generate Carousel
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryBadge category={story.category} />
            <span className="text-xs text-neutral-300 font-medium">
              {story.source}
            </span>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {story.readDuration} read
          </span>
        </div>

        {/* Media Preview if present */}
        {story.imageUrl && (
          <div
            className="w-full h-56 rounded-2xl overflow-hidden relative"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <img
              src={story.imageUrl}
              alt={story.imageAlt || story.title}
              className="w-full h-full object-cover"
            />
            {story.topicTag && (
              <span
                style={{
                  background: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
                className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-xs font-medium text-white"
              >
                {story.topicTag}
              </span>
            )}
          </div>
        )}

        {/* Story Content */}
        <div className="space-y-3 text-neutral-300 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-white text-sm sm:text-base">
            {story.description}
          </p>

          <p className="text-neutral-400">
            Social distribution dynamics and automated content engines prioritize verified,
            high-signal industry developments. This briefing was captured directly by
            PostPilot&apos;s real-time ingestion queue and mapped for multi-platform LinkedIn
            and X carousels.
          </p>

          {story.conceptPreview?.type === "narrative" && (
            <div
              className="p-4 rounded-xl space-y-2"
              style={{
                background: "rgba(197, 245, 42, 0.08)",
                border: "1px solid rgba(197, 245, 42, 0.3)",
              }}
            >
              <div className="text-xs font-mono text-brand-lime font-bold">
                AI SYNTHESIS NARRATIVE STRUCTURE
              </div>
              <div className="text-sm font-semibold text-white">
                {story.conceptPreview.hookText}
              </div>
              <div className="text-xs text-neutral-300">
                {story.conceptPreview.takeawayText}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

