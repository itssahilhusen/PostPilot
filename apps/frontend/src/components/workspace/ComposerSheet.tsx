"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Smile, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Loader2,
  Wand2,
  Layers,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PreviewPanel, PreviewPostData } from "./PreviewPanel";

export interface ThreadItem {
  id: string;
  content: string;
  mediaUrls: string[];
}

interface ComposerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialPost?: {
    id?: string;
    title?: string;
    content?: string;
    platforms?: string[];
  };
  onSavePost?: (post: any) => void;
}

const AVAILABLE_PLATFORMS = [
  { id: "x", name: "X", icon: "/images/platforms/x-light.svg", charLimit: 280, invertDark: true },
  { id: "threads", name: "Threads", icon: "/images/platforms/threads.svg", charLimit: 500, invertDark: true },
  { id: "linkedin", name: "LinkedIn", icon: "/images/platforms/linkedin.svg", charLimit: 3000 },
  { id: "instagram", name: "Instagram", icon: "/images/platforms/instagram.svg", charLimit: 2200 },
  { id: "facebook", name: "Facebook", icon: "/images/platforms/facebook.svg", charLimit: 5000 },
  { id: "tiktok", name: "TikTok", icon: "/images/platforms/tiktok-light.svg", charLimit: 2200, invertDark: true },
];

export function ComposerSheet({
  isOpen,
  onClose,
  initialPost,
  onSavePost,
}: ComposerSheetProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    initialPost?.platforms || ["x", "linkedin", "threads"]
  );

  const [threads, setThreads] = useState<ThreadItem[]>([
    {
      id: "1",
      content: initialPost?.content || "Just shipped our biggest feature yet! 🚀 Consistent multi-platform publishing is now 100% automated with AI brand voice and feedback loops.\n\n#buildinpublic #growth #socialmedia",
      mediaUrls: [],
    },
  ]);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<"x" | "linkedin" | "instagram" | "threads">("x");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("2026-10-26T10:00");
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  if (!isOpen) return null;

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
      } else {
        toast.error("At least one platform must be selected");
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const updateThreadContent = (index: number, val: string) => {
    const updated = [...threads];
    updated[index].content = val;
    setThreads(updated);
  };

  const addThread = () => {
    setThreads([
      ...threads,
      {
        id: String(threads.length + 1),
        content: "",
        mediaUrls: [],
      },
    ]);
    toast.info("Added next tweet in thread");
  };

  const removeThread = (index: number) => {
    if (threads.length <= 1) return;
    setThreads(threads.filter((_, i) => i !== index));
  };

  const handleAiAssist = (promptType: string) => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      const current = threads[0].content;
      let newText = current;
      if (promptType === "hook") {
        newText = "🔥 Here is the secret 99% of creators don't realize about automated growth:\n\n" + current;
      } else if (promptType === "concise") {
        newText = current.replace(/\n\n/g, "\n").slice(0, 180) + "...\n\nKey takeaway: Consistency beats intensity.";
      } else if (promptType === "hashtags") {
        newText = current + "\n\n#AIAutomation #ContentStrategy #CreatorEconomy #SaaS #BuildInPublic";
      } else if (promptType === "thread") {
        setThreads([
          { id: "1", content: "1/5 How to 10x your social reach without spending 8 hours a day creating content 👇", mediaUrls: [] },
          { id: "2", content: "2/5 Step 1: Capture everything.\n\nUse RSS feeds, competitor bookmarks, and audio notes directly into your ideas inbox.", mediaUrls: [] },
          { id: "3", content: "3/5 Step 2: Repurpose with AI.\n\nTurn 1 core idea into 5 native formats: Twitter thread, LinkedIn carousel, Instagram caption, and video script.", mediaUrls: [] },
          { id: "4", content: "4/5 Step 3: Automate the delivery.\n\nSchedule out your weekly calendar and let auto-DM reply to comments while you sleep.", mediaUrls: [] },
          { id: "5", content: "5/5 Try reerts today to put your content pipeline on full autopilot. Link in bio!", mediaUrls: [] },
        ]);
        toast.success("Generated 5-part viral thread!");
        return;
      }
      updateThreadContent(0, newText);
      toast.success(`AI ${promptType} applied!`);
    }, 800);
  };

  const handlePostNow = async () => {
    try {
      const payload = {
        title: threads[0].content.slice(0, 40),
        content: threads[0].content,
        rawThreads: threads,
        platforms: selectedPlatforms,
        status: "PUBLISHED",
      };

      let res;
      if (initialPost?.id) {
        res = await fetch(`/api/posts/${initialPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success("Successfully published simultaneously across connected channels! 🎉");
        onSavePost?.(payload);
        onClose();
      } else {
        toast.error("Failed to publish post");
      }
    } catch (err) {
      toast.error("Error communicating with posts API");
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = {
        title: threads[0].content.slice(0, 40),
        content: threads[0].content,
        rawThreads: threads,
        platforms: selectedPlatforms,
        status: "DRAFT",
      };

      let res;
      if (initialPost?.id) {
        res = await fetch(`/api/posts/${initialPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success("Draft saved to Content Studio!");
        onSavePost?.(payload);
        onClose();
      }
    } catch (err) {
      toast.error("Error saving draft");
    }
  };

  const handleSchedule = async () => {
    try {
      const payload = {
        title: threads[0].content.slice(0, 40),
        content: threads[0].content,
        rawThreads: threads,
        platforms: selectedPlatforms,
        status: "SCHEDULED",
        scheduledAt: scheduleDate,
      };

      let res;
      if (initialPost?.id) {
        res = await fetch(`/api/posts/${initialPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(`Post scheduled for ${new Date(scheduleDate).toLocaleString()}`);
        setScheduleModalOpen(false);
        onSavePost?.(payload);
        onClose();
      }
    } catch (err) {
      toast.error("Error scheduling post");
    }
  };

  // Preview data object
  const previewPostData: PreviewPostData = {
    content: threads[0].content,
    mediaUrls: threads[0].mediaUrls,
    accountName: "Alex Rivers",
    accountHandle: "alexgrowth",
    avatarUrl: "/images/testimonials/oliviandtilly.jpg",
    platform: activePreviewPlatform,
  };

  // Smallest character limit among selected platforms
  const activeLimits = selectedPlatforms.map((p) => {
    const found = AVAILABLE_PLATFORMS.find((item) => item.id === p);
    return found ? found.charLimit : 280;
  });
  const minCharLimit = Math.min(...activeLimits);
  const currentChars = threads[0].content.length;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Slide-out Sheet Canvas */}
      <div className="relative ml-auto h-full w-full max-w-[560px] bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Top Composer Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-base">New Post Studio</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              Multi-channel
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Tab Toggle */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg lg:hidden">
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={cn("px-2.5 py-1 text-xs font-medium rounded-md", activeTab === "editor" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground")}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn("px-2.5 py-1 text-xs font-medium rounded-md", activeTab === "preview" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground")}
              >
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Target Platforms Strip */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 sm:px-6 py-2.5">
          <span className="text-xs font-medium text-muted-foreground mr-1">Publish to:</span>
          {AVAILABLE_PLATFORMS.map((plat) => {
            const isSelected = selectedPlatforms.includes(plat.id);
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => togglePlatform(plat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium h-8 px-3 transition-all select-none border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <Image
                  src={plat.icon}
                  alt={plat.name}
                  width={14}
                  height={14}
                  className={cn(plat.invertDark && isSelected && "invert", plat.invertDark && !isSelected && "dark:invert")}
                />
                <span>{plat.name}</span>
                {isSelected && <Check className="size-3" />}
              </button>
            );
          })}
        </div>

        {/* Main Body: Two Columns (Left Editor, Right Live Preview) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Thread Composer */}
          <div className={cn("lg:col-span-7 flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-6", activeTab === "preview" && "hidden lg:flex")}>
            {/* AI Assistant Quick Suggestions */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <Sparkles className="size-4" />
                <span>AI Content Copilot</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiAssist("hook")}
                  className="rounded-lg border border-primary/30 bg-background/80 px-2.5 py-1 font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  ⚡ Viral Hook
                </button>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiAssist("concise")}
                  className="rounded-lg border border-primary/30 bg-background/80 px-2.5 py-1 font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  ✂️ Punchy
                </button>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiAssist("hashtags")}
                  className="rounded-lg border border-primary/30 bg-background/80 px-2.5 py-1 font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  #️⃣ Hashtags
                </button>
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => handleAiAssist("thread")}
                  className="rounded-lg border border-primary/30 bg-background/80 px-2.5 py-1 font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  🧵 5-Part Thread
                </button>
              </div>
            </div>

            {/* Threads List */}
            <div className="space-y-4">
              {threads.map((thread, index) => (
                <div key={thread.id} className="relative flex gap-3">
                  {/* Thread sequence indicator with vertical connector */}
                  <div className="flex flex-col items-center">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
                      #{index + 1}
                    </div>
                    {index < threads.length - 1 && (
                      <div className="w-0.5 flex-1 border-l-2 border-dashed border-border my-2" />
                    )}
                  </div>

                  {/* Composer Card */}
                  <div className="flex-1 rounded-xl border border-border bg-card shadow-xs focus-within:border-primary/60 transition-all overflow-hidden">
                    <textarea
                      value={thread.content}
                      onChange={(e) => updateThreadContent(index, e.target.value)}
                      placeholder={index === 0 ? "What's new? (drag & drop media files, or type your thoughts)" : `Thread continuation #${index + 1}...`}
                      rows={5}
                      className="w-full resize-none bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 leading-relaxed"
                    />

                    {/* Media preview if any */}
                    {thread.mediaUrls.length > 0 && (
                      <div className="px-4 pb-3 flex gap-2">
                        {thread.mediaUrls.map((url, mIdx) => (
                          <div key={mIdx} className="relative size-16 rounded-lg overflow-hidden border border-border">
                            <Image src={url} alt="" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Card Footer Toolbar */}
                    <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {/* Attach media simulation */}
                        <label className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted hover:text-foreground cursor-pointer transition-colors" title="Attach Media">
                          <ImageIcon className="size-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                const updated = [...threads];
                                updated[index].mediaUrls.push(url);
                                setThreads(updated);
                                toast.success("Media attached to post!");
                              }
                            }}
                          />
                        </label>

                        {/* Emoji shortcut */}
                        <button
                          type="button"
                          onClick={() => updateThreadContent(index, thread.content + " ✨")}
                          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted hover:text-foreground transition-colors"
                          title="Add Sparkle"
                        >
                          <Smile className="size-4" />
                        </button>

                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeThread(index)}
                            className="inline-flex size-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors ml-1"
                            title="Delete thread item"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>

                      {/* Character Counter */}
                      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                        <span className={cn(thread.content.length > minCharLimit && "text-destructive font-bold")}>
                          {thread.content.length} / {minCharLimit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Thread Button */}
              <div className="pl-10">
                <button
                  type="button"
                  onClick={addThread}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/10 px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/60 hover:text-foreground transition-all"
                >
                  <Plus className="size-3.5" />
                  Add thread #{threads.length + 1}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Multi-Platform Preview */}
          <div className={cn("lg:col-span-5 h-full border-t lg:border-t-0 lg:border-l border-border", activeTab === "editor" && "hidden lg:block")}>
            <PreviewPanel
              post={previewPostData}
              activePlatform={activePreviewPlatform}
              onSelectPlatform={setActivePreviewPlatform}
            />
          </div>
        </div>

        {/* Bottom Action Footer Bar */}
        <div className="flex h-16 shrink-0 items-center justify-between border-t border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none border shadow-xs h-9 px-4 py-2 text-foreground bg-tone-yellow hover:bg-tone-yellow hover:brightness-95 dark:hover:brightness-110"
            >
              Save as draft
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none border shadow-xs h-9 px-4 py-2 text-foreground bg-tone-green hover:bg-tone-green hover:brightness-95 dark:hover:brightness-110"
            >
              <CalendarIcon className="size-3.5 text-muted-foreground" />
              Schedule
            </button>

            <button
              type="button"
              onClick={handlePostNow}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none border shadow-xs h-9 px-4 py-2 text-foreground bg-tone-blue hover:bg-tone-blue hover:brightness-95 dark:hover:brightness-110"
            >
              Post now
            </button>
          </div>
        </div>
      </div>

      {/* Schedule DateTime Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-base">Schedule Post</h3>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select date and time to automatically publish across all {selectedPlatforms.length} selected networks.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Date & Time</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
