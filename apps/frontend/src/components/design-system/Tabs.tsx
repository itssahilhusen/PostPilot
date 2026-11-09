"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  size?: "sm" | "md";
  className?: string;
  pill?: boolean;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  size = "sm",
  className,
  pill = true,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center p-0.5 sm:p-1 bg-[var(--surface-secondary)] border border-[var(--border)]",
        pill ? "rounded-full" : "rounded-xl",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 transition-all duration-150 select-none cursor-pointer whitespace-nowrap",
              pill ? "rounded-full" : "rounded-lg",
              size === "sm"
                ? "h-7 px-2.5 sm:px-3 text-xs font-semibold"
                : "h-8 px-3 sm:px-4 text-xs sm:text-sm font-semibold",
              isActive
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)] font-bold"
                : "text-[var(--muted)] hover:text-[var(--foreground)] border border-transparent"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  isActive
                    ? "bg-[#C5F52A] text-black font-bold"
                    : "bg-[var(--surface)] text-[var(--muted)]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

