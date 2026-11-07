"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Bot, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyFlywheelAlertBannerProps {
  onOpenFlywheelModal: () => void;
  className?: string;
}

export function DailyFlywheelAlertBanner({
  onOpenFlywheelModal,
  className,
}: DailyFlywheelAlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [styleMemory, setStyleMemory] = useState<any>(null);

  useEffect(() => {
    // Read from config to see if prompt should be shown
    const checkMemory = async () => {
      try {
        const res = await fetch("/api/automations/daily-pipeline/config");
        if (res.ok) {
          const data = await res.json();
          if (data.config?.styleMemory) {
            setStyleMemory(data.config.styleMemory);
            // Show if user hasn't explicitly dismissed or already automated
            const dismissed = localStorage.getItem("reerts_flywheel_banner_dismissed");
            if (!dismissed && !data.config.enabled) {
              setIsVisible(true);
            }
          }
        }
      } catch {
        // ignore
      }
    };
    checkMemory();
  }, []);

  if (!isVisible) return null;

  const detectedNiche = styleMemory?.detectedNiche || "Tech & AI Breakthroughs";
  const favoriteTheme = styleMemory?.favoriteTemplate || "FutureTech";

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("reerts_flywheel_banner_dismissed", "true");
  };

  return (
    <div
      className={cn(
        "relative mx-4 my-2.5 p-3 sm:p-3.5 rounded-2xl border border-[#c6f432]/40 bg-gradient-to-r from-[#c6f432]/10 via-[var(--panel)] to-[var(--panel)] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300 font-sans z-30 select-none",
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="size-9 rounded-xl bg-[#c6f432] text-[#141414] flex items-center justify-center shrink-0 shadow-xs">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#4f7a00] dark:text-[#c6f432]">
              Reerts Style Memory
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#c6f432]/20 text-[#4f7a00] dark:text-[#c6f432]">
              NEW PATTERN
            </span>
          </div>
          <p className="text-xs font-semibold text-[var(--fg)] mt-0.5 leading-snug">
            We noticed you post in <span className="text-[#4f7a00] dark:text-[#c6f432] font-black">{detectedNiche}</span> using the{" "}
            <span className="font-black text-[var(--fg)] capitalize">{favoriteTheme}</span> style. Want Reerts to automate your daily content loop?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-2.5 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--hover)] text-xs font-bold text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={() => {
            onOpenFlywheelModal();
            setIsVisible(false);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <span>Automate Daily</span>
          <ArrowRight className="size-3" />
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="size-7 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer ml-1"
          title="Dismiss"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

