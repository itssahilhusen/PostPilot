"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, TrendingUp, Filter, Sparkles } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { FilterButton } from "./Buttons";

export interface PublishingStats {
  scheduledCount: number;
  publishedCount: number;
  bestTimes?: string[];
  pendingCount?: number;
}

interface PageToolbarProps {
  // Stats
  stats?: PublishingStats;
  // Search
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear?: () => void;
  // Channel Filter
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  // Status Filter
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  className?: string;
}

export function PageToolbar({
  stats = { scheduledCount: 0, publishedCount: 0, bestTimes: ["10:00 AM", "6:30 PM"] },
  searchQuery,
  onSearchChange,
  onSearchClear,
  selectedChannel,
  onChannelChange,
  selectedStatus,
  onStatusChange,
  className,
}: PageToolbarProps) {
  const channels = [
    { id: "all", label: "All Channels" },
    { id: "x", label: "X" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "threads", label: "Threads" },
    { id: "instagram", label: "Instagram" },
  ];

  const statuses = [
    { id: "all", label: "All Statuses" },
    { id: "DRAFT", label: "Draft" },
    { id: "PENDING_APPROVAL", label: "Pending Approval" },
    { id: "SCHEDULED", label: "Scheduled" },
    { id: "PUBLISHED", label: "Published" },
    { id: "FAILED", label: "Failed" },
  ];

  const bestTimesString = stats.bestTimes && stats.bestTimes.length > 0
    ? stats.bestTimes.join(" & ")
    : "10:00 AM & 6:30 PM";

  return (
    <div
      className={cn(
        "shrink-0 border-b border-[var(--border)] bg-[var(--surface-secondary)]/50 px-4 sm:px-6 py-2.5 flex flex-col gap-2.5 select-none transition-colors",
        className
      )}
    >
      {/* Row 1: Real Dynamic Publishing Statistics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Scheduled Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#C5F52A]" />
            <span className="text-[var(--muted)] font-normal">Scheduled:</span>
            <span className="font-bold font-mono text-[#C5F52A]">{stats.scheduledCount}</span>
          </div>

          {/* Published Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[var(--muted)] font-normal">Published:</span>
            <span className="font-bold font-mono text-emerald-400">{stats.publishedCount}</span>
          </div>

          {/* Best Posting Time Recommendation */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5F52A]" />
            <span className="text-[var(--muted)] font-normal">Best Time:</span>
            <span className="font-medium text-[var(--foreground)]">{bestTimesString}</span>
          </div>
        </div>

        {/* Search Field */}
        <div className="w-full sm:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={onSearchClear}
            placeholder="Search scheduled posts..."
            size="sm"
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {/* Row 2: Working Channel Filters & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/40">
        {/* Channel Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mr-1 hidden sm:inline">
            Channels:
          </span>
          {channels.map((ch) => (
            <FilterButton
              key={ch.id}
              active={selectedChannel === ch.id}
              onClick={() => onChannelChange(ch.id)}
            >
              {ch.label}
            </FilterButton>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mr-1 hidden md:inline">
            Status:
          </span>
          {statuses.map((st) => (
            <FilterButton
              key={st.id}
              active={selectedStatus === st.id}
              onClick={() => onStatusChange(st.id)}
            >
              {st.label}
            </FilterButton>
          ))}
        </div>
      </div>
    </div>
  );
}

