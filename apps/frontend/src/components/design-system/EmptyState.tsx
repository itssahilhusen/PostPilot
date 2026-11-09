"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "./Buttons";
import { CalendarX } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = <CalendarX className="w-8 h-8 text-[var(--muted)]" />,
  title = "No items found",
  description = "No posts scheduled for this period. Click below to add a new slot.",
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] select-none",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center mb-3.5 shadow-2xs">
        {icon}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <PrimaryButton size="sm" onClick={onAction}>
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}

