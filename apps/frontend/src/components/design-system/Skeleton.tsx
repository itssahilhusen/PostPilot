"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      className={cn("animate-pulse rounded-xl", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
      }}
      className="flex flex-col justify-between overflow-hidden rounded-[20px] p-2.5 animate-pulse min-h-[340px]"
    >
      <div>
        {/* Top header row skeleton */}
        <div className="flex items-center justify-between mb-2.5 px-1 pt-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-12 h-4 rounded" />
            <Skeleton className="w-24 h-3.5 rounded" />
          </div>
          <Skeleton className="w-10 h-3.5 rounded" />
        </div>

        {/* Media box skeleton */}
        <Skeleton className="w-full h-[155px] rounded-[16px] mb-2.5" />

        {/* Text rows skeleton */}
        <div className="space-y-2 px-1">
          <Skeleton className="w-32 h-3 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-4/5 h-3 rounded" />
        </div>
      </div>

      {/* Buttons skeleton */}
      <div
        className="mt-3 pt-2.5 flex items-center gap-1.5 px-1"
        style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        <Skeleton className="flex-1 h-7 rounded-xl" />
        <Skeleton className="flex-1 h-7 rounded-xl" />
        <Skeleton className="flex-1 h-7 rounded-xl" />
      </div>
    </div>
  );
}

