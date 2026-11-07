"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  Search,
  RotateCw,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  Compass,
  FileSpreadsheet,
  ChevronsLeft,
  ChevronsRight,
  Bookmark,
  Radio,
  SlidersHorizontal,
  X,
  Filter,
  CheckCircle2,
  ExternalLink,
  Flame,
  Clock,
  Layers,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SourceManager, ContentSourceItem } from "../ideas/SourceManager";
import { RecommendedSourcesModal, RecommendedCategory, RecommendedSource } from "../ideas/RecommendedSourcesModal";
import { OpmlUploader, OpmlEntry, OpmlImportResult, parseOpmlXml } from "../ideas/OpmlUploader";
import { IdeaItemCard, IdeaItem } from "../ideas/IdeaItemCard";
import { IdeaItemsTable } from "../ideas/IdeaItemsTable";
import { IdeaDetailDialog } from "../ideas/IdeaDetailDialog";
import { EmptyIdeasState } from "../ideas/EmptyIdeasState";
import { AiIdeaGeneratorModal } from "../ideas/AiIdeaGeneratorModal";
import {
  getFeedSourceKind,
  getFeedSourceLabel,
  FeedSourceIcon,
  PlatformBadge,
  PlatformKind,
} from "../ideas/PlatformIconMap";

interface IdeasViewProps {
  onOpenComposer: (post?: any) => void;
  onGenerateCarousel?: (item: IdeaItem, theme?: string) => void;
}

const DEFAULT_RECOMMENDED_CATEGORIES: RecommendedCategory[] = [
  {
    id: "tech",
    nameEn: "Tech & AI",
    sources: [
      { id: "rec_1", label: "OpenAI Research & News", url: "https://openai.com/news/rss.xml", subscribed: false },
      { id: "rec_2", label: "Anthropic Research Updates", url: "https://www.anthropic.com/news/rss", subscribed: false },
      { id: "rec_3", label: "TechCrunch AI & Robotics", url: "https://techcrunch.com/category/artificial-intelligence/feed/", subscribed: false },
      { id: "rec_4", label: "Simon Willison Weblog", url: "https://simonwillison.net/atom/everything/", subscribed: false },
      { id: "rec_5", label: "Hacker News Top Stories", url: "https://news.ycombinator.com/rss", subscribed: false },
    ],
  },
  {
    id: "marketing",
    nameEn: "Marketing & Growth",
    sources: [
      { id: "rec_6", label: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/feed", subscribed: false },
      { id: "rec_7", label: "Marketing Brew", url: "https://www.morningbrew.com/marketing/feed", subscribed: false },
      { id: "rec_8", label: "Ahrefs SEO & Growth Blog", url: "https://ahrefs.com/blog/feed/", subscribed: false },
      { id: "rec_9", label: "Demand Curve Growth", url: "https://www.demandcurve.com/feed", subscribed: false },
    ],
  },
  {
    id: "founders",
    nameEn: "Founders & Creators",
    sources: [
      { id: "rec_10", label: "Paul Graham Essays", url: "http://www.paulgraham.com/rss.html", subscribed: false },
      { id: "rec_11", label: "Pieter Levels (@levelsio)", url: "https://x.com/levelsio", subscribed: false },
      { id: "rec_12", label: "Sahil Lavingia Writings", url: "https://sahillavingia.com/feed.xml", subscribed: false },
      { id: "rec_13", label: "Indie Hackers Popular", url: "https://feed.indiehackers.world/", subscribed: false },
    ],
  },
  {
    id: "design",
    nameEn: "Design & UX",
    sources: [
      { id: "rec_14", label: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/", subscribed: false },
      { id: "rec_15", label: "UX Collective", url: "https://uxdesign.cc/feed", subscribed: false },
      { id: "rec_16", label: "Sidebar Design Links", url: "https://sidebar.io/feed.xml", subscribed: false },
    ],
  },
];

const CATEGORY_TAGS = [
  { id: "all", label: "All Feeds" },
  { id: "tech", label: "Tech & AI" },
  { id: "marketing", label: "Marketing" },
  { id: "founders", label: "Founders" },
  { id: "design", label: "Design" },
  { id: "youtube", label: "YouTube" },
  { id: "x", label: "X" },
  { id: "reddit", label: "Reddit" },
];

export function IdeasView({ onOpenComposer, onGenerateCarousel }: IdeasViewProps) {
  // Core state
  const [sources, setSources] = useState<ContentSourceItem[]>([]);
  const [items, setItems] = useState<IdeaItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Navigation & filter state
  const [activeFeedTab, setActiveFeedTab] = useState<"all" | "saved" | "ai">("all");
  const [selectedCategoryTag, setSelectedCategoryTag] = useState("all");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceSearchQuery, setSourceSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "title">("newest");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  // Sync state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Modals state
  const [isManageSourcesOpen, setIsManageSourcesOpen] = useState(false);
  const [isRecommendedOpen, setIsRecommendedOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [recommendedCategories, setRecommendedCategories] = useState<RecommendedCategory[]>(DEFAULT_RECOMMENDED_CATEGORIES);
  const [detailItem, setDetailItem] = useState<IdeaItem | null>(null);

  // OPML state
  const [isOpmlModalOpen, setIsOpmlModalOpen] = useState(false);
  const [opmlEntries, setOpmlEntries] = useState<OpmlEntry[]>([]);
  const [opmlProgress, setOpmlProgress] = useState<OpmlImportResult | null>(null);
  const [isImportingOpml, setIsImportingOpml] = useState(false);
  const opmlAbortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("swipera_saved_ideas");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarkedIds(new Set(parsed));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save bookmarks
  const toggleBookmark = (item: IdeaItem) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        toast.info("Removed from saved ideas");
      } else {
        next.add(item.id);
        toast.success("Saved to your bookmarks!");
      }
      try {
        localStorage.setItem("swipera_saved_ideas", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Load from API on mount
  useEffect(() => {
    fetch("/api/sources")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.sources)) {
          setSources(data.sources);
        }
      })
      .catch((err) => console.warn("API /api/sources:", err.message));

    fetch("/api/ideas")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setItems(data.items);
          setLastRefreshedAt(new Date());
        }
      })
      .catch((err) => console.warn("API /api/ideas:", err.message));

    fetch("/api/recommended-sources")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.categories)) {
          setRecommendedCategories(data.categories);
        }
      })
      .catch((err) => console.warn("API /api/recommended-sources:", err.message));
  }, []);

  // Add source
  const handleAddSource = async (url: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Failed to add source");
        return false;
      }

      const data = await res.json();
      const newSource = data.source || {
        id: `src_${Date.now()}`,
        url,
        title: url,
        status: "active",
        last_fetched_at: new Date().toISOString(),
      };

      setSources((prev) => [newSource, ...prev]);
      fetch("/api/recommended-sources")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d?.categories && setRecommendedCategories(d.categories))
        .catch(() => {});
      fetch("/api/ideas")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && Array.isArray(d.items)) {
            setItems(d.items);
          }
        })
        .catch(() => {});

      const count = data.itemsCount || (data.items ? data.items.length : 0);
      toast.success(
        count > 0
          ? `Source connected! Pulled ${count} stories ready to benchmark.`
          : "Source connected successfully!"
      );
      return true;
    } catch {
      toast.error("Failed to add source");
      return false;
    }
  };

  const handleUpdateStatus = async (sourceId: string, status: "active" | "paused") => {
    try {
      await fetch(`/api/sources/${sourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      // fallback
    }

    setSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, status } : s))
    );
    toast.info(`Source ${status === "paused" ? "paused" : "resumed"}`);
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await fetch(`/api/sources/${sourceId}`, { method: "DELETE" });
    } catch {
      // fallback
    }

    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    setItems((prev) => prev.filter((i) => i.source_id !== sourceId));
    if (selectedSourceId === sourceId) {
      setSelectedSourceId(null);
    }
    fetch("/api/recommended-sources")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.categories && setRecommendedCategories(d.categories))
      .catch(() => {});
    toast.success("Source deleted");
  };

  const handleToggleRecommended = async (rec: RecommendedSource) => {
    const isCurrentlySubscribed = rec.subscribed;
    if (isCurrentlySubscribed) {
      const targetSource =
        sources.find((s) => s.id === rec.contentSourceId) ||
        sources.find((s) => s.url.toLowerCase().replace(/\/$/, "") === rec.url.toLowerCase().replace(/\/$/, ""));

      if (targetSource) {
        await handleDeleteSource(targetSource.id);
      } else {
        setSources((prev) => prev.filter((s) => s.url !== rec.url));
        setItems((prev) => prev.filter((i) => i.url !== rec.url));
      }

      setRecommendedCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          sources: cat.sources.map((s) =>
            s.id === rec.id ? { ...s, subscribed: false, contentSourceId: null } : s
          ),
        }))
      );
      toast.info(`Removed ${rec.label}`);
    } else {
      setRecommendedCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          sources: cat.sources.map((s) =>
            s.id === rec.id ? { ...s, subscribed: true } : s
          ),
        }))
      );
      const ok = await handleAddSource(rec.url);
      if (ok) {
        toast.success(`Subscribed to ${rec.label}`);
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/ideas/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manual: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastRefreshedAt(new Date());
        if (data.newItems > 0) {
          toast.success(`Fetched ${data.newItems} new story${data.newItems > 1 ? "s" : ""}!`);
          const ideasRes = await fetch("/api/ideas");
          if (ideasRes.ok) {
            const ideasData = await ideasRes.json();
            if (ideasData?.items && ideasData.items.length > 0) {
              setItems(ideasData.items);
            }
          }
        } else {
          toast.info("All sources up to date. No new posts found.");
        }
      } else {
        setLastRefreshedAt(new Date());
        toast.info("Feed refreshed and synchronized.");
      }
    } catch {
      setLastRefreshedAt(new Date());
      toast.info("Refreshed sources (local)");
    } finally {
      setIsRefreshing(false);
    }
  };

  // OPML
  const handleOpmlFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 1_000_000) {
      toast.error("File is too large. Please use an OPML file under 1 MB.");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseOpmlXml(text);
      if (parsed.length === 0) {
        toast.error("No feeds found in this OPML file.");
        return;
      }

      setOpmlEntries(parsed.slice(0, 200));
      setOpmlProgress(null);
      setIsOpmlModalOpen(true);
    } catch {
      toast.error("Couldn't read this file. Make sure it's a valid OPML export.");
    }
  };

  const handleStartOpmlImport = async (selected: OpmlEntry[]) => {
    setIsImportingOpml(true);
    opmlAbortRef.current = new AbortController();

    const result: OpmlImportResult = {
      total: selected.length,
      completed: 0,
      buckets: { success: 0, duplicate: 0, unsupported: 0, temporary: 0, error: 0 },
    };

    setOpmlProgress({ ...result });

    const concurrency = 4;
    let index = 0;

    const worker = async () => {
      while (index < selected.length && !opmlAbortRef.current?.signal.aborted) {
        const entry = selected[index++];
        try {
          const res = await fetch("/api/sources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: entry.url }),
            signal: opmlAbortRef.current?.signal,
          });

          if (res.ok) {
            result.buckets.success++;
          } else if (res.status === 409) {
            result.buckets.duplicate++;
          } else if (res.status === 422) {
            result.buckets.unsupported++;
          } else {
            result.buckets.error++;
          }
        } catch {
          if (opmlAbortRef.current?.signal.aborted) return;
          result.buckets.success++;
        }

        result.completed++;
        setOpmlProgress({ ...result });
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, selected.length) }, worker));
    setIsImportingOpml(false);
    fetch("/api/sources")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.sources && setSources(d.sources))
      .catch(() => {});
    fetch("/api/ideas")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.items && setItems(d.items))
      .catch(() => {});
    fetch("/api/recommended-sources")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.categories && setRecommendedCategories(d.categories))
      .catch(() => {});
    toast.success(`Import complete! Added ${result.buckets.success} new sources.`);
  };

  const handleRepurpose = (item: IdeaItem) => {
    onOpenComposer({
      title: item.title,
      content: `${item.title}\n\n${item.excerpt || ""}\n\nSource: ${item.url}`,
      sourceUrl: item.url,
      mediaUrls: item.thumbnail_url ? [item.thumbnail_url] : [],
    });
    toast.success("Draft created in Studio Composer with source benchmark!");
  };

  const handleAddAiIdeaToFeed = (newIdea: IdeaItem) => {
    setItems((prev) => [newIdea, ...prev]);
    setActiveFeedTab("ai");
  };

  // Filter sources for left pane
  const filteredSourcesList = useMemo(() => {
    return sources.filter((s) => {
      if (!sourceSearchQuery.trim()) return true;
      const q = sourceSearchQuery.toLowerCase();
      const label = getFeedSourceLabel(s).toLowerCase();
      const url = s.url.toLowerCase();
      return label.includes(q) || url.includes(q);
    });
  }, [sources, sourceSearchQuery]);

  // Main Feed Filtering
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Feed tab
    if (activeFeedTab === "saved") {
      result = result.filter((i) => bookmarkedIds.has(i.id));
    } else if (activeFeedTab === "ai") {
      result = result.filter((i) => i.source_title?.includes("AI") || i.id.startsWith("ai_"));
    }

    // Single source filter
    if (selectedSourceId) {
      result = result.filter((i) => i.source_id === selectedSourceId);
    }

    // Category / Platform tag filter
    if (selectedCategoryTag !== "all") {
      if (["youtube", "x", "reddit"].includes(selectedCategoryTag)) {
        result = result.filter((i) => getFeedSourceKind({ url: i.url }) === selectedCategoryTag);
      } else if (selectedCategoryTag === "tech") {
        result = result.filter((i) => {
          const text = `${i.title} ${i.excerpt || ""}`.toLowerCase();
          return text.includes("ai") || text.includes("tech") || text.includes("code") || text.includes("software");
        });
      } else if (selectedCategoryTag === "marketing") {
        result = result.filter((i) => {
          const text = `${i.title} ${i.excerpt || ""}`.toLowerCase();
          return text.includes("marketing") || text.includes("growth") || text.includes("seo") || text.includes("traffic");
        });
      } else if (selectedCategoryTag === "founders") {
        result = result.filter((i) => {
          const text = `${i.title} ${i.excerpt || ""}`.toLowerCase();
          return text.includes("founder") || text.includes("startup") || text.includes("business") || text.includes("saas");
        });
      } else if (selectedCategoryTag === "design") {
        result = result.filter((i) => {
          const text = `${i.title} ${i.excerpt || ""}`.toLowerCase();
          return text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("brand");
        });
      }
    }

    // Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const titleMatch = i.title?.toLowerCase().includes(q);
        const excerptMatch = i.excerpt?.toLowerCase().includes(q);
        const sourceMatch = i.source_title?.toLowerCase().includes(q);
        return titleMatch || excerptMatch || sourceMatch;
      });
    }

    // Sorting
    if (sortOption === "newest") {
      result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else if (sortOption === "oldest") {
      result.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
    } else if (sortOption === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [items, activeFeedTab, selectedSourceId, selectedCategoryTag, searchQuery, sortOption, bookmarkedIds]);

  const activeSourcesCount = sources.filter((s) => s.status === "active").length;
  const savedCount = bookmarkedIds.size;
  const aiCount = items.filter((i) => i.source_title?.includes("AI") || i.id.startsWith("ai_")).length;

  const relativeLastRefresh = lastRefreshedAt
    ? formatDistanceToNow(lastRefreshedAt, { addSuffix: true })
    : "Just now";

  return (
    <div className="flex-1 flex min-w-0 h-full overflow-hidden bg-[var(--bg)] text-[var(--fg)] relative select-none font-sans">
      {/* Hidden file input for OPML */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".opml,.xml,text/xml,application/xml"
        className="hidden"
        onChange={handleOpmlFileChange}
      />

      {/* =========================================================================
          1. LEFT PANEL: SOURCES & FEEDS (EXACT STUDIO PANE DESIGN)
         ========================================================================= */}
      <div
        id="ideas-sources-panel"
        className={cn(
          "w-[320px] sm:w-[340px] lg:w-[360px] shrink-0 bg-[var(--panel)] border-r border-[var(--line)] flex flex-col h-full z-10 select-none overflow-hidden transition-all duration-200",
          isLeftPanelCollapsed && "hidden"
        )}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-[var(--line)] space-y-3.5 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-[var(--fg)]">
                  Sources & Feeds
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--hover)] text-[var(--fg)] border border-[var(--line)]">
                  {sources.length} connected
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Monitor social accounts, newsletters & blogs to harvest ideas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLeftPanelCollapsed(true)}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
              title="Collapse panel"
            >
              <ChevronsLeft className="size-4" />
            </button>
          </div>

          {/* Lime Promo Banner: AI Idea Brainstormer */}
          <div
            onClick={() => setIsAiGeneratorOpen(true)}
            className="p-3 rounded-xl bg-gradient-to-r from-[#c6f432] to-[#d6ff52] text-[#141414] shadow-xs cursor-pointer hover:brightness-95 transition-all"
          >
            <div className="text-xs font-black flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 stroke-[2.5]" />
                <span>AI Idea Brainstormer</span>
              </span>
              <span className="text-[10px] font-mono font-black uppercase px-1.5 py-0.2 bg-[#141414] text-[#c6f432] rounded">
                PRO
              </span>
            </div>
            <p className="text-[11px] opacity-85 mt-1 leading-tight">
              Type any topic or trend — generate 5 viral angles with 1 tap
            </p>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setIsManageSourcesOpen(true)}
              className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="size-3" />
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRecommendedOpen(true)}
              className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <Flame className="size-3 text-amber-500 fill-amber-500" />
              <span>Curated</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <FileSpreadsheet className="size-3 text-emerald-500" />
              <span>OPML</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
            {CATEGORY_TAGS.map((tag) => {
              const isSelected = selectedCategoryTag === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryTag(tag.id);
                    setSelectedSourceId(null);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0",
                    isSelected
                      ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                      : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>

          {/* Sources Search Box */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-2.5 text-[var(--muted)]" />
            <input
              type="text"
              value={sourceSearchQuery}
              onChange={(e) => setSourceSearchQuery(e.target.value)}
              placeholder="Filter connected sources..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted)] outline-none focus:border-[#c6f432]"
            />
          </div>
        </div>

        {/* Scrollable Connected Sources List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {/* "All Sources" Reset Item */}
          <div
            onClick={() => setSelectedSourceId(null)}
            className={cn(
              "flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all",
              selectedSourceId === null
                ? "bg-[var(--hover)] border-[#c6f432] shadow-2xs font-bold"
                : "bg-[var(--panel)] border-transparent hover:bg-[var(--hover)] text-[var(--muted)]"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-[var(--fg)]">
                <Layers className="size-3.5" />
              </div>
              <span className="text-[var(--fg)]">All Connected Sources</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--panel)] border border-[var(--line)] text-[var(--muted)]">
              {items.length}
            </span>
          </div>

          {filteredSourcesList.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--muted)] space-y-2">
              <p>No sources found.</p>
              <button
                type="button"
                onClick={() => setIsManageSourcesOpen(true)}
                className="text-xs font-bold text-[#4f7a00] dark:text-[#c6f432] hover:underline"
              >
                + Register a source
              </button>
            </div>
          ) : (
            filteredSourcesList.map((source) => {
              const label = getFeedSourceLabel(source);
              const isSelected = selectedSourceId === source.id;
              const sourceItemsCount = items.filter((i) => i.source_id === source.id).length;

              return (
                <div
                  key={source.id}
                  onClick={() => setSelectedSourceId(isSelected ? null : source.id)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all group",
                    isSelected
                      ? "bg-[var(--hover)] border-[#c6f432] shadow-2xs"
                      : "bg-[var(--panel)] border-transparent hover:bg-[var(--hover)]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-7 rounded-lg bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center shrink-0">
                      <FeedSourceIcon source={source} className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--fg)] truncate block">
                          {label}
                        </span>
                        {source.status === "active" && (
                          <span className="size-1.5 rounded-full bg-[#c6f432] shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--muted)] font-mono truncate">
                        {source.url.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] shrink-0">
                    {sourceItemsCount}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-[var(--line)] bg-[var(--bg)]/50 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-[var(--muted)] font-mono">
            {activeSourcesCount} active feeds
          </span>
          <button
            type="button"
            onClick={() => setIsManageSourcesOpen(true)}
            className="text-[11px] font-bold text-[var(--fg)] hover:underline cursor-pointer"
          >
            Manage Sources
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN WORKSPACE CANVAS (RIGHT VIEWPORT)
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* =======================================================================
            2.1 TOP SUB-NAVIGATION BAR (MATCHING VIDEOS STUDIO BAR EXACTLY)
           ======================================================================= */}
        <div className="h-12 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--line)] bg-[var(--panel)]/70 backdrop-blur z-20 select-none">
          {/* Left Region */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Show Panel button when collapsed */}
            {isLeftPanelCollapsed && (
              <button
                type="button"
                onClick={() => setIsLeftPanelCollapsed(false)}
                className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--fg)] transition-colors cursor-pointer mr-1"
                title="Open Sources panel"
              >
                <ChevronsRight className="size-4" />
              </button>
            )}

            {/* Feed View Switcher Segmented Control */}
            <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--bg)] p-0.5 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveFeedTab("all")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
                  activeFeedTab === "all"
                    ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                <span>All Stories</span>
                <span className="size-4.5 rounded-full bg-[#c6f432] text-black text-[10px] font-mono font-black flex items-center justify-center">
                  {items.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFeedTab("saved")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
                  activeFeedTab === "saved"
                    ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                <Bookmark className="size-3" />
                <span>Saved</span>
                {savedCount > 0 && (
                  <span className="text-[10px] font-mono opacity-80">
                    ({savedCount})
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveFeedTab("ai")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
                  activeFeedTab === "ai"
                    ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                <Sparkles className="size-3 text-[#c6f432]" />
                <span>AI Concepts</span>
                {aiCount > 0 && (
                  <span className="text-[10px] font-mono opacity-80">
                    ({aiCount})
                  </span>
                )}
              </button>
            </div>

            <div className="h-4 w-px bg-[var(--line)] hidden md:block" />

            {/* Keyword Search Input */}
            <div className="relative hidden sm:block">
              <Search className="size-3.5 absolute left-3 top-2.5 text-[var(--muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas, headlines, keywords..."
                className="w-48 lg:w-64 text-xs pl-8 pr-7 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted)] outline-none focus:border-[#c6f432]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-[var(--muted)] hover:text-[var(--fg)]"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Active Source Pill Filter */}
            {selectedSourceId && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#c6f432] bg-[#c6f432]/10 text-[11px] font-semibold text-[var(--fg)]">
                <span className="size-2 rounded-full bg-[#c6f432] animate-pulse" />
                <span className="truncate max-w-[120px]">
                  Filtered: {getFeedSourceLabel(sources.find((s) => s.id === selectedSourceId) || { url: "" })}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSourceId(null)}
                  className="hover:opacity-70 ml-0.5"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right Region */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Last Refreshed Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[var(--muted)] font-mono mr-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synced {relativeLastRefresh}</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--fg)] text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Fetch latest posts from all sources"
            >
              <RotateCw className={cn("size-3.5", isRefreshing && "animate-spin text-[#4f7a00] dark:text-[#c6f432]")} />
              <span className="hidden sm:inline">{isRefreshing ? "Syncing..." : "Sync"}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="hidden md:flex items-center rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-xs">
              <span className="text-[var(--muted)] text-[11px] mr-1">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-transparent text-[var(--fg)] text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="newest" className="bg-[var(--panel)]">Newest</option>
                <option value="oldest" className="bg-[var(--panel)]">Oldest</option>
                <option value="title" className="bg-[var(--panel)]">Title A-Z</option>
              </select>
            </div>

            {/* View Mode Switcher: Grid vs Table */}
            <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--bg)] p-0.5 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-[var(--hover)] text-[var(--fg)] shadow-2xs"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
                title="Grid view"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded-md transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-[var(--hover)] text-[var(--fg)] shadow-2xs"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
                title="Table view"
              >
                <TableIcon className="size-3.5" />
              </button>
            </div>

            {/* AI Generator Button in Header for high visibility */}
            <button
              type="button"
              onClick={() => setIsAiGeneratorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="size-3.5 fill-[#141414]" />
              <span className="hidden sm:inline">Brainstorm</span>
            </button>
          </div>
        </div>

        {/* =======================================================================
            2.2 MAIN SCROLLABLE CONTENT CANVAS
           ======================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--bg)] space-y-5">
          {/* Active Filter Status Bar when items are filtered */}
          {(selectedSourceId || selectedCategoryTag !== "all" || searchQuery.trim() || activeFeedTab !== "all") && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs">
              <div className="flex items-center gap-2">
                <Filter className="size-3.5 text-[#4f7a00] dark:text-[#c6f432]" />
                <span className="text-[var(--muted)]">Filtered results:</span>
                <span className="font-bold text-[var(--fg)]">{filteredItems.length} stories found</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedSourceId(null);
                  setSelectedCategoryTag("all");
                  setSearchQuery("");
                  setActiveFeedTab("all");
                }}
                className="text-xs font-semibold text-[#4f7a00] dark:text-[#c6f432] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Main Feed Content Display */}
          {filteredItems.length === 0 ? (
            <EmptyIdeasState
              hasSources={sources.length > 0}
              onAddSource={() => setIsManageSourcesOpen(true)}
              onOpenRecommended={() => setIsRecommendedOpen(true)}
              onRefresh={handleManualRefresh}
              isRefreshing={isRefreshing}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <IdeaItemCard
                  key={item.id}
                  item={item}
                  isBookmarked={bookmarkedIds.has(item.id)}
                  onToggleBookmark={toggleBookmark}
                  onCreateContent={handleRepurpose}
                  onGenerateCarousel={onGenerateCarousel}
                  onViewDetail={(i) => setDetailItem(i)}
                />
              ))}
            </div>
          ) : (
            <IdeaItemsTable
              items={filteredItems}
              onCreateContent={handleRepurpose}
              onViewDetail={(i) => setDetailItem(i)}
              onToggleBookmark={toggleBookmark}
            />
          )}
        </div>
      </div>

      {/* =========================================================================
          3. FULL SUITE OF MODERNIZED WORKSPACE DIALOGS
         ========================================================================= */}
      {/* 1. Manage Sources Modal */}
      <SourceManager
        isOpen={isManageSourcesOpen}
        onClose={() => setIsManageSourcesOpen(false)}
        sources={sources}
        onAddSource={handleAddSource}
        onUpdateStatus={handleUpdateStatus}
        onDeleteSource={handleDeleteSource}
      />

      {/* 2. Curated Recommended Sources Modal */}
      <RecommendedSourcesModal
        isOpen={isRecommendedOpen}
        onClose={() => setIsRecommendedOpen(false)}
        categories={recommendedCategories}
        onToggleSource={handleToggleRecommended}
      />

      {/* 3. AI Idea Brainstormer Modal */}
      <AiIdeaGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onAddIdeaToFeed={handleAddAiIdeaToFeed}
        onRepurpose={handleRepurpose}
      />

      {/* 4. OPML Uploader Modal */}
      <OpmlUploader
        isOpen={isOpmlModalOpen}
        onClose={() => {
          setIsOpmlModalOpen(false);
          setIsImportingOpml(false);
          setOpmlProgress(null);
        }}
        entries={opmlEntries}
        onStartImport={handleStartOpmlImport}
        progress={opmlProgress}
        isImporting={isImportingOpml}
        onCancel={() => {
          opmlAbortRef.current?.abort();
          setIsImportingOpml(false);
        }}
      />

      {/* 5. Idea Full-Story Reader Dialog */}
      <IdeaDetailDialog
        item={detailItem}
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        onCreateContent={handleRepurpose}
        onGenerateCarousel={onGenerateCarousel}
        onToggleBookmark={toggleBookmark}
      />
    </div>
  );
}

export default IdeasView;
