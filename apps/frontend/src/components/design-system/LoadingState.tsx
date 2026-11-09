"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[var(--surface-secondary)]/80 border border-[var(--border)]/40",
        className
      )}
    />
  );
}

export function CalendarGridLoadingState() {
  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 md:grid-cols-7 gap-3 p-4 overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] min-h-[500px]"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <Skeleton className="w-12 h-4" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-3/4 h-3 rounded-md" />
          <Skeleton className="w-1/2 h-3 rounded-md" />
        </div>
      ))}
    </div>
  );
}

