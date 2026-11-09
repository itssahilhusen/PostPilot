"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "xs" | "sm" | "md" | number;
  onClear?: () => void;
  showKbd?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onChange,
      onClear,
      placeholder = "Search ideas, headlines, keywords, or sources...",
      showKbd = true,
      size = "sm",
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <svg
          className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" x2="16.65" y1="21" y2="16.65" />
        </svg>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
          }}
          className={cn(
            "w-full focus:outline-none text-xs text-neutral-200 placeholder-neutral-400 rounded-xl pl-8 pr-8 py-1.5 transition-colors focus:border-[#C5F52A]/50",
            className
          )}
          {...props}
        />

        {showKbd && (
          <span
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
            className="absolute right-2 top-1.5 px-1.5 py-0.5 rounded text-[9px] text-neutral-300 font-mono pointer-events-none select-none"
          >
            ⌘K
          </span>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
