"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sparkles, Plus, Calendar as CalendarIcon } from "lucide-react";
import { PrimaryButton, SecondaryButton, IconButton } from "./Buttons";
import { Tabs } from "./Tabs";

export type CalendarViewType = "day" | "week" | "month" | "queue";

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  badge?: string;
  subtitle?: string;
  // Date Controls
  showDateNav?: boolean;
  dateLabel?: string;
  onPrevDate?: () => void;
  onNextDate?: () => void;
  onToday?: () => void;
  // View Selector
  viewMode?: CalendarViewType;
  onViewModeChange?: (view: CalendarViewType) => void;
  // Actions
  onDailyFlywheel?: () => void;
  onScheduleSlot?: () => void;
  primaryActionLabel?: string;
  primaryActionIcon?: React.ReactNode;
  extraActions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon = <CalendarIcon className="w-4 h-4 text-black" />,
  title = "Content Calendar",
  badge = "Scheduling Hub",
  subtitle = "Plan, schedule, and automate multi-channel releases.",
  showDateNav = true,
  dateLabel,
  onPrevDate,
  onNextDate,
  onToday,
  viewMode = "week",
  onViewModeChange,
  onDailyFlywheel,
  onScheduleSlot,
  primaryActionLabel = "Schedule Slot",
  primaryActionIcon = <Plus className="w-3.5 h-3.5" />,
  extraActions,
  className,
}: PageHeaderProps) {
  const viewTabs = [
    { id: "day" as const, label: "Day" },
    { id: "week" as const, label: "Week" },
    { id: "month" as const, label: "Month" },
    { id: "queue" as const, label: "Queue" },
  ];

  return (
    <div
      className={cn(
        "shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 select-none transition-colors",
        className
      )}
    >
      {/* Title & Badge */}
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[#C5F52A] text-black flex items-center justify-center font-bold shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-[17px] font-semibold tracking-tight text-[var(--foreground)] truncate">
              {title}
            </h1>
            {badge && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5F52A]/15 text-[#C5F52A] border border-[#C5F52A]/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[var(--muted)] truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
        {/* Date Navigation */}
        {showDateNav && (
          <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-0.5 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={onPrevDate}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {dateLabel && (
              <span className="px-3 min-w-[120px] text-center font-semibold text-xs text-[var(--foreground)] truncate">
                {dateLabel}
              </span>
            )}

            <button
              type="button"
              onClick={onNextDate}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Today Button */}
        {onToday && (
          <button
            type="button"
            onClick={onToday}
            className="h-8 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--foreground)] transition-all cursor-pointer shadow-2xs"
          >
            Today
          </button>
        )}

        {/* View Mode Segmented Tabs */}
        {onViewModeChange && (
          <Tabs
            tabs={viewTabs}
            activeTab={viewMode}
            onChange={onViewModeChange}
            size="sm"
            pill={true}
          />
        )}

        {extraActions}

        {/* Daily Flywheel Button */}
        {onDailyFlywheel && (
          <SecondaryButton
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5 text-[#C5F52A]" />}
            onClick={onDailyFlywheel}
            title="Open Daily Flywheel Automation Hub"
          >
            <span className="hidden sm:inline">Daily</span> Flywheel
          </SecondaryButton>
        )}

        {/* Schedule Slot / Primary Action */}
        {onScheduleSlot && (
          <PrimaryButton size="sm" icon={primaryActionIcon} onClick={onScheduleSlot}>
            {primaryActionLabel}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

