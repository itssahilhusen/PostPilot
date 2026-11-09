"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StatusBadge, StatusType } from "./StatusBadge";
import { Clock, Eye, Layers } from "lucide-react";

export interface ContentCardProps {
  id: string;
  title: string;
  excerpt?: string;
  status?: StatusType | string;
  platforms?: string[];
  image?: string;
  category?: string;
  date?: string;
  authorName?: string;
  authorAvatar?: string;
  onClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function ContentCard({
  title,
  excerpt,
  status = "DRAFT",
  platforms = ["x", "linkedin"],
  image,
  category,
  date,
  authorName,
  authorAvatar,
  onClick,
  actions,
  className,
}: ContentCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col sm:flex-row gap-3.5 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] transition-all duration-150 select-none cursor-pointer shadow-2xs",
        "hover:border-[#C5F52A]/40 hover:bg-[var(--surface-secondary)]/30",
        className
      )}
    >
      {image && (
        <div className="relative w-full sm:w-28 sm:h-24 aspect-[16/9] sm:aspect-auto rounded-xl overflow-hidden bg-[var(--surface-secondary)] shrink-0 border border-[var(--border)]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="120px"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between gap-2 min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {category && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-[var(--muted)] bg-[var(--surface-secondary)] border border-[var(--border)]">
                  {category}
                </span>
              )}
              <StatusBadge status={status} size="xs" />
            </div>

            {date && (
              <span className="text-[10px] text-[var(--muted)] font-mono flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                <span>{date}</span>
              </span>
            )}
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-[#C5F52A] transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="text-xs text-[var(--muted)] line-clamp-2 mt-0.5 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/40">
          {authorName && (
            <div className="flex items-center gap-1.5 min-w-0">
              {authorAvatar && (
                <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-[var(--border)]">
                  <Image src={authorAvatar} alt={authorName} fill sizes="16px" className="object-cover" />
                </div>
              )}
              <span className="text-[11px] text-[var(--muted)] truncate font-medium">{authorName}</span>
            </div>
          )}

          {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

