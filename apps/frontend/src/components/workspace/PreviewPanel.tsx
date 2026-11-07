"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  CheckCircle2, 
  BarChart2, 
  ThumbsUp, 
  Send,
  Smartphone,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PreviewPostData {
  content: string;
  mediaUrls?: string[];
  accountName?: string;
  accountHandle?: string;
  avatarUrl?: string;
  platform?: "x" | "linkedin" | "instagram" | "threads";
}

interface PreviewPanelProps {
  post: PreviewPostData;
  activePlatform?: "x" | "linkedin" | "instagram" | "threads";
  onSelectPlatform?: (platform: "x" | "linkedin" | "instagram" | "threads") => void;
}

export function PreviewPanel({
  post,
  activePlatform = "x",
  onSelectPlatform,
}: PreviewPanelProps) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const platform = activePlatform;

  const accountName = post.accountName || "Alex Rivers";
  const accountHandle = post.accountHandle || "alexgrowth";
  const avatarUrl = post.avatarUrl || "/images/testimonials/oliviandtilly.jpg";
  const textContent = post.content || "Just shipped our biggest feature yet! 🚀 Consistent multi-platform publishing is now 100% automated with AI brand voice and feedback loops.\n\n#buildinpublic #growth #socialmedia";

  return (
    <div className="flex flex-col h-full w-full bg-muted/10 border-l border-border select-none">
      {/* Top Preview Controls */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        {/* Platform Switcher */}
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onSelectPlatform?.("x")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
              platform === "x" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Image src="/images/platforms/x-light.svg" alt="X" width={14} height={14} className="dark:invert" />
            <span>X (Twitter)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPlatform?.("linkedin")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
              platform === "linkedin" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Image src="/images/platforms/linkedin.svg" alt="LinkedIn" width={14} height={14} />
            <span>LinkedIn</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPlatform?.("threads")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
              platform === "threads" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Image src="/images/platforms/threads.svg" alt="Threads" width={14} height={14} className="dark:invert" />
            <span>Threads</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPlatform?.("instagram")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
              platform === "instagram" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Image src="/images/platforms/instagram.svg" alt="Instagram" width={14} height={14} />
            <span>Instagram</span>
          </button>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setDeviceView("desktop")}
            className={cn(
              "p-1.5 rounded-md text-xs transition-all",
              deviceView === "desktop" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
            title="Desktop Card View"
          >
            <Monitor className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceView("mobile")}
            className={cn(
              "p-1.5 rounded-md text-xs transition-all",
              deviceView === "mobile" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
            title="Mobile iPhone View"
          >
            <Smartphone className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Viewport Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
        {deviceView === "mobile" ? (
          /* Mobile Phone Frame Mockup */
          <div className="relative mx-auto w-[320px] rounded-[40px] border-[6px] border-neutral-800 bg-background shadow-2xl overflow-hidden min-h-[580px] flex flex-col">
            {/* Notch */}
            <div className="h-6 w-full bg-neutral-900 flex justify-center items-center">
              <div className="h-3 w-20 rounded-full bg-black/60" />
            </div>

            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border text-xs font-semibold">
              <span className="capitalize">{platform}</span>
              <span className="text-muted-foreground text-[10px]">Preview</span>
            </div>

            {/* Post in Mobile Feed */}
            <div className="p-3 flex-1 overflow-y-auto">
              {renderFeedPost(platform, accountName, accountHandle, avatarUrl, textContent, post.mediaUrls)}
            </div>
          </div>
        ) : (
          /* Desktop Card View */
          <div className="w-full max-w-lg mx-auto">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              {renderFeedPost(platform, accountName, accountHandle, avatarUrl, textContent, post.mediaUrls)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderFeedPost(
  platform: "x" | "linkedin" | "instagram" | "threads",
  accountName: string,
  accountHandle: string,
  avatarUrl: string,
  textContent: string,
  mediaUrls?: string[]
) {
  switch (platform) {
    case "x":
      return (
        <div className="space-y-3 font-sans text-sm">
          {/* Author Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative size-10 rounded-full overflow-hidden bg-primary/10 border border-border">
                <Image src={avatarUrl} alt={accountName} fill className="object-cover" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <span>{accountName}</span>
                  <CheckCircle2 className="size-3.5 text-sky-500 fill-sky-500/20" />
                </div>
                <span className="text-xs text-muted-foreground">@{accountHandle} · Just now</span>
              </div>
            </div>
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </div>

          {/* Post Body */}
          <div className="text-foreground/90 whitespace-pre-line leading-relaxed text-sm">
            {textContent}
          </div>

          {/* Attached Media */}
          {mediaUrls && mediaUrls.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-border max-h-60 bg-muted/20">
              <Image src={mediaUrls[0]} alt="Media" width={600} height={350} className="w-full object-cover" />
            </div>
          )}

          {/* X Metrics Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
              <MessageCircle className="size-3.5" /> 24
            </span>
            <span className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
              <Repeat2 className="size-3.5" /> 18
            </span>
            <span className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
              <Heart className="size-3.5" /> 142
            </span>
            <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <BarChart2 className="size-3.5" /> 3.8K
            </span>
            <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Bookmark className="size-3.5" />
              <Share2 className="size-3.5 ml-1" />
            </span>
          </div>
        </div>
      );

    case "linkedin":
      return (
        <div className="space-y-3 font-sans text-sm">
          {/* Author Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative size-11 rounded-full overflow-hidden bg-primary/10 border border-border">
                <Image src={avatarUrl} alt={accountName} fill className="object-cover" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-foreground">{accountName}</span>
                <p className="text-[11px] text-muted-foreground">Founder & Content Creator • Growth Strategist</p>
                <span className="text-[10px] text-muted-foreground">Just now • 🌐</span>
              </div>
            </div>
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </div>

          {/* LinkedIn Body */}
          <div className="text-foreground/90 whitespace-pre-line leading-relaxed text-sm">
            {textContent}
          </div>

          {/* Attached Media */}
          {mediaUrls && mediaUrls.length > 0 && (
            <div className="rounded-lg overflow-hidden border border-border max-h-60 bg-muted/20">
              <Image src={mediaUrls[0]} alt="Media" width={600} height={350} className="w-full object-cover" />
            </div>
          )}

          {/* LinkedIn Reactions & Bar */}
          <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 mb-2">
              <span className="inline-flex size-4 rounded-full bg-blue-500 items-center justify-center text-[8px] text-white">👍</span>
              <span className="inline-flex size-4 rounded-full bg-rose-500 items-center justify-center text-[8px] text-white">❤️</span>
              <span className="inline-flex size-4 rounded-full bg-amber-500 items-center justify-center text-[8px] text-white">💡</span>
              <span className="text-[11px] ml-1">189 • 36 comments</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/40 pt-2 font-medium">
              <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                <ThumbsUp className="size-3.5" /> Like
              </span>
              <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                <MessageCircle className="size-3.5" /> Comment
              </span>
              <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                <Repeat2 className="size-3.5" /> Repost
              </span>
              <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                <Send className="size-3.5" /> Send
              </span>
            </div>
          </div>
        </div>
      );

    case "threads":
      return (
        <div className="space-y-3 font-sans text-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative size-10 rounded-full overflow-hidden bg-primary/10 border border-border">
                <Image src={avatarUrl} alt={accountName} fill className="object-cover" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <span>{accountHandle}</span>
                  <CheckCircle2 className="size-3.5 text-blue-500 fill-blue-500/20" />
                </div>
                <span className="text-xs text-muted-foreground">Just now</span>
              </div>
            </div>
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </div>

          <div className="text-foreground/90 whitespace-pre-line leading-relaxed text-sm">
            {textContent}
          </div>

          {/* Threads Action Icons */}
          <div className="flex items-center gap-4 pt-1 text-muted-foreground">
            <Heart className="size-4 hover:text-rose-500 cursor-pointer" />
            <MessageCircle className="size-4 hover:text-foreground cursor-pointer" />
            <Repeat2 className="size-4 hover:text-emerald-500 cursor-pointer" />
            <Send className="size-4 hover:text-foreground cursor-pointer" />
          </div>
        </div>
      );

    case "instagram":
      return (
        <div className="space-y-3 font-sans text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative size-8 rounded-full ring-2 ring-gradient-to-tr from-amber-500 to-fuchsia-600 p-0.5 overflow-hidden">
                <Image src={avatarUrl} alt={accountName} fill className="object-cover rounded-full" />
              </div>
              <span className="font-bold text-foreground text-xs">{accountHandle}</span>
            </div>
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </div>

          {/* Media box */}
          <div className="rounded-xl overflow-hidden aspect-square bg-muted/40 border border-border flex items-center justify-center relative">
            {mediaUrls && mediaUrls.length > 0 ? (
              <Image src={mediaUrls[0]} alt="Post" fill className="object-cover" />
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Visual Post / Carousel</p>
                <p>Upload images or let AI generate a carousel</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-foreground">
              <Heart className="size-5 hover:text-rose-500 cursor-pointer" />
              <MessageCircle className="size-5 hover:text-foreground cursor-pointer" />
              <Send className="size-5 hover:text-foreground cursor-pointer" />
            </div>
            <Bookmark className="size-5 hover:text-foreground cursor-pointer" />
          </div>

          <div className="text-xs">
            <p className="font-semibold text-foreground">148 likes</p>
            <p className="mt-1 text-muted-foreground leading-snug">
              <span className="font-semibold text-foreground mr-1.5">{accountHandle}</span>
              {textContent}
            </p>
          </div>
        </div>
      );
  }
}
