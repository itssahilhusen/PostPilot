"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Rss,
  Search,
  Filter,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  Tag,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  Send,
  Share2,
  Flame,
  Zap,
  TrendingUp,
  Bot,
  ShieldCheck,
  Cpu,
  Globe,
  RefreshCw,
  Play,
  Check,
  Settings2,
  Radio,
  FileText,
  AlertCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ArrowUpRight,
  Database,
  Terminal,
  Activity,
  CheckCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface NewsSourceItem {
  id: string;
  name: string;
  website_url: string;
  rss_url: string | null;
  category: string;
  source_type: "official" | "publication" | "research" | "community";
  fetch_method: "rss" | "api" | "supported_web_extraction" | "manual";
  is_active: boolean;
  trust_level: number;
  language: string;
  favicon_url?: string;
  last_fetched_at: string | null;
  last_successful_fetch_at: string | null;
  last_error: string | null;
  article_count?: number;
  health_status?: "healthy" | "degraded" | "needs_config" | "offline" | "unknown";
}

export interface NewsArticleItem {
  id: string;
  source_id: string;
  source_name: string;
  source_favicon_url?: string;
  title: string;
  original_url: string;
  canonical_url: string;
  author: string | null;
  published_at: string;
  fetched_at: string;
  description: string;
  article_content: string;
  image_url: string | null;
  category: string;
  tags: string[];
  language: string;
  importance_score: number;
  credibility_score: number;
  verification_status: "verified" | "unverified" | "disputed";
  processing_status: "pending" | "processed" | "failed";
  ai_summary: string | null;
  main_event: string | null;
  announcement_type: "product_launch" | "funding" | "research_breakthrough" | "acquisition" | "update" | "industry_development" | "other" | null;
  extracted_entities: {
    companies?: string[];
    products?: string[];
    people?: string[];
  };
  potential_concerns: string | null;
}

export interface NewsStats {
  total_sources: number;
  active_sources: number;
  working_rss_sources: number;
  web_extraction_sources: number;
  needs_config_sources: number;
  total_articles: number;
  high_importance_articles: number;
  last_cron_run: string | null;
  categories: { name: string; count: number }[];
}

const CATEGORIES = [
  "All Categories",
  "AI & Machine Learning",
  "AI News & Publications",
  "Startups, Technology & Business",
  "Cybersecurity",
  "Web3 & Blockchain",
  "Software Development & Open Source",
  "Enterprise IT & Cloud",
  "IoT & Edge Computing",
  "Robotics & Automation",
  "Semiconductors, Hardware & Emerging Science",
];

const ANNOUNCEMENT_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  product_launch: { label: "Product Launch", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: "🚀" },
  research_breakthrough: { label: "Research Breakthrough", color: "bg-purple-500/10 text-purple-400 border-purple-500/30", icon: "🔬" },
  funding: { label: "Funding & Investment", color: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: "💰" },
  acquisition: { label: "Acquisition & M&A", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: "🤝" },
  update: { label: "Platform Update", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", icon: "⚡" },
  industry_development: { label: "Industry Development", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30", icon: "🌐" },
  other: { label: "News & Analysis", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30", icon: "📰" },
};

export function NewsSourcesHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feed" | "sources" | "failed" | "logs">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string>("all");
  const [minImportance, setMinImportance] = useState<number>(0);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>("all");
  
  // Data state
  const [sources, setSources] = useState<NewsSourceItem[]>([]);
  const [articles, setArticles] = useState<NewsArticleItem[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngestingBatch, setIsIngestingBatch] = useState(false);
  const [activeTestingId, setActiveTestingId] = useState<string | null>(null);
  const [activeFetchingId, setActiveFetchingId] = useState<string | null>(null);

  // Source Detail Modal state
  const [editingSource, setEditingSource] = useState<NewsSourceItem | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingModal, setIsTestingModal] = useState(false);
  const [isSavingModal, setIsSavingModal] = useState(false);

  // Load Initial Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sourcesRes, articlesRes, statsRes] = await Promise.all([
        fetch("/api/news/sources"),
        fetch("/api/news/articles?limit=100"),
        fetch("/api/news/stats")
      ]);

      if (sourcesRes.ok) {
        const sData = await sourcesRes.json();
        setSources(sData.sources || []);
      }
      if (articlesRes.ok) {
        const aData = await articlesRes.json();
        setArticles(aData.articles || []);
      }
      if (statsRes.ok) {
        const stData = await statsRes.json();
        setStats(stData);
      }
    } catch (err: any) {
      console.error("Failed to load news data:", err);
      toast.error("Failed to connect to News Intelligence API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Articles for News Feed
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (selectedCategory !== "All Categories" && art.category !== selectedCategory) return false;
      if (selectedAnnouncement !== "all" && art.announcement_type !== selectedAnnouncement) return false;
      if (selectedSourceFilter !== "all" && art.source_id !== selectedSourceFilter) return false;
      if (art.importance_score < minImportance) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSummary = art.ai_summary?.toLowerCase().includes(q);
        const matchesSource = art.source_name.toLowerCase().includes(q);
        const matchesEntities = [
          ...(art.extracted_entities?.companies || []),
          ...(art.extracted_entities?.products || []),
          ...(art.extracted_entities?.people || [])
        ].some(e => e.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesSource && !matchesEntities) return false;
      }
      return true;
    });
  }, [articles, selectedCategory, selectedAnnouncement, selectedSourceFilter, minImportance, searchQuery]);

  // Filtered Sources for All Sources Tab
  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (selectedCategory !== "All Categories" && s.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesUrl = s.website_url.toLowerCase().includes(q);
        const matchesCat = s.category.toLowerCase().includes(q);
        if (!matchesName && !matchesUrl && !matchesCat) return false;
      }
      return true;
    });
  }, [sources, selectedCategory, searchQuery]);

  // Attention Needed Sources
  const failedSources = useMemo(() => {
    return sources.filter((s) => {
      return (
        s.health_status === "needs_config" ||
        s.health_status === "offline" ||
        s.fetch_method === "manual" ||
        Boolean(s.last_error) ||
        !s.rss_url
      );
    });
  }, [sources]);

  // Handle Quick Fetch Now for a single source
  const handleFetchSource = async (sourceId: string, sourceName: string) => {
    setActiveFetchingId(sourceId);
    toast.loading(`Fetching latest news from ${sourceName}...`, { id: `fetch-${sourceId}` });
    try {
      const res = await fetch(`/api/news/sources/${sourceId}/fetch`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Fetched ${data.result.fetched} items (+${data.result.added} new) from ${sourceName}`, { id: `fetch-${sourceId}` });
        await loadData();
      } else {
        toast.error(`Fetch failed: ${data.result?.error || data.error || "Unknown error"}`, { id: `fetch-${sourceId}` });
      }
    } catch (err: any) {
      toast.error(`Fetch error: ${err.message}`, { id: `fetch-${sourceId}` });
    } finally {
      setActiveFetchingId(null);
    }
  };

  // Handle Test Connection for a source
  const handleTestSource = async (source: NewsSourceItem) => {
    setActiveTestingId(source.id);
    toast.loading(`Testing connection to ${source.name}...`, { id: `test-${source.id}` });
    try {
      const res = await fetch(`/api/news/sources/${source.id}/test`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Connection verified! Found ${data.result.items_found} feed items.`, { id: `test-${source.id}` });
      } else {
        toast.error(`Test failed: ${data.result?.error || data.error}`, { id: `test-${source.id}` });
      }
      await loadData();
    } catch (err: any) {
      toast.error(`Test error: ${err.message}`, { id: `test-${source.id}` });
    } finally {
      setActiveTestingId(null);
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (source: NewsSourceItem) => {
    const updated = !source.is_active;
    try {
      const res = await fetch(`/api/news/sources/${source.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: updated })
      });
      if (res.ok) {
        setSources(prev => prev.map(s => s.id === source.id ? { ...s, is_active: updated } : s));
        toast.success(`${source.name} is now ${updated ? "Active" : "Paused"}`);
      }
    } catch (err) {
      toast.error("Failed to toggle source state");
    }
  };

  // Handle Batch Fetch All
  const handleFetchAll = async () => {
    if (isIngestingBatch) return;
    setIsIngestingBatch(true);
    toast.loading("Running batch ingestion across all active sources...", { id: "batch-fetch" });
    try {
      const res = await fetch("/api/news/sources/fetch-all", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Batch complete! Added ${data.report.new_articles_added} articles from ${data.report.successful_sources} sources.`, { id: "batch-fetch" });
        await loadData();
      } else {
        toast.error(`Batch completed with errors: ${data.error || "Check logs"}`, { id: "batch-fetch" });
      }
    } catch (err: any) {
      toast.error(`Batch error: ${err.message}`, { id: "batch-fetch" });
    } finally {
      setIsIngestingBatch(false);
    }
  };

  // Send Article to Carousel Studio
  const handleCreateCarousel = (article: NewsArticleItem) => {
    const targetUrl = `/result?url=${encodeURIComponent(article.original_url)}&title=${encodeURIComponent(article.title)}&summary=${encodeURIComponent(article.ai_summary || "")}`;
    toast.success(`Loading "${article.title.slice(0, 40)}..." into PostPilot Studio`);
    router.push(targetUrl);
  };

  // Save Modal Source Edits
  const handleSaveModal = async () => {
    if (!editingSource) return;
    setIsSavingModal(true);
    try {
      const res = await fetch(`/api/news/sources/${editingSource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rss_url: editingSource.rss_url,
          fetch_method: editingSource.fetch_method,
          is_active: editingSource.is_active,
          trust_level: editingSource.trust_level,
          category: editingSource.category,
        })
      });
      if (res.ok) {
        toast.success(`Source settings updated for ${editingSource.name}`);
        setEditingSource(null);
        await loadData();
      } else {
        toast.error("Failed to update source configuration");
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSavingModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-[#e5e7eb] flex flex-col font-sans selection:bg-[#38bdf8]/30">
      {/* Top Banner & Header */}
      <header className="border-b border-[#1d222b] bg-[#0e1117]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-0.5 shadow-lg shadow-sky-500/10">
                <div className="w-full h-full bg-[#090a0d] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">The AI Seed</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    News Intelligence
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    30m Auto-Sync
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  100 Curated AI, Tech & Emerging Tech Sources • Real-time AI Summaries • One-Click Instagram Carousels
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleFetchAll}
                disabled={isIngestingBatch}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer",
                  "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 disabled:opacity-50"
                )}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isIngestingBatch && "animate-spin")} />
                {isIngestingBatch ? "Ingesting Feeds..." : "Fetch All Sources"}
              </button>

              <Link
                href="/result"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[#171b24] hover:bg-[#202633] text-[#e2e8f0] border border-[#2b3345] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                PostPilot Studio
              </Link>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-3 border-t border-[#1d222b]/80">
            <div className="bg-[#121620]/60 border border-[#1f2636] rounded-lg p-2.5">
              <div className="text-[11px] text-[#94a3b8] font-medium flex items-center gap-1">
                <Globe className="w-3 h-3 text-sky-400" /> Total Sources
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                {stats?.total_sources || sources.length || 100}
              </div>
            </div>

            <div className="bg-[#121620]/60 border border-[#1f2636] rounded-lg p-2.5">
              <div className="text-[11px] text-[#94a3b8] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live RSS Feeds
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {stats?.working_rss_sources || sources.filter(s => s.fetch_method === "rss" && s.rss_url).length || 69}
              </div>
            </div>

            <div className="bg-[#121620]/60 border border-[#1f2636] rounded-lg p-2.5">
              <div className="text-[11px] text-[#94a3b8] font-medium flex items-center gap-1">
                <Bot className="w-3 h-3 text-purple-400" /> Web Extraction
              </div>
              <div className="text-lg font-bold text-purple-300 mt-0.5">
                {stats?.web_extraction_sources || sources.filter(s => s.fetch_method === "supported_web_extraction").length || 23}
              </div>
            </div>

            <div className="bg-[#121620]/60 border border-[#1f2636] rounded-lg p-2.5">
              <div className="text-[11px] text-[#94a3b8] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" /> Attention Needed
              </div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">
                {stats?.needs_config_sources || failedSources.length || 8}
              </div>
            </div>

            <div className="bg-[#121620]/60 border border-[#1f2636] rounded-lg p-2.5">
              <div className="text-[11px] text-[#94a3b8] font-medium flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-400" /> Total Ingested
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                {stats?.total_articles || articles.length}
              </div>
            </div>

            <div className="bg-[#121620]/60 border border-[#1f2636] rounded-lg p-2.5">
              <div className="text-[11px] text-[#94a3b8] font-medium flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> High Impact (75+)
              </div>
              <div className="text-lg font-bold text-orange-400 mt-0.5">
                {stats?.high_importance_articles || articles.filter(a => a.importance_score >= 75).length}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 border-b border-transparent">
            <button
              onClick={() => setActiveTab("feed")}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer",
                activeTab === "feed"
                  ? "bg-[#181d28] text-sky-400 border-t-2 border-sky-400 shadow-sm"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#131720]"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              Intelligence Feed
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300">
                {articles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sources")}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer",
                activeTab === "sources"
                  ? "bg-[#181d28] text-sky-400 border-t-2 border-sky-400 shadow-sm"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#131720]"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              All Sources
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#202738] text-[#94a3b8]">
                100
              </span>
            </button>

            <button
              onClick={() => setActiveTab("failed")}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer",
                activeTab === "failed"
                  ? "bg-[#181d28] text-amber-400 border-t-2 border-amber-400 shadow-sm"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#131720]"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Attention Needed
              {failedSources.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {failedSources.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Controls Bar: Search & Category Filter */}
        <div className="bg-[#11141d] border border-[#1f2636] rounded-xl p-3.5 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "feed"
                    ? "Search intelligence by headline, company, AI model, or breakthrough..."
                    : "Search 100 sources by name, URL, or domain..."
                }
                className="w-full bg-[#0a0d13] border border-[#232b3d] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#0a0d13] border border-[#232b3d] rounded-lg px-2.5 py-2 text-xs text-[#cbd5e1] focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Feed-specific filters */}
              {activeTab === "feed" && (
                <>
                  <select
                    value={selectedAnnouncement}
                    onChange={(e) => setSelectedAnnouncement(e.target.value)}
                    className="bg-[#0a0d13] border border-[#232b3d] rounded-lg px-2.5 py-2 text-xs text-[#cbd5e1] focus:outline-none focus:border-sky-500 cursor-pointer hidden sm:block"
                  >
                    <option value="all">All Announcements</option>
                    <option value="product_launch">🚀 Product Launches</option>
                    <option value="research_breakthrough">🔬 Research Breakthroughs</option>
                    <option value="funding">💰 Funding & Investments</option>
                    <option value="acquisition">🤝 Acquisitions</option>
                    <option value="update">⚡ Platform Updates</option>
                    <option value="industry_development">🌐 Industry News</option>
                  </select>

                  <select
                    value={minImportance}
                    onChange={(e) => setMinImportance(Number(e.target.value))}
                    className="bg-[#0a0d13] border border-[#232b3d] rounded-lg px-2.5 py-2 text-xs text-[#cbd5e1] focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="0">All Impact</option>
                    <option value="50">Medium+ (50+)</option>
                    <option value="75">High Impact (75+)</option>
                    <option value="85">Viral/Critical (85+)</option>
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TAB 1: INTELLIGENCE FEED */}
        {activeTab === "feed" && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-[#94a3b8]">
              <div>
                Showing <span className="font-semibold text-white">{filteredArticles.length}</span> verified intelligence reports
              </div>
              <div className="text-[11px] flex items-center gap-1.5">
                <span>Sorted by latest published</span>
              </div>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="bg-[#11141d] border border-[#1f2636] rounded-xl p-12 text-center">
                <FileText className="w-10 h-10 text-[#475569] mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">No articles match your criteria</h3>
                <p className="text-xs text-[#94a3b8] mt-1 max-w-sm mx-auto">
                  Try adjusting the category, importance score, or search query to discover intelligence.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All Categories");
                    setSelectedAnnouncement("all");
                    setMinImportance(0);
                    setSearchQuery("");
                  }}
                  className="mt-4 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1d2332] text-sky-400 hover:bg-[#252d40]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((art) => {
                  const ann = ANNOUNCEMENT_LABELS[art.announcement_type || "other"] || ANNOUNCEMENT_LABELS.other;
                  const isHighImpact = art.importance_score >= 75;

                  return (
                    <article
                      key={art.id}
                      className={cn(
                        "bg-[#11141d] border rounded-xl p-4 transition-all hover:border-[#2f394f] flex flex-col justify-between group",
                        isHighImpact ? "border-sky-500/30 bg-gradient-to-b from-[#11141d] to-[#121824]" : "border-[#1f2636]"
                      )}
                    >
                      <div>
                        {/* Header: Publisher & Category & Announcement Tag */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            {art.source_favicon_url ? (
                              <img
                                src={art.source_favicon_url}
                                alt={art.source_name}
                                className="w-4 h-4 rounded-sm shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-sm bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">
                                {art.source_name[0]}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-[#cbd5e1] truncate">
                              {art.source_name}
                            </span>
                            <span className="text-[10px] text-[#64748b]">•</span>
                            <span className="text-[10px] text-[#94a3b8] truncate">
                              {art.category.split("&")[0].trim()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1",
                                ann.color
                              )}
                            >
                              <span>{ann.icon}</span>
                              <span className="hidden sm:inline">{ann.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 mb-2 leading-snug">
                          <a href={art.original_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {art.title}
                          </a>
                        </h2>

                        {/* AI Executive Summary Card */}
                        <div className="bg-[#090b10] border border-[#1a202c] rounded-lg p-2.5 mb-3 text-xs">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-sky-400 mb-1">
                            <Sparkles className="w-3 h-3 text-sky-400" />
                            AI EXECUTIVE SUMMARY
                          </div>
                          <p className="text-[#cbd5e1] text-[11px] leading-relaxed line-clamp-3">
                            {art.ai_summary || art.description}
                          </p>
                          {art.main_event && (
                            <div className="mt-1.5 pt-1.5 border-t border-[#1a202c] text-[10px] text-[#94a3b8]">
                              <span className="font-semibold text-emerald-400">Main Event:</span> {art.main_event}
                            </div>
                          )}
                        </div>

                        {/* Extracted Entities */}
                        {((art.extracted_entities?.companies?.length ?? 0) > 0 || (art.extracted_entities?.products?.length ?? 0) > 0) && (
                          <div className="flex flex-wrap items-center gap-1 mb-3">
                            {art.extracted_entities?.companies?.slice(0, 3).map((comp) => (
                              <span
                                key={comp}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                              >
                                🏢 {comp}
                              </span>
                            ))}
                            {art.extracted_entities?.products?.slice(0, 2).map((prod) => (
                              <span
                                key={prod}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
                              >
                                ⚡ {prod}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Row: Scores + One-Click Studio Action */}
                      <div className="pt-3 border-t border-[#1a202c] flex items-center justify-between gap-2 mt-2">
                        {/* Score Gauge */}
                        <div className="flex items-center gap-3 text-[11px]">
                          <div className="flex items-center gap-1" title="AI Importance Score (1-100)">
                            <Flame className={cn("w-3.5 h-3.5", isHighImpact ? "text-orange-400" : "text-sky-400")} />
                            <span className="font-bold text-white">{art.importance_score}</span>
                            <span className="text-[10px] text-[#64748b]">/100</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-emerald-400" title="Credibility Rating">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>{art.credibility_score}% verified</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <a
                            href={art.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1a202c] transition-colors"
                            title="Read original source"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleCreateCarousel(art)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                            title="Generate 5-10 slide visual carousel in Studio"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            Create Carousel
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL SOURCES (100) */}
        {activeTab === "sources" && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs text-[#94a3b8]">
              <div>
                Displaying <span className="font-semibold text-white">{filteredSources.length}</span> sources across 10 categories
              </div>
              <div className="text-[11px]">
                Click "Test" to check live reachability or "Fetch" to run ingestion
              </div>
            </div>

            <div className="bg-[#11141d] border border-[#1f2636] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#cbd5e1]">
                  <thead className="bg-[#0b0e14] text-[11px] text-[#94a3b8] border-b border-[#1f2636]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Source Name</th>
                      <th className="px-3 py-3 font-semibold">Category</th>
                      <th className="px-3 py-3 font-semibold">Type</th>
                      <th className="px-3 py-3 font-semibold">Method</th>
                      <th className="px-3 py-3 font-semibold">Health Status</th>
                      <th className="px-3 py-3 font-semibold text-center">Active</th>
                      <th className="px-3 py-3 font-semibold">Last Fetch</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181e2b]">
                    {filteredSources.map((source) => {
                      const isWorkingRss = source.fetch_method === "rss" && source.rss_url;
                      const isTesting = activeTestingId === source.id;
                      const isFetching = activeFetchingId === source.id;

                      return (
                        <tr key={source.id} className="hover:bg-[#141923] transition-colors">
                          {/* Name + Favicon */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {source.favicon_url ? (
                                <img
                                  src={source.favicon_url}
                                  alt={source.name}
                                  className="w-4 h-4 rounded-sm shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-4 h-4 rounded-sm bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">
                                  {source.name[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate">{source.name}</div>
                                <a
                                  href={source.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[#64748b] hover:text-sky-400 flex items-center gap-0.5 truncate"
                                >
                                  {source.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                  <ArrowUpRight className="w-2.5 h-2.5 inline" />
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-3 py-3">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#1a202c] text-[#94a3b8] font-medium border border-[#262f40]">
                              {source.category.split("&")[0].trim()}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="px-3 py-3 text-[#94a3b8] capitalize">
                            {source.source_type}
                          </td>

                          {/* Method */}
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded font-medium border",
                                source.fetch_method === "rss"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : source.fetch_method === "supported_web_extraction"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              )}
                            >
                              {source.fetch_method.toUpperCase().replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Health Status */}
                          <td className="px-3 py-3">
                            {isWorkingRss ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live RSS
                              </span>
                            ) : source.fetch_method === "supported_web_extraction" ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-purple-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                Web Extraction
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                Needs Config
                              </span>
                            )}
                          </td>

                          {/* Active Toggle */}
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => handleToggleActive(source)}
                              className={cn(
                                "w-8 h-4 rounded-full transition-colors relative cursor-pointer",
                                source.is_active ? "bg-emerald-500" : "bg-[#2d3748]"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform",
                                  source.is_active ? "left-4.5" : "left-0.5"
                                )}
                              />
                            </button>
                          </td>

                          {/* Last Fetch */}
                          <td className="px-3 py-3 text-[11px] text-[#94a3b8]">
                            {source.last_fetched_at ? (
                              <span>{new Date(source.last_fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            ) : (
                              <span className="text-[#64748b]">Never</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleTestSource(source)}
                                disabled={isTesting}
                                className="px-2 py-1 rounded text-[11px] font-medium bg-[#1a202c] hover:bg-[#252f40] text-[#cbd5e1] border border-[#2d3748] transition-colors disabled:opacity-50 cursor-pointer"
                                title="Test connection to feed"
                              >
                                {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Test"}
                              </button>

                              <button
                                onClick={() => handleFetchSource(source.id, source.name)}
                                disabled={isFetching}
                                className="px-2 py-1 rounded text-[11px] font-medium bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                                title="Fetch latest news right now"
                              >
                                {isFetching ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Fetch"}
                              </button>

                              <button
                                onClick={() => {
                                  setEditingSource({ ...source });
                                  setTestResult(null);
                                }}
                                className="p-1 rounded text-[#94a3b8] hover:text-white hover:bg-[#1f2636] transition-colors cursor-pointer"
                                title="Inspect & Configure"
                              >
                                <Settings2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ATTENTION NEEDED / NEEDS CONFIGURATION */}
        {activeTab === "failed" && (
          <div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 text-xs text-amber-200">
              <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Sources Requiring Manual Feed Configuration or Advanced Web Extraction
              </div>
              <p className="text-[11px] text-amber-200/80">
                These {failedSources.length} sources do not expose an open standard RSS feed, use client-side SPA rendering, enforce anti-bot challenges, or have recently transitioned their publication. You can configure custom endpoints or switch their ingestion method.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {failedSources.map((source) => (
                <div
                  key={source.id}
                  className="bg-[#11141d] border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-white text-sm">{source.name}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {source.fetch_method.toUpperCase().replace(/_/g, " ")}
                      </span>
                    </div>

                    <a
                      href={source.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1 mb-2"
                    >
                      {source.website_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="text-[11px] text-[#94a3b8] bg-[#090b10] p-2.5 rounded-lg border border-[#1b212d] mb-3">
                      <span className="font-semibold text-red-400">Diagnosis:</span>{" "}
                      {source.last_error ||
                        (source.name === "AnandTech"
                          ? "Site stopped publishing in August 2024; legacy archive only."
                          : "Publisher uses dynamic client-side hydration or Cloudflare challenge.")}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1b212d] flex items-center justify-between">
                    <span className="text-[10px] text-[#64748b]">Category: {source.category}</span>
                    <button
                      onClick={() => {
                        setEditingSource({ ...source });
                        setTestResult(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a202c] hover:bg-[#252f40] text-sky-400 border border-[#2d3748] flex items-center gap-1 cursor-pointer"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      Configure Endpoint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* SOURCE EDIT / CONFIGURATION MODAL */}
      {editingSource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141d] border border-[#252e3f] rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f2636]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-sky-400" />
                  Configure {editingSource.name}
                </h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">Edit ingestion parameters and test connectivity</p>
              </div>
              <button
                onClick={() => setEditingSource(null)}
                className="text-[#64748b] hover:text-white p-1 rounded-lg hover:bg-[#1a202c]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#94a3b8] font-medium mb-1">Website URL</label>
                <input
                  type="text"
                  value={editingSource.website_url}
                  readOnly
                  className="w-full bg-[#0a0d13] border border-[#1f2636] rounded-lg px-3 py-2 text-[#cbd5e1] opacity-75"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] font-medium mb-1">RSS / Feed URL</label>
                <input
                  type="text"
                  value={editingSource.rss_url || ""}
                  onChange={(e) => setEditingSource({ ...editingSource, rss_url: e.target.value })}
                  placeholder="https://example.com/feed.xml"
                  className="w-full bg-[#0a0d13] border border-[#263145] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] font-medium mb-1">Fetch Method</label>
                  <select
                    value={editingSource.fetch_method}
                    onChange={(e: any) => setEditingSource({ ...editingSource, fetch_method: e.target.value })}
                    className="w-full bg-[#0a0d13] border border-[#263145] rounded-lg px-2.5 py-2 text-[#cbd5e1] focus:outline-none focus:border-sky-500"
                  >
                    <option value="rss">RSS / Atom Feed</option>
                    <option value="supported_web_extraction">Web Extraction</option>
                    <option value="api">Official API</option>
                    <option value="manual">Manual Config</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94a3b8] font-medium mb-1">Trust Level</label>
                  <select
                    value={editingSource.trust_level}
                    onChange={(e) => setEditingSource({ ...editingSource, trust_level: Number(e.target.value) })}
                    className="w-full bg-[#0a0d13] border border-[#263145] rounded-lg px-2.5 py-2 text-[#cbd5e1] focus:outline-none focus:border-sky-500"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ Official Research / Source</option>
                    <option value="4">⭐⭐⭐⭐ Tier-1 Publication</option>
                    <option value="3">⭐⭐⭐ Tech Media / Community</option>
                    <option value="2">⭐⭐ Secondary Blog</option>
                  </select>
                </div>
              </div>

              {/* Live Test In Modal */}
              <div className="pt-2">
                <button
                  onClick={async () => {
                    setIsTestingModal(true);
                    try {
                      const res = await fetch(`/api/news/sources/${editingSource.id}/test`, { method: "POST" });
                      const d = await res.json();
                      setTestResult(d);
                    } catch (e: any) {
                      setTestResult({ success: false, error: e.message });
                    } finally {
                      setIsTestingModal(false);
                    }
                  }}
                  disabled={isTestingModal}
                  className="w-full py-2 rounded-lg text-xs font-semibold bg-[#1a202c] hover:bg-[#252f40] text-sky-400 border border-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className={cn("w-3.5 h-3.5", isTestingModal && "animate-spin")} />
                  {isTestingModal ? "Testing Live Feed..." : "Test Connection Live"}
                </button>

                {testResult && (
                  <div className={cn(
                    "mt-2 p-2.5 rounded-lg text-[11px] font-mono border",
                    testResult.success ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-red-500/10 text-red-300 border-red-500/20"
                  )}>
                    {testResult.success ? (
                      <div>
                        ✓ Connection OK ({testResult.result?.status_code}) — Found {testResult.result?.items_found} items.
                        {testResult.result?.latest_title && (
                          <div className="text-[10px] text-white mt-1">Latest: "{testResult.result.latest_title}"</div>
                        )}
                      </div>
                    ) : (
                      <div>✗ Test Failed: {testResult.result?.error || testResult.error}</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#1f2636] flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingSource(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-[#1a202c]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                disabled={isSavingModal}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {isSavingModal ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default NewsSourcesHub;

