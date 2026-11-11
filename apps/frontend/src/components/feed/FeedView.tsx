"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FeedStory,
  FeedStoryCard,
} from "@/components/design-system/FeedStoryCard";
import { SearchInput } from "@/components/design-system/SearchInput";
import { CardSkeleton } from "@/components/design-system/Skeleton";
import { useToast } from "@/components/design-system/Toast";
import {
  INITIAL_FEED_STORIES,
  CATEGORIES_LIST,
} from "@/lib/mock/feed-data";
import { AddSourceModal, AddSourceFormData } from "./AddSourceModal";
import { ArticleReaderModal } from "./ArticleReaderModal";

export function FeedView() {
  const router = useRouter();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [stories, setStories] = useState<FeedStory[]>(INITIAL_FEED_STORIES);
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [activeCategory, setActiveCategory] = useState<string>("All Feeds");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals state
  const [isAddSourceOpen, setIsAddSourceOpen] = useState<boolean>(false);
  const [selectedStory, setSelectedStory] = useState<FeedStory | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close category dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategoryDropdownOpen]);

  // Global ⌘K keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const savedCount = useMemo(() => {
    return stories.filter((s) => s.isSaved).length;
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Tab filter
      if (activeTab === "saved" && !story.isSaved) {
        return false;
      }

      // Category filter
      if (activeCategory !== "All Feeds") {
        const queryLower = activeCategory.toLowerCase();
        // Support compound categories like "Tech & AI", "Luxury & Fragrance"
        const terms = queryLower.includes("&")
          ? queryLower.split("&").map((s) => s.trim().toLowerCase()).filter(Boolean)
          : [queryLower];

        const matchesCategory = terms.some(
          (term) =>
            story.category.toLowerCase().includes(term) ||
            (story.topicTag && story.topicTag.toLowerCase().includes(term)) ||
            story.title.toLowerCase().includes(term) ||
            story.description.toLowerCase().includes(term)
        );
        if (!matchesCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          story.title.toLowerCase().includes(q) ||
          story.description.toLowerCase().includes(q) ||
          story.source.toLowerCase().includes(q) ||
          story.category.toLowerCase().includes(q) ||
          (story.topicTag && story.topicTag.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [stories, activeTab, activeCategory, searchQuery]);

  // Bookmark toggle
  const handleBookmarkToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextSaved = !s.isSaved;
          toast(
            nextSaved ? "Saved story to bookmarks" : "Removed story from bookmarks",
            "info"
          );
          return { ...s, isSaved: nextSaved };
        }
        return s;
      })
    );
  };

  // Sync handler
  const handleSync = () => {
    setIsSyncing(true);
    toast("Syncing RSS feeds and social channels...", "info");
    setTimeout(() => {
      setIsSyncing(false);
      toast("All feeds are up to date! 14 new signals indexed.", "success");
    }, 1200);
  };

  // Curated toggle
  const handleCurated = () => {
    toast("Curated AI filter applied: High-signal founder trends only.", "success");
    setActiveCategory("Founders");
  };

  // Flywheel trigger
  const handleFlywheel = () => {
    toast("PostPilot Flywheel running: 3 drafts prepared for review.", "success");
  };

  // Add source handler
  const handleAddSource = (data: AddSourceFormData) => {
    const newStory: FeedStory = {
      id: `custom-${Date.now()}`,
      category: data.platform,
      source: data.name,
      sourceDotColor: "bg-brand-lime",
      readDuration: "3 min",
      isSaved: false,
      topicTag: data.category,
      metaLine: `Just now · ${new URL(data.url).hostname || data.url}`,
      title: `Latest briefing from ${data.name}: New intelligence indexed.`,
      description: `Automated ingestion has connected ${data.name}. Real-time monitoring active.`,
    };
    setStories([newStory, ...stories]);
    toast(`Successfully connected source: ${data.name}`, "success");
  };

  // Card CTA actions
  const handleGenerateCarousel = (story: FeedStory) => {
    toast(`Generating carousel for: "${story.title.slice(0, 32)}..."`, "success");
    setTimeout(() => {
      router.push(`/result?source=${encodeURIComponent(story.id)}`);
    }, 600);
  };

  const handleDraft = (story: FeedStory) => {
    toast(`Draft created: "${story.title.slice(0, 32)}..."`, "success");
    setTimeout(() => {
      router.push(`/result?mode=draft&source=${encodeURIComponent(story.id)}`);
    }, 600);
  };

  const handleCopyLink = (story: FeedStory) => {
    navigator.clipboard?.writeText(window.location.href);
    toast("Article link copied to clipboard", "success");
  };

  return (
    <main className="flex-1 flex flex-col gap-3 overflow-hidden relative select-none">
      {/* ============================================================== */}
      {/* 1. SEPARATE TOP ACTION & SEARCH BAR (Topbar UI Style)          */}
      {/* ============================================================== */}
      <div
        className="h-14 px-4 flex items-center justify-between shrink-0 select-none rounded-2xl relative z-30"
        style={{
          background: "rgba(14, 18, 19, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          boxShadow:
            "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.12) 0px 1px 0px inset",
        }}
      >
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left Tabs: All Stories vs Saved */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors",
                activeTab === "all"
                  ? "text-white shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              style={
                activeTab === "all"
                  ? {
                      background: "rgba(255, 255, 255, 0.12)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                    }
                  : {
                      background: "rgba(255, 255, 255, 0.06)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                    }
              }
            >
              <span>All Stories</span>
              <span className="px-1.5 py-0.2 rounded-full bg-brand-lime text-black text-[10px] font-bold">
                204
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                activeTab === "saved"
                  ? "text-white shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              style={
                activeTab === "saved"
                  ? {
                      background: "rgba(255, 255, 255, 0.12)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                    }
                  : {
                      background: "rgba(255, 255, 255, 0.06)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                    }
              }
            >
              <svg
                className="w-3.5 h-3.5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span>Saved</span>
              <span className="text-[10px] text-neutral-400">({savedCount})</span>
            </button>
          </div>

          {/* Center Search Input & Category Dropdown */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas, headlines, keywords, or sources..."
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative shrink-0" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                className={cn(
                  "h-9 px-3 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer select-none",
                  activeCategory !== "All Feeds"
                    ? "text-brand-lime"
                    : "text-white/90 hover:text-white"
                )}
                style={{
                  background:
                    activeCategory !== "All Feeds"
                      ? "rgba(197, 245, 42, 0.12)"
                      : "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border:
                    activeCategory !== "All Feeds"
                      ? "1px solid rgba(197, 245, 42, 0.35)"
                      : "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "rgba(255, 255, 255, 0.08) 0px 1px 1px inset",
                }}
                aria-haspopup="listbox"
                aria-expanded={isCategoryDropdownOpen}
                title={`Filter Category: ${activeCategory}`}
              >
                <svg
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    activeCategory !== "All Feeds"
                      ? "text-brand-lime"
                      : "text-neutral-400"
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>

                <span className="truncate max-w-[120px]">
                  {activeCategory}
                </span>

                <svg
                  className={cn(
                    "w-3 h-3 text-neutral-400 transition-transform duration-200 shrink-0",
                    isCategoryDropdownOpen && "rotate-180 text-white"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+6px)] w-52 py-1.5 z-50 rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-100"
                  style={{
                    background: "rgba(18, 20, 22, 0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow:
                      "0 16px 36px -4px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                  role="listbox"
                >
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-neutral-400 border-b border-white/10 mb-1">
                    Filter by Category
                  </div>
                  <div className="max-h-64 overflow-y-auto hide-scrollbar py-0.5">
                    {CATEGORIES_LIST.map((cat) => {
                      const isSelected = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setActiveCategory(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer",
                            isSelected
                              ? "bg-brand-lime/15 text-brand-lime font-medium"
                              : "text-white/80 hover:text-white hover:bg-white/10"
                          )}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="truncate">{cat}</span>
                          {isSelected && (
                            <svg
                              className="w-3.5 h-3.5 text-brand-lime shrink-0 ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="m4.5 12.75 6 6 9-13.5"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Add Source button */}
              <button
                type="button"
                onClick={() => setIsAddSourceOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:text-white transition-colors hover:bg-white/10 cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "rgba(255, 255, 255, 0.08) 0px 1px 1px inset",
                }}
                title="Add Source Feed"
              >
                <svg
                  className="w-3.5 h-3.5 text-white/90"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Add</span>
              </button>

              {/* Curated filter button */}
              <button
                type="button"
                onClick={handleCurated}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:text-white transition-colors hover:bg-white/10 cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
                }}
                title="Curated AI Signals"
              >
                <svg
                  className="w-3.5 h-3.5 text-white/90"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
                <span>Curated</span>
              </button>

              {/* Sync button */}
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:text-white transition-colors hover:bg-white/10 cursor-pointer disabled:opacity-50"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
                }}
                title="Refresh and sync feeds"
              >
                <svg
                  className={cn(
                    "w-3.5 h-3.5 text-white/90",
                    isSyncing && "animate-spin text-brand-lime"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <span>Sync</span>
              </button>

              {/* Flywheel button */}
              <button
                type="button"
                onClick={handleFlywheel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:text-white transition-colors hover:bg-white/10 cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
                }}
                title="Autopilot Flywheel"
              >
                <svg
                  className="w-3.5 h-3.5 text-brand-lime"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>Flywheel</span>
              </button>
            </div>

            {/* View Switcher: Grid vs List */}
            <div
              className="flex items-center gap-1 p-0.5 rounded-xl shrink-0"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "text-brand-lime"
                    : "text-neutral-400 hover:text-white hover:bg-white/10"
                )}
                style={
                  viewMode === "grid"
                    ? {
                        background: "rgba(255, 255, 255, 0.12)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                      }
                    : undefined
                }
                title="Grid View"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect height="7" width="7" x="3" y="3" />
                  <rect height="7" width="7" x="14" y="3" />
                  <rect height="7" width="7" x="14" y="14" />
                  <rect height="7" width="7" x="3" y="14" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  viewMode === "list"
                    ? "text-brand-lime"
                    : "text-neutral-400 hover:text-white hover:bg-white/10"
                )}
                style={
                  viewMode === "list"
                    ? {
                        background: "rgba(255, 255, 255, 0.12)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                      }
                    : undefined
                }
                title="List View"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SEPARATE STORY FEED CARD GRID                               */}
      {/* ============================================================== */}
      <div
        className="flex-1 overflow-y-auto p-5 rounded-2xl relative"
        style={{
          background: "rgba(14, 18, 19, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          boxShadow:
            "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
        }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center space-y-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-neutral-400"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">No stories found</h4>
              <p className="text-xs text-neutral-400 max-w-xs">
                No articles match your current filter or search query.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("All Feeds");
                setSearchQuery("");
                setActiveTab("all");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-brand-lime text-black font-bold text-xs hover:bg-brand-limeHover transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredStories.map((story) => (
              <FeedStoryCard
                key={story.id}
                story={story}
                onBookmarkToggle={handleBookmarkToggle}
                onRead={(s) => setSelectedStory(s)}
                onDraft={handleDraft}
                onAction={handleGenerateCarousel}
                onMenuClick={(s) => setSelectedStory(s)}
              />
            ))}
          </div>
        ) : (
          /* List View Mode */
          <div className="space-y-2.5 max-w-5xl mx-auto">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(16px)",
                  border: story.isAiSynthesis
                    ? "1px solid rgba(197, 245, 42, 0.35)"
                    : "1px solid rgba(255, 255, 255, 0.14)",
                  boxShadow: "rgba(0, 0, 0, 0.35) 0px 8px 24px",
                  borderRadius: "16px",
                }}
                className="p-3 flex items-center justify-between gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {story.imageUrl && (
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase text-brand-lime">
                        {story.category}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {story.source} · {story.metaLine}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-white truncate">
                      {story.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">
                      {story.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDraft(story);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:bg-white/10 border border-white/15"
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateCarousel(story);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-lime text-black font-bold text-xs hover:bg-brand-limeHover"
                  >
                    Carousel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSourceModal
        isOpen={isAddSourceOpen}
        onClose={() => setIsAddSourceOpen(false)}
        onAdd={handleAddSource}
      />

      <ArticleReaderModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onGenerateCarousel={handleGenerateCarousel}
        onSendDraft={handleDraft}
        onCopyLink={handleCopyLink}
      />
    </main>
  );
}

