"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Channel,
  ScheduledPost,
  TIME_SLOTS,
  TIMEZONES,
} from "@/lib/calendar-data";
import { useToast } from "@/components/design-system/Toast";
import { cn } from "@/lib/utils";
import {
  getClientCached,
  setClientCached,
  isClientCacheFresh,
} from "@/lib/client-cache";
import { AddChannelModal, ChannelPlatform } from "./AddChannelModal";

export function CalendarView() {
  const { toast } = useToast();
  const addToast = ({
    title,
    description,
    variant = "success",
  }: {
    title: string;
    description?: string;
    variant?: "success" | "error" | "info";
  }) => {
    toast(description ? `${title}: ${description}` : title, variant);
  };

  // State with instant SWR cache initialization
  const [channels, setChannels] = useState<Channel[]>(() => getClientCached<Channel[]>("accounts_channels") || []);
  const [channelsError, setChannelsError] = useState("");
  const [metaMessage, setMetaMessage] = useState("");
  const metaBackend = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");
  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("meta");
    const messages: Record<string, string> = {
      connected: "Meta connection complete. Your Facebook and Instagram accounts are loading.",
      no_pages: "Meta granted Page-list permission, but returned no Pages. Sign in with a Facebook user who manages a Page and select that Page during authorization.",
      missing_pages_permission: "Meta did not grant pages_show_list. Add Page access and this permission to the Facebook Login for Business configuration, then reconnect.",
      page_access_missing: "Meta listed a Page but did not provide a usable Page token. Check Page asset access and the configuration's Page permissions, then reconnect.",
      denied: "Meta authorization was cancelled or denied.",
      missing_code: "Meta did not return an authorization code. Please try again.",
      code_exchange_failed: "Meta could not exchange the authorization code. Check your callback URL and Meta app configuration.",
      error: "Meta connection failed. Please try again or check the backend logs.",
    };
    if (result) setMetaMessage(messages[result] || "Meta connection could not be completed.");
  }, []);
  useEffect(() => {
    let active = true;
    if (isClientCacheFresh("accounts_channels", 20000) && channels.length > 0) return;
    fetch("/api/accounts", { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Could not load connected accounts"); return response.json(); })
      .then((data) => {
        if (!active) return;
        const linked: Channel[] = (data.accounts || [])
          .filter((account: { provider: string; status: string }) => ["facebook", "instagram"].includes(account.provider) && account.status === "active")
          .map((account: { id: string; name: string; handle: string; avatar?: string | null; provider: "facebook" | "instagram" }) => ({
            id: account.id, name: account.name, handle: account.handle,
            platform: account.provider, avatarUrl: account.avatar || "/brand/postpilot-logo.png",
            badgeBg: account.provider === "instagram" ? "bg-[#E1306C]" : "bg-[#1877F2]",
            badgeIcon: account.provider === "instagram" ? "📷" : "f",
          }));
        setChannels(linked);
        setClientCached("accounts_channels", linked);
        setChannelsError("");
      })
      .catch((error) => { if (active) setChannelsError(error.message); });
    return () => { active = false; };
  }, [channels.length]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [rawPosts, setRawPosts] = useState<any[]>(() => getClientCached<any[]>("calendar_raw_posts") || []);
  const [postsError, setPostsError] = useState("");
  const [startDate, setStartDate] = useState(() => { const date = new Date(); date.setHours(0, 0, 0, 0); return date; });
  const calendarDays = useMemo(() => Array.from({ length: 5 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return { dayNumber: date.getDate(), dayName: date.toLocaleDateString(undefined, { weekday: "short" }), dateStr: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` };
  }), [startDate]);
  const selectedMonth = startDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const moveWindow = (days: number) => setStartDate((current) => { const next = new Date(current); next.setDate(next.getDate() + days); return next; });
  
  const loadPosts = useCallback(async (force = false) => {
    if (!force && isClientCacheFresh("calendar_raw_posts", 15000) && rawPosts.length > 0) return;
    try {
      const response = await fetch("/api/posts", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load scheduled posts");
      const data = await response.json();
      const list = data.posts || [];
      setRawPosts(list);
      setClientCached("calendar_raw_posts", list);
      setPostsError("");
    } catch (error) { setPostsError(error instanceof Error ? error.message : "Could not load posts"); }
  }, [rawPosts.length]);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  const scheduledPosts = useMemo(() => {
    return rawPosts.filter((post: { scheduledAt?: string | null }) => Boolean(post.scheduledAt)).map((post: { id: string; title: string; content: string; status: string; scheduledAt: string; platforms?: string[]; mediaUrls?: string[] }) => {
      const date = new Date(post.scheduledAt);
      const platform = post.platforms?.[0] || "instagram";
      const matching = channels.filter((channel) => channel.platform === platform || (platform === "x" && channel.platform === "twitter"));
      const channel = matching.length === 1 ? matching[0] : undefined;
      const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const dayIndex = calendarDays.findIndex((day) => day.dateStr === localDate);
      const hour = date.getHours();
      return { id: post.id, channelId: channel?.id || "", authorName: channel?.name || "PostPilot", authorHandle: channel?.handle || "", authorAvatar: channel?.avatarUrl || "/brand/postpilot-logo.png", platform: (platform === "x" ? "twitter" : platform) as ScheduledPost["platform"], platformBadgeBg: channel?.badgeBg || "bg-neutral-800", platformBadgeIcon: channel?.badgeIcon || "•", dayIndex, dayNumber: date.getDate(), dayName: date.toLocaleDateString(undefined, { weekday: "short" }), timeSlot: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }), topOffset: Math.max(0, Math.min(450, (hour - 8) * 112 + Math.round(date.getMinutes() * 112 / 60))), imageUrl: post.mediaUrls?.[0] || "", imageAlt: post.title, caption: post.title || post.content.slice(0, 40), fullCaption: post.content, tag: post.status.toLowerCase().replaceAll("_", " "), status: post.status.toLowerCase() as ScheduledPost["status"], scheduledTime: date.toLocaleString() };
    });
  }, [rawPosts, channels, calendarDays]);

  // Settings
  const [scheduleFreq, setScheduleFreq] = useState<"daily" | "3x_week" | "custom">("daily");
  const [selectedTimezone, setSelectedTimezone] = useState<string>("GMT+1 · Auto-detected");
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [autoSuggestTime, setAutoSuggestTime] = useState(true);
  const [autoRecycleEvergreen, setAutoRecycleEvergreen] = useState(false);

  // Calendar View
  const [calendarView, setCalendarView] = useState<"today" | "month" | "year">("month");
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  // Modals
  const [activeModalPost, setActiveModalPost] = useState<ScheduledPost | null>(null);
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [showManageChannelsModal, setShowManageChannelsModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedDayForNewPost, setSelectedDayForNewPost] = useState<number | null>(null);

  // Tablet / Mobile Signal Array toggle
  const [showMobileSignalArray, setShowMobileSignalArray] = useState(false);

  // Card Context Menu
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // Filtered posts
  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId);
  const displayedPosts = selectedChannel
    ? scheduledPosts.filter((post) => post.platform === selectedChannel.platform)
    : scheduledPosts;

  // New Post Form State
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostTag, setNewPostTag] = useState("#brand");
  const [newPostChannelId, setNewPostChannelId] = useState(channels[0]?.id || "");
  useEffect(() => { if (!newPostChannelId && channels[0]) setNewPostChannelId(channels[0].id); }, [channels, newPostChannelId]);
  const [newPostTime, setNewPostTime] = useState("09:00");

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
        description: `Showing ${ch?.platform || "platform"} posts. Posts are not assigned to individual accounts yet.`,
        variant: "info",
      });
    }
  };

  const unavailable = () => addToast({ title: "Publishing unavailable", description: "Automatic publishing is not available yet.", variant: "info" });
  const handleCreateChannel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (metaBackend) {
      window.location.assign(`${metaBackend}/api/integrations/meta/connect?returnTo=calendar`);
    } else {
      addToast({ title: "Meta backend unavailable", description: "Configure NEXT_PUBLIC_BACKEND_URL", variant: "error" });
    }
  };
  const handleSelectPlatform = (platform: ChannelPlatform) => {
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
      const response = await fetch(`/api/accounts?id=${encodeURIComponent(channel.id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not disconnect channel");
      setChannels((current) => current.filter((item) => item.id !== channel.id));
      if (selectedChannelId === channel.id) setSelectedChannelId(null);
      addToast({ title: "Channel disconnected", description: channel.name });
    } catch { addToast({ title: "Disconnect failed", description: "Please try again", variant: "error" }); }
  };
  const handleDeletePost = async (postId: string) => {
    const post = scheduledPosts.find((item) => item.id === postId);
    if (!post) return;
    try {
      const response = post.status === "draft"
        ? await fetch(`/api/posts/${encodeURIComponent(postId)}`, { method: "DELETE" })
        : await fetch(`/api/posts/${encodeURIComponent(postId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELLED" }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Could not change post");
      setActiveModalPost(null);
      await loadPosts(true);
      addToast({ title: post.status === "draft" ? "Draft deleted" : "Schedule cancelled" });
    } catch (error) { addToast({ title: "Post update failed", description: error instanceof Error ? error.message : "Please try again", variant: "error" }); }
  };
  const handleDuplicatePost = async (post: ScheduledPost) => {
    try {
      const response = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: post.caption, content: post.fullCaption, platforms: [post.platform === "twitter" ? "x" : post.platform], status: "DRAFT" }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Could not duplicate post");
      addToast({ title: "Draft duplicated" });
      setActiveModalPost(null);
      await loadPosts(true);
    } catch (error) { addToast({ title: "Duplicate failed", description: error instanceof Error ? error.message : "Please try again", variant: "error" }); }
  };
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const channel = channels.find((item) => item.id === newPostChannelId);
    const day = selectedDayForNewPost === null ? null : calendarDays[selectedDayForNewPost];
    if (!channel || !day || !newPostCaption.trim()) { addToast({ title: "Select a channel, date and caption", variant: "error" }); return; }
    const scheduledAt = new Date(`${day.dateStr}T${newPostTime}:00`);
    if (scheduledAt.getTime() <= Date.now()) { addToast({ title: "Choose a future time", variant: "error" }); return; }
    try {
      const response = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newPostCaption.trim().slice(0, 80), content: [newPostCaption.trim(), newPostTag.trim()].filter(Boolean).join("\n\n"), platforms: [channel.platform === "twitter" ? "x" : channel.platform], scheduledAt: scheduledAt.toISOString(), status: "SCHEDULED" }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Could not schedule post");
      setShowNewPostModal(false);
      setNewPostCaption("");
      await loadPosts(true);
      addToast({ title: "Post saved", description: "Automatic publishing is unavailable; this schedule will not publish itself", variant: "info" });
    } catch (error) { addToast({ title: "Save failed", description: error instanceof Error ? error.message : "Please try again", variant: "error" }); }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .calendar-grid-line {
          border-bottom: 1px dashed rgba(255, 255, 255, 0.04);
        }
        .calendar-col-divider {
          border-right: 1px solid rgba(255, 255, 255, 0.04);
        }
      `}} />

      <div className="flex flex-1 min-w-0 flex-col gap-2 overflow-hidden">
      {metaMessage && <div role="status" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs text-white">{metaMessage}</div>}
      {postsError && <div role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2 text-xs text-red-200">{postsError}</div>}
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
              <h1 className="text-sm font-semibold text-white tracking-tight">Signal Array</h1>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowManageChannelsModal(true)}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                  title="Manage Channels"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          isSelected ? "text-brand-lime font-semibold" : "text-neutral-300"
                        )}
                      >
                        {ch.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              {!channels.length && <p className="mb-3 text-[11px] text-neutral-500">No connected Meta channels yet.</p>}

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
                        description: "This preference is only shown on this screen; automatic publishing is unavailable",
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
                        description: "This preference is only shown on this screen; automatic publishing is unavailable",
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
                        description: "This preference is only shown on this screen; automatic publishing is unavailable",
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
                      title: !autoSuggestTime ? "Auto-Suggest Enabled" : "Auto-Suggest Disabled",
                      description: "This setting is not saved and does not affect post times",
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
                      description: "This setting is not saved; posts are not recirculated",
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
            className="mt-2 rounded-[20px] p-3 transition-all duration-200 select-none shadow-md backdrop-blur-md"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow:
                "rgba(0, 0, 0, 0.35) 0px 8px 24px, rgba(255, 255, 255, 0.2) 0px 1px 1px inset",
            }}
          >
            {/* Embedded Graphic Preview Box */}
            <div
              className="relative rounded-[14px] overflow-hidden p-2.5 flex flex-col justify-end"
              style={{
                background:
                  "linear-gradient(145deg, #e0a37e 0%, #b26c4b 28%, #574e44 60%, #224335 100%)",
                minHeight: "120px",
                boxShadow: "inset 0 0 16px rgba(0,0,0,0.25)",
              }}
            >
              {/* Frosted / Translucent Dark UI Bubble Card */}
              <div
                className="rounded-xl p-2.5 text-[10px] space-y-2 backdrop-blur-md"
                style={{
                  background: "rgba(22, 22, 22, 0.78)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-1.5 text-white/90 font-medium text-[10.5px]">
                  <span className="text-[10px] opacity-90">✦</span>
                  <span>AI Agent</span>
                </div>
                {/* Input User Prompt Bubble */}
                <div
                  className="rounded-lg px-2 py-1.5 text-[9.5px] leading-tight text-neutral-300 font-normal"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  Plan posts for the upcoming week
                </div>
                {/* Micro Action Buttons */}
                <div className="flex items-center gap-2 text-neutral-400 pl-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      addToast({
                        title: "Scheduling unavailable",
                        description: "AI scheduling is not available yet",
                        variant: "info",
                      });
                    }}
                    title="Refresh AI Agent Plan"
                  >
                    <svg
                      className="w-2.5 h-2.5 hover:text-white transition-colors cursor-pointer"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAgentModal(true)}
                    title="Edit AI Agent Prompt"
                  >
                    <svg
                      className="w-2.5 h-2.5 hover:text-white transition-colors cursor-pointer"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        "Plan posts for the upcoming week"
                      );
                      addToast({
                        title: "Copied to Clipboard",
                        description: "Example prompt copied",
                        variant: "info",
                      });
                    }}
                    title="Copy Workflow"
                  >
                    <svg
                      className="w-2.5 h-2.5 hover:text-white transition-colors cursor-pointer"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                {/* Output Agent Result */}
                <div className="text-[9.5px] leading-snug text-neutral-200 font-normal pt-0.5">
                  AI planning is coming soon. Use the calendar to save a post for a future date.
                </div>
              </div>
            </div>

            {/* Card Typography & Action */}
            <div className="mt-3 px-0.5">
              <h3 className="text-[13px] font-semibold text-white tracking-tight leading-snug mb-1">
                Plan your posting workflow
              </h3>
              <p className="text-[11px] leading-relaxed mb-3 font-normal text-white/80">
                Review your connected channels and scheduled posts in the calendar.
              </p>
              <button
                type="button"
                onClick={() => setShowAgentModal(true)}
                className="inline-flex items-center justify-between w-full text-xs font-semibold group text-white hover:text-white/80 transition-colors"
              >
                <span className="text-[11.5px] font-medium group-hover:underline">Learn more</span>
                <span className="group-hover:translate-x-0.5 transition-transform text-sm">→</span>
              </button>
            </div>
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
          {/* Calendar Toolbar Header */}
          <div
            className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-5 bg-[#050505] shrink-0"
            style={{
              background: "rgba(14, 18, 19, 0.45)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Month Dropdown Selector */}
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMonthOpen(!isMonthOpen)}
                className="flex items-center gap-1.5 text-sm font-semibold text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors whitespace-nowrap"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow:
                    "rgba(0, 0, 0, 0.3) 0px 4px 12px, rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                }}
              >
                <span>{selectedMonth}</span>
                <svg
                  className={cn(
                    "w-3.5 h-3.5 text-neutral-400 transition-transform",
                    isMonthOpen ? "rotate-180" : ""
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

              {/* Mobile/Tablet Signal Array Toggle */}
              <button
                type="button"
                onClick={() => setShowMobileSignalArray(!showMobileSignalArray)}
                className="lg:hidden flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 transition-colors whitespace-nowrap"
                title="Toggle Channels & Signal Array"
              >
                <span>Channels</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
              </button>

              {isMonthOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 py-1 z-30 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                  style={{
                    background: "rgba(18, 18, 20, 0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  {[-1, 0, 1].map((offset) => {
                    const date = new Date(startDate);
                    date.setMonth(date.getMonth() + offset, 1);
                    const m = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
                    return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setStartDate(date);
                        setIsMonthOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs transition-colors",
                        selectedMonth === m
                          ? "bg-white/10 text-brand-lime font-medium"
                          : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {m}
                    </button>
                  ); })}
                </div>
              )}
            </div>

            {/* View Controls & Schedule Action */}
            <div className="flex items-center gap-3">
              {/* View Selector Segmented: Today, Month, Year */}
              <div
                className="flex bg-transparent p-0.5 rounded-xl border border-white/10 text-xs"
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
                    setCalendarView("today");
                    const today = new Date(); today.setHours(0, 0, 0, 0); setStartDate(today);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-colors",
                    calendarView === "today"
                      ? "text-white font-medium shadow-xs"
                      : "text-neutral-400 hover:text-white bg-transparent"
                  )}
                  style={
                    calendarView === "today"
                      ? {
                          background: "rgba(255, 255, 255, 0.16)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          boxShadow:
                            "rgba(0, 0, 0, 0.3) 0px 2px 8px, rgba(255, 255, 255, 0.2) 0px 1px 1px inset",
                        }
                      : undefined
                  }
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalendarView("month");
                    moveWindow(5);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-colors",
                    calendarView === "month"
                      ? "text-white font-medium shadow-xs"
                      : "text-neutral-400 hover:text-white bg-transparent"
                  )}
                  style={
                    calendarView === "month"
                      ? {
                          background: "rgba(255, 255, 255, 0.16)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          boxShadow:
                            "rgba(0, 0, 0, 0.3) 0px 2px 8px, rgba(255, 255, 255, 0.2) 0px 1px 1px inset",
                        }
                      : undefined
                  }
                >
                  Next 5 days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalendarView("year");
                    moveWindow(-5);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-colors",
                    calendarView === "year"
                      ? "text-white font-medium shadow-xs"
                      : "text-neutral-400 hover:text-white bg-transparent"
                  )}
                  style={
                    calendarView === "year"
                      ? {
                          background: "rgba(255, 255, 255, 0.16)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          boxShadow:
                            "rgba(0, 0, 0, 0.3) 0px 2px 8px, rgba(255, 255, 255, 0.2) 0px 1px 1px inset",
                        }
                      : undefined
                  }
                >
                  Previous 5 days
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Timeline Grid Container */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-auto relative min-w-0">
            <div className="w-full min-w-[960px] lg:min-w-0 h-full flex flex-col relative">
              {/* Day Columns Header (Fixed Top) */}
              <div
                className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-[#1f1f1f] bg-[#050505] sticky top-0 z-20"
                style={{
                  background: "transparent",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {/* Blank time label corner */}
                <div className="h-12 calendar-col-divider" />
                {calendarDays.map((day, idx) => (
                  <div
                    key={day.dayNumber}
                    onClick={() => {
                      setSelectedDayForNewPost(idx);
                      setShowNewPostModal(true);
                    }}
                    className={cn(
                      "h-12 px-2 flex flex-col justify-center items-center cursor-pointer hover:bg-white/[0.02] transition-colors",
                      idx < 4 ? "calendar-col-divider" : ""
                    )}
                    title={`Click to schedule post on ${day.dayName} ${day.dayNumber}`}
                  >
                    <span className="text-sm font-bold text-white tracking-tight leading-none">
                      {day.dayNumber}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium mt-0.5">
                      {day.dayName}
                    </span>
                  </div>
                ))}
              </div>

              {/* Time Grid & Scheduled Items Canvas */}
              <div className="relative flex-1 h-full min-h-[580px]" style={{ minHeight: Math.max(580, Math.max(...calendarDays.map((_, index) => displayedPosts.filter((post) => post.dayIndex === index).length), 1) * 330) }}>
                {/* Background Grid Rows (Time Slots) */}
                <div className="grid grid-cols-[60px_repeat(5,1fr)] h-full">
                  {/* Time Column Labels */}
                  <div className="calendar-col-divider flex flex-col text-neutral-500 text-[10px] font-medium select-none">
                    {TIME_SLOTS.map((t) => (
                      <div key={t} className="h-28 pt-1.5 px-2 calendar-grid-line text-right">
                        {t}
                      </div>
                    ))}
                  </div>

                  {/* Day Columns 1 to 5 Grid Lines */}
                  {[0, 1, 2, 3, 4].map((colIndex) => (
                    <div
                      key={colIndex}
                      onClick={() => {
                        setSelectedDayForNewPost(colIndex);
                        setShowNewPostModal(true);
                      }}
                      className={cn(
                        "flex flex-col cursor-pointer hover:bg-white/[0.015] transition-colors",
                        colIndex < 4 ? "calendar-col-divider" : ""
                      )}
                      title={`Click empty slot to schedule post`}
                    >
                      {TIME_SLOTS.map((t) => (
                        <div key={t} className="h-28 calendar-grid-line" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Absolute Overlay for Scheduled Content Cards */}
                <div className="absolute inset-0 left-[60px] grid grid-cols-5 pointer-events-none p-2 gap-2 min-w-0">
                  {[0, 1, 2, 3, 4].map((colIndex) => {
                    const posts = displayedPosts.filter((post) => post.dayIndex === colIndex);
                    return (
                      <div key={colIndex} className="relative w-full h-full">
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
                          className="pointer-events-auto absolute left-1 right-1 transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col select-none rounded-[20px] p-2.5 shadow-lg border border-white/5 bg-[#1c2e26]"
                        >
                          {/* Top Image Container with 3-dot menu and bottom overlay info */}
                          <div className="relative w-full h-44 rounded-[14px] overflow-hidden bg-neutral-900 shrink-0">
                            {post.imageUrl ? <img
                              alt={post.imageAlt}
                              className="w-full h-full object-cover block"
                              src={post.imageUrl}
                            /> : <div className="flex h-full items-center justify-center p-4 text-center text-xs text-neutral-300">{post.caption}</div>}

                            {/* 3-dot context menu */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuPostId(openMenuPostId === post.id ? null : post.id);
                              }}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors border border-white/10 shadow-sm z-10"
                              title="Post options"
                            >
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
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
                                  onClick={() => {
                                    addToast({
                                      title: "Publishing unavailable",
                                      description: "Automatic publishing is not available yet",
                                      variant: "info",
                                    });
                                    setOpenMenuPostId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-brand-lime hover:bg-white/10 transition-colors"
                                >
                                  Publish Now
                                </button>
                                <div className="border-t border-white/10 my-1" />
                                {(post.status === "scheduled" || post.status === "draft") && <button
                                  type="button"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                >
                                  {post.status === "draft" ? "Delete Draft" : "Cancel Schedule"}
                                </button>}
                              </div>
                            )}

                            {/* Bottom overlay info (Name & Handle on image to the right of avatar pocket) */}
                            <div className="absolute bottom-2 left-[58px] right-2 z-10 flex flex-col min-w-0 drop-shadow-md pointer-events-none">
                              <span className="font-bold text-[13px] text-white leading-tight truncate">
                                {post.authorName}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span
                                  className={cn(
                                    "w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[7px] text-white shrink-0 shadow-xs",
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

                          {/* Creator avatar notch overlapping bottom edge of image */}
                          <div className="relative flex items-center -mt-7 z-10 px-0.5">
                            <div
                              className="p-1 bg-[#1c2e26] rounded-[16px] shadow-md shrink-0 flex items-center justify-center"
                              style={{
                                background: "rgba(255, 255, 255, 0.08)",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.14)",
                              }}
                            >
                              <div className="w-10 h-10 rounded-[12px] overflow-hidden bg-neutral-800 shrink-0 relative">
                                <img
                                  alt={post.authorName}
                                  className="w-full h-full object-cover"
                                  src={post.authorAvatar}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Caption & Hashtag */}
                          <p className="text-[11.5px] text-white/90 truncate mt-2 font-medium px-1">
                            {post.caption}
                          </p>
                          <div className="mt-1.5 px-1">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-medium text-white/90 border border-white/10 shadow-xs"
                              style={{
                                background: "rgba(255, 255, 255, 0.08)",
                                backdropFilter: "blur(8px)",
                                WebkitBackdropFilter: "blur(8px)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                boxShadow:
                                  "rgba(0, 0, 0, 0.2) 0px 2px 6px, rgba(255, 255, 255, 0.12) 0px 1px 1px inset",
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
                  <h3 className="text-sm font-bold text-white">{activeModalPost.authorName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[7px] text-white",
                        activeModalPost.platformBadgeBg
                      )}
                    >
                      {activeModalPost.platformBadgeIcon}
                    </span>
                    <span className="text-xs text-neutral-400">{activeModalPost.authorHandle}</span>
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
              {activeModalPost.imageUrl ? <img
                src={activeModalPost.imageUrl}
                alt={activeModalPost.imageAlt}
                className="w-full h-full object-cover"
              /> : <div className="flex h-full items-center justify-center p-6 text-center text-neutral-300">{activeModalPost.caption}</div>}
              <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/20">
                {activeModalPost.tag}
              </span>
            </div>

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
              {(activeModalPost.status === "scheduled" || activeModalPost.status === "draft") && <button
                type="button"
                onClick={() => handleDeletePost(activeModalPost.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                {activeModalPost.status === "draft" ? "Delete Draft" : "Cancel Schedule"}
              </button>}
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
                  onClick={() => {
                    addToast({
                      title: "Publishing unavailable",
                      description: "Automatic publishing is not available yet",
                      variant: "info",
                    });
                    setActiveModalPost(null);
                  }}
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
            className="w-full max-w-md rounded-2xl p-6 text-white shadow-2xl border border-white/15"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Manage Connected Channels</h3>
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
                      <img src={ch.avatarUrl} alt={ch.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{ch.name}</h4>
                      <p className="text-[10px] text-neutral-400">{ch.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                    {(
                      <button
                        type="button"
                        onClick={() => handleDisconnectChannel(ch)}
                        className="text-neutral-500 hover:text-red-400 text-xs p-1"
                        title="Disconnect"
                      >
                        ✕
                      </button>
                    )}
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
          onClick={() => setShowNewPostModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl p-6 text-white shadow-2xl border border-white/15"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                Schedule New Post {selectedDayForNewPost !== null && `for ${calendarDays[selectedDayForNewPost].dayName} ${calendarDays[selectedDayForNewPost].dayNumber}`}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPostModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">Channel</label>
                <select
                  value={newPostChannelId}
                  onChange={(e) => setNewPostChannelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                >
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name} ({ch.handle})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] text-neutral-400">This saves a workspace post for the selected platform. Publishing to a specific account is not available yet.</p>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">Scheduled Time</label>
                <input
                  type="time"
                  value={newPostTime}
                  onChange={(e) => setNewPostTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">Caption</label>
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
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">Hashtag / Tag</label>
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
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-[#b1de22] text-black shadow-md transition-colors"
                >
                  Schedule Post
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
                <h3 className="text-sm font-bold text-white">AI Agent Automated Workflow</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAgentModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-neutral-300 leading-relaxed">
              <p>
                AI planning and automatic publishing are not available yet. The calendar shows posts saved in your workspace database.
              </p>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-semibold text-white">Available now:</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-400">
                  <li>Connect Facebook Pages and linked Instagram accounts</li>
                  <li>View and save scheduled posts in your workspace</li>
                  <li>Cancel a scheduled post or disconnect a channel</li>
                </ul>
              </div>

              <p className="text-neutral-400 text-[11px]">
                Saved schedules do not publish automatically yet.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAgentModal(false);
                  addToast({
                    title: "Scheduling unavailable",
                    description: "AI scheduling is not available yet",
                    variant: "info",
                  });
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-lime hover:bg-[#b1de22] text-black shadow-md transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
