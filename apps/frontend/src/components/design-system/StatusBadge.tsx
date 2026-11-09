"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, AlertTriangle, FileEdit } from "lucide-react";

export type StatusType =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "PENDING_REVIEW"
  | "SCHEDULED"
  | "PUBLISHED"
  | "FAILED";

export interface StatusBadgeProps {
  status: StatusType | string;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = "sm",
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const normStatus = (status || "DRAFT").toUpperCase();

  const config = (() => {
    switch (normStatus) {
      case "SCHEDULED":
        return {
          label: "Scheduled",
          icon: Clock,
          styles: "bg-[#C5F52A]/15 text-[#C5F52A] border-[#C5F52A]/30",
          dotColor: "bg-[#C5F52A]",
        };
      case "PUBLISHED":
        return {
          label: "Published",
          icon: Check,
          styles: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          dotColor: "bg-emerald-400",
        };
      case "PENDING_APPROVAL":
      case "PENDING_REVIEW":
        return {
          label: "Pending",
          icon: AlertTriangle,
          styles: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          dotColor: "bg-amber-400",
        };
      case "FAILED":
        return {
          label: "Failed",
          icon: AlertCircle,
          styles: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          dotColor: "bg-rose-400",
        };
      case "DRAFT":
      default:
        return {
          label: "Draft",
          icon: FileEdit,
          styles: "bg-white/10 text-neutral-400 border-white/15",
          dotColor: "bg-neutral-400",
        };
    }
  })();

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px] gap-1 rounded-md",
    sm: "px-2 py-0.5 text-[10px] gap-1.5 rounded-full font-bold uppercase tracking-wider",
    md: "px-2.5 py-1 text-xs gap-1.5 rounded-full font-semibold",
  }[size];

  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center border select-none transition-colors",
        config.styles,
        sizeClasses,
        className
      )}
    >
      {showIcon ? (
        <IconComponent className="w-2.5 h-2.5 shrink-0" />
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotColor)} />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const cat = category.toUpperCase().trim();

  if (cat === "AI SYNTHESIS") {
    return (
      <span
        className={cn(
          "px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-lime text-black uppercase tracking-wider select-none shrink-0",
          className
        )}
      >
        AI SYNTHESIS
      </span>
    );
  }

  let color = "#C5F52A";
  if (cat.includes("X") || cat.includes("POST") || cat.includes("TWITTER")) {
    color = "#c084fc";
  } else if (cat.includes("REDDIT")) {
    color = "#fbbf24";
  } else if (cat.includes("SECURITY")) {
    color = "#22d3ee";
  } else if (cat.includes("NEWSLETTER")) {
    color = "#f472b6";
  } else if (cat.includes("RESEARCH")) {
    color = "#C5F52A";
  }

  return (
    <span
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        color: color,
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
      className={cn(
        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider select-none shrink-0",
        className
      )}
    >
      {category}
    </span>
  );
}
