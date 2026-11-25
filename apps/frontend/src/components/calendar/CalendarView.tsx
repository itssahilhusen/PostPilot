"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Channel,
  ScheduledPost,
  TIME_SLOTS,
  TIMEZONES,
} from "@/lib/calendar-data";
import { isSlide, renderSlide } from "./render-carousel";
import { AutoAntsReview } from "./AutoAntsReview";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AddChannelModal, ChannelPlatform } from "./AddChannelModal";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List as ListIcon,
  Plus,
  Clock,
  Sparkles,
  Search,
  MoreVertical,
  Check,
  X,
} from "lucide-react";

interface CalendarPost {
  id: string;
  title: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  platforms: string[];
  mediaUrls: string[];
  deliveries: { accountId: string; status: string; failureReason: string | null }[];
}

export function CalendarView() {
  const addToast = ({
    title,
    description,
    variant = "success",
  }: {
    title: string;
    description?: string;
    variant?: "success" | "error" | "info";
  }) => {
    const message = description ? `${title}: ${description}` : title;
    toast[variant](message);
  };

  // State with instant SWR cache initialization
  const [channels, setChannels] = useState<Channel[]>(
    []
  );
  const [channelsError, setChannelsError] = useState("");
  const metaBackend =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");

  useEffect(() => {
    const callback = new URL(window.location.href);
    const threads = callback.searchParams.get("threads");
    if (threads) {
      if (threads === "connected") toast.success("Threads channel connected");
      else toast.error(threads === "unconfigured" ? "Configure Threads app credentials to connect this channel" : "Threads authorization was not completed");
      callback.searchParams.delete("threads");
      window.history.replaceState(window.history.state, "", callback);
    }
    const result = callback.searchParams.get("meta");
    const messages: Record<string, string> = {
      connected:
        "Meta connection complete. Your Facebook and Instagram accounts are loading.",
      no_pages:
        "Meta granted Page-list permission, but returned no Pages. Sign in with a Facebook user who manages a Page and select that Page during authorization.",
      missing_pages_permission:
        "Meta did not grant pages_show_list. Add Page access and this permission to the Facebook Login for Business configuration, then reconnect.",
      page_access_missing:
        "Meta listed a Page but did not provide a usable Page token. Check Page asset access and the configuration's Page permissions, then reconnect.",
      denied: "Meta authorization was cancelled or denied.",
      missing_code: "Meta did not return an authorization code. Please try again.",
      code_exchange_failed:
        "Meta could not exchange the authorization code. Check your callback URL and Meta app configuration.",
      error: "Meta connection failed. Please try again or check the backend logs.",
    };
    if (result) {
      const message = messages[result] || "Meta connection could not be completed.";
      const type = result === "connected" ? "success" : result === "denied" ? "info" : "error";
      toast[type](message, { duration: 8000 });

      const url = new URL(window.location.href);
      url.searchParams.delete("meta");
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/accounts", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load connected accounts");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const linked: Channel[] = (data.accounts || [])
          .filter(
            (account: { provider: string; status: string }) =>
              ["facebook", "instagram", "threads"].includes(account.provider) &&
              account.status === "active"
          )
          .map(
            (account: {
              id: string;
              name: string;
              handle: string;
              avatar?: string | null;
              provider: "facebook" | "instagram" | "threads";
            }) => ({
              id: account.id,
              name: account.name,
              handle: account.handle,
              platform: account.provider,
              avatarUrl: account.avatar || "/brand/postpilot-logo.png",
              badgeBg:
                account.provider === "instagram" ? "bg-[#E1306C]" : "bg-[#1877F2]",
              badgeIcon: account.provider === "instagram" ? "📷" : account.provider === "threads" ? "@" : "f",
            })
          );
        setChannels(linked);
        setChannelsError("");
      })
      .catch((error) => {
        if (active) setChannelsError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [rawPosts, setRawPosts] = useState<CalendarPost[]>([]);
  const requestNumber = useRef(0);
  const [postsError, setPostsError] = useState("");

  // Navigation Date & Mode States
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => currentDate.getFullYear());
  const monthPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPickerYear(currentDate.getFullYear());
  }, [currentDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target as Node)
      ) {
        setIsMonthPickerOpen(false);
      }
    }
    if (isMonthPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMonthPickerOpen]);

  // Load Posts from Backend API
  const loadPosts = useCallback(
    async (_force = false) => {
      const number = ++requestNumber.current;
      try {
        const query = selectedChannelId ? "?channel_id=" + encodeURIComponent(selectedChannelId) : "";
        const response = await fetch("/api/posts" + query, { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load scheduled posts");
        const data = await response.json();
        const list = data.posts || [];
        if (number !== requestNumber.current) return;
        setRawPosts(list);

        setPostsError("");
      } catch (error) {
        if (number !== requestNumber.current) return;
        setPostsError(
          error instanceof Error ? error.message : "Could not load posts"
        );
      }
    },
    [selectedChannelId]
  );

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  // Calendar Helpers (7-day Week Matrix)
  const weekGridDays = useMemo(() => {
    const d = new Date(currentDate);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 is Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(d);
    monday.setDate(diff);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return {
        date,
        dateStr,
        dayNumber: date.getDate(),
        dayName: date.toLocaleDateString(undefined, { weekday: "short" }),
        fullDayName: date.toLocaleDateString(undefined, { weekday: "long" }),
        isToday: date.getTime() === today.getTime(),
        isPast: date.getTime() < today.getTime(),
      };
    });
  }, [currentDate]);

  // Calendar Helpers (Accurate Month Grid: 35 or 42 cells starting Monday)
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0, ..., Sunday = 6
    let firstDayIndex = firstDay.getDay();
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: {
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
    }[] = [];

    // Leading days from previous month
    for (let i = firstDayIndex; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isPast: d.getTime() < today.getTime(),
      });
    }

    // Days in current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      d.setHours(0, 0, 0, 0);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: d.getTime() === today.getTime(),
        isPast: d.getTime() < today.getTime(),
      });
    }

    // Trailing days to fill full rows (35 or 42)
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      d.setHours(0, 0, 0, 0);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isPast: d.getTime() < today.getTime(),
      });
    }

    return days;
  }, [currentDate]);

  // Formatted header label
  const formattedHeaderLabel = useMemo(() => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    if (viewMode === "week") {
      const start = weekGridDays[0]?.date;
      const end = weekGridDays[6]?.date;
      if (start && end) {
        if (start.getMonth() === end.getMonth()) {
          return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
        }
        return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      }
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return currentDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [currentDate, viewMode, weekGridDays]);

  // Unified post mapper with fallback seeds
  const scheduledPosts = useMemo(() => {
    return rawPosts.filter(post => post.scheduledAt && post.status !== "CANCELLED")
      .map(post => {
          const date = new Date(post.scheduledAt!);
          const ids = post.deliveries.map(d => d.accountId);
          const channel = channels.find(c => c.id === (selectedChannelId || ids[0]));
          const platform = channel?.platform || post.platforms[0] || "instagram";
          const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const dayIndex = weekGridDays.findIndex((day) => day.dateStr === localDate);
          const hour = date.getHours();

          return {
            id: post.id,
            channelId: channel?.id || "",
            channelIds: ids,
            authorName: channel?.name || "PostPilot Brand",
            authorHandle: channel?.handle || "@postpilot_hq",
            authorAvatar:
              channel?.avatarUrl || "/brand/postpilot-logo.png",
            platform: (platform === "x" ? "twitter" : platform) as ScheduledPost["platform"],
            platformBadgeBg:
              channel?.badgeBg ||
              (platform === "instagram"
                ? "bg-[#E1306C]"
                : platform === "facebook"
                ? "bg-[#1877F2]"
                : "bg-neutral-800"),
            platformBadgeIcon:
              channel?.badgeIcon ||
              (platform === "instagram" ? "📷" : platform === "facebook" ? "f" : "•"),
            dateObj: date,
            dateStr: localDate,
            dayIndex,
            dayNumber: date.getDate(),
            dayName: date.toLocaleDateString(undefined, { weekday: "short" }),
            timeSlot: date.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            }),
            topOffset: Math.max(
              0,
              Math.min(
                450,
                (hour - 8) * 112 + Math.round((date.getMinutes() * 112) / 60)
              )
            ),
            imageUrl: post.mediaUrls?.[0] || "",
            imageAlt: post.title,
            caption: post.title || post.content.slice(0, 40),
            fullCaption: post.content,
            tag: post.status?.toLowerCase().replaceAll("_", " ") || "#post",
            status: (post.status?.toLowerCase() ||
              "scheduled") as ScheduledPost["status"],
            scheduledTime: date.toLocaleString(),
          };
        }
      );
  }, [rawPosts, channels, weekGridDays, selectedChannelId]);

  // Settings
  const [scheduleFreq, setScheduleFreq] = useState<"daily" | "3x_week" | "custom">(
    "daily"
  );
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    "GMT+1 · Auto-detected"
  );
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [autoSuggestTime, setAutoSuggestTime] = useState(true);
  const [autoRecycleEvergreen, setAutoRecycleEvergreen] = useState(false);

  // Modals
  const [activeModalPost, setActiveModalPost] = useState<ScheduledPost | null>(
    null
  );
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [showManageChannelsModal, setShowManageChannelsModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  useEffect(() => { if (new URLSearchParams(location.search).has("review")) setShowAgentModal(true); }, []);
  const [selectedDateForNewPost, setSelectedDateForNewPost] = useState<string>("");

  // Tablet / Mobile Signal Array toggle
  const [showMobileSignalArray, setShowMobileSignalArray] = useState(false);

  // Card Context Menu
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // Filtered posts
  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId);
  const displayedPosts = useMemo(() => {
    return selectedChannel
      ? scheduledPosts.filter((post) => post.channelIds.includes(selectedChannel.id))
      : scheduledPosts;
  }, [scheduledPosts, selectedChannel]);

  // List View search query
  const [listSearchQuery, setListSearchQuery] = useState("");

  // New Post Form State
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostTag, setNewPostTag] = useState("#brand");
  const [newPostChannelIds, setNewPostChannelIds] = useState<string[]>([]);
  const [mediaText, setMediaText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [slides, setSlides] = useState<{ title: string; body: string }[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const closeComposer = () => { if (uploading) return; setShowNewPostModal(false); setReviewId(null); setSlides([]); setNewPostCaption(""); setMediaText(""); };
  const [newPostTime, setNewPostTime] = useState("09:00");
  const [newPostDate, setNewPostDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  // Navigation Handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentDate(today);
  };

  const handleToggleChannelFilter = (channelId: string) => {
    if (selectedChannelId === channelId) {
      setSelectedChannelId(null);
      addToast({
        title: "Filter Cleared",
        description: "Showing scheduled posts for all channels",
        variant: "info",
      });
    } else {
      setSelectedChannelId(channelId);
      const ch = channels.find((c) => c.id === channelId);
      addToast({
        title: "Channel Filtered",
        description: `Showing posts for ${ch?.name || "this channel"}.`,
        variant: "info",
      });
    }
  };

  const handleCreateChannel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (metaBackend) {
      window.location.assign(
        `${metaBackend}/api/integrations/meta/connect?returnTo=calendar`
      );
    } else {
      addToast({
        title: "Meta backend unavailable",
        description: "Configure NEXT_PUBLIC_BACKEND_URL",
        variant: "error",
      });
    }
  };

  const handleSelectPlatform = (platform: ChannelPlatform) => {
    if (platform.id === "threads") {
      window.location.assign("/api/integrations/threads/connect");
      return;
    }
    if (platform.isMeta) {
      handleCreateChannel();
    } else {
      addToast({
        title: `${platform.name} Connection`,
        description: `Connecting ${platform.name} will be available once the platform credentials and OAuth are configured.`,
        variant: "info",
      });
    }
  };

  const handleDisconnectChannel = async (channel: Channel) => {
    try {
      const response = await fetch(
        `/api/accounts?id=${encodeURIComponent(channel.id)}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Could not disconnect channel");
      setChannels((current) => current.filter((item) => item.id !== channel.id));
      if (selectedChannelId === channel.id) setSelectedChannelId(null);
      addToast({ title: "Channel disconnected", description: channel.name });
    } catch {
      addToast({
        title: "Disconnect failed",
        description: "Please try again",
        variant: "error",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    const post = scheduledPosts.find((item) => item.id === postId);
    if (!post) return;
    try {
      const response =
        post.status === "draft"
          ? await fetch(`/api/posts/${encodeURIComponent(postId)}`, {
              method: "DELETE",
            })
          : await fetch(`/api/posts/${encodeURIComponent(postId)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "CANCELLED" }),
            });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => null))?.error ||
            "Could not change post"
        );
      setActiveModalPost(null);
      await loadPosts(true);
      addToast({
        title: post.status === "draft" ? "Draft deleted" : "Schedule cancelled",
      });
    } catch (error) {
      addToast({
        title: "Post update failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "error",
      });
    }
  };

  async function publishNow(post: ScheduledPost) {
    try {
      const res = await fetch("/api/posts/" + encodeURIComponent(post.id), {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SCHEDULED", scheduledAt: new Date(Date.now() + 5000).toISOString() }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Could not queue publication");
      toast.success("Queued for publication");
      setActiveModalPost(null);
      await loadPosts(true);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not queue publication"); }
    setOpenMenuPostId(null);
  }
  const handleDuplicatePost = async (post: ScheduledPost) => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.caption,
          content: post.fullCaption,
          channelIds: rawPosts.find(item => item.id === post.id)?.deliveries.map(d => d.accountId),
          mediaUrls: rawPosts.find(item => item.id === post.id)?.mediaUrls,
          platforms: [post.platform === "twitter" ? "x" : post.platform],
          status: "DRAFT",
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => null))?.error ||
            "Could not duplicate post"
        );
      addToast({ title: "Draft duplicated" });
      setActiveModalPost(null);
      await loadPosts(true);
    } catch (error) {
      addToast({
        title: "Duplicate failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "error",
      });
    }
  };

  async function attachFiles(files: File[]) {
    if (!files.length || uploading) return;
    if (files.length + mediaText.trim().split(/\s+/).filter(Boolean).length > 10) { toast.error("Attach up to ten files"); return; }
    setUploading(true);
    try {
      for (const file of files) {
        const response = await fetch("/api/media/publish-upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: file.type, bytes: file.size }) });
        const asset = await response.json();
        if (!response.ok) throw new Error(asset.error || "Could not start upload");
        const uploaded = await fetch(asset.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!uploaded.ok) throw new Error("Could not upload " + file.name);
        setMediaText(previous => [previous.trim(), asset.publicUrl].filter(Boolean).join("\n"));
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed"); }
    finally { setUploading(false); }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || uploading) return;
    const dateToSchedule = selectedDateForNewPost || newPostDate;

    if (!newPostChannelIds.length || !dateToSchedule || !newPostCaption.trim()) {
      addToast({
        title: "Select a channel, date and caption",
        variant: "error",
      });
      return;
    }

    const scheduledAt = new Date(`${dateToSchedule}T${newPostTime}:00`);
    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      addToast({ title: "Choose a future time", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(reviewId ? "/api/automations/daily-pipeline/review" : "/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(reviewId && { postId: reviewId, action: "approve" }),
          title: newPostCaption.trim().slice(0, 80),
          content: [newPostCaption.trim(), newPostTag.trim()]
            .filter(Boolean)
            .join("\n\n"),
          channelIds: newPostChannelIds,
          mediaUrls: mediaText.split(/\s+/).filter(Boolean),
          scheduledAt: scheduledAt.toISOString(),
          status: "SCHEDULED",
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => null))?.error ||
            "Could not schedule post"
        );
      closeComposer();
      setNewPostCaption("");
      await loadPosts(true);
      addToast({
        title: "Post saved",
        description:
          "Queued for the selected channels",
        variant: "info",
      });
    } catch (error) {
      addToast({
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "error",
      });
    } finally { setSaving(false); }
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .calendar-passed-day {
          background-color: rgba(20, 20, 22, 0.4);
          background-image: repeating-linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.02) 0px,
            rgba(255, 255, 255, 0.02) 1.5px,
            transparent 1.5px,
            transparent 8.5px
          );
        }
        .calendar-grid-line {
          border-bottom: 1px dashed rgba(255, 255, 255, 0.04);
        }
        .calendar-col-divider {
          border-right: 1px solid rgba(255, 255, 255, 0.04);
        }
      `,
        }}
      />

      <div className="flex flex-1 min-w-0 flex-col gap-2 overflow-hidden h-full">
        {postsError && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2 text-xs text-red-200 shrink-0"
          >
            {postsError}
          </div>
        )}

        {/* Main Container Housing Left Configuration Panel & Calendar Workspace */}
        <div className="flex flex-1 overflow-hidden w-full h-full gap-3">
          {/* BEGIN: LeftConfigurationPanel ("Signal Array") */}
          <aside
            className={cn(
              "w-[260px] flex-col justify-between p-3.5 overflow-y-auto shrink-0 select-none transition-all",
              showMobileSignalArray
                ? "fixed inset-y-3 left-3 z-40 w-72 flex rounded-2xl shadow-2xl border border-white/20 bg-neutral-950/95 backdrop-blur-2xl"
                : "hidden lg:flex"
            )}
            style={{
              background: "rgba(14, 18, 19, 0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              boxShadow:
                "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
            }}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-sm font-semibold text-white tracking-tight">
                  Signal Array
                </h1>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowManageChannelsModal(true)}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors"
                    title="Manage Channels"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                  {showMobileSignalArray && (
                    <button
                      type="button"
                      onClick={() => setShowMobileSignalArray(false)}
                      className="lg:hidden text-neutral-400 hover:text-white p-1 ml-1 text-xs"
                      title="Close"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Channels Section */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="text-neutral-400 font-semibold tracking-wider text-[10px] uppercase">
                    CHANNELS
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowManageChannelsModal(true)}
                    className="text-brand-lime text-xs hover:underline font-medium"
                  >
                    Manage
                  </button>
                </div>

                {/* Channels Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {channels.slice(0, 3).map((ch) => {
                    const isSelected = selectedChannelId === ch.id;
                    return (
                      <div
                        key={ch.id}
                        onClick={() => handleToggleChannelFilter(ch.id)}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <div
                          className={cn(
                            "relative w-10 h-10 rounded-full bg-neutral-800 border flex items-center justify-center overflow-visible transition-all",
                            isSelected
                              ? "border-brand-lime ring-2 ring-brand-lime/30"
                              : "border-neutral-700 group-hover:border-neutral-500"
                          )}
                        >
                          <img
                            alt={ch.name}
                            className="w-full h-full rounded-full object-cover"
                            src={ch.avatarUrl}
                          />
                          <span
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[7px] ring-2 ring-[#0a0a0a] shadow-sm",
                              ch.badgeBg
                            )}
                          >
                            {ch.badgeIcon}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-medium mt-1 truncate max-w-[64px] transition-colors",
                            isSelected
                              ? "text-brand-lime font-semibold"
                              : "text-neutral-300"
                          )}
                        >
                          {ch.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {!channels.length && (
                  <p className="mb-3 text-[11px] text-neutral-500">
                    No connected Meta channels yet.
                  </p>
                )}

                {/* Add New Channel Button */}
                <button
                  type="button"
                  onClick={() => setShowAddChannelModal(true)}
                  className="w-full py-1.5 px-3 rounded-xl border border-white/10 hover:border-neutral-500 text-xs font-medium text-[#a3a3a3] hover:text-white bg-transparent hover:bg-neutral-900/60 flex items-center justify-center gap-1 transition-all border-dashed"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px dashed rgba(255, 255, 255, 0.2)",
                    boxShadow:
                      "rgba(0, 0, 0, 0.2) 0px 4px 12px, rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                    color: "rgb(255, 255, 255)",
                  }}
                >
                  <span>Add new channel</span>
                  <span className="text-neutral-500 font-normal">+</span>
                </button>
              </div>

              {/* Post Schedule Configuration */}
              <div className="mb-4 space-y-3 border-t border-[#1a1a1a] pt-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
                    POST SCHEDULE
                  </label>
                  <div
                    className="grid grid-cols-3 bg-transparent p-0.5 rounded-xl border border-white/10 text-xs"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      boxShadow: "rgba(0, 0, 0, 0.3) 0px 2px 8px inset",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleFreq("daily");
                        addToast({
                          title: "Schedule Updated",
                          description:
                            "Updated for this calendar view",
                          variant: "success",
                        });
                      }}
                      className={cn(
                        "py-1 rounded-lg text-center text-[11px] transition-all",
                        scheduleFreq === "daily"
                          ? "text-white font-medium"
                          : "text-neutral-400 hover:text-white"
                      )}
                      style={
                        scheduleFreq === "daily"
                          ? {
                              background: "rgba(255, 255, 255, 0.16)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              boxShadow:
                                "rgba(0, 0, 0, 0.25) 0px 2px 6px, rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                            }
                          : undefined
                      }
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleFreq("3x_week");
                        addToast({
                          title: "Schedule Updated",
                          description:
                            "Updated for this calendar view",
                          variant: "success",
                        });
                      }}
                      className={cn(
                        "py-1 rounded-lg text-center text-[11px] transition-all",
                        scheduleFreq === "3x_week"
                          ? "text-white font-medium"
                          : "text-neutral-400 hover:text-white"
                      )}
                      style={
                        scheduleFreq === "3x_week"
                          ? {
                              background: "rgba(255, 255, 255, 0.16)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              boxShadow:
                                "rgba(0, 0, 0, 0.25) 0px 2px 6px, rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                            }
                          : undefined
                      }
                    >
                      3x/week
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleFreq("custom");
                        addToast({
                          title: "Custom Schedule",
                          description:
                            "Updated for this calendar view",
                          variant: "info",
                        });
                      }}
                      className={cn(
                        "py-1 rounded-lg text-center text-[11px] transition-all",
                        scheduleFreq === "custom"
                          ? "text-white font-medium"
                          : "text-neutral-400 hover:text-white"
                      )}
                      style={
                        scheduleFreq === "custom"
                          ? {
                              background: "rgba(255, 255, 255, 0.16)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              boxShadow:
                                "rgba(0, 0, 0, 0.25) 0px 2px 6px, rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                            }
                          : undefined
                      }
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {/* Time Zone Dropdown */}
                <div className="relative">
                  <label className="text-[12px] text-neutral-300 block mb-1.5 font-normal">
                    Time zone
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTimezoneOpen(!isTimezoneOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-transparent border border-white/10 text-xs text-neutral-200 cursor-pointer hover:border-neutral-500 transition-colors"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      boxShadow:
                        "rgba(0, 0, 0, 0.25) 0px 4px 12px, rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                    }}
                  >
                    <span className="truncate text-[12px] font-medium text-neutral-200">
                      {selectedTimezone}
                    </span>
                    <svg
                      className={cn(
                        "w-4 h-4 text-neutral-400 shrink-0 transition-transform",
                        isTimezoneOpen ? "rotate-180" : ""
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>

                  {isTimezoneOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 py-1 z-30 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                      style={{
                        background: "rgba(18, 18, 20, 0.95)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                      }}
                    >
                      {TIMEZONES.map((tz) => (
                        <button
                          key={tz}
                          type="button"
                          onClick={() => {
                            setSelectedTimezone(tz);
                            setIsTimezoneOpen(false);
                            addToast({
                              title: "Timezone Updated",
                              description: `Selection is not saved. Posts use your browser time zone.`,
                              variant: "info",
                            });
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs truncate transition-colors",
                            selectedTimezone === tz
                              ? "bg-white/10 text-brand-lime font-medium"
                              : "text-neutral-300 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {tz}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Switch 1: Auto-suggest best time */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[12px] text-neutral-200 font-normal">
                    Auto-suggest best time
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoSuggestTime}
                    onClick={() => {
                      setAutoSuggestTime(!autoSuggestTime);
                      addToast({
                        title: !autoSuggestTime
                          ? "Auto-Suggest Enabled"
                          : "Auto-Suggest Disabled",
                        description:
                          "This setting is not saved and does not affect post times",
                        variant: "info",
                      });
                    }}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 flex items-center cursor-pointer transition-colors duration-200 shrink-0",
                      autoSuggestTime ? "justify-end" : "justify-start"
                    )}
                    style={{
                      background: autoSuggestTime
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: autoSuggestTime
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                      boxShadow: "rgba(0, 0, 0, 0.4) 0px 1px 2px inset",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full transition-all"
                      style={{
                        backgroundColor: autoSuggestTime
                          ? "rgb(197, 245, 42)"
                          : "rgba(255, 255, 255, 0.4)",
                      }}
                    />
                  </button>
                </div>

                {/* Switch 2: Auto-recycle evergreen */}
                <div className="flex items-start justify-between">
                  <div className="pr-2">
                    <span className="text-[12px] text-neutral-200 block font-normal leading-snug">
                      Auto-recycle evergreen
                    </span>
                    <span className="text-[10px] text-neutral-500 block leading-normal mt-0.5">
                      Showcases top posts in rotation
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoRecycleEvergreen}
                    onClick={() => {
                      setAutoRecycleEvergreen(!autoRecycleEvergreen);
                      addToast({
                        title: !autoRecycleEvergreen
                          ? "Evergreen Recycling Enabled"
                          : "Evergreen Recycling Disabled",
                        description:
                          "This setting is not saved; posts are not recirculated",
                        variant: "info",
                      });
                    }}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 flex items-center cursor-pointer transition-colors duration-200 shrink-0 mt-0.5",
                      autoRecycleEvergreen ? "justify-end" : "justify-start"
                    )}
                    style={{
                      background: autoRecycleEvergreen
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: autoRecycleEvergreen
                        ? "1px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                      boxShadow: "rgba(0, 0, 0, 0.4) 0px 1px 2px inset",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full transition-all"
                      style={{
                        backgroundColor: autoRecycleEvergreen
                          ? "rgb(197, 245, 42)"
                          : "rgba(255, 255, 255, 0.4)",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Card: Agent Automated Workflow */}
            <div
              onClick={() => setShowAgentModal(true)}
              className="mt-3 p-3 rounded-2xl border border-white/10 hover:border-brand-lime/40 transition-colors cursor-pointer"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
                <span className="text-xs font-semibold text-white">
                  Agent Workflow
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Autonomous publishing orchestration & intelligent cadencing.
              </p>
            </div>
          </aside>
          {/* END: LeftConfigurationPanel */}

          {/* Mobile Signal Array Backdrop */}
          {showMobileSignalArray && (
            <div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setShowMobileSignalArray(false)}
            />
          )}

          {/* BEGIN: CalendarWorkspace */}
          <main
            className="flex-1 bg-[#050505] border-[#1a1a1a] flex flex-col overflow-hidden relative min-w-0"
            style={{
              background: "rgba(14, 18, 19, 0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              boxShadow:
                "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
            }}
          >
            {/* Calendar Toolbar Header (Matching Reference Navigation & Style) */}
            <div
              className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-4 sm:px-5 bg-[#050505] shrink-0 gap-3"
              style={{
                background: "rgba(14, 18, 19, 0.45)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Left Navigation: < Month Year > Today */}
              <div className="relative flex items-center gap-1.5 sm:gap-2">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                  title="Previous period"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Month / Period Picker Button */}
                <button
                  type="button"
                  onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white px-3 py-1.5 rounded-lg hover:bg-neutral-900 border border-white/10 hover:border-neutral-700 transition-colors whitespace-nowrap shadow-xs"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <span>{formattedHeaderLabel}</span>
                  <svg
                    className={cn(
                      "w-3 h-3 text-neutral-400 transition-transform",
                      isMonthPickerOpen ? "rotate-180" : ""
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                  title="Next period"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Today Button */}
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-200 hover:text-white border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Today
                </button>

                {/* Mobile/Tablet Signal Array Toggle */}
                <button
                  type="button"
                  onClick={() => setShowMobileSignalArray(!showMobileSignalArray)}
                  className="lg:hidden flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 transition-colors whitespace-nowrap ml-1"
                  title="Toggle Channels & Signal Array"
                >
                  <span>Channels</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                </button>

                {/* Clean, Non-glitchy Month & Year Selector Popover */}
                {isMonthPickerOpen && (
                  <div
                    ref={monthPickerRef}
                    className="absolute top-full left-0 mt-2 w-64 p-3 z-50 rounded-2xl shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150 select-none"
                    style={{
                      background: "rgba(18, 20, 22, 0.98)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      boxShadow:
                        "0 20px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)",
                    }}
                  >
                    {/* Year Navigation */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                      <button
                        type="button"
                        onClick={() => setPickerYear((y) => y - 1)}
                        className="w-7 h-7 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                        title="Previous Year"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-white tracking-wide">
                        {pickerYear}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPickerYear((y) => y + 1)}
                        className="w-7 h-7 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                        title="Next Year"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Months 3x4 Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((mName, mIdx) => {
                        const isSelected =
                          currentDate.getFullYear() === pickerYear &&
                          currentDate.getMonth() === mIdx;

                        return (
                          <button
                            key={mName}
                            type="button"
                            onClick={() => {
                              const next = new Date(currentDate);
                              next.setFullYear(pickerYear);
                              next.setMonth(mIdx);
                              setCurrentDate(next);
                              setIsMonthPickerOpen(false);
                            }}
                            className={cn(
                              "py-2 px-1 rounded-xl text-xs font-medium transition-all text-center",
                              isSelected
                                ? "bg-brand-lime text-black font-bold shadow-md shadow-brand-lime/20"
                                : "text-neutral-300 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {mName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right View Controls & Schedule Action (Day | Week | Month + Grid/List) */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Segmented View Switch: Day | Week | Month */}
                <div
                  className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "rgba(0, 0, 0, 0.3) 0px 2px 8px inset",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("day");
                      setDisplayMode("grid");
                    }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs transition-all",
                      viewMode === "day" && displayMode === "grid"
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white bg-transparent font-medium"
                    )}
                  >
                    Day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("week");
                      setDisplayMode("grid");
                    }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs transition-all",
                      viewMode === "week" && displayMode === "grid"
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white bg-transparent font-medium"
                    )}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("month");
                      setDisplayMode("grid");
                    }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs transition-all",
                      viewMode === "month" && displayMode === "grid"
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white bg-transparent font-medium"
                    )}
                  >
                    Month
                  </button>
                </div>

                {/* Display Mode Icon Toggle (Grid vs List) */}
                <div
                  className="hidden sm:flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs items-center gap-0.5"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDisplayMode("grid")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      displayMode === "grid"
                        ? "bg-white/15 text-white shadow-xs"
                        : "text-neutral-400 hover:text-white"
                    )}
                    title="Grid View"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayMode("list")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      displayMode === "list"
                        ? "bg-white/15 text-white shadow-xs"
                        : "text-neutral-400 hover:text-white"
                    )}
                    title="List View"
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Add Post Button */}
                <button
                  type="button"
                  onClick={() => {
                    const todayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
                    setSelectedDateForNewPost(todayStr);
                    setShowNewPostModal(true);
                  }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-[#b1de22] text-black shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New Post</span>
                </button>
              </div>
            </div>

            {/* Calendar Main Body */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-auto relative min-w-0 h-full">
              {/* ========================================================================= */}
              {/* VIEW MODE A: MONTH VIEW (Accurate 7-column Calendar Matching Image 2)      */}
              {/* ========================================================================= */}
              {displayMode === "grid" && viewMode === "month" && (
                <div className="w-full min-w-[760px] h-full flex flex-col select-none">
                  {/* Weekday Names Header (Monday through Sunday) */}
                  <div
                    className="grid grid-cols-7 border-b border-white/[0.08] sticky top-0 z-10 shrink-0"
                    style={{
                      background: "rgba(14, 18, 19, 0.85)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((weekday) => (
                      <div
                        key={weekday}
                        className="py-3 text-center text-xs font-semibold text-neutral-300 tracking-wide"
                      >
                        <span className="hidden md:inline">{weekday}</span>
                        <span className="md:hidden">{weekday.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Month Grid Cells */}
                  <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {monthGridDays.map((cell, idx) => {
                      const dayPosts = displayedPosts.filter(
                        (p) => p.dateStr === cell.dateStr
                      );
                      const isColEnd = (idx + 1) % 7 === 0;

                      return (
                        <div
                          key={cell.dateStr + "_" + idx}
                          onClick={() => {
                            if (!cell.isPast) {
                              setSelectedDateForNewPost(cell.dateStr);
                              setShowNewPostModal(true);
                            }
                          }}
                          className={cn(
                            "relative flex flex-col p-2 min-h-[110px] border-b border-white/[0.06] transition-colors",
                            !isColEnd && "border-r border-white/[0.06]",
                            cell.isPast
                              ? "calendar-passed-day"
                              : "bg-neutral-950/40 hover:bg-white/[0.025] cursor-pointer group",
                            cell.isToday &&
                              "bg-white/[0.03] ring-1 ring-inset ring-brand-lime/20"
                          )}
                        >
                          {/* Day Number Header */}
                          <div className="flex items-center justify-center pt-1 pb-1.5">
                            {cell.isToday ? (
                              <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md font-bold text-xs bg-brand-lime text-black shadow-[0_0_12px_rgba(197,245,42,0.35)]">
                                {cell.dayNumber}
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  !cell.isCurrentMonth
                                    ? "text-neutral-600"
                                    : cell.isPast
                                    ? "text-neutral-500"
                                    : "text-neutral-200 group-hover:text-white"
                                )}
                              >
                                {cell.dayNumber}
                              </span>
                            )}
                          </div>

                          {/* Plus button on future hover */}
                          {!cell.isPast && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDateForNewPost(cell.dateStr);
                                setShowNewPostModal(true);
                              }}
                              className="absolute top-2 right-2 w-5 h-5 rounded-md bg-white/10 hover:bg-brand-lime hover:text-black text-neutral-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
                              title={`Schedule post on ${cell.dateStr}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}

                          {/* Scheduled Posts in this day */}
                          <div className="flex flex-col gap-1.5 overflow-hidden my-auto">
                            {dayPosts.slice(0, 2).map((post) => (
                              <div
                                key={post.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveModalPost(post);
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-white text-[10px] font-medium transition-all truncate cursor-pointer shadow-xs hover:border-brand-lime/40"
                              >
                                <span
                                  className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    post.platformBadgeBg
                                  )}
                                />
                                <span className="truncate">
                                  {post.caption || "Scheduled post"}
                                </span>
                                <span className="text-neutral-400 text-[9px] shrink-0 ml-auto">
                                  {post.timeSlot}
                                </span>
                              </div>
                            ))}
                            {dayPosts.length > 2 && (
                              <span className="text-[9px] text-neutral-400 font-semibold pl-1">
                                +{dayPosts.length - 2} more
                              </span>
                            )}
                          </div>

                          {/* "Date passed" text for past dates matching reference screenshot */}
                          {cell.isPast && (
                            <div className="mt-auto pb-1.5 text-center select-none">
                              <span className="text-[10px] text-neutral-600 font-medium tracking-tight">
                                Date passed
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW MODE B: WEEK VIEW (7-Day Monday-to-Sunday Timeline Matrix)             */}
              {/* ========================================================================= */}
              {displayMode === "grid" && viewMode === "week" && (
                <div className="w-full min-w-[960px] h-full flex flex-col relative select-none">
                  {/* Day Columns Header (Fixed Top) */}
                  <div
                    className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#1f1f1f] sticky top-0 z-20 shrink-0"
                    style={{
                      background: "rgba(14, 18, 19, 0.85)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {/* Corner time gutter */}
                    <div className="h-12 calendar-col-divider" />
                    {weekGridDays.map((day, idx) => (
                      <div
                        key={day.dateStr}
                        onClick={() => {
                          setSelectedDateForNewPost(day.dateStr);
                          setShowNewPostModal(true);
                        }}
                        className={cn(
                          "h-12 px-2 flex flex-col justify-center items-center cursor-pointer hover:bg-white/[0.03] transition-colors",
                          idx < 6 ? "calendar-col-divider" : "",
                          day.isToday && "bg-white/[0.02]"
                        )}
                        title={`Click to schedule post on ${day.dayName} ${day.dayNumber}`}
                      >
                        <div className="flex items-center gap-1.5">
                          {day.isToday ? (
                            <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1 rounded-md font-bold text-xs bg-brand-lime text-black">
                              {day.dayNumber}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-white tracking-tight leading-none">
                              {day.dayNumber}
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400 font-medium uppercase">
                            {day.dayName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time Grid & Scheduled Items Canvas */}
                  <div
                    className="relative flex-1 min-h-[640px]"
                    style={{
                      minHeight: Math.max(
                        640,
                        Math.max(
                          ...weekGridDays.map(
                            (d) =>
                              displayedPosts.filter((p) => p.dateStr === d.dateStr)
                                .length
                          ),
                          1
                        ) * 320
                      ),
                    }}
                  >
                    {/* Background Grid Rows (Time Slots) */}
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] h-full">
                      {/* Time Column Labels */}
                      <div className="calendar-col-divider flex flex-col text-neutral-500 text-[10px] font-medium select-none">
                        {TIME_SLOTS.map((t) => (
                          <div
                            key={t}
                            className="h-28 pt-1.5 px-2 calendar-grid-line text-right"
                          >
                            {t}
                          </div>
                        ))}
                      </div>

                      {/* 7 Day Columns Grid Lines */}
                      {weekGridDays.map((day, colIndex) => (
                        <div
                          key={day.dateStr}
                          onClick={() => {
                            setSelectedDateForNewPost(day.dateStr);
                            setShowNewPostModal(true);
                          }}
                          className={cn(
                            "flex flex-col cursor-pointer hover:bg-white/[0.015] transition-colors",
                            colIndex < 6 ? "calendar-col-divider" : "",
                            day.isPast && "calendar-passed-day",
                            day.isToday && "bg-brand-lime/[0.015]"
                          )}
                          title={`Click to schedule post on ${day.dayName}`}
                        >
                          {TIME_SLOTS.map((t) => (
                            <div key={t} className="h-28 calendar-grid-line" />
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Absolute Overlay for Scheduled Content Cards */}
                    <div className="absolute inset-0 left-[60px] grid grid-cols-7 pointer-events-none p-2 gap-2 min-w-0">
                      {weekGridDays.map((day) => {
                        const posts = displayedPosts.filter(
                          (post) => post.dateStr === day.dateStr
                        );
                        return (
                          <div key={day.dateStr} className="relative w-full h-full">
                            {posts.map((post, postIndex) => (
                              <article
                                key={post.id}
                                style={{
                                  top: `${Math.max(post.topOffset, postIndex * 310)}px`,
                                  background: "rgba(255, 255, 255, 0.08)",
                                  backdropFilter: "blur(12px)",
                                  WebkitBackdropFilter: "blur(12px)",
                                  border: "1px solid rgba(255, 255, 255, 0.14)",
                                  boxShadow:
                                    "rgba(0, 0, 0, 0.3) 0px 8px 24px, rgba(255, 255, 255, 0.12) 0px 1px 1px inset",
                                }}
                                onClick={() => setActiveModalPost(post)}
                                className="pointer-events-auto absolute left-1 right-1 transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col select-none rounded-[18px] p-2.5 shadow-lg border border-white/5 bg-[#1c2e26]"
                              >
                                {/* Top Image Container with 3-dot menu */}
                                <div className="relative w-full h-36 rounded-[12px] overflow-hidden bg-neutral-900 shrink-0">
                                  {post.imageUrl ? (
                                    <img
                                      alt={post.imageAlt}
                                      className="w-full h-full object-cover block"
                                      src={post.imageUrl}
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center p-3 text-center text-xs text-neutral-300">
                                      {post.caption}
                                    </div>
                                  )}

                                  {/* 3-dot context menu */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuPostId(
                                        openMenuPostId === post.id ? null : post.id
                                      );
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors border border-white/10 shadow-sm z-10"
                                    title="Post options"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5 fill-current"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle cx="12" cy="5" r="1.8" />
                                      <circle cx="12" cy="12" r="1.8" />
                                      <circle cx="12" cy="19" r="1.8" />
                                    </svg>
                                  </button>

                                  {/* Quick Context Menu Popover */}
                                  {openMenuPostId === post.id && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute top-10 right-2 w-36 py-1 z-30 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                                      style={{
                                        background: "rgba(18, 18, 20, 0.95)",
                                        backdropFilter: "blur(20px)",
                                        WebkitBackdropFilter: "blur(20px)",
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveModalPost(post);
                                          setOpenMenuPostId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                                      >
                                        View Details
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicatePost(post)}
                                        className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                                      >
                                        Duplicate
                                      </button>
                                      <button
                                        type="button"
                                        disabled={post.status !== "scheduled"} onClick={() => void publishNow(post)}
                                        className="w-full text-left px-3 py-1.5 text-xs text-brand-lime hover:bg-white/10 transition-colors"
                                      >
                                        Publish Now
                                      </button>
                                      <div className="border-t border-white/10 my-1" />
                                      {(post.status === "scheduled" ||
                                        post.status === "draft") && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePost(post.id)}
                                          className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                        >
                                          {post.status === "draft"
                                            ? "Delete Draft"
                                            : "Cancel Schedule"}
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Bottom overlay info */}
                                  <div className="absolute bottom-2 left-[52px] right-2 z-10 flex flex-col min-w-0 drop-shadow-md pointer-events-none">
                                    <span className="font-bold text-[12px] text-white leading-tight truncate">
                                      {post.authorName}
                                    </span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span
                                        className={cn(
                                          "w-3 h-3 rounded-[3px] flex items-center justify-center text-[7px] text-white shrink-0 shadow-xs",
                                          post.platformBadgeBg
                                        )}
                                      >
                                        {post.platformBadgeIcon}
                                      </span>
                                      <span className="text-[10px] text-white/90 font-medium truncate leading-tight">
                                        {post.authorHandle}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Creator avatar notch */}
                                <div className="relative flex items-center -mt-6 z-10 px-0.5">
                                  <div
                                    className="p-1 rounded-[14px] shadow-md shrink-0 flex items-center justify-center"
                                    style={{
                                      background: "rgba(255, 255, 255, 0.08)",
                                      backdropFilter: "blur(12px)",
                                      WebkitBackdropFilter: "blur(12px)",
                                      border: "1px solid rgba(255, 255, 255, 0.14)",
                                    }}
                                  >
                                    <div className="w-9 h-9 rounded-[10px] overflow-hidden bg-neutral-800 shrink-0 relative">
                                      <img
                                        alt={post.authorName}
                                        className="w-full h-full object-cover"
                                        src={post.authorAvatar}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Caption & Hashtag */}
                                <p className="text-[11px] text-white/90 truncate mt-1.5 font-medium px-1">
                                  {post.caption}
                                </p>
                                <div className="mt-1 px-1">
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium text-white/90 border border-white/10 shadow-xs"
                                    style={{
                                      background: "rgba(255, 255, 255, 0.08)",
                                      backdropFilter: "blur(8px)",
                                    }}
                                  >
                                    {post.tag}
                                  </span>
                                </div>
                              </article>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW MODE C: DAY VIEW (Chronological Daily Schedule)                       */}
              {/* ========================================================================= */}
              {displayMode === "grid" && viewMode === "day" && (
                <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
                  <div
                    className="flex items-center justify-between p-4 rounded-2xl border border-white/10"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {currentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {
                          displayedPosts.filter(
                            (p) =>
                              p.dateStr ===
                              `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`
                          ).length
                        }{" "}
                        posts scheduled for this day
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const dayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
                        setSelectedDateForNewPost(dayStr);
                        setShowNewPostModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-[#b1de22] text-black shadow-md transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Post</span>
                    </button>
                  </div>

                  {/* Day Posts List */}
                  <div className="flex flex-col gap-3">
                    {displayedPosts.filter(
                      (p) =>
                        p.dateStr ===
                        `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`
                    ).length === 0 ? (
                      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                        <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-white">
                          No posts scheduled today
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                          Click below to schedule a new release or switch to Month
                          view to review your content pipeline.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const dayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
                            setSelectedDateForNewPost(dayStr);
                            setShowNewPostModal(true);
                          }}
                          className="mt-4 px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-lime text-black inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Schedule Post</span>
                        </button>
                      </div>
                    ) : (
                      displayedPosts
                        .filter(
                          (p) =>
                            p.dateStr ===
                            `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`
                        )
                        .map((post) => (
                          <div
                            key={post.id}
                            onClick={() => setActiveModalPost(post)}
                            className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 hover:border-brand-lime/40 transition-all cursor-pointer bg-white/[0.03]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                                {post.imageUrl ? (
                                  <img
                                    src={post.imageUrl}
                                    alt={post.imageAlt}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                    Post
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "w-3 h-3 rounded-[3px] flex items-center justify-center text-[7px] text-white shrink-0",
                                      post.platformBadgeBg
                                    )}
                                  >
                                    {post.platformBadgeIcon}
                                  </span>
                                  <span className="text-xs font-bold text-white truncate">
                                    {post.caption}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                                  {post.fullCaption}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                              <span className="text-xs font-mono font-medium text-brand-lime">
                                {post.timeSlot}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-neutral-200">
                                {post.status}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* VIEW MODE D: LIST VIEW (Chronological Queue Feed)                          */}
              {/* ========================================================================= */}
              {displayMode === "list" && (
                <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Scheduled Releases Queue
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Total {displayedPosts.length} posts queued across all channels
                      </p>
                    </div>

                    {/* Search filter */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={listSearchQuery}
                        onChange={(e) => setListSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-lime"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {displayedPosts
                      .filter((p) =>
                        p.caption
                          .toLowerCase()
                          .includes(listSearchQuery.toLowerCase()) ||
                        p.fullCaption
                          .toLowerCase()
                          .includes(listSearchQuery.toLowerCase())
                      )
                      .map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setActiveModalPost(post)}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 hover:border-brand-lime/40 transition-all cursor-pointer bg-white/[0.03]"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                              {post.imageUrl ? (
                                <img
                                  src={post.imageUrl}
                                  alt={post.imageAlt}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                  Post
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[7px] text-white shrink-0",
                                    post.platformBadgeBg
                                  )}
                                >
                                  {post.platformBadgeIcon}
                                </span>
                                <span className="text-xs font-bold text-white truncate">
                                  {post.caption}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1 max-w-lg">
                                {post.fullCaption}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-brand-lime font-mono">
                                  {post.scheduledTime}
                                </span>
                                <span className="text-neutral-500">•</span>
                                <span className="text-[10px] text-neutral-400">
                                  {post.authorName}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/10 text-neutral-200">
                              {post.status}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicatePost(post);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              Duplicate
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </main>
          {/* END: CalendarWorkspace */}
        </div>
      </div>

      {/* MODAL 1: Post Details / Preview Modal */}
      {activeModalPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setActiveModalPost(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl p-6 text-white shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-800 border border-white/10">
                  <img
                    src={activeModalPost.authorAvatar}
                    alt={activeModalPost.authorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {activeModalPost.authorName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[7px] text-white",
                        activeModalPost.platformBadgeBg
                      )}
                    >
                      {activeModalPost.platformBadgeIcon}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {activeModalPost.authorHandle}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-xs text-brand-lime font-medium">
                      {activeModalPost.scheduledTime}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalPost(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Media Image */}
            <div className="my-4 rounded-xl overflow-hidden h-64 bg-black/50 border border-white/10 relative">
              {activeModalPost.imageUrl ? (
                <img
                  src={activeModalPost.imageUrl}
                  alt={activeModalPost.imageAlt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-neutral-300">
                  {activeModalPost.caption}
                </div>
              )}
              <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/20">
                {activeModalPost.tag}
              </span>
            </div>

            <ul className="mb-3 space-y-1 text-xs" aria-label="Delivery status by channel">
              {rawPosts.find(post => post.id === activeModalPost.id)?.deliveries.map(delivery =>
                <li key={delivery.accountId}>{channels.find(ch => ch.id === delivery.accountId)?.name || "Disconnected channel"} · {delivery.status.toLowerCase()}
                  {delivery.failureReason && <p className="text-red-300">{delivery.failureReason}</p>}
                </li>)}
            </ul>
            {/* Caption Body */}
            <div className="space-y-2 mb-6">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Full Caption
              </label>
              <p className="text-xs text-neutral-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                {activeModalPost.fullCaption}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              {(activeModalPost.status === "scheduled" ||
                activeModalPost.status === "draft") && (
                <button
                  type="button"
                  onClick={() => handleDeletePost(activeModalPost.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  {activeModalPost.status === "draft"
                    ? "Delete Draft"
                    : "Cancel Schedule"}
                </button>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDuplicatePost(activeModalPost)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  disabled={activeModalPost.status !== "scheduled"} onClick={() => void publishNow(activeModalPost)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-[#b1de22] text-black shadow-lg transition-colors"
                >
                  Publish Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Channel Modal */}
      <AddChannelModal
        isOpen={showAddChannelModal}
        onClose={() => setShowAddChannelModal(false)}
        onSelectPlatform={handleSelectPlatform}
        error={channelsError}
      />

      {/* MODAL 3: Manage Channels Modal */}
      {showManageChannelsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowManageChannelsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 text-white shadow-2xl border border-white/15"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                Manage Connected Channels
              </h3>
              <button
                type="button"
                onClick={() => setShowManageChannelsModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
                      <img
                        src={ch.avatarUrl}
                        alt={ch.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">
                        {ch.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400">{ch.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDisconnectChannel(ch)}
                      className="text-neutral-500 hover:text-red-400 text-xs p-1"
                      title="Disconnect"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setShowManageChannelsModal(false);
                  setShowAddChannelModal(true);
                }}
                className="text-xs text-brand-lime hover:underline font-medium"
              >
                + Connect another channel
              </button>
              <button
                type="button"
                onClick={() => setShowManageChannelsModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs bg-white/10 hover:bg-white/15 text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Schedule Post Modal */}
      {showNewPostModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={closeComposer}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6 text-white shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                Schedule New Post
              </h3>
              <button
                type="button"
                onClick={closeComposer}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                  Channel
                </label>
                {channels.map(ch => <label key={ch.id} className="flex items-center gap-2 py-1 text-sm">
                  <input type="checkbox" checked={newPostChannelIds.includes(ch.id)} onChange={e =>
                    setNewPostChannelIds(ids => e.target.checked ? [...ids, ch.id] : ids.filter(id => id !== ch.id))} />
                  {ch.name} · {ch.platform}
                </label>)}
                <label className="block text-xs mt-3">Images or videos (one public HTTPS URL per line)
                  <textarea className="block mt-1 w-full rounded-lg bg-neutral-900 p-2" rows={2} value={mediaText} onChange={e => setMediaText(e.target.value)} />
                </label>
              </div>

              {slides.length > 0 && <button type="button" disabled={uploading || saving} className="text-sm text-brand-lime"
                onClick={async () => {
                  try { await attachFiles(await Promise.all(slides.map((slide, index) => renderSlide(slide, index, slides.length)))); }
                  catch { toast.error("Could not render the carousel"); }
                }}>Attach generated carousel ({slides.length} slides)</button>}
              <label className="block text-xs">{uploading ? "Uploading media…" : "Attach files"}
                <input type="file" multiple accept="image/jpeg,image/png,video/mp4,video/quicktime" disabled={uploading || saving} className="mt-1 block" onChange={e => { const files = Array.from(e.target.files || []); e.target.value = ""; void attachFiles(files); }} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={selectedDateForNewPost || newPostDate}
                    onChange={(e) => {
                      setSelectedDateForNewPost(e.target.value);
                      setNewPostDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={newPostTime}
                    onChange={(e) => setNewPostTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                  Caption
                </label>
                <textarea
                  rows={3}
                  placeholder="What would you like to share?"
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                  Hashtag / Tag
                </label>
                <input
                  type="text"
                  placeholder="#newcollection"
                  value={newPostTag}
                  onChange={(e) => setNewPostTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving || uploading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-[#b1de22] text-black shadow-md transition-colors"
                >
                  {saving ? "Saving…" : reviewId ? "Approve and schedule" : "Schedule Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Agent Workflow Information Modal */}
      {showAgentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowAgentModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl p-6 text-white shadow-2xl border border-white/15"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-brand-lime text-base">✦</span>
                <h3 className="text-sm font-bold text-white">
                  AI Agent Automated Workflow
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAgentModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <AutoAntsReview onReview={draft => {
              setSlides(draft.rawThreads.filter(isSlide));
              setReviewId(draft.id);
              setNewPostCaption(draft.content);
              setMediaText(draft.mediaUrls.join("\n"));
              setNewPostTag("");
              setShowAgentModal(false);
              setShowNewPostModal(true);
            }} />
          </div>
        </div>
      )}
    </>
  );
}
