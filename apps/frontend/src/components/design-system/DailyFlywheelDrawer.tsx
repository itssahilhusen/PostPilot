"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Drawer } from "./Drawer";
import { PrimaryButton, SecondaryButton } from "./Buttons";
import {
  Sparkles,
  Play,
  Pause,
  Bot,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  Layers,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

interface DailyFlywheelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableProjectsCount?: number;
  approvedDraftsCount?: number;
  upcomingScheduledCount?: number;
}

export function DailyFlywheelDrawer({
  isOpen,
  onClose,
  availableProjectsCount = 12,
  approvedDraftsCount = 4,
  upcomingScheduledCount = 7,
}: DailyFlywheelDrawerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(2);
  const [remainingCredits, setRemainingCredits] = useState(485);

  const handleToggleAutomation = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (nextState) {
      toast.success("Daily Flywheel Automation Active", {
        description: `Autonomous agent will queue ${dailyTarget} posts daily based on trending news.`,
      });
    } else {
      toast.info("Flywheel paused");
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Flywheel Automation"
      subtitle="Autonomous content scheduling and multi-channel publication engine"
      width="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>AI Credits: <strong className="text-[var(--foreground)]">{remainingCredits}</strong></span>
          </div>

          <PrimaryButton
            size="sm"
            icon={isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            onClick={handleToggleAutomation}
            className={isRunning ? "bg-amber-400 hover:bg-amber-500 text-black" : undefined}
          >
            {isRunning ? "Pause Automation" : "Start Flywheel Engine"}
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5 select-none text-xs">
        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-xs",
                isRunning
                  ? "bg-[#C5F52A] text-black animate-pulse"
                  : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
              )}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--foreground)]">
                  Flywheel Agent Engine
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    isRunning
                      ? "bg-[#C5F52A]/15 text-[#C5F52A] border border-[#C5F52A]/30"
                      : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
                  )}
                >
                  {isRunning ? "Running" : "Paused"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">
                Automatically discovers trending topics, drafts carousels, and schedules releases.
              </p>
            </div>
          </div>
        </div>

        {/* Engine Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Daily Target</span>
            <span className="text-lg font-bold font-mono text-[#C5F52A]">{dailyTarget} / day</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Projects</span>
            <span className="text-lg font-bold font-mono text-[var(--foreground)]">
              {availableProjectsCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Approved</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {approvedDraftsCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Scheduled</span>
            <span className="text-lg font-bold font-mono text-[#C5F52A]">
              {upcomingScheduledCount}
            </span>
          </div>
        </div>

        {/* Cadence Settings */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-3">
          <h4 className="font-bold text-xs text-[var(--foreground)]">Automation Cadence</h4>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted)]">Posts per day to schedule:</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDailyTarget(num)}
                  className={cn(
                    "w-8 h-8 rounded-lg font-mono font-bold text-xs border transition-all cursor-pointer",
                    dailyTarget === num
                      ? "bg-[#C5F52A] text-black border-[#C5F52A]"
                      : "bg-[var(--surface-secondary)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Integration notice */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Connected to Gemini 3.8 Flash news radar & Sharp canvas renderer. All generated slots are checked against brand guidelines before slot placement.
          </span>
        </div>
      </div>
    </Drawer>
  );
}

