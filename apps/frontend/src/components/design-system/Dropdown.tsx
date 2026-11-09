"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
  align?: "left" | "right";
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
  size = "sm",
  className,
  icon,
  align = "left",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-between gap-2 bg-[var(--surface-secondary)] text-[var(--foreground)] border border-[var(--border)] rounded-xl font-medium transition-all select-none cursor-pointer",
          "hover:border-[var(--muted)]/50 focus:outline-none focus:ring-1 focus:ring-[#C5F52A]/40",
          size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-3.5 text-sm"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="text-[var(--muted)]">{icon}</span>}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-150 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[160px] max-h-60 overflow-auto rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer",
                  isSelected
                    ? "bg-[#C5F52A]/15 text-[#C5F52A] font-bold"
                    : "text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="truncate">
                    <div>{opt.label}</div>
                    {opt.description && (
                      <div className="text-[10px] text-[var(--muted)] truncate">
                        {opt.description}
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

