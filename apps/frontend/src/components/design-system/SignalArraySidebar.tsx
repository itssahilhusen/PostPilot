"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Plus, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { Dropdown } from "./Dropdown";

export interface ConnectedChannel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platform: "x" | "linkedin" | "threads" | "instagram";
  active?: boolean;
}

interface SignalArraySidebarProps {
  onOpenFlywheelModal?: () => void;
  onAddChannel?: () => void;
  className?: string;
}

export function SignalArraySidebar({
  onOpenFlywheelModal,
  onAddChannel,
  className,
}: SignalArraySidebarProps) {
  // Cadence State
  const [cadence, setCadence] = useState<"daily" | "3x" | "custom">("daily");

  // Timezone State
  const [timezone, setTimezone] = useState("gmt1");

  // Toggles State
  const [autoSuggestTime, setAutoSuggestTime] = useState(true);
  const [autoRecycleEvergreen, setAutoRecycleEvergreen] = useState(false);

  // Channels matching screenshot
  const channels: ConnectedChannel[] = [
    {
      id: "nevo",
      name: "Nevo David",
      handle: "@nevo_david",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      platform: "x",
      active: true,
    },
    {
      id: "nova",
      name: "Nova Clay",
      handle: "@nova_clay",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      platform: "linkedin",
      active: true,
    },
    {
      id: "acme",
      name: "Acme Co",
      handle: "@acme_co",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
      platform: "threads",
      active: true,
    },
  ];

  const tzOptions = [
    { value: "gmt1", label: "GMT+1 · Auto-detected" },
    { value: "utc", label: "UTC · Coordinated Universal Time" },
    { value: "est", label: "EST · New York (UTC-5)" },
    { value: "pst", label: "PST · San Francisco (UTC-8)" },
    { value: "cet", label: "CET · Berlin / Paris (UTC+1)" },
    { value: "kst", label: "KST · Seoul / Tokyo (UTC+9)" },
  ];

  return (
    <aside
      className={cn(
        "w-[260px] shrink-0 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col justify-between p-4 overflow-y-auto select-none z-20 transition-colors",
        className
      )}
    >
      <div className="flex flex-col gap-5">
        {/* Header: Signal Array */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">
            Signal Array
          </h2>
        </div>

        {/* Channels Section */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-[var(--muted)] uppercase">
              Channels
            </span>
            <button
              type="button"
              onClick={onAddChannel}
              className="text-xs font-bold text-[#C5F52A] hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          {/* Channel Avatars Row */}
          <div className="flex items-center gap-3 py-1">
            {channels.map((ch) => (
              <div key={ch.id} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                <div className="relative">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[var(--border)] group-hover:border-[#C5F52A] transition-all">
                    <Image
                      src={ch.avatar}
                      alt={ch.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  {/* Platform Badge overlay at bottom right */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center p-0.5 shadow-xs">
                    <Image
                      src={
                        ch.platform === "x"
                          ? "/images/platforms/x-light.svg"
                          : ch.platform === "linkedin"
                          ? "/images/platforms/linkedin.svg"
                          : "/images/platforms/threads.svg"
                      }
                      alt={ch.platform}
                      width={10}
                      height={10}
                      className="object-contain"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-[var(--muted)] group-hover:text-[var(--foreground)] font-medium max-w-[55px] truncate text-center">
                  {ch.name}
                </span>
              </div>
            ))}
          </div>

          {/* Add New Channel Button */}
          <button
            type="button"
            onClick={onAddChannel}
            className="w-full h-8 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] text-[var(--foreground)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <span>Add new channel</span>
            <Plus className="w-3.5 h-3.5 text-[var(--muted)]" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border)]/60" />

        {/* Post Schedule Section */}
        <div className="flex flex-col gap-3.5">
          <span className="text-[10px] font-bold tracking-wider text-[var(--muted)] uppercase">
            Post Schedule
          </span>

          {/* Posting Cadence Segmented Pills */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--foreground)]">Posting cadence</span>
            <div className="grid grid-cols-3 p-1 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCadence("daily")}
                className={cn(
                  "h-7 rounded-full transition-all cursor-pointer",
                  cadence === "daily"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)] font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setCadence("3x")}
                className={cn(
                  "h-7 rounded-full transition-all cursor-pointer",
                  cadence === "3x"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)] font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                3x/week
              </button>
              <button
                type="button"
                onClick={() => setCadence("custom")}
                className={cn(
                  "h-7 rounded-full transition-all cursor-pointer",
                  cadence === "custom"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)] font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Time zone selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--foreground)]">Time zone</span>
            <Dropdown
              options={tzOptions}
              value={timezone}
              onChange={setTimezone}
              size="sm"
              className="w-full"
            />
          </div>

          {/* Auto-suggest best time Toggle */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-medium text-[var(--foreground)]">
              Auto-suggest best time
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoSuggestTime}
              onClick={() => setAutoSuggestTime(!autoSuggestTime)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                autoSuggestTime ? "bg-[#C5F52A]" : "bg-[var(--border)]"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                  autoSuggestTime ? "translate-x-4" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>

          {/* Auto-recycle evergreen Toggle */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div>
              <span className="text-xs font-medium text-[var(--foreground)] block">
                Auto-recycle evergreen
              </span>
              <span className="text-[10px] text-[var(--muted)] block">
                Showcases top posts in rotation
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoRecycleEvergreen}
              onClick={() => setAutoRecycleEvergreen(!autoRecycleEvergreen)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                autoRecycleEvergreen ? "bg-[#C5F52A]" : "bg-[var(--border)]"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                  autoRecycleEvergreen ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Card: Agent automated workflow (Exact replica from reference screenshot) */}
      <div className="mt-4 pt-3 border-t border-[var(--border)]/60">
        <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
          {/* Mock AI Agent Chat Bubble Preview */}
          <div className="rounded-xl bg-black/40 border border-white/5 p-2.5 flex flex-col gap-1.5 shadow-inner">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Agent</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5 text-[10px] text-white/80 leading-snug">
              Schedule post for upcoming week on all the channels
            </div>
            <div className="flex items-center gap-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-white/60">X · LinkedIn · Threads</span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#C5F52A]/10 border border-[#C5F52A]/20 text-[10px] text-white leading-snug">
              Done — I&apos;ve scheduled 7 posts across all 3 channels for the week ahead
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[var(--foreground)]">
              Agent automated workflow
            </h4>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed mt-0.5">
              Streamline your daily posting workflow with an AI agent.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenFlywheelModal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)] hover:text-[#C5F52A] transition-colors cursor-pointer group mt-0.5"
          >
            <span>Learn more</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SignalArraySidebar;

