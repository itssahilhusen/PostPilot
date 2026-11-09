"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Eye,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  PageHeader,
  CalendarViewType,
  PageToolbar,
  CalendarCard,
  CalendarPostItem,
  ContentCard,
  EmptyState,
  PostDetailDrawer,
  AddSlotModal,
  DailyFlywheelDrawer,
  ConfirmationDialog,
  StatusBadge,
  PrimaryButton,
  SecondaryButton,
} from "@/components/design-system";

interface CalendarViewProps {
  onOpenComposer?: (post?: any) => void;
}

export function CalendarView({ onOpenComposer }: CalendarViewProps) {
  // Navigation & View States
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewType>("week");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Posts State
  const [posts, setPosts] = useState<CalendarPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Drawers State
  const [selectedPost, setSelectedPost] = useState<CalendarPostItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [isFlywheelOpen, setIsFlywheelOpen] = useState(false);
  const [slotPrefillDate, setSlotPrefillDate] = useState<string>("");
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Fetch / Seed Posts
  const seedFallbackPosts = useCallback(() => {
    const today = new Date();
    // Monday of current week
    const currentDay = today.getDay();
    const diffToMon = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMon));

    const makeDate = (dayOffset: number, hours: number, minutes: number) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + dayOffset);
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    };

    // Reference screenshot high-fidelity post items:
    const seeds: CalendarPostItem[] = [
      {
        id: "seed_1",
        title: "Meet the new eau de parfum collection",
        content: "Crafted with rare natural essences and cold-pressed botanical oils. Discover our limited series online today.\n\n#newdrop #botanical #fragrance #luxury",
        status: "SCHEDULED",
        platforms: ["threads", "x"],
        scheduledAt: makeDate(0, 9, 0), // Mon 09:00
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=450&fit=crop",
        tag: "#newdrop",
        authorName: "Nevo David",
        authorHandle: "@nevo_david",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "seed_2",
        title: "We're partnering with world-class distillers",
        content: "Amber reserve edition. 100 numbered decanters dropping this Tuesday at 08:30 AM exclusively for members.\n\n#limited #reserve #parfum",
        status: "SCHEDULED",
        platforms: ["threads", "x", "linkedin"],
        scheduledAt: makeDate(1, 8, 30), // Tue 08:30
        image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&h=450&fit=crop",
        tag: "#limited",
        authorName: "Nevo David",
        authorHandle: "@nevo_david",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "seed_3",
        title: "Discover our new 30-day botanical extract",
        content: "Formulated without synthetic stabilizers. Designed for long-lasting sillage throughout your workday.\n\n#discovery #wellness #cleanbeauty",
        status: "SCHEDULED",
        platforms: ["linkedin", "threads"],
        scheduledAt: makeDate(0, 10, 30), // Mon 10:30
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=450&fit=crop",
        tag: "#discovery",
        authorName: "Nova Clay",
        authorHandle: "@nova_clay",
        authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "seed_4",
        title: "Limited bottle, weekend release exclusive",
        content: "Smoky cedarwood & dark plum. Available at select concept stores across Paris and Tokyo.\n\n#limited #specialedition #tokyo",
        status: "SCHEDULED",
        platforms: ["linkedin", "instagram"],
        scheduledAt: makeDate(2, 11, 0), // Wed 11:00
        image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&h=450&fit=crop",
        tag: "#limited",
        authorName: "Nova Clay",
        authorHandle: "@nova_clay",
        authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "seed_5",
        title: "New collection drops in flagship stores",
        content: "Experience the complete fragrance bar at Acme Co flagship locations starting this Thursday.\n\n#teaser #design #architecture",
        status: "SCHEDULED",
        platforms: ["x", "threads"],
        scheduledAt: makeDate(3, 9, 30), // Thu 09:30
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=450&fit=crop",
        tag: "#teaser",
        authorName: "Acme Co",
        authorHandle: "@acme_co",
        authorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
      },
      {
        id: "seed_6",
        title: "Behind the Scent: Creative Direction Q&A",
        content: "Over the last 6 months our perfumers and visual team created 14 bespoke fragrance chords.\n\n#behindthescenes #storytelling",
        status: "PUBLISHED",
        platforms: ["x", "linkedin"],
        scheduledAt: makeDate(-2, 14, 0),
        publishedAt: makeDate(-2, 14, 0),
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=450&fit=crop",
        tag: "#published",
        authorName: "Nevo David",
        authorHandle: "@nevo_david",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
    ];

    setPosts(seeds);
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
        // Map backend posts and fill visual fallbacks if missing
        const mapped: CalendarPostItem[] = data.posts.map((p: any, idx: number) => ({
          ...p,
          status: p.status || "SCHEDULED",
          platforms: Array.isArray(p.platforms) ? p.platforms : ["x", "linkedin"],
          image:
            p.mediaUrls?.[0] ||
            p.image ||
            (idx % 2 === 0
              ? "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=450&fit=crop"
              : "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&h=450&fit=crop"),
          tag: p.title?.toLowerCase().includes("limited") ? "#limited" : "#newdrop",
          authorName: p.authorName || "Nevo David",
          authorHandle: p.authorHandle || "@nevo_david",
          authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        }));
        setPosts(mapped);
      } else {
        seedFallbackPosts();
      }
    } catch (err) {
      console.warn("Falling back to seed schedule:", err);
      seedFallbackPosts();
    } finally {
      setIsLoading(false);
    }
  }, [seedFallbackPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Calendar Helpers (Week View)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0 is Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
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

    // Trailing days to fill 35 grid
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
    } else if (viewMode === "day") {
      next.setDate(next.getDate() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === "day") {
      next.setDate(next.getDate() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header display string (e.g. August 2026 v matching reference screenshot)
  const dateRangeLabel = useMemo(() => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
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

  // Filter Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Channel Filter
      if (selectedChannel !== "all") {
        if (!p.platforms || !p.platforms.includes(selectedChannel)) {
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
  }, [posts, selectedChannel, selectedStatus, searchQuery]);

  // Posts for day
  const getPostsForDay = (day: Date) => {
    return filteredPosts.filter((p) => {
      const dateStr = p.scheduledAt || p.publishedAt || p.createdAt;
      if (!dateStr) return false;
      const postDate = new Date(dateStr);
      return isSameDay(postDate, day);
    });
  };

  // Open Add Slot with Date
  const handleOpenAddSlotForDay = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setSlotPrefillDate(`${yyyy}-${mm}-${dd}`);
    setIsAddSlotOpen(true);
  };

  // Open Add Slot Generic
  const handleOpenScheduleSlot = () => {
    setSlotPrefillDate(new Date().toISOString().split("T")[0]);
    setIsAddSlotOpen(true);
  };

  // Slot Added Success Handler
  const handleSlotAdded = (newPost: CalendarPostItem) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Delete Action
  const handleDeletePost = async (id: string) => {
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Delete local fallback:", err);
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Post removed from schedule");
  };

  // Publish Now Action
  const handlePublishNow = async (post: CalendarPostItem) => {
    try {
      await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
    } catch (err) {
      console.warn("Publish patch fallback:", err);
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, status: "PUBLISHED" as const, publishedAt: new Date().toISOString() }
          : p
      )
    );
    toast.success("Post published across selected channels!");
  };

  // Dynamic Metrics
  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;

  // Time Axis slots for the week view (08:00 to 18:00 matching reference screenshot)
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)] font-sans text-[var(--foreground)] select-none">
      {/* 1. Page Header */}
      <PageHeader
        title="Content Calendar"
        badge="Scheduling Hub"
        subtitle="Plan, schedule, and automate multi-channel releases."
        dateLabel={dateRangeLabel}
        onPrevDate={handlePrev}
        onNextDate={handleNext}
        onToday={handleToday}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onDailyFlywheel={() => setIsFlywheelOpen(true)}
        onScheduleSlot={handleOpenScheduleSlot}
        primaryActionLabel="Schedule Slot"
      />

      {/* 2. Publishing Statistics & Filters Toolbar */}
      <PageToolbar
        stats={{
          scheduledCount,
          publishedCount,
          bestTimes: ["10:00 AM", "6:30 PM"],
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery("")}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* 3. Main Calendar Views */}
      <div className="flex-1 overflow-auto bg-[var(--background)] relative">
        {/* =====================================================================
            VIEW 1: WEEK VIEW (Pixel-perfect replica of reference screenshot)
            ===================================================================== */}
        {viewMode === "week" && (
          <div className="min-w-[960px] h-full flex flex-col p-4 sm:p-6 overflow-x-auto">
            {/* Week Columns Header Grid */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-3 mb-3 shrink-0">
              {/* Empty gutter for time column */}
              <div />

              {/* Day column headers */}
              {weekDays.map((day, idx) => {
                const todayFlag = isToday(day);
                const dayPosts = getPostsForDay(day);

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border bg-[var(--surface)] transition-all",
                      todayFlag
                        ? "border-[#C5F52A] shadow-[0_0_15px_-3px_rgba(197,245,42,0.25)] ring-1 ring-[#C5F52A]/50"
                        : "border-[var(--border)]"
                    )}
                  >
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span className="text-base font-bold font-mono text-[var(--foreground)]">
                        {day.getDate()}
                      </span>
                      <span className="text-xs font-semibold text-[var(--muted)] uppercase truncate">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      {todayFlag && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5F52A] shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {dayPosts.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#C5F52A]/15 text-[#C5F52A] border border-[#C5F52A]/30">
                          {dayPosts.length}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenAddSlotForDay(day)}
                        className="w-6 h-6 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)]/80 text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors cursor-pointer"
                        title="Add slot for this day"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Grid Matrix */}
            <div className="relative flex-1 min-h-[640px] border border-[var(--border)] rounded-2xl bg-[var(--surface)] overflow-hidden">
              {/* Horizontal Time Lines Background */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2">
                {timeSlots.map((time, idx) => (
                  <div key={idx} className="flex items-center w-full border-b border-dashed border-[var(--border)]/40 h-14">
                    <span className="w-14 pl-3 text-[11px] font-mono text-[var(--muted)] shrink-0 select-none">
                      {time}
                    </span>
                    <div className="flex-1 h-full" />
                  </div>
                ))}
              </div>

              {/* 7 Columns Container */}
              <div className="relative z-10 grid grid-cols-[60px_repeat(7,1fr)] h-full min-h-[640px]">
                {/* Time Axis Gutter */}
                <div className="w-[60px]" />

                {/* Day Columns */}
                {weekDays.map((day, colIdx) => {
                  const dayPosts = getPostsForDay(day);
                  const todayFlag = isToday(day);

                  return (
                    <div
                      key={colIdx}
                      className={cn(
                        "relative flex flex-col gap-3 p-2 border-l border-[var(--border)]/60 min-h-full transition-colors",
                        todayFlag && "bg-[#C5F52A]/[0.015]"
                      )}
                    >
                      {dayPosts.map((post) => (
                        <CalendarCard
                          key={post.id}
                          post={post}
                          onClick={(p) => {
                            setSelectedPost(p);
                            setIsDetailOpen(true);
                          }}
                          onEdit={(p) => {
                            if (onOpenComposer) {
                              onOpenComposer(p);
                            } else {
                              setSelectedPost(p);
                              setIsDetailOpen(true);
                            }
                          }}
                          onDelete={(id, e) => {
                            e.stopPropagation();
                            setDeleteCandidateId(id);
                          }}
                          onPublishNow={(p, e) => {
                            e.stopPropagation();
                            handlePublishNow(p);
                          }}
                        />
                      ))}

                      {/* Empty Column Guide */}
                      {dayPosts.length === 0 && (
                        <div
                          onClick={() => handleOpenAddSlotForDay(day)}
                          className="flex-1 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-transparent hover:border-[var(--border)]/80 rounded-xl transition-all cursor-pointer group"
                        >
                          <Plus className="w-4 h-4 text-[var(--muted)] group-hover:text-[#C5F52A] group-hover:scale-125 transition-all opacity-0 group-hover:opacity-100" />
                          <span className="text-[10px] text-[var(--muted)] group-hover:text-[var(--foreground)] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Add Slot
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: MONTH VIEW
            ===================================================================== */}
        {viewMode === "month" && (
          <div className="min-w-[800px] p-4 sm:p-6 flex flex-col h-full">
            {/* Month Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                <div key={i} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Month Grid Cells */}
            <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
              {monthDays.map((cell, idx) => {
                const dayPosts = getPostsForDay(cell.date);
                const todayFlag = isToday(cell.date);

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenAddSlotForDay(cell.date)}
                    className={cn(
                      "flex flex-col p-2.5 rounded-2xl border transition-all cursor-pointer min-h-[105px]",
                      todayFlag
                        ? "bg-[var(--surface)] border-[#C5F52A] ring-1 ring-[#C5F52A]/50 shadow-xs"
                        : cell.isCurrentMonth
                        ? "bg-[var(--surface)] border-[var(--border)] hover:border-[#C5F52A]/40"
                        : "bg-[var(--surface-secondary)]/30 border-[var(--border)]/40 opacity-40"
                    )}
                  >
                    <div className="flex items-center justify-between pb-1.5">
                      <span
                        className={cn(
                          "text-xs font-bold font-mono",
                          todayFlag ? "text-[#C5F52A]" : "text-[var(--foreground)]"
                        )}
                      >
                        {cell.date.getDate()}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono bg-[#C5F52A]/15 text-[#C5F52A]">
                          {dayPosts.length}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 overflow-hidden">
                      {dayPosts.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(p);
                            setIsDetailOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-[10px] font-semibold text-[var(--foreground)] truncate hover:border-[#C5F52A]/50 transition-colors"
                        >
                          {p.title}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <span className="text-[9px] text-[var(--muted)] font-bold pl-1">
                          +{dayPosts.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 3: DAY VIEW (Chronological Daily Timeline)
            ===================================================================== */}
        {viewMode === "day" && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {getPostsForDay(currentDate).length} posts scheduled for this day
                </p>
              </div>

              <PrimaryButton
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => handleOpenAddSlotForDay(currentDate)}
              >
                Add Slot
              </PrimaryButton>
            </div>

            {/* Timeline */}
            <div className="flex flex-col gap-3">
              {getPostsForDay(currentDate).length === 0 ? (
                <EmptyState
                  title="No posts scheduled today"
                  description="Keep your cadence consistent by adding a post or generating a carousel with the AI engine."
                  actionLabel="Schedule Post"
                  onAction={() => handleOpenAddSlotForDay(currentDate)}
                />
              ) : (
                getPostsForDay(currentDate).map((post) => (
                  <ContentCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    excerpt={post.content}
                    status={post.status}
                    platforms={post.platforms}
                    image={post.image}
                    category={post.tag}
                    authorName={post.authorName}
                    authorAvatar={post.authorAvatar}
                    onClick={() => {
                      setSelectedPost(post);
                      setIsDetailOpen(true);
                    }}
                    actions={
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishNow(post);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#C5F52A]/15 hover:bg-[#C5F52A]/25 text-[#C5F52A] text-xs font-bold transition-colors cursor-pointer"
                        >
                          Publish Now
                        </button>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 4: QUEUE VIEW (Upcoming Scheduled Posts List)
            ===================================================================== */}
        {viewMode === "queue" && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">Upcoming Post Queue</h3>
                <p className="text-xs text-[var(--muted)]">
                  Chronological pipeline of all scheduled releases
                </p>
              </div>

              <PrimaryButton
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleOpenScheduleSlot}
              >
                Add to Queue
              </PrimaryButton>
            </div>

            <div className="flex flex-col gap-3">
              {filteredPosts.length === 0 ? (
                <EmptyState
                  title="Your queue is clear"
                  description="There are no posts currently in your publishing queue."
                  actionLabel="Schedule a Slot"
                  onAction={handleOpenScheduleSlot}
                />
              ) : (
                filteredPosts.map((post) => (
                  <ContentCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    excerpt={post.content}
                    status={post.status}
                    platforms={post.platforms}
                    image={post.image}
                    category={post.tag}
                    authorName={post.authorName}
                    authorAvatar={post.authorAvatar}
                    date={post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : undefined}
                    onClick={() => {
                      setSelectedPost(post);
                      setIsDetailOpen(true);
                    }}
                    actions={
                      <div className="flex items-center gap-2">
                        {post.status !== "PUBLISHED" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublishNow(post);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#C5F52A]/15 hover:bg-[#C5F52A]/25 text-[#C5F52A] text-xs font-bold transition-colors cursor-pointer"
                          >
                            Publish Now
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCandidateId(post.id);
                          }}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    }
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <PostDetailDrawer
        post={selectedPost}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPost(null);
        }}
        onDelete={(id) => handleDeletePost(id)}
        onPublishNow={(p) => handlePublishNow(p)}
      />

      {/* Add Slot Modal */}
      <AddSlotModal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        initialDate={slotPrefillDate}
        onSuccess={handleSlotAdded}
      />

      {/* Daily Flywheel Drawer */}
      <DailyFlywheelDrawer
        isOpen={isFlywheelOpen}
        onClose={() => setIsFlywheelOpen(false)}
        availableProjectsCount={posts.length + 8}
        approvedDraftsCount={posts.filter((p) => p.status === "SCHEDULED").length}
        upcomingScheduledCount={scheduledCount}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteCandidateId)}
        onClose={() => setDeleteCandidateId(null)}
        onConfirm={() => {
          if (deleteCandidateId) {
            handleDeletePost(deleteCandidateId);
            setDeleteCandidateId(null);
          }
        }}
        title="Delete Scheduled Slot"
        message="Are you sure you want to remove this post from your schedule? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}

export default CalendarView;
