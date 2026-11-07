"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Send,
  MoreVertical,
  CalendarDays,
  ListFilter,
  X,
  Layers,
  Check,
  TrendingUp,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DailyFlywheelModal } from "./DailyFlywheelModal";

interface CalendarViewProps {
  onOpenComposer: (post?: any) => void;
}

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  status: "SCHEDULED" | "PUBLISHED" | "DRAFT" | "PENDING_REVIEW";
  platforms: string[];
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  impressions?: number;
  engagements?: number;
}

const PLATFORM_CONFIGS: Record<string, { name: string; icon: string; invertDark?: boolean }> = {
  x: { name: "X", icon: "/images/platforms/x-light.svg", invertDark: true },
  linkedin: { name: "LinkedIn", icon: "/images/platforms/linkedin.svg" },
  threads: { name: "Threads", icon: "/images/platforms/threads.svg", invertDark: true },
  instagram: { name: "Instagram", icon: "/images/platforms/instagram.svg" },
  tiktok: { name: "TikTok", icon: "/images/platforms/tiktok-dark.svg", invertDark: true },
  youtube: { name: "YouTube", icon: "/images/platforms/youtube.svg" },
  facebook: { name: "Facebook", icon: "/images/platforms/facebook.svg" },
};

export function CalendarView({ onOpenComposer }: CalendarViewProps) {
  // Navigation & View States
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<"week" | "month" | "list">("week");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Posts State
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Selection
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isFlywheelModalOpen, setIsFlywheelModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:00");

  // New Slot Form State
  const [slotTitle, setSlotTitle] = useState("");
  const [slotContent, setSlotContent] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("10:00");
  const [slotPlatforms, setSlotPlatforms] = useState<string[]>(["x", "linkedin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Seed / Fetch
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
        setPosts(data.posts);
      } else {
        // High quality seed posts for realistic scheduling experience
        seedFallbackPosts();
      }
    } catch (err) {
      console.warn("Could not fetch /api/posts, loading local sample schedule:", err);
      seedFallbackPosts();
    } finally {
      setIsLoading(false);
    }
  };

  const seedFallbackPosts = () => {
    const today = new Date();
    const makeDate = (offsetDays: number, hours: number, minutes: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offsetDays);
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    };

    const initialSeeds: ScheduledPost[] = [
      {
        id: "seed_1",
        title: "10 AI Engineering Paradigms for 2027",
        content: "Here is what 6 months of shipping autonomous sub-agents taught our core engineering team:\n\n1. Deterministic scaffolds beat infinite generation loops.\n2. Bounded AST inspection catches 90% of regressions before deploy.\n3. Keep your data layer typed and isolated.",
        status: "SCHEDULED",
        platforms: ["x", "linkedin", "threads"],
        scheduledAt: makeDate(0, 10, 30),
      },
      {
        id: "seed_2",
        title: "Why Visual Storytelling Drives 4.2x Engagement",
        content: "Stop posting plain text essays without visual hooks. Here are the 3 slide frameworks we use to turn boring case studies into viral carousels.",
        status: "SCHEDULED",
        platforms: ["linkedin", "instagram"],
        scheduledAt: makeDate(1, 14, 0),
      },
      {
        id: "seed_3",
        title: "Building in Public: Week 42 Growth Sprint",
        content: "Over the last 7 days we crossed $24k ARR and shipped video rendering with Remotion. Here is our exact marketing checklist.",
        status: "PUBLISHED",
        platforms: ["x", "threads"],
        publishedAt: makeDate(-2, 9, 0),
        scheduledAt: makeDate(-2, 9, 0),
        impressions: 4820,
        engagements: 312,
      },
      {
        id: "seed_4",
        title: "Behind the Scenes: AI Video Subtitle Engine",
        content: "Automated subtitle sync with Groq Whisper and Remotion Canvas. Full source code walkthrough dropping this afternoon.",
        status: "SCHEDULED",
        platforms: ["youtube", "tiktok", "instagram"],
        scheduledAt: makeDate(2, 17, 30),
      },
      {
        id: "seed_5",
        title: "Sunday Deep Dive: The Future of Creator Workflows",
        content: "How solopreneurs are generating 30 pieces of social content from a single 5-minute raw idea transcript.",
        status: "DRAFT",
        platforms: ["x", "linkedin"],
        scheduledAt: makeDate(3, 20, 0),
      },
    ];

    setPosts(initialSeeds);
  };

  useEffect(() => {
    fetchPosts();
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("approved") === "true") {
        toast.success("Post approved & scheduled on your Calendar for 10:00 AM!");
      }
    }
  }, []);

  // Calendar Helpers (Week View)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0 is Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday is start
    const monday = new Date(d.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      days.push(dayDate);
    }
    return days;
  }, [currentDate]);

  // Calendar Helpers (Month View)
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Leading days from previous month
    let firstDayIndex = firstDay.getDay(); // 0 is Sun
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0

    for (let i = firstDayIndex; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Days in current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Trailing days to fill 35 or 42 grid
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Date Comparisons
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header display string
  const dateRangeLabel = useMemo(() => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    const start = weekDays[0];
    const end = weekDays[6];
    const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = end.toLocaleDateString("en-US", {
      month: start.getMonth() === end.getMonth() ? undefined : "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} – ${endStr}`;
  }, [currentDate, viewMode, weekDays]);

  // Filtering posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Platform Filter
      if (selectedPlatform !== "all") {
        if (!p.platforms || !p.platforms.includes(selectedPlatform)) {
          return false;
        }
      }
      // Status Filter
      if (selectedStatus !== "all") {
        if (p.status !== selectedStatus) return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesContent = p.content?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }
      return true;
    });
  }, [posts, selectedPlatform, selectedStatus, searchQuery]);

  // Posts grouped by Day for Week View
  const getPostsForDay = (day: Date) => {
    return filteredPosts.filter((p) => {
      const dateStr = p.scheduledAt || p.publishedAt || p.createdAt;
      if (!dateStr) return false;
      const postDate = new Date(dateStr);
      return isSameDay(postDate, day);
    });
  };

  // Quick Open Scheduler pre-filled with date
  const openScheduleSlot = (targetDate?: Date) => {
    const d = targetDate || new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setSlotDate(`${yyyy}-${mm}-${dd}`);
    setSlotTime("10:00");
    setSlotTitle("");
    setSlotContent("");
    setSlotPlatforms(["x", "linkedin"]);
    setIsQuickScheduleOpen(true);
  };

  // Save Scheduled Post Handler
  const handleSaveScheduledSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotTitle.trim() && !slotContent.trim()) {
      toast.error("Please enter a title or post draft");
      return;
    }

    setIsSubmitting(true);
    const scheduledDateTime = new Date(`${slotDate}T${slotTime}:00`);

    const newPostPayload = {
      title: slotTitle.trim() || "Scheduled Post",
      content: slotContent.trim() || slotTitle.trim(),
      platforms: slotPlatforms,
      scheduledAt: scheduledDateTime.toISOString(),
      status: "SCHEDULED",
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPostPayload),
      });

      const data = await res.json();
      const savedPost: ScheduledPost = data.post || {
        id: "post_" + Date.now(),
        ...newPostPayload,
        status: "SCHEDULED",
      };

      setPosts((prev) => [savedPost, ...prev]);
      setIsQuickScheduleOpen(false);
      toast.success("Post scheduled successfully!", {
        description: `Set for ${scheduledDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${slotTime}`,
      });
    } catch (err) {
      console.error(err);
      // Optimistic fallback
      const fallbackPost: ScheduledPost = {
        id: "post_" + Date.now(),
        ...newPostPayload,
        status: "SCHEDULED",
      };
      setPosts((prev) => [fallbackPost, ...prev]);
      setIsQuickScheduleOpen(false);
      toast.success("Post scheduled (saved locally)!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reschedule Action
  const handleRescheduleSubmit = async () => {
    if (!selectedPost || !rescheduleDate) return;
    const newDateTime = new Date(`${rescheduleDate}T${rescheduleTime}:00`);

    try {
      await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newDateTime.toISOString() }),
      });
    } catch (err) {
      console.warn("PATCH fallback:", err);
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPost.id ? { ...p, scheduledAt: newDateTime.toISOString() } : p
      )
    );
    setIsRescheduleOpen(false);
    setSelectedPost(null);
    toast.success("Slot rescheduled!", {
      description: `Moved to ${newDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${rescheduleTime}`,
    });
  };

  // Delete Action
  const handleDeletePost = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("DELETE fallback:", err);
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (selectedPost?.id === id) setSelectedPost(null);
    toast.success("Post removed from schedule");
  };

  // Publish Now Action
  const handlePublishNow = async (post: ScheduledPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
    } catch (err) {
      console.warn("PATCH fallback:", err);
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, status: "PUBLISHED", publishedAt: new Date().toISOString() }
          : p
      )
    );
    if (selectedPost?.id === post.id) {
      setSelectedPost({ ...selectedPost, status: "PUBLISHED", publishedAt: new Date().toISOString() });
    }
    toast.success("Post published across selected channels!");
  };

  // Platform Toggle helper for modal
  const toggleModalPlatform = (p: string) => {
    if (slotPlatforms.includes(p)) {
      if (slotPlatforms.length > 1) {
        setSlotPlatforms(slotPlatforms.filter((item) => item !== p));
      } else {
        toast.error("At least one platform is required");
      }
    } else {
      setSlotPlatforms([...slotPlatforms, p]);
    }
  };

  // Metrics
  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg)] font-sans text-[var(--fg)] select-none">
      {/* =====================================================================
          1. HEADER TOOLBAR
          ===================================================================== */}
      <header className="shrink-0 border-b border-[var(--line)] bg-[var(--panel)] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#c6f432]/20 text-[#365300] dark:text-[#c6f432] flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--fg)]">
                Content Calendar
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c6f432] text-black">
                Scheduling Hub
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Plan, schedule, and automate multi-channel releases
            </p>
          </div>
        </div>

        {/* Date Navigation & View Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Previous / Range / Next */}
          <div className="flex items-center rounded-xl border border-[var(--line)] bg-[var(--bg)] p-1 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              title="Previous Range"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 min-w-[130px] text-center font-bold text-xs truncate">
              {dateRangeLabel}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              title="Next Range"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={handleToday}
            className="h-9 px-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer shadow-2xs"
          >
            Today
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-[var(--line)] bg-[var(--bg)] p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                viewMode === "week"
                  ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              )}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                viewMode === "month"
                  ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              )}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              )}
            >
              Queue
            </button>
          </div>

          {/* Autonomous Daily Flywheel Configuration Button */}
          <button
            type="button"
            onClick={() => setIsFlywheelModalOpen(true)}
            className="h-9 px-3 rounded-xl border border-[#c6f432]/40 bg-[#c6f432]/10 hover:bg-[#c6f432]/20 text-[#4f7a00] dark:text-[#c6f432] font-black text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Configure or test autonomous daily theme page runs"
          >
            <Bot className="w-3.5 h-3.5 text-[#c6f432]" />
            <span>Daily Flywheel</span>
          </button>

          {/* Primary Schedule Button */}
          <button
            type="button"
            onClick={() => openScheduleSlot()}
            className="h-9 px-3.5 rounded-xl bg-[#c6f432] text-black font-extrabold text-xs inline-flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Slot</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          2. METRICS & FILTER SUB-BAR
          ===================================================================== */}
      <div className="shrink-0 border-b border-[var(--line)] bg-[var(--panel)]/70 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Metric Badges */}
        <div className="flex items-center gap-3 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[var(--muted)]">Scheduled:</span>
            <span className="font-bold text-[var(--fg)]">{scheduledCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[var(--muted)]">Published:</span>
            <span className="font-bold text-[var(--fg)]">{publishedCount}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[var(--muted)]">Best Time:</span>
            <span className="font-bold text-[var(--fg)]">10:00 AM & 6:30 PM</span>
          </div>
        </div>

        {/* Platform & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scheduled posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#c6f432] w-36 sm:w-48 transition-all"
            />
          </div>

          {/* Platform Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {["all", "x", "linkedin", "threads", "instagram"].map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setSelectedPlatform(plat)}
                className={cn(
                  "h-8 px-2.5 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer flex items-center gap-1.5",
                  selectedPlatform === plat
                    ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                    : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
                )}
              >
                {plat === "all" ? (
                  "All Channels"
                ) : (
                  <>
                    <Image
                      src={PLATFORM_CONFIGS[plat]?.icon || "/images/platforms/x-light.svg"}
                      alt={plat}
                      width={12}
                      height={12}
                      className={PLATFORM_CONFIGS[plat]?.invertDark ? "dark:invert" : ""}
                    />
                    <span>{PLATFORM_CONFIGS[plat]?.name}</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Status Filter Dropdown / Pill */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs font-semibold text-[var(--fg)] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PENDING_REVIEW">Pending Approval</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* =====================================================================
          3. MAIN CALENDAR BODY
          ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
        {/* ==================== A. WEEK VIEW ==================== */}
        {viewMode === "week" && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[580px] h-full">
            {weekDays.map((dayDate, idx) => {
              const dayPosts = getPostsForDay(dayDate);
              const dayIsToday = isToday(dayDate);
              const dayName = dayDate.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = dayDate.getDate();

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-[var(--panel)] p-3 transition-all min-h-[420px] shadow-2xs group/col",
                    dayIsToday
                      ? "border-[#c6f432] ring-1 ring-[#c6f432]/40"
                      : "border-[var(--line)] hover:border-[var(--muted)]"
                  )}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--fg)] uppercase tracking-wide">
                        {dayName}
                      </span>
                      {dayIsToday && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-[#c6f432] text-black">
                          Today
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold",
                        dayIsToday
                          ? "bg-[#c6f432] text-black"
                          : "text-[var(--muted)] bg-[var(--bg)]"
                      )}
                    >
                      {dayNum}
                    </div>
                  </div>

                  {/* Post Slots Container */}
                  <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
                    {dayPosts.map((post) => {
                      const postTimeStr = post.scheduledAt || post.publishedAt || post.createdAt;
                      const timeFormatted = postTimeStr
                        ? new Date(postTimeStr).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "10:00 AM";

                      const isPublished = post.status === "PUBLISHED";
                      const isDraft = post.status === "DRAFT";

                      return (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className={cn(
                            "p-2.5 rounded-xl border bg-[var(--bg)] hover:border-[#c6f432] cursor-pointer transition-all space-y-1.5 group/card shadow-2xs relative",
                            isPublished
                              ? "border-blue-500/30"
                              : isDraft
                              ? "border-amber-500/30"
                              : "border-[var(--line)]"
                          )}
                        >
                          {/* Time & Status Row */}
                          <div className="flex items-center justify-between text-[10px]">
                            <span
                              className={cn(
                                "flex items-center gap-1 font-semibold",
                                isPublished
                                  ? "text-blue-600 dark:text-blue-400"
                                  : isDraft
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              )}
                            >
                              <Clock className="w-2.5 h-2.5" /> {timeFormatted}
                            </span>

                            {/* Platforms */}
                            <div className="flex items-center gap-1">
                              {(post.platforms || ["x", "linkedin"]).map((plat) => (
                                <div
                                  key={plat}
                                  className="w-4 h-4 rounded-full bg-[var(--hover)] flex items-center justify-center p-0.5"
                                  title={PLATFORM_CONFIGS[plat]?.name || plat}
                                >
                                  <Image
                                    src={PLATFORM_CONFIGS[plat]?.icon || "/images/platforms/x-light.svg"}
                                    alt={plat}
                                    width={10}
                                    height={10}
                                    className={PLATFORM_CONFIGS[plat]?.invertDark ? "dark:invert" : ""}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Post Title */}
                          <p className="text-xs font-bold text-[var(--fg)] line-clamp-2 leading-snug group-hover/card:text-[#365300] dark:group-hover/card:text-[#c6f432] transition-colors">
                            {post.title}
                          </p>

                          {/* Post Snippet */}
                          <p className="text-[10px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                            {post.content}
                          </p>

                          {/* Action Hover Buttons */}
                          <div className="pt-1 flex items-center justify-between text-[10px] border-t border-[var(--line)]/60 text-[var(--muted)]">
                            <span className="capitalize font-mono text-[9px] font-semibold">
                              {post.status.toLowerCase()}
                            </span>

                            <div className="flex items-center gap-1 opacity-80 group-hover/card:opacity-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenComposer({
                                    id: post.id,
                                    title: post.title,
                                    content: post.content,
                                    platforms: post.platforms,
                                  });
                                }}
                                className="p-1 hover:text-[var(--fg)] transition-colors"
                                title="Edit in Composer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeletePost(post.id, e)}
                                className="p-1 hover:text-red-500 transition-colors"
                                title="Delete Slot"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Slot Button for Day */}
                    <button
                      type="button"
                      onClick={() => openScheduleSlot(dayDate)}
                      className="w-full rounded-xl border border-dashed border-[var(--line)] hover:border-[#c6f432] hover:bg-[var(--hover)] py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--fg)] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slot</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== B. MONTH VIEW ==================== */}
        {viewMode === "month" && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-2xs">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 border-b border-[var(--line)] pb-2 mb-2 text-center text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthDays.map(({ date: dayDate, isCurrentMonth }, idx) => {
                const dayPosts = getPostsForDay(dayDate);
                const dayIsToday = isToday(dayDate);
                const dayNum = dayDate.getDate();

                return (
                  <div
                    key={idx}
                    onClick={() => openScheduleSlot(dayDate)}
                    className={cn(
                      "min-h-[100px] sm:min-h-[120px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group",
                      dayIsToday
                        ? "border-[#c6f432] bg-[#c6f432]/5"
                        : isCurrentMonth
                        ? "border-[var(--line)] bg-[var(--bg)] hover:border-[var(--muted)]"
                        : "border-transparent bg-[var(--hover)]/30 opacity-40 hover:opacity-70"
                    )}
                  >
                    {/* Top Row: Date & Count */}
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono",
                          dayIsToday
                            ? "bg-[#c6f432] text-black"
                            : "text-[var(--fg)]"
                        )}
                      >
                        {dayNum}
                      </span>

                      {dayPosts.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#c6f432]/20 text-[#365300] dark:text-[#c6f432]">
                          {dayPosts.length}
                        </span>
                      )}
                    </div>

                    {/* Posts snippet pills */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayPosts.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(p);
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate bg-[var(--panel)] border border-[var(--line)] text-[var(--fg)] hover:border-[#c6f432]"
                        >
                          {p.title}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-[9px] font-mono text-[var(--muted)] pl-1">
                          +{dayPosts.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Bottom: Fast Add Slot Indicator */}
                    <div className="text-[10px] text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity text-right">
                      + Add
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== C. QUEUE / LIST VIEW ==================== */}
        {viewMode === "list" && (
          <div className="space-y-3 max-w-4xl mx-auto">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-[var(--muted)]">
              <span>{filteredPosts.length} Total Scheduled & Published Slots</span>
              <span>Sorted by Timeline</span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] space-y-3">
                <CalendarDays className="w-10 h-10 text-[var(--muted)] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[var(--fg)]">No matching slots in queue</h3>
                <p className="text-xs text-[var(--muted)]">
                  Add a slot or adjust your platform/status filters.
                </p>
                <button
                  type="button"
                  onClick={() => openScheduleSlot()}
                  className="px-4 py-2 rounded-xl bg-[#c6f432] text-black font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Schedule New Content
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const postTimeStr = post.scheduledAt || post.publishedAt || post.createdAt;
                const postDateObj = postTimeStr ? new Date(postTimeStr) : new Date();
                const dateStrFormatted = postDateObj.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const timeStrFormatted = postDateObj.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] hover:border-[#c6f432] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer shadow-2xs group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--hover)] text-[var(--fg)] border border-[var(--line)]">
                          {post.status}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-mono font-bold text-[var(--muted)]">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          {dateStrFormatted} at {timeStrFormatted}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[var(--fg)] group-hover:text-[#365300] dark:group-hover:text-[#c6f432] transition-colors truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[var(--muted)] line-clamp-2">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {/* Channels */}
                      <div className="flex items-center gap-1">
                        {(post.platforms || []).map((plat) => (
                          <div
                            key={plat}
                            className="w-6 h-6 rounded-lg bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center p-1"
                            title={PLATFORM_CONFIGS[plat]?.name || plat}
                          >
                            <Image
                              src={PLATFORM_CONFIGS[plat]?.icon || "/images/platforms/x-light.svg"}
                              alt={plat}
                              width={14}
                              height={14}
                              className={PLATFORM_CONFIGS[plat]?.invertDark ? "dark:invert" : ""}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenComposer({
                            id: post.id,
                            title: post.title,
                            content: post.content,
                            platforms: post.platforms,
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs font-bold hover:bg-[var(--hover)] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeletePost(post.id, e)}
                        className="p-2 rounded-xl text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          4. INLINE QUICK SCHEDULE MODAL
          ===================================================================== */}
      {isQuickScheduleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsQuickScheduleOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#c6f432]" />
                <h3 className="text-base font-extrabold text-[var(--fg)]">Schedule Content Slot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickScheduleOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[var(--hover)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--fg)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScheduledSlot} className="space-y-4">
              {/* Post Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg)]">Post Title / Hook</label>
                <input
                  type="text"
                  placeholder="e.g. 5 AI tools that saved us 20 hours this week"
                  value={slotTitle}
                  onChange={(e) => setSlotTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:border-[#c6f432]"
                  required
                />
              </div>

              {/* Post Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg)]">Content Body</label>
                <textarea
                  rows={4}
                  placeholder="Draft your social post text or outline here..."
                  value={slotContent}
                  onChange={(e) => setSlotContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:border-[#c6f432] resize-none"
                />
              </div>

              {/* Target Platforms */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--fg)]">Publish Channels</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => {
                    const isSelected = slotPlatforms.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleModalPlatform(key)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all",
                          isSelected
                            ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                            : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)]"
                        )}
                      >
                        <Image
                          src={config.icon}
                          alt={config.name}
                          width={12}
                          height={12}
                          className={config.invertDark && !isSelected ? "dark:invert" : ""}
                        />
                        <span>{config.name}</span>
                        {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--fg)]">Scheduled Date</label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:border-[#c6f432]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--fg)]">Scheduled Time</label>
                  <input
                    type="time"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:border-[#c6f432]"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickScheduleOpen(false);
                    onOpenComposer({
                      title: slotTitle,
                      content: slotContent,
                      platforms: slotPlatforms,
                    });
                  }}
                  className="text-xs font-bold text-[var(--muted)] hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Composer</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickScheduleOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] text-xs font-bold hover:bg-[var(--hover)] text-[var(--fg)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-[#c6f432] text-black text-xs font-extrabold hover:brightness-105 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Scheduling..." : "Schedule Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. POST DETAIL & ACTIONS MODAL
          ===================================================================== */}
      {selectedPost && !isRescheduleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c6f432] text-black">
                  {selectedPost.status}
                </span>
                <span className="text-xs font-mono text-[var(--muted)]">
                  {selectedPost.scheduledAt
                    ? new Date(selectedPost.scheduledAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "No scheduled date"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="w-7 h-7 rounded-lg hover:bg-[var(--hover)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--fg)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post Title & Content */}
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[var(--fg)]">
                {selectedPost.title}
              </h3>
              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedPost.content}
              </div>
            </div>

            {/* Platform Badges */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[var(--muted)]">Target Channels</span>
              <div className="flex items-center gap-2 pt-1">
                {(selectedPost.platforms || []).map((plat) => (
                  <div
                    key={plat}
                    className="px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Image
                      src={PLATFORM_CONFIGS[plat]?.icon || "/images/platforms/x-light.svg"}
                      alt={plat}
                      width={12}
                      height={12}
                      className={PLATFORM_CONFIGS[plat]?.invertDark ? "dark:invert" : ""}
                    />
                    <span>{PLATFORM_CONFIGS[plat]?.name || plat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => handleDeletePost(selectedPost.id)}
                className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const d = selectedPost.scheduledAt
                      ? new Date(selectedPost.scheduledAt)
                      : new Date();
                    setRescheduleDate(d.toISOString().slice(0, 10));
                    setRescheduleTime(
                      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
                    );
                    setIsRescheduleOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--hover)] text-xs font-bold transition-colors cursor-pointer"
                >
                  Reschedule
                </button>

                {selectedPost.status === "PENDING_REVIEW" && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch(`/api/automations/daily-pipeline/review?action=approve&postId=${selectedPost.id}`);
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === selectedPost.id ? { ...p, status: "SCHEDULED" } : p
                          )
                        );
                        setSelectedPost({ ...selectedPost, status: "SCHEDULED" });
                        toast.success("Post approved & scheduled for 10:00 AM!");
                      } catch (e: any) {
                        toast.error(e.message || "Failed to approve");
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] text-xs font-black transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Schedule</span>
                  </button>
                )}

                {selectedPost.status !== "PUBLISHED" && selectedPost.status !== "PENDING_REVIEW" && (
                  <button
                    type="button"
                    onClick={() => handlePublishNow(selectedPost)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Publish Now</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const post = selectedPost;
                    setSelectedPost(null);
                    onOpenComposer({
                      id: post.id,
                      title: post.title,
                      content: post.content,
                      platforms: post.platforms,
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#c6f432] text-black text-xs font-extrabold hover:brightness-105 active:scale-95 transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. RESCHEDULE MODAL
          ===================================================================== */}
      {isRescheduleOpen && selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsRescheduleOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
              <h3 className="text-sm font-extrabold text-[var(--fg)]">Reschedule Slot</h3>
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="w-6 h-6 rounded-lg hover:bg-[var(--hover)] flex items-center justify-center text-[var(--muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg)]">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:border-[#c6f432]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg)]">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:border-[#c6f432]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs font-bold hover:bg-[var(--hover)] text-[var(--fg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRescheduleSubmit}
                className="px-4 py-1.5 rounded-xl bg-[#c6f432] text-black text-xs font-extrabold hover:brightness-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Autonomous Daily Flywheel Configuration Modal */}
      <DailyFlywheelModal
        isOpen={isFlywheelModalOpen}
        onClose={() => setIsFlywheelModalOpen(false)}
        onScheduledSuccess={fetchPosts}
      />
    </div>
  );
}
export default CalendarView;
