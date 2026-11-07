"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Link2,
  SquareCode,
  Pencil,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronsUpDown,
  Upload,
  Plus,
  ArrowRight,
  Loader2,
  Check,
  CheckSquare,
  ImageIcon,
  FolderOpen,
  Layers,
  Wand2,
  RotateCcw,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CarouselSlideItem } from "@/types";

export type SourceTab = "link" | "post" | "text" | "topic" | "file";
export type DesignStyle = "minimal" | "gradient" | "dark" | "editorial" | "brutalist";

interface PostItem {
  id: string;
  caption: string;
  date: string;
  views: string;
  reactions: number;
}

const SAMPLE_POSTS: PostItem[] = [
  {
    id: "p1",
    caption: "(no text)",
    date: "6/24/2024",
    views: "0",
    reactions: 101,
  },
  {
    id: "p2",
    caption: "#newpost #goodvibes",
    date: "1/9/2023",
    views: "0",
    reactions: 95,
  },
  {
    id: "p3",
    caption: "(no text)",
    date: "4/24/2022",
    views: "0",
    reactions: 83,
  },
  {
    id: "p4",
    caption: "(no text)",
    date: "9/29/2022",
    views: "0",
    reactions: 80,
  },
  {
    id: "p5",
    caption: "(no text)",
    date: "7/29/2024",
    views: "1,603",
    reactions: 78,
  },
];

const DESIGN_PRESETS: { id: DesignStyle; name: string; desc: string; previewClass: string }[] = [
  {
    id: "minimal",
    name: "Minimal Clean",
    desc: "Black typography on crisp white background with generous whitespace.",
    previewClass: "bg-white text-neutral-900 border-neutral-300",
  },
  {
    id: "gradient",
    name: "Modern Gradient",
    desc: "Deep violet to indigo vibrant backdrop for high-engagement viral carousels.",
    previewClass: "bg-gradient-to-br from-indigo-900 via-purple-900 to-neutral-950 text-white border-purple-800/60",
  },
  {
    id: "dark",
    name: "High Contrast Dark",
    desc: "Premium charcoal aesthetic with luminous text and bright accent badges.",
    previewClass: "bg-neutral-950 text-white border-neutral-800",
  },
  {
    id: "editorial",
    name: "Editorial Serif",
    desc: "Warm paper tone with sophisticated serif headlines for thoughtful creators.",
    previewClass: "bg-[#fdfaf5] text-amber-950 border-amber-200",
  },
  {
    id: "brutalist",
    name: "Neo-Brutalism",
    desc: "Heavy outlines, stark contrast tags, and high-energy punchy typography.",
    previewClass: "bg-yellow-50 text-black border-2 border-black",
  },
];

interface CreateCarouselDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCarouselGenerated: (title: string, slides: CarouselSlideItem[], theme: "dark" | "gradient" | "minimal") => void;
}

export function CreateCarouselDrawer({
  isOpen,
  onClose,
  onCarouselGenerated,
}: CreateCarouselDrawerProps) {
  const [activeTab, setActiveTab] = useState<SourceTab>("link");

  // Link Tab State
  const [linkInput, setLinkInput] = useState("");
  const [isImportingLink, setIsImportingLink] = useState(false);
  const [hasImported, setHasImported] = useState(false);
  const [extractError, setExtractError] = useState(
    "We could not extract this link. Enter the content and add images to continue."
  );
  const [contentTitle, setContentTitle] = useState("safd");
  const [contentText, setContentText] = useState("fdsafd");
  const [initialContentText, setInitialContentText] = useState("fdsafd");
  const [mediaList, setMediaList] = useState<string[]>([
    "/images/logos/app-icon.png",
  ]);

  // Post Tab State
  const [selectedPostId, setSelectedPostId] = useState<string>("p1");
  const [sourceAccount, setSourceAccount] = useState("sahil_357_");
  const [sortOrder, setSortOrder] = useState<"Reactions" | "Date" | "Views">("Reactions");

  // Text Tab State
  const [rawTextContent, setRawTextContent] = useState("");
  const [rawTextMedia, setRawTextMedia] = useState<string[]>([]);

  // Topic Tab State
  const [topicContent, setTopicContent] = useState("");

  // Step state: 'source' | 'design'
  const [step, setStep] = useState<"source" | "design">("source");
  const [selectedDesign, setSelectedDesign] = useState<DesignStyle>("dark");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Import link logic
  const handleImportLink = async () => {
    if (!linkInput.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }
    setIsImportingLink(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setHasImported(true);

      if (linkInput.includes("unsplash") || linkInput.includes("photo") || linkInput.includes("image")) {
        setExtractError("We could not extract this link. Enter the content and add images to continue.");
        if (!contentTitle) setContentTitle("safd");
        if (!contentText) setContentText("fdsafd");
        setInitialContentText("fdsafd");
      } else {
        setExtractError("");
        setContentTitle("5 High-Conversion Strategies for Solo SaaS Founders");
        const sampleText = "How bootstrapped founders turn single feature commits into sustainable revenue machines. 5 tactical frameworks for high retention and distribution.";
        setContentText(sampleText);
        setInitialContentText(sampleText);
        toast.success("Article content and key insights extracted!");
      }
    } catch {
      setHasImported(true);
      setExtractError("We could not extract this link. Enter the content and add images to continue.");
      toast.error("Failed to parse URL automatically. Please enter content manually.");
    } finally {
      setIsImportingLink(false);
    }
  };

  const handleRestoreText = () => {
    setContentText(initialContentText);
    toast.info("Restored original text");
  };

  const handleAddMedia = () => {
    const newMedia = `/images/logos/app-icon.png`;
    setMediaList((prev) => [...prev, newMedia]);
    toast.success("Image added to content media");
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== index));
    toast.info("Image removed");
  };

  const handleProceedToDesign = () => {
    if (activeTab === "link") {
      if (!contentTitle.trim() && !linkInput.trim()) {
        toast.error("Please enter a title or link to proceed");
        return;
      }
    } else if (activeTab === "topic") {
      if (!topicContent.trim()) {
        toast.error("Please describe your topic");
        return;
      }
    } else if (activeTab === "text") {
      if (!rawTextContent.trim()) {
        toast.error("Please enter your content text");
        return;
      }
    }
    setStep("design");
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let finalTopic = topicContent;
      let finalUrl = linkInput;
      let finalText = contentText;

      if (activeTab === "link") {
        finalTopic = contentTitle || "Curated Framework";
        finalText = contentText;
      } else if (activeTab === "post") {
        const post = SAMPLE_POSTS.find((p) => p.id === selectedPostId);
        finalTopic = post ? `Repurposed Post: ${post.caption || "Creator Framework"}` : "Social Post Insights";
      } else if (activeTab === "text") {
        finalTopic = rawTextContent.slice(0, 50);
        finalText = rawTextContent;
      }

      // Call API
      const res = await fetch("/api/carousel/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic || "5 High-Conversion Strategies",
          url: finalUrl || undefined,
          text: finalText || undefined,
        }),
      });

      const data = await res.json();
      const title = data.title || finalTopic || "AI Planned Carousel";

      let slides: CarouselSlideItem[] = [];
      if (data.slides && data.slides.length > 0) {
        slides = data.slides.map((s: any, idx: number) => ({
          id: `slide-${idx + 1}`,
          order: s.order || idx + 1,
          slideType: s.slideType || (idx === 0 ? "COVER" : idx === data.slides.length - 1 ? "CLOSING" : "CONTENT"),
          headline: s.headline || `Key Takeaway ${idx + 1}`,
          body: s.body || "Actionable breakdown and insight.",
          tag: s.tag || (idx === 0 ? "FRAMEWORK" : `STEP 0${idx}`),
          bgGradient: s.bgGradient,
        }));
      } else {
        // Fallback default rich 5 slides
        slides = [
          {
            id: "slide-1",
            order: 1,
            slideType: "COVER",
            headline: title,
            body: contentText || "A high-conversion tactical breakdown engineered for solopreneurs and builders.",
            tag: "FRAMEWORK",
          },
          {
            id: "slide-2",
            order: 2,
            slideType: "PROBLEM",
            headline: "The Hidden Bottleneck",
            body: "Most creators rely on random bursts of inspiration instead of repeatable distribution flywheels.",
            tag: "THE PROBLEM",
          },
          {
            id: "slide-3",
            order: 3,
            slideType: "CONTENT",
            headline: "The Rule of Single Takeaway",
            body: "Every slide must deliver one clear punchline. Never dilute high-intent attention with cluttered text.",
            tag: "CORE PRINCIPLE",
          },
          {
            id: "slide-4",
            order: 4,
            slideType: "COMPARISON",
            headline: "Manual Grinding vs. AI Systems",
            body: "❌ Spending 3 hours manually formatting slides in Canva.\n✅ Letting AI plan the argument and export ready-to-post graphics in 30 seconds.",
            tag: "SYSTEM COMPARISON",
          },
          {
            id: "slide-5",
            order: 5,
            slideType: "CLOSING",
            headline: "Save this carousel for your next launch",
            body: "Bookmark for later. Drop a comment below if you want the full implementation checklist.",
            tag: "SAVE & SHARE",
          },
        ];
      }

      const mappedTheme: "dark" | "gradient" | "minimal" =
        selectedDesign === "minimal" || selectedDesign === "editorial"
          ? "minimal"
          : selectedDesign === "gradient"
          ? "gradient"
          : "dark";

      toast.success("Carousel slides generated successfully!");
      onCarouselGenerated(title, slides, mappedTheme);
      onClose();
    } catch (err) {
      toast.error("Failed to plan carousel");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 overflow-hidden select-none",
        !isOpen && "pointer-events-none"
      )}
    >
      {/* 1. Dark Backdrop: covers ONLY the main view area (sidebar and top navbar stay visible!) */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-neutral-900/50 dark:bg-black/60 backdrop-blur-2xs transition-opacity duration-300 ease-out z-10",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* 2. Main Drawer: EXACT same width & structure as 'New Automation' (w-full max-w-[560px] sm:w-[540px]) */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex items-stretch transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="w-[480px] sm:w-[500px] lg:w-[520px] shrink-0 bg-white dark:bg-card border-r border-border flex flex-col h-full shadow-2xl relative z-20 p-5 sm:p-6 overflow-y-auto">
          {step === "source" ? (
            <div className="flex-1 flex flex-col pb-12">
              {/* Header matching Snapshot */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-[420px]">
                  <div className="flex items-center gap-2 text-foreground font-bold text-base">
                    {/* Exact Carousel Icon */}
                    <svg
                      className="size-4 shrink-0 text-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="10" height="14" x="7" y="5" rx="1.5" />
                      <path d="M3 8v8" />
                      <path d="M21 8v8" />
                    </svg>
                    <span>Create a carousel</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add a link, one of your posts, text, a topic, or files, then create it with an AI design or a saved template.
                  </p>
                </div>

                {/* Close Button: Black rounded square with crisp white X */}
                <button
                  type="button"
                  onClick={onClose}
                  className="size-7 shrink-0 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors shadow-2xs"
                  title="Close"
                >
                  <X className="size-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Vertical spacing between subtitle and tabs matching Image 1 */}
              <div className="mt-7 sm:mt-8 w-full">
                {/* Tab Row: Bottom aligned, overlapping the container below by 1px */}
                <div className="flex items-end gap-1.5 sm:gap-2 relative z-10 -mb-px">
                  {/* TAB 1: Link */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("link")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border outline-none select-none",
                      activeTab === "link"
                        ? "bg-[#fcf7ec] dark:bg-[#252017] border-[#e3d7be] dark:border-[#4d3f29] border-b-0 rounded-t-xl rounded-b-none text-[#45371c] dark:text-[#f3e5c9] shadow-2xs pb-2.5"
                        : "bg-[#fcf7ec]/60 dark:bg-[#252017]/40 border-[#e3d7be]/60 text-amber-900/70 hover:bg-[#fcf7ec] hover:text-amber-950 rounded-xl"
                    )}
                  >
                    <Link2 className="size-3.5" />
                    <span>Link</span>
                  </button>

                  {/* TAB 2: Post */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("post")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border outline-none select-none",
                      activeTab === "post"
                        ? "bg-[#fff1f3] dark:bg-[#26161a] border-[#fbcfe8] dark:border-[#522939] border-b-0 rounded-t-xl rounded-b-none text-[#831843] dark:text-[#fce7f3] shadow-2xs pb-2.5"
                        : "bg-[#fff1f3]/60 dark:bg-[#26161a]/40 border-[#fbcfe8]/60 text-rose-900/70 hover:bg-[#fff1f3] hover:text-rose-950 rounded-xl"
                    )}
                  >
                    <SquareCode className="size-3.5" />
                    <span>Post</span>
                  </button>

                  {/* TAB 3: Text */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border outline-none select-none",
                      activeTab === "text"
                        ? "bg-[#edf7f1] dark:bg-[#15241b] border-[#bbf7d0] dark:border-[#224e33] border-b-0 rounded-t-xl rounded-b-none text-[#14532d] dark:text-[#dcfce7] shadow-2xs pb-2.5"
                        : "bg-[#edf7f1]/60 dark:bg-[#15241b]/40 border-[#bbf7d0]/60 text-emerald-900/70 hover:bg-[#edf7f1] hover:text-emerald-950 rounded-xl"
                    )}
                  >
                    <Pencil className="size-3.5" />
                    <span>Text</span>
                  </button>

                  {/* TAB 4: Topic */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("topic")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border outline-none select-none",
                      activeTab === "topic"
                        ? "bg-[#eef5fc] dark:bg-[#15212c] border-[#bae6fd] dark:border-[#1e4461] border-b-0 rounded-t-xl rounded-b-none text-[#075985] dark:text-[#e0f2fe] shadow-2xs pb-2.5"
                        : "bg-[#eef5fc]/60 dark:bg-[#15212c]/40 border-[#bae6fd]/60 text-sky-900/70 hover:bg-[#eef5fc] hover:text-sky-950 rounded-xl"
                    )}
                  >
                    <Sparkles className="size-3.5" />
                    <span>Topic</span>
                  </button>

                  {/* TAB 5: File */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("file")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border outline-none select-none",
                      activeTab === "file"
                        ? "bg-[#f3f4f6] dark:bg-[#1f242d] border-[#d1d5db] dark:border-[#374151] border-b-0 rounded-t-xl rounded-b-none text-[#374151] dark:text-[#f3f4f6] shadow-2xs pb-2.5"
                        : "bg-[#f3f4f6]/60 dark:bg-[#1f242d]/40 border-[#d1d5db]/60 text-muted-foreground hover:bg-[#f3f4f6] hover:text-foreground rounded-xl"
                    )}
                  >
                    <FileText className="size-3.5" />
                    <span>File</span>
                  </button>
                </div>

                {/* Connected Inner Container */}
                <div
                  className={cn(
                    "border p-4.5 sm:p-5 space-y-4 transition-all shadow-xs rounded-2xl w-full",
                    activeTab === "link" && "rounded-tl-none bg-[#fcf7ec] dark:bg-[#252017] border-[#e3d7be] dark:border-[#4d3f29]",
                    activeTab === "post" && "bg-[#fff1f3] dark:bg-[#26161a] border-[#fbcfe8] dark:border-[#522939]",
                    activeTab === "text" && "bg-[#edf7f1] dark:bg-[#15241b] border-[#bbf7d0] dark:border-[#224e33]",
                    activeTab === "topic" && "bg-[#eef5fc] dark:bg-[#15212c] border-[#bae6fd] dark:border-[#1e4461]",
                    activeTab === "file" && "bg-[#f3f4f6] dark:bg-[#1f242d] border-[#d1d5db] dark:border-[#374151]"
                  )}
                >
                {/* -------------------------------------------------------------
                    TAB 1: LINK CONTENT (Exact match to Image 1 and Image 2)
                   ------------------------------------------------------------- */}
                {activeTab === "link" && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <h4 className="font-bold text-sm text-[#1f2937] dark:text-neutral-100">
                        Review source
                      </h4>
                      <p className="text-xs text-[#6b7280] dark:text-neutral-400 mt-1">
                        Review and edit the content and images from your link before creating a carousel.
                      </p>
                    </div>

                    {/* Link Input Row matching Image 1 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1f2937] dark:text-neutral-200 block">
                        Link
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-amber-500 transition-colors shadow-2xs"
                          onKeyDown={(e) => e.key === "Enter" && handleImportLink()}
                        />
                        {/* Gray Import Button matching Image 1 */}
                        <button
                          type="button"
                          disabled={isImportingLink || !linkInput.trim()}
                          onClick={handleImportLink}
                          className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm h-9 px-4 transition-all shrink-0 disabled:opacity-50 shadow-xs"
                        >
                          {isImportingLink ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            "Import"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Fields: Appear once imported (matching Image 2) */}
                    {hasImported && (
                      <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                        {/* Notice line */}
                        {extractError && (
                          <p className="text-xs text-[#6b7280] dark:text-neutral-400 leading-relaxed font-normal">
                            {extractError}
                          </p>
                        )}

                        {/* Content Title Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1f2937] dark:text-neutral-200 block">
                            Content title
                          </label>
                          <input
                            type="text"
                            value={contentTitle}
                            onChange={(e) => setContentTitle(e.target.value)}
                            placeholder="Enter title..."
                            className="w-full rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-amber-500 shadow-2xs"
                          />
                        </div>

                        {/* Content Textarea with Restore Text Button */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-[#1f2937] dark:text-neutral-200 block">
                              Content text
                            </label>
                            <button
                              type="button"
                              onClick={handleRestoreText}
                              className="rounded-lg border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-3 h-8 text-xs font-semibold text-[#374151] dark:text-neutral-200 hover:bg-muted/50 transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <RotateCcw className="size-3" />
                              <span>Restore text</span>
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={contentText}
                            onChange={(e) => setContentText(e.target.value)}
                            placeholder="Enter text..."
                            className="w-full rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card p-3 text-xs text-foreground outline-none resize-none leading-relaxed shadow-2xs focus:border-amber-500"
                          />
                          <div className="text-[11px] text-[#6b7280] dark:text-neutral-400 font-medium">
                            {contentText.length} characters
                          </div>
                        </div>

                        {/* Content Media Section */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-[#1f2937] dark:text-neutral-200">
                            <span>
                              Content media &nbsp;
                              <span className="text-muted-foreground font-normal">
                                {mediaList.length} images
                              </span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleAddMedia}
                                className="rounded-lg border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-3 h-8 text-xs font-semibold text-[#374151] dark:text-neutral-200 hover:bg-muted/50 transition-colors shadow-2xs flex items-center gap-1"
                              >
                                <Upload className="size-3" />
                                <span>Upload images</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleAddMedia}
                                className="rounded-lg border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-3 h-8 text-xs font-semibold text-[#374151] dark:text-neutral-200 hover:bg-muted/50 transition-colors shadow-2xs flex items-center gap-1"
                              >
                                <FolderOpen className="size-3" />
                                <span>Add from library</span>
                              </button>
                            </div>
                          </div>

                          {/* Media Thumbnails Row */}
                          <div className="flex items-center gap-2 pt-1">
                            {mediaList.map((m, idx) => (
                              <div
                                key={idx}
                                className="size-16 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden relative flex items-center justify-center p-2 group shadow-2xs"
                              >
                                <span className="text-white text-xl font-bold select-none">✳</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedia(idx)}
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                  title="Remove image"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            ))}

                            {/* Dashed Add Button matching screenshot */}
                            <button
                              type="button"
                              onClick={handleAddMedia}
                              className="size-16 rounded-2xl border-2 border-dashed border-neutral-300/80 dark:border-neutral-700 bg-white/70 dark:bg-card/70 flex items-center justify-center text-muted-foreground hover:bg-white transition-colors shadow-2xs"
                            >
                              <Plus className="size-5" />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Action: Choose Design Button matching Image 2 */}
                        <div className="pt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={handleProceedToDesign}
                            className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <span>Choose design</span>
                            <ArrowRight className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------------------------------------------------
                    TAB 2: POST CONTENT
                   ------------------------------------------------------------- */}
                {activeTab === "post" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#1f2937] dark:text-neutral-100">
                        Review source
                      </h4>
                      <p className="text-xs text-[#6b7280] dark:text-neutral-400 mt-1">
                        Pick a post from a connected account and we&apos;ll plan the slides from its content.
                      </p>
                    </div>

                    {/* Account & Sort Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#1f2937] dark:text-neutral-200 block">
                          Source account
                        </label>
                        <div className="flex items-center justify-between rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-2.5 py-1.5 text-xs font-medium cursor-pointer shadow-2xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="size-4 shrink-0 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                              📸
                            </div>
                            <span className="font-semibold text-foreground truncate">{sourceAccount}</span>
                          </div>
                          <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#1f2937] dark:text-neutral-200 block">
                          Sort
                        </label>
                        <div className="flex items-center justify-between rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-2.5 py-1.5 text-xs font-medium cursor-pointer shadow-2xs">
                          <span className="font-semibold text-foreground">{sortOrder}</span>
                          <ChevronDown className="size-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Posts List matching Screenshot 3 */}
                    <div className="rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card divide-y divide-border/60 overflow-hidden shadow-2xs max-h-[260px] overflow-y-auto">
                      {SAMPLE_POSTS.map((post) => {
                        const isSelected = selectedPostId === post.id;
                        return (
                          <div
                            key={post.id}
                            onClick={() => setSelectedPostId(post.id)}
                            className={cn(
                              "p-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer",
                              isSelected
                                ? "bg-rose-500/10 text-foreground font-medium"
                                : "hover:bg-muted/50 text-foreground"
                            )}
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {post.caption}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {post.date} · Views {post.views} · Reactions {post.reactions}
                              </p>
                            </div>

                            <div className="size-6 shrink-0 rounded-md border border-neutral-300/70 dark:border-neutral-700 flex items-center justify-center text-muted-foreground">
                              <SquareCode className="size-3.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleProceedToDesign}
                        className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Choose design</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    TAB 3: TEXT CONTENT
                   ------------------------------------------------------------- */}
                {activeTab === "text" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#1f2937] dark:text-neutral-100">
                        Review source
                      </h4>
                      <p className="text-xs text-[#6b7280] dark:text-neutral-400 mt-1">
                        Enter your text, add images, and we&apos;ll plan the slides from your content.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1f2937] dark:text-neutral-200 block">
                        Content text
                      </label>
                      <textarea
                        rows={4}
                        value={rawTextContent}
                        onChange={(e) => setRawTextContent(e.target.value)}
                        placeholder="Enter notes, talking points, key frameworks..."
                        className="w-full rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card p-3 text-xs text-foreground outline-none resize-none shadow-2xs leading-relaxed"
                      />
                      <div className="text-[11px] text-[#6b7280] dark:text-neutral-400 font-medium">
                        {rawTextContent.length} characters
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#1f2937] dark:text-neutral-200">
                        <span>
                          Content media &nbsp;
                          <span className="text-muted-foreground font-normal">
                            {rawTextMedia.length} images
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRawTextMedia((p) => [...p, "/images/logos/app-icon.png"])}
                            className="rounded-lg border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-3 h-8 text-xs font-semibold text-[#374151] dark:text-neutral-200 hover:bg-muted/50 transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <Upload className="size-3" />
                            <span>Upload images</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRawTextMedia((p) => [...p, "/images/logos/app-icon.png"])}
                            className="rounded-lg border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card px-3 h-8 text-xs font-semibold text-[#374151] dark:text-neutral-200 hover:bg-muted/50 transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <FolderOpen className="size-3" />
                            <span>Add from library</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {rawTextMedia.map((m, idx) => (
                          <div
                            key={idx}
                            className="size-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center p-2"
                          >
                            <span className="text-white text-xl font-bold">✳</span>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setRawTextMedia((p) => [...p, "/images/logos/app-icon.png"])}
                          className="size-16 rounded-2xl border-2 border-dashed border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card flex items-center justify-center text-muted-foreground hover:bg-muted/40 transition-colors shadow-2xs"
                        >
                          <Plus className="size-5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#6b7280] dark:text-neutral-400">
                        No images yet. Upload files or add from your library.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleProceedToDesign}
                        className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Choose design</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    TAB 4: TOPIC CONTENT
                   ------------------------------------------------------------- */}
                {activeTab === "topic" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#1f2937] dark:text-neutral-100">
                        Review source
                      </h4>
                      <p className="text-xs text-[#6b7280] dark:text-neutral-400 mt-1">
                        Describe the topic of your carousel. AI writes the content from it.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1f2937] dark:text-neutral-200 block">
                        Topic
                      </label>
                      <textarea
                        rows={3}
                        maxLength={1000}
                        value={topicContent}
                        onChange={(e) => setTopicContent(e.target.value)}
                        placeholder="e.g. Small habits for better morning focus"
                        className="w-full rounded-xl border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-card p-3 text-xs text-foreground outline-none resize-none shadow-2xs leading-relaxed"
                      />
                      <div className="text-[11px] text-[#6b7280] dark:text-neutral-400 font-medium">
                        {topicContent.length} / 1000 characters
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleProceedToDesign}
                        className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Choose design</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    TAB 5: FILE CONTENT
                   ------------------------------------------------------------- */}
                {activeTab === "file" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#1f2937] dark:text-neutral-100">
                        Review source
                      </h4>
                      <p className="text-xs text-[#6b7280] dark:text-neutral-400 mt-1">
                        Upload a PDF, document, or markdown file to auto-extract slides.
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-neutral-300/80 dark:border-neutral-700 rounded-xl p-6 text-center space-y-2 bg-white dark:bg-card cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="size-6 text-muted-foreground mx-auto" />
                      <p className="text-xs font-semibold text-foreground">
                        Click to browse or drag and drop files here
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        PDF, DOCX, TXT, or MD (up to 25 MB)
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setContentTitle("Key Takeaways from Document");
                          setStep("design");
                        }}
                        className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Choose design</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Choose Design & Generate */
          <div className="space-y-4 animate-in fade-in pb-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => setStep("source")}
                  className="text-xs font-semibold text-primary hover:underline mb-1 inline-flex items-center gap-1"
                >
                  ← Back to Source
                </button>
                <h3 className="font-bold text-base text-foreground">Choose Design Style</h3>
                <p className="text-xs text-muted-foreground">
                  Pick a visual aesthetic for your carousel typography and layout.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-7 shrink-0 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors shadow-2xs"
              >
                <X className="size-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Design Presets List */}
            <div className="space-y-2.5">
              {DESIGN_PRESETS.map((preset) => {
                const isSelected = selectedDesign === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedDesign(preset.id)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                        : "border-border bg-white dark:bg-card hover:border-border/80"
                    )}
                  >
                    {/* Visual Preview Box */}
                    <div
                      className={cn(
                        "size-12 rounded-lg border flex flex-col justify-between p-1.5 shrink-0 shadow-2xs",
                        preset.previewClass
                      )}
                    >
                      <div className="size-2 rounded-full bg-current opacity-60" />
                      <div className="h-1 w-full bg-current opacity-40 rounded" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">{preset.name}</span>
                        {isSelected && <Check className="size-3.5 text-primary stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {preset.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button: Generate Carousel */}
            <div className="pt-3">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full rounded-xl bg-primary py-2.5 px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Planning Carousel Slides with AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4" />
                    <span>Generate Carousel Slides</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
