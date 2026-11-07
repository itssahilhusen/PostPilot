"use client";

import React, { useState } from "react";
import { ChevronDown, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SocialAccountOption {
  id: string;
  name: string;
  handle: string;
  provider: string;
  avatar?: string | null;
}

interface AccountSelectorComboboxProps {
  accounts: SocialAccountOption[];
  selectedAccountId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}

export function AccountSelectorCombobox({
  accounts,
  selectedAccountId,
  onSelect,
  className,
}: AccountSelectorComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = accounts.find((a) => a.id === selectedAccountId);

  const getPlatformIcon = (prov?: string) => {
    switch (prov?.toLowerCase()) {
      case "threads":
        return "/images/platforms/threads.svg";
      case "x":
        return "/images/platforms/x-light.svg";
      case "linkedin":
        return "/images/platforms/linkedin.svg";
      case "instagram":
        return "/images/platforms/instagram.svg";
      case "tiktok":
        return "/images/platforms/tiktok-light.svg";
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 min-w-[200px] items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors shadow-xs"
      >
        <div className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              {selected.provider && (
                <img
                  src={getPlatformIcon(selected.provider) || ""}
                  alt={selected.provider}
                  className="size-3.5 object-contain dark:invert"
                />
              )}
              <span className="truncate">{selected.name} (@{selected.handle})</span>
            </>
          ) : (
            <>
              <Users className="size-3.5 text-muted-foreground" />
              <span className="truncate text-muted-foreground">All Accounts</span>
            </>
          )}
        </div>
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 z-40 mt-1.5 w-64 rounded-xl border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors",
                selectedAccountId === null
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <Users className="size-3.5" />
                <span>All Accounts</span>
              </div>
              {selectedAccountId === null && <Check className="size-3.5" />}
            </button>

            <div className="my-1 border-t border-border/50" />

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {accounts.map((acc) => {
                const icon = getPlatformIcon(acc.provider);
                const isCurrent = acc.id === selectedAccountId;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      onSelect(acc.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors",
                      isCurrent
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {icon && (
                        <img
                          src={icon}
                          alt={acc.provider}
                          className={cn("size-3.5 object-contain", isCurrent ? "invert-0" : "dark:invert")}
                        />
                      )}
                      <span className="truncate">{acc.name} <span className="opacity-70">(@{acc.handle})</span></span>
                    </div>
                    {isCurrent && <Check className="size-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
