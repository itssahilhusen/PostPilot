"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MoreVertical, Edit3, Trash2, Clock, Send, Eye, Sparkles } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export interface CalendarPostItem {
  id: string;
  title: string;
  content: string;
  status: "SCHEDULED" | "PUBLISHED" | "DRAFT" | "PENDING_REVIEW" | "PENDING_APPROVAL" | "FAILED";
  platforms: string[];
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  image?: string;
  tag?: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  slidesCount?: number;
  impressions?: number;
  engagements?: number;
}

const PLATFORM_ICONS: Record<string, string> = {
  x: "/images/platforms/x-light.svg",
  linkedin: "/images/platforms/linkedin.svg",
  threads: "/images/platforms/threads.svg",
  instagram: "/images/platforms/instagram.svg",
  tiktok: "/images/platforms/tiktok-dark.svg",
  youtube: "/images/platforms/youtube.svg",
  facebook: "/images/platforms/facebook.svg",
};

interface CalendarCardProps {
  post: CalendarPostItem;
  onClick: (post: CalendarPostItem) => void;
  onEdit?: (post: CalendarPostItem) => void;
  onReschedule?: (post: CalendarPostItem) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  onPublishNow?: (post: CalendarPostItem, e: React.MouseEvent) => void;
  className?: string;
}

export function CalendarCard({
  post,
  onClick,
  onEdit,
  onReschedule,
  onDelete,
  onPublishNow,
  className,
}: CalendarCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Format scheduled time display
  const timeString = (() => {
    const raw = post.scheduledAt || post.publishedAt || post.createdAt;
    if (!raw) return "10:00 AM";
    try {
      const d = new Date(raw);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } catch {
      return "10:00 AM";
    }
  })();

  // Fallback author info matching reference
  const author = {
    name: post.authorName || "Nevo David",
    handle: post.authorHandle || "@nevo_david",
    avatar: post.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  };

  // Image preview fallback (high quality product visual matching reference screenshot aesthetic)
  const imagePreview = post.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=400&fit=crop";

  // Tag preview
  const tagPreview = post.tag || (post.title?.toLowerCase().includes("limited") ? "#limited" : "#newdrop");

  return (
    <div
      onClick={() => onClick(post)}
      className={cn(
        "group relative flex flex-col rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors duration-150 select-none cursor-pointer overflow-hidden",
        "hover:border-[#C5F52A]/60",
        className
      )}
    >
      {/* Visual Image Preview */}
      <div className="relative w-full aspect-[3/2] bg-[var(--surface-secondary)] overflow-hidden">
        <Image
          src={imagePreview}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 240px"
          className="object-cover"
        />

        {/* Scheduled Time Pill Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-medium">
          <Clock className="w-2.5 h-2.5 text-[#C5F52A]" />
          <span>{timeString}</span>
        </div>

        {/* 3-Dots Action Button */}
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Context Menu Dropdown */}
          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-40 min-w-[130px] rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1 shadow-xl text-xs backdrop-blur-md animate-in fade-in zoom-in-95"
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onClick(post);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>View Details</span>
              </button>

              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(post);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>Edit Post</span>
                </button>
              )}

              {onReschedule && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onReschedule(post);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>Reschedule</span>
                </button>
              )}

              {onPublishNow && post.status !== "PUBLISHED" && (
                <button
                  type="button"
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    onPublishNow(post, e);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[#C5F52A] hover:bg-[#C5F52A]/10 font-medium transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Now</span>
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    onDelete(post.id, e);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-t border-[var(--border)] mt-1 pt-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-2.5 flex flex-col gap-1.5">
        {/* Author / Channel Row */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-[var(--border)]">
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                sizes="20px"
                className="object-cover"
              />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-bold text-[var(--foreground)] truncate block leading-none">
                {author.name}
              </span>
              <span className="text-[10px] text-[var(--muted)] truncate block leading-tight">
                {author.handle}
              </span>
            </div>
          </div>

          {/* Social Platforms Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {(post.platforms || ["x"]).map((p) => {
              const iconSrc = PLATFORM_ICONS[p.toLowerCase()];
              return iconSrc ? (
                <div
                  key={p}
                  className="w-4 h-4 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center p-0.5"
                  title={p.toUpperCase()}
                >
                  <Image
                    src={iconSrc}
                    alt={p}
                    width={10}
                    height={10}
                    className="object-contain"
                  />
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Post Title / Excerpt */}
        <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-1 leading-snug">
          {post.title}
        </p>

        {/* Tag Pill & Status Badge */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-[var(--muted)] bg-[var(--surface-secondary)] border border-[var(--border)]">
            {tagPreview}
          </span>
          <StatusBadge status={post.status} size="xs" showIcon={false} />
        </div>
      </div>
    </div>
  );
}

