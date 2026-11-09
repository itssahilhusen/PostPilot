"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  X,
  Clock,
  Calendar,
  Send,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Share2,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Drawer } from "./Drawer";
import { StatusBadge } from "./StatusBadge";
import { PrimaryButton, SecondaryButton } from "./Buttons";
import { CalendarPostItem } from "./CalendarCard";
import { toast } from "sonner";

interface PostDetailDrawerProps {
  post: CalendarPostItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (post: CalendarPostItem) => void;
  onReschedule?: (post: CalendarPostItem) => void;
  onDelete?: (id: string) => void;
  onPublishNow?: (post: CalendarPostItem) => void;
}

export function PostDetailDrawer({
  post,
  isOpen,
  onClose,
  onEdit,
  onReschedule,
  onDelete,
  onPublishNow,
}: PostDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "caption" | "history">("preview");

  if (!post) return null;

  const formattedDate = (() => {
    const raw = post.scheduledAt || post.publishedAt || post.createdAt;
    if (!raw) return "No date set";
    try {
      const d = new Date(raw);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  })();

  const handleCopyCaption = () => {
    if (post.content) {
      navigator.clipboard.writeText(post.content);
      toast.success("Caption copied to clipboard");
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Scheduled Post Details"
      subtitle={post.title}
      width="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(post.id);
                onClose();
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Delete Slot
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {onReschedule && (
              <SecondaryButton
                size="sm"
                icon={<Clock className="w-3.5 h-3.5" />}
                onClick={() => {
                  onReschedule(post);
                  onClose();
                }}
              >
                Reschedule
              </SecondaryButton>
            )}

            {onPublishNow && post.status !== "PUBLISHED" && (
              <PrimaryButton
                size="sm"
                icon={<Send className="w-3.5 h-3.5" />}
                onClick={() => {
                  onPublishNow(post);
                  onClose();
                }}
              >
                Publish Now
              </PrimaryButton>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Top Status & Date Banner */}
        <div className="p-3.5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={post.status} size="md" />
            <span className="text-xs font-mono text-[var(--muted)]">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {post.platforms?.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Visual Preview */}
        {post.image && (
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[var(--surface-secondary)] border border-[var(--border)] shadow-xs">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover"
            />
            {post.tag && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-medium">
                {post.tag}
              </div>
            )}
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-[var(--border)] gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "pb-2 border-b-2 cursor-pointer transition-colors",
              activeTab === "preview"
                ? "border-[#C5F52A] text-[var(--foreground)] font-bold"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            Post Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("caption")}
            className={cn(
              "pb-2 border-b-2 cursor-pointer transition-colors",
              activeTab === "caption"
                ? "border-[#C5F52A] text-[var(--foreground)] font-bold"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            Caption & Hashtags
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "pb-2 border-b-2 cursor-pointer transition-colors",
              activeTab === "history"
                ? "border-[#C5F52A] text-[var(--foreground)] font-bold"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            Approval History
          </button>
        </div>

        {/* Tab 1: Preview */}
        {activeTab === "preview" && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[var(--foreground)]">{post.title}</h3>
            <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed font-sans">
              {post.content || "No caption text provided for this post."}
            </div>
          </div>
        )}

        {/* Tab 2: Caption & Hashtags */}
        {activeTab === "caption" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--muted)]">Post Copy</span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#C5F52A] hover:underline cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Caption</span>
              </button>
            </div>
            <textarea
              readOnly
              value={post.content}
              rows={6}
              className="w-full p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono resize-none focus:outline-none"
            />
          </div>
        )}

        {/* Tab 3: Approval History */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#C5F52A] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[var(--foreground)]">
                  Approved for Publishing
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">
                  Content passed brand voice validation and is queued for automated release.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-start gap-3">
              <Clock className="w-4 h-4 text-[var(--muted)] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-[var(--foreground)]">
                  Created & Scheduled
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">
                  Scheduled for {formattedDate} across {post.platforms?.join(", ").toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

