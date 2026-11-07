"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Layers,
  Link2,
  FileText,
  Pencil,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Loader2,
  Eye,
  Wand2,
  Sliders,
  Palette,
  ArrowRight,
  Maximize2,
  Scan,
  MessageSquare,
  LayoutTemplate,
  Star,
  AtSign,
  Bookmark,
  ExternalLink,
  Sun,
  Copy,
  MoreVertical,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CarouselSlideItem } from "@/types";
import { CreateCarouselDrawer } from "./CreateCarouselDrawer";

interface CarouselRecord {
  id: string;
  title: string;
  theme: "dark" | "gradient" | "minimal";
  aspectRatio: "4:5" | "1:1";
  slidesCount: number;
  updatedAt: string;
  slides: CarouselSlideItem[];
}

interface CarouselViewProps {
  onOpenComposer: (post?: any) => void;
}

type MainTab = "my-carousels" | "my-templates" | "templates" | "ctas" | "branding";

export function CarouselView({ onOpenComposer }: CarouselViewProps) {
  // Navigation / View State: 'list' | 'editor'
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("my-carousels");

  // Filters
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [ratioFilter, setRatioFilter] = useState("All ratios");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);

  // Drawer State
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [extractUrl, setExtractUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  // Carousels Collection
  const [carousels, setCarousels] = useState<CarouselRecord[]>([]);

  // Active Editor State
  const [activeCarouselId, setActiveCarouselId] = useState<string | null>(null);
  const [carouselTitle, setCarouselTitle] = useState("5 High-Conversion Strategies for Solo SaaS Founders");
  const [theme, setTheme] = useState<"dark" | "gradient" | "minimal">("dark");
  const [aspectRatio, setAspectRatio] = useState<"4:5" | "1:1">("4:5");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Editor Slides State
  const [slides, setSlides] = useState<CarouselSlideItem[]>([
    {
      id: "slide-1",
      order: 1,
      slideType: "COVER",
      headline: "5 High-Conversion Strategies for Solo SaaS Founders",
      body: "How bootstrapped founders turn single feature commits into sustainable revenue machines.",
      tag: "FRAMEWORK",
    },
    {
      id: "slide-2",
      order: 2,
      slideType: "PROBLEM",
      headline: "The Trap of Random Content",
      body: "Posting spontaneously without a feedback loop leads to burnout and flatlining engagement. Consistent creators build repeatable distribution loops.",
      tag: "BOTTLENECK",
    },
    {
      id: "slide-3",
      order: 3,
      slideType: "CONTENT",
      headline: "Rule of 1 Core Message per Slide",
      body: "Never crowd slides with dense paragraphs. High-contrast typography, a single takeaway, and generous margins increase swipe-through rates by 240%.",
      tag: "DESIGN RULE",
    },
    {
      id: "slide-4",
      order: 4,
      slideType: "COMPARISON",
      headline: "Read vs. Skipped Content",
      body: "❌ Generic advice without proof.\n✅ Direct playbooks with concrete step-by-step numbers and visual hierarchy.",
      tag: "BENCHMARK",
    },
    {
      id: "slide-5",
      order: 5,
      slideType: "CLOSING",
      headline: "Save this playbook for your next sprint",
      body: "Bookmark for later. Follow @sahil_357_ for weekly systems on automated creator distribution.",
      tag: "SAVE & SHARE",
    },
  ]);

  // Load existing carousels from API on mount
  useEffect(() => {
    fetch("/api/carousel")
      .then((res) => res.json())
      .then((data) => {
        if (data.carousels && Array.isArray(data.carousels) && data.carousels.length > 0) {
          // Keep list ready if populated
        }
      })
      .catch((err) => console.warn("Failed to load carousels", err));
  }, []);

  // Handle Carousel Creation from Drawer
  const handleCarouselGenerated = (
    title: string,
    generatedSlides: CarouselSlideItem[],
    generatedTheme: "dark" | "gradient" | "minimal"
  ) => {
    const newId = `car-${Date.now()}`;
    const newRecord: CarouselRecord = {
      id: newId,
      title,
      theme: generatedTheme,
      aspectRatio: "4:5",
      slidesCount: generatedSlides.length,
      updatedAt: "Just now",
      slides: generatedSlides,
    };

    setCarousels((prev) => [newRecord, ...prev]);
    setActiveCarouselId(newId);
    setCarouselTitle(title);
    setSlides(generatedSlides);
    setTheme(generatedTheme);
    setActiveSlideIndex(0);
    setViewMode("editor");
  };

  // Start From Blank
  const handleStartFromBlank = () => {
    const blankSlides: CarouselSlideItem[] = [
      {
        id: "slide-1",
        order: 1,
        slideType: "COVER",
        headline: "Add Your Catchy Headline Here",
        body: "Hook the reader in the first 2 seconds with an intriguing premise or question.",
        tag: "INTRO HOOK",
      },
      {
        id: "slide-2",
        order: 2,
        slideType: "CONTENT",
        headline: "Point 01: Core Bottleneck",
        body: "Explain the fundamental problem your audience faces before discovering this solution.",
        tag: "POINT 1",
      },
      {
        id: "slide-3",
        order: 3,
        slideType: "CONTENT",
        headline: "Point 02: Tactical Solution",
        body: "Walk through the exact framework, numbers, or workflow step to overcome the roadblock.",
        tag: "POINT 2",
      },
      {
        id: "slide-4",
        order: 4,
        slideType: "CONTENT",
        headline: "Point 03: Tangible Outcome",
        body: "Show the contrast between before and after implementing this system.",
        tag: "OUTCOME",
      },
      {
        id: "slide-5",
        order: 5,
        slideType: "CLOSING",
        headline: "Was this helpful?",
        body: "Save this post for later reference. Drop your thoughts or questions in the comments below!",
        tag: "CALL TO ACTION",
      },
    ];

    const newId = `blank-${Date.now()}`;
    const newRecord: CarouselRecord = {
      id: newId,
      title: "Untitled Carousel",
      theme: "dark",
      aspectRatio: "4:5",
      slidesCount: 5,
      updatedAt: "Just now",
      slides: blankSlides,
    };

    setCarousels((prev) => [newRecord, ...prev]);
    setActiveCarouselId(newId);
    setCarouselTitle("Untitled Carousel");
    setSlides(blankSlides);
    setTheme("dark");
    setActiveSlideIndex(0);
    setViewMode("editor");
    toast.success("Created new blank carousel");
  };

  // Extract Template Action
  const handleExtractTemplate = async () => {
    if (!extractUrl.trim()) {
      toast.error("Please enter a URL or post link");
      return;
    }
    setIsExtracting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Carousel layout extracted as reusable template!");
      setIsExtractModalOpen(false);
      setExtractUrl("");
      setActiveMainTab("my-templates");
    } catch {
      toast.error("Failed to extract template");
    } finally {
      setIsExtracting(false);
    }
  };

  // Slide Modification Helpers
  const updateSlideHeadline = (val: string) => {
    const updated = [...slides];
    updated[activeSlideIndex].headline = val;
    setSlides(updated);
  };

  const updateSlideBody = (val: string) => {
    const updated = [...slides];
    updated[activeSlideIndex].body = val;
    setSlides(updated);
  };

  const updateSlideTag = (val: string) => {
    const updated = [...slides];
    updated[activeSlideIndex].tag = val;
    setSlides(updated);
  };

  const handleAddSlide = () => {
    const nextOrder = slides.length + 1;
    const newSlide: CarouselSlideItem = {
      id: `slide-${Date.now()}`,
      order: nextOrder,
      slideType: "CONTENT",
      headline: `Key Point ${nextOrder}`,
      body: "Enter your tactical breakdown or key supporting point here.",
      tag: `STEP 0${nextOrder}`,
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
    toast.success("Added new slide");
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 2) {
      toast.error("Carousels require at least 2 slides");
      return;
    }
    const updated = slides.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(updated);
    setActiveSlideIndex(Math.max(0, index - 1));
    toast.info("Slide removed");
  };

  const handleExport = () => {
    toast.success("Carousel exported as high-resolution PNG & PDF package!");
  };

  const handleCreatePost = () => {
    const postContent = `${carouselTitle}\n\nSwipe through the carousel for the complete breakdown 👈\n\nWhich takeaway resonates most with your workflow? Drop your thoughts below!\n\n#socialmedia #contentstrategy #carousels #growth #buildinpublic`;
    onOpenComposer({
      title: carouselTitle,
      content: postContent,
      platforms: ["linkedin", "instagram", "threads"],
    });
  };

  const activeSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-background px-4 lg:px-6 py-4 font-sans min-w-0 select-none">
      {/* =========================================================================
          VIEW MODE 1: MAIN CAROUSEL DASHBOARD (Exact Match to Screenshot 1)
         ========================================================================= */}
      {viewMode === "list" && (
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          {/* 1. Header Row matching Screenshot 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {/* Carousel Icon */}
                <svg
                  className="size-5 shrink-0 text-foreground"
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Carousel
                </h1>
              </div>
              <p className="text-xs text-muted-foreground">
                AI plans slides from a link; edit them, render images, and attach them to a post.
              </p>
            </div>
          </div>

          {/* 2. Action Buttons Row matching Screenshot 1 */}
          <div className="flex flex-wrap items-center gap-2 mb-4 shrink-0">
            {/* + New carousel button: Solid black pill button */}
            <button
              type="button"
              onClick={() => setIsCreateDrawerOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs h-9 px-4 py-2 text-sm font-medium transition-all"
            >
              <Plus className="size-3.5" />
              <span>New carousel</span>
            </button>

            {/* Start from blank button: Outline button */}
            <button
              type="button"
              onClick={handleStartFromBlank}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-9 px-4 py-2 text-sm font-medium text-foreground transition-all"
            >
              <Sparkles className="size-3.5 text-muted-foreground" />
              <span>Start from blank</span>
            </button>

            {/* Extract template button: Outline button */}
            <button
              type="button"
              onClick={() => setIsExtractModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-9 px-4 py-2 text-sm font-medium text-foreground transition-all"
            >
              <Scan className="size-3.5 text-muted-foreground" />
              <span>Extract template</span>
            </button>
          </div>

          {/* 3. Sub-Tabs & Filters Row matching Screenshot 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
            {/* Left Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {/* My carousels tab */}
              <button
                type="button"
                onClick={() => setActiveMainTab("my-carousels")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium rounded-md transition-all shrink-0",
                  activeMainTab === "my-carousels"
                    ? "border border-border bg-card font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <svg
                  className="size-3.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="8" height="10" x="8" y="7" rx="1" />
                  <path d="M4 9v6" />
                  <path d="M20 9v6" />
                </svg>
                <span>My carousels</span>
              </button>

              {/* My templates tab */}
              <button
                type="button"
                onClick={() => setActiveMainTab("my-templates")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium rounded-md transition-all shrink-0",
                  activeMainTab === "my-templates"
                    ? "border border-border bg-card font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <LayoutTemplate className="size-3.5" />
                <span>My templates</span>
              </button>

              {/* Templates tab */}
              <button
                type="button"
                onClick={() => setActiveMainTab("templates")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium rounded-md transition-all shrink-0",
                  activeMainTab === "templates"
                    ? "border border-border bg-card font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <Star className="size-3.5" />
                <span>Templates</span>
              </button>

              {/* CTAs tab */}
              <button
                type="button"
                onClick={() => setActiveMainTab("ctas")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium rounded-md transition-all shrink-0",
                  activeMainTab === "ctas"
                    ? "border border-border bg-card font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <AtSign className="size-3.5" />
                <span>CTAs</span>
              </button>

              {/* Branding tab */}
              <button
                type="button"
                onClick={() => setActiveMainTab("branding")}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium rounded-md transition-all shrink-0",
                  activeMainTab === "branding"
                    ? "border border-border bg-card font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <Palette className="size-3.5" />
                <span>Branding</span>
              </button>
            </div>

            {/* Right Dropdown Filters */}
            <div className="flex items-center gap-2 shrink-0">
              {/* All statuses dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusDropdownOpen((p) => !p);
                    setIsRatioDropdownOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground font-medium shadow-2xs transition-colors"
                >
                  <span>{statusFilter}</span>
                  <ChevronDown className="size-3.5 opacity-60" />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-border bg-card p-1 shadow-xl z-20 space-y-0.5">
                    {["All statuses", "Published", "Draft", "Scheduled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStatusFilter(st);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors font-medium",
                          statusFilter === st ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* All ratios dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsRatioDropdownOpen((p) => !p);
                    setIsStatusDropdownOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground font-medium shadow-2xs transition-colors"
                >
                  <span>{ratioFilter}</span>
                  <ChevronDown className="size-3.5 opacity-60" />
                </button>
                {isRatioDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-border bg-card p-1 shadow-xl z-20 space-y-0.5">
                    {["All ratios", "4:5 (Portrait)", "1:1 (Square)"].map((rf) => (
                      <button
                        key={rf}
                        onClick={() => {
                          setRatioFilter(rf);
                          setIsRatioDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors font-medium",
                          ratioFilter === rf ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {rf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Main Content Area matching Screenshot 1 */}
          <div className="flex-1 rounded-2xl border border-border/70 bg-transparent flex flex-col justify-center items-center p-8 sm:p-12 min-h-[460px] relative">
            {activeMainTab === "my-carousels" && (
              <>
                {carousels.length === 0 ? (
                  /* Exact Empty State from Screenshot 1 */
                  <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                    {/* Outline Carousel Icon */}
                    <div className="text-neutral-300 dark:text-neutral-700">
                      <svg
                        className="size-12 stroke-[1.5]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="10" height="14" x="7" y="5" rx="2" />
                        <path d="M3 8v8" />
                        <path d="M21 8v8" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-foreground">
                        No carousels yet
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Paste a link and we&apos;ll draft carousel slides for you.
                      </p>
                    </div>

                    {/* New carousel button in empty state */}
                    <button
                      type="button"
                      onClick={() => setIsCreateDrawerOpen(true)}
                      className="rounded-lg border border-border/80 bg-card hover:bg-muted/60 text-foreground px-4 py-2 text-xs font-semibold shadow-2xs transition-all"
                    >
                      New carousel
                    </button>
                  </div>
                ) : (
                  /* Grid of Saved Carousels */
                  <div className="w-full h-full overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                      {carousels.map((item) => (
                        <div
                          key={item.id}
                          className="group rounded-2xl border border-border bg-card p-4 space-y-3 hover:border-primary/50 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                          onClick={() => {
                            setActiveCarouselId(item.id);
                            setCarouselTitle(item.title);
                            setSlides(item.slides);
                            setTheme(item.theme);
                            setAspectRatio(item.aspectRatio);
                            setActiveSlideIndex(0);
                            setViewMode("editor");
                          }}
                        >
                          {/* Mini Slide Preview Card */}
                          <div
                            className={cn(
                              "w-full aspect-[4/3] rounded-xl border p-4 flex flex-col justify-between overflow-hidden shadow-2xs",
                              item.theme === "dark" && "bg-neutral-950 text-white border-neutral-800",
                              item.theme === "gradient" && "bg-gradient-to-br from-indigo-950 via-purple-950 to-neutral-950 text-white border-purple-900/50",
                              item.theme === "minimal" && "bg-white text-neutral-900 border-neutral-200"
                            )}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary w-fit">
                              {item.slides[0]?.tag || "FRAMEWORK"}
                            </span>
                            <p className="font-bold text-xs line-clamp-2 leading-tight">
                              {item.slides[0]?.headline || item.title}
                            </p>
                            <div className="flex items-center justify-between text-[9px] opacity-70">
                              <span>1 / {item.slidesCount}</span>
                              <span>Swipe →</span>
                            </div>
                          </div>

                          {/* Info & Meta */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-foreground truncate">{item.title}</h4>
                            <p className="text-[11px] text-muted-foreground flex items-center justify-between">
                              <span>{item.slidesCount} slides · {item.aspectRatio}</span>
                              <span>{item.updatedAt}</span>
                            </p>
                          </div>

                          {/* Action row */}
                          <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-primary group-hover:underline">
                              Edit Slides →
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCarousels((prev) => prev.filter((c) => c.id !== item.id));
                                toast.info("Carousel deleted");
                              }}
                              className="size-7 rounded-lg border border-border/60 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors"
                              title="Delete carousel"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Sub-Tab 2: My Templates */}
            {activeMainTab === "my-templates" && (
              <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-3">
                <LayoutTemplate className="size-10 text-neutral-300 dark:text-neutral-700" />
                <h3 className="font-bold text-base text-foreground">No saved templates</h3>
                <p className="text-xs text-muted-foreground">
                  Save your best performing carousels as reusable slide templates.
                </p>
                <button
                  type="button"
                  onClick={() => setIsExtractModalOpen(true)}
                  className="rounded-lg border border-border/80 bg-card hover:bg-muted/60 text-foreground px-4 py-2 text-xs font-semibold shadow-2xs"
                >
                  Extract a template
                </button>
              </div>
            )}

            {/* Sub-Tab 3: Curated Templates */}
            {activeMainTab === "templates" && (
              <div className="w-full h-full overflow-y-auto p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "5-Step Implementation Playbook", tag: "PLAYBOOK", desc: "Breakdown complex processes into bite-sized actionable steps." },
                    { title: "Common Mistakes vs Tactical Fixes", tag: "COMPARISON", desc: "Contrast what amateurs do vs what high-converting pros do." },
                    { title: "Contrarian Industry Opinion", tag: "THOUGHT LEADERSHIP", desc: "Challenge standard dogmas with hard data and compelling proof." },
                    { title: "SaaS Launch Metric Breakdown", tag: "CASE STUDY", desc: "Show revenue, CAC, MRR numbers and tactical takeaways." },
                  ].map((tpl, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border bg-card p-4 space-y-3 hover:border-primary/50 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {tpl.tag}
                        </span>
                        <h4 className="font-bold text-xs text-foreground">{tpl.title}</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{tpl.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCarouselTitle(tpl.title);
                          setViewMode("editor");
                          toast.success(`Loaded template: ${tpl.title}`);
                        }}
                        className="w-full rounded-xl border border-border/80 bg-muted/60 hover:bg-muted text-foreground py-2 text-xs font-semibold transition-all shadow-2xs"
                      >
                        Use this template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 4: CTAs Library */}
            {activeMainTab === "ctas" && (
              <div className="w-full h-full overflow-y-auto p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Save & Bookmark CTA", body: "Save this post for your next sprint. Drop a bookmark so you don't lose it.", tag: "BOOKMARK" },
                    { title: "Keyword Comment Trigger", body: "Comment 'LINK' below and our automation bot will DM you the free template.", tag: "ENGAGEMENT" },
                    { title: "Follow For Weekly Frameworks", body: "If you found this helpful, follow @sahil_357_ for weekly systems on creator growth.", tag: "FOLLOW" },
                  ].map((cta, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border bg-card p-4 space-y-3 hover:border-primary/50 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
                          {cta.tag}
                        </span>
                        <h4 className="font-bold text-xs text-foreground">{cta.title}</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{cta.body}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...slides];
                          updated[updated.length - 1] = {
                            ...updated[updated.length - 1],
                            headline: cta.title,
                            body: cta.body,
                            tag: cta.tag,
                          };
                          setSlides(updated);
                          setViewMode("editor");
                          toast.success("Applied CTA to final slide!");
                        }}
                        className="w-full rounded-xl border border-border/80 bg-muted/60 hover:bg-muted text-foreground py-2 text-xs font-semibold transition-all shadow-2xs"
                      >
                        Insert into Carousel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 5: Branding */}
            {activeMainTab === "branding" && (
              <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-bold text-sm text-foreground">Brand Kit Settings</h3>
                <p className="text-xs text-muted-foreground">
                  Configure handle, avatar, and watermark displayed on every slide footer.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">Creator Handle</label>
                  <input
                    type="text"
                    defaultValue="@sahil_357_"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">Footer Watermark</label>
                  <input
                    type="text"
                    defaultValue="REERTS.IN"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => toast.success("Brand kit settings saved!")}
                  className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                >
                  Save Brand Kit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: INTERACTIVE SLIDE CANVAS & EDITOR
         ========================================================================= */}
      {viewMode === "editor" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Bar for Editor */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ChevronLeft className="size-4" />
                <span>All Carousels</span>
              </button>

              <div className="h-4 w-px bg-border shrink-0" />

              <input
                type="text"
                value={carouselTitle}
                onChange={(e) => setCarouselTitle(e.target.value)}
                className="font-bold text-sm sm:text-base text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none truncate max-w-sm"
              />
            </div>

            {/* Actions: Export & Create Post */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs"
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Export PNG/PDF</span>
              </button>

              <button
                type="button"
                onClick={handleCreatePost}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xs"
              >
                <Share2 className="size-3.5" />
                <span>Create Post</span>
              </button>
            </div>
          </div>

          {/* Main Editor Workspace */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-3">
            {/* Center Canvas Preview */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/20 overflow-y-auto relative border-b lg:border-b-0 lg:border-r border-border rounded-xl">
              {/* Aspect Ratio & Theme Controls */}
              <div className="flex items-center gap-3 mb-4 shrink-0">
                {/* Aspect Ratio Switch */}
                <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-[11px] font-semibold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("4:5")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all",
                      aspectRatio === "4:5" ? "bg-muted text-foreground shadow-2xs" : "text-muted-foreground"
                    )}
                  >
                    4:5 (Portrait)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("1:1")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all",
                      aspectRatio === "1:1" ? "bg-muted text-foreground shadow-2xs" : "text-muted-foreground"
                    )}
                  >
                    1:1 (Square)
                  </button>
                </div>

                {/* Theme Switcher */}
                <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-[11px] font-semibold shadow-2xs">
                  {(["dark", "gradient", "minimal"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={cn(
                        "capitalize px-2.5 py-1 rounded-md transition-all",
                        theme === t ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide Card Viewport */}
              <div
                className={cn(
                  "relative rounded-2xl shadow-2xl border transition-all duration-300 flex flex-col justify-between p-7 select-none overflow-hidden",
                  aspectRatio === "4:5"
                    ? "w-[290px] h-[362px] sm:w-[330px] sm:h-[412px]"
                    : "w-[300px] h-[300px] sm:w-[350px] sm:h-[350px]",
                  theme === "dark" && "bg-neutral-950 text-white border-neutral-800",
                  theme === "gradient" && "bg-gradient-to-br from-indigo-950 via-neutral-900 to-purple-950 text-white border-indigo-900/50",
                  theme === "minimal" && "bg-white text-neutral-900 border-neutral-200"
                )}
              >
                {/* Header inside slide */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      theme === "minimal"
                        ? "bg-neutral-100 text-neutral-800"
                        : "bg-neutral-800/80 text-neutral-200"
                    )}
                  >
                    {activeSlide.tag || "FRAMEWORK"}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[11px] font-semibold",
                      theme === "minimal" ? "text-neutral-500" : "text-neutral-400"
                    )}
                  >
                    {activeSlideIndex + 1} / {slides.length}
                  </span>
                </div>

                {/* Main Content inside slide */}
                <div className="space-y-3 my-auto">
                  <h3
                    className={cn(
                      "font-extrabold tracking-tight leading-tight",
                      activeSlide.slideType === "COVER" ? "text-lg sm:text-xl" : "text-base sm:text-lg",
                      theme === "minimal" ? "text-neutral-900" : "text-neutral-100"
                    )}
                  >
                    {activeSlide.headline}
                  </h3>
                  <p
                    className={cn(
                      "text-xs leading-relaxed whitespace-pre-line font-medium",
                      theme === "minimal" ? "text-neutral-600" : "text-neutral-300"
                    )}
                  >
                    {activeSlide.body}
                  </p>
                </div>

                {/* Footer inside slide */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] opacity-70">
                  <span className="font-semibold tracking-wide">@sahil_357_</span>
                  <span className="flex items-center gap-1 font-medium">
                    Swipe <ChevronRight className="size-3" />
                  </span>
                </div>
              </div>

              {/* Slide Navigation Arrows */}
              <div className="flex items-center gap-4 mt-5 shrink-0">
                <button
                  type="button"
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="size-8 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 transition-all shadow-2xs"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-xs font-semibold text-muted-foreground">
                  Slide {activeSlideIndex + 1} of {slides.length}
                </span>
                <button
                  type="button"
                  disabled={activeSlideIndex === slides.length - 1}
                  onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                  className="size-8 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 transition-all shadow-2xs"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Right Editor Controls & Slide List */}
            <div className="w-full lg:w-[380px] border-l border-border bg-card p-5 flex flex-col space-y-4 overflow-y-auto shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Edit Slide #{activeSlideIndex + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(activeSlideIndex)}
                  className="text-muted-foreground hover:text-red-500 transition-colors text-xs flex items-center gap-1"
                  title="Delete this slide"
                >
                  <Trash2 className="size-3" /> Delete
                </button>
              </div>

              {/* Tag / Category Badge */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground">Slide Tag</label>
                <input
                  type="text"
                  value={activeSlide.tag || ""}
                  onChange={(e) => updateSlideTag(e.target.value)}
                  placeholder="e.g. CORE RULE, STEP 01"
                  className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary shadow-2xs"
                />
              </div>

              {/* Headline Editor */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground">Headline</label>
                <input
                  type="text"
                  value={activeSlide.headline || ""}
                  onChange={(e) => updateSlideHeadline(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary shadow-2xs"
                />
              </div>

              {/* Body Editor */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground">Body Content / Bullet Points</label>
                <textarea
                  rows={4}
                  value={activeSlide.body || ""}
                  onChange={(e) => updateSlideBody(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground outline-none focus:border-primary resize-none leading-relaxed shadow-2xs"
                />
              </div>

              {/* All Slides Strip Thumbnail Navigator */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">All Slides ({slides.length})</span>
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="size-3" /> Add Slide
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {slides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={cn(
                        "aspect-[4/5] rounded-lg border p-1 flex flex-col justify-between text-left transition-all text-[8px]",
                        activeSlideIndex === idx
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                          : "border-border bg-muted/40 hover:border-border/80"
                      )}
                    >
                      <span className="font-mono font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="line-clamp-2 font-medium leading-tight text-foreground">
                        {slide.headline}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border space-y-2">
                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="w-full rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 py-2.5 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Share2 className="size-3.5" />
                  <span>Create Post with Carousel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER 1: CREATE CAROUSEL DRAWER (Exact Match to Screenshots 2, 3, 4, 5)
         ========================================================================= */}
      <CreateCarouselDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCarouselGenerated={handleCarouselGenerated}
      />

      {/* =========================================================================
          MODAL 2: EXTRACT TEMPLATE DIALOG
         ========================================================================= */}
      {isExtractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground">Extract Template</h3>
              <button
                type="button"
                onClick={() => setIsExtractModalOpen(false)}
                className="size-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center"
              >
                <X className="size-4 stroke-[2.5]" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Paste a link to any public post, carousel, or article to extract its slide structure into a saved template.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">Source URL</label>
              <input
                type="url"
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary shadow-2xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExtractModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExtracting || !extractUrl.trim()}
                onClick={handleExtractTemplate}
                className="rounded-xl bg-primary text-primary-foreground font-bold text-xs px-4 py-2 transition-all shadow-xs disabled:opacity-50"
              >
                {isExtracting ? "Extracting..." : "Extract Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FLOATING INTERCOM / SUPPORT BUBBLE (Matching bottom right of Screenshot 1-5)
         ========================================================================= */}
      <button
        type="button"
        onClick={() => toast.info("Reerts AI Support & Feedback")}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 size-11 rounded-full bg-neutral-600 hover:bg-neutral-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-20"
        title="Help & Feedback"
      >
        <MessageSquare className="size-5 fill-current" />
      </button>
    </div>
  );
}
