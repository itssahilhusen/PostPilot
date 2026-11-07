"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Sliders,
  ExternalLink,
  RotateCw,
  X,
  Play,
  Layers,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DailyFlywheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduledSuccess?: () => void;
}

export function DailyFlywheelModal({ isOpen, onClose, onScheduledSuccess }: DailyFlywheelModalProps) {
  const [loading, setLoading] = useState(false);
  const [testingRun, setTestingRun] = useState(false);
  const [config, setConfig] = useState<any>({
    enabled: true,
    niche: "tech_ai",
    nicheLabel: "Tech & AI Breakthroughs",
    preferredTheme: "futuretech",
    brandHandle: "@theaiseed",
    scheduleTime: "10:00",
    notificationChannel: "discord",
    webhookUrl: "",
    requireApproval: true,
    autoScheduleOnApproval: true,
    targetPlatforms: ["instagram", "x", "linkedin", "threads"],
  });

  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/automations/daily-pipeline/config");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
          }
        }
      } catch (err) {
        console.warn("Could not fetch flywheel config:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/automations/daily-pipeline/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success("Daily Flywheel automation settings saved!");
        onClose();
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleTestRunNow = async () => {
    if (config.notificationChannel !== "telegram" && !config.webhookUrl) {
      toast.error("Please enter a Discord or Slack Webhook URL to test live delivery.");
      return;
    }

    setTestingRun(true);
    setTestResult(null);
    toast.loading("Scouting today's top tech news & building deck...", { id: "flywheel-test" });

    try {
      const res = await fetch("/api/automations/daily-pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: config.niche,
          theme: config.preferredTheme,
          brandHandle: config.brandHandle,
          webhookUrl: config.webhookUrl,
          notificationChannel: config.notificationChannel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult(data);
        if (data.notificationSent) {
          toast.success("Success! Carousel created and dispatched to your Discord/Slack webhook!", {
            id: "flywheel-test",
          });
        } else {
          toast.success("Carousel created! (Webhook notification warning: check URL)", {
            id: "flywheel-test",
          });
        }
        if (onScheduledSuccess) {
          onScheduledSuccess();
        }
      } else {
        toast.error(data.error || "Flywheel run failed", { id: "flywheel-test" });
      }
    } catch (err: any) {
      toast.error(err.message || "Execution error", { id: "flywheel-test" });
    } finally {
      setTestingRun(false);
    }
  };

  const niches = [
    { id: "tech_ai", label: "Tech & AI Breakthroughs", desc: "LLMs, robotics, frontier computing" },
    { id: "dev_tools", label: "Dev Tools & Open Source", desc: "Frameworks, GitHub trending, DX" },
    { id: "science", label: "Science & Inventions", desc: "Physics, energy, quantum engineering" },
    { id: "crypto", label: "Crypto & Web3", desc: "Protocols, decentralized systems, DeFi" },
  ];

  const themes = [
    {
      id: "futuretech",
      name: "FutureTech Alert",
      desc: "50/50 vertical layout, uppercase cyan/blue header, verified pill",
      accent: "#00e5ff",
    },
    {
      id: "aipagedaily",
      name: "AI Page Daily",
      desc: "Minimalist void black, pure white text, numbered cards",
      accent: "#ffffff",
    },
    {
      id: "tyches",
      name: "Tyches Spotlight",
      desc: "Cyberpunk card glow, neon lime accents, viral curiosity hook",
      accent: "#c6f432",
    },
    {
      id: "inventionshark",
      name: "InventionShark",
      desc: "Full documentary editorial, warm ochre highlights, deep insights",
      accent: "#f59e0b",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 bg-[var(--bg)]/80 select-none">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#c6f432]/10 border border-[#c6f432]/30 flex items-center justify-center text-[#c6f432]">
              <Bot className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--fg)] flex items-center gap-2">
                <span>Autonomous Daily Flywheel</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#c6f432] text-black">
                  FACELESS ENGINE
                </span>
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Automates your entire morning news scout, 4:5 deck generation, and Discord review
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Flywheel Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--fg)]">Enable Daily Autonomous Runs</h3>
              <p className="text-xs text-[var(--muted)]">
                Reerts will scout fresh news every morning at {config.scheduleTime || "10:00 AM"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--line)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c6f432]" />
            </label>
          </div>

          {/* 2. Niche Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
              1. Choose Content Niche
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {niches.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setConfig({ ...config, niche: n.id, nicheLabel: n.label })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1",
                    config.niche === n.id
                      ? "border-[#c6f432] bg-[#c6f432]/10 ring-1 ring-[#c6f432]"
                      : "border-[var(--line)] bg-[var(--bg)] hover:border-[var(--muted)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[var(--fg)]">{n.label}</span>
                    {config.niche === n.id && <Check className="size-3.5 text-[#c6f432]" />}
                  </div>
                  <span className="text-[11px] text-[var(--muted)] leading-tight">{n.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Theme Preset Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
              2. Preferred Faceless Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setConfig({ ...config, preferredTheme: t.id })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1",
                    config.preferredTheme === t.id
                      ? "border-[#c6f432] bg-[#c6f432]/10 ring-1 ring-[#c6f432]"
                      : "border-[var(--line)] bg-[var(--bg)] hover:border-[var(--muted)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: t.accent }} />
                      <span className="text-xs font-extrabold text-[var(--fg)]">{t.name}</span>
                    </div>
                    {config.preferredTheme === t.id && <Check className="size-3.5 text-[#c6f432]" />}
                  </div>
                  <span className="text-[11px] text-[var(--muted)] leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Brand Handle & Schedule Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--fg)]">Channel / Handle Badge</label>
              <input
                type="text"
                value={config.brandHandle}
                onChange={(e) => setConfig({ ...config, brandHandle: e.target.value })}
                placeholder="@theaiseed"
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:border-[#c6f432]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--fg)]">Daily Run & Schedule Time</label>
              <input
                type="time"
                value={config.scheduleTime}
                onChange={(e) => setConfig({ ...config, scheduleTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:border-[#c6f432]"
              />
            </div>
          </div>

          {/* 5. Notification Channel & Webhook */}
          <div className="space-y-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-[var(--fg)]">Human-in-the-Loop Review Channel</h4>
                <p className="text-[11px] text-[var(--muted)]">
                  Where Reerts sends generated drafts with 1-click &quot;Approve & Schedule&quot; links
                </p>
              </div>
              <div className="flex items-center gap-1">
                {(["discord", "slack", "telegram"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setConfig({ ...config, notificationChannel: ch })}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer",
                      config.notificationChannel === ch
                        ? "bg-[#c6f432] text-black"
                        : "bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--fg)]"
                    )}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--fg)]">
                {config.notificationChannel === "discord"
                  ? "Discord Webhook URL"
                  : config.notificationChannel === "slack"
                  ? "Slack Incoming Webhook URL"
                  : "Telegram Bot Token / Chat ID"}
              </label>
              <input
                type="text"
                value={config.webhookUrl}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder={
                  config.notificationChannel === "discord"
                    ? "https://discord.com/api/webhooks/..."
                    : config.notificationChannel === "slack"
                    ? "https://hooks.slack.com/services/..."
                    : "bot123456:ABC-DEF..."
                }
                className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-xs font-mono text-[var(--fg)] focus:outline-none focus:border-[#c6f432]"
              />
              <p className="text-[10px] text-[var(--muted)]">
                Paste your channel webhook. Every morning you&apos;ll get a rich embed with the 4 slides and one-click
                buttons.
              </p>
            </div>
          </div>

          {/* Test Run Output Preview */}
          {testResult && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                <CheckCircle2 className="size-4" />
                <span>Test Run Succeeded! Post Created in Calendar</span>
              </div>
              <p className="text-xs font-bold text-[var(--fg)]">&quot;{testResult.post?.title}&quot;</p>
              <p className="text-[11px] text-[var(--muted)]">
                Status: <span className="font-mono text-[#c6f432]">{testResult.status}</span> · Scheduled for{" "}
                {new Date(testResult.scheduledAt).toLocaleDateString()} at 10:00 AM
              </p>
              {testResult.notificationSent ? (
                <p className="text-[11px] text-emerald-300">
                  ✓ Discord rich embed delivered with 1-click Approve &amp; Retouch buttons.
                </p>
              ) : (
                <p className="text-[11px] text-amber-300">
                  Notice: No webhook URL configured or webhook unreachable, but carousel was created and scheduled.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[var(--line)] px-6 py-4 bg-[var(--bg)]/80 select-none">
          {/* Test Run Button */}
          <button
            type="button"
            disabled={testingRun}
            onClick={handleTestRunNow}
            className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--fg)] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Execute immediate scout and send preview to your webhook"
          >
            {testingRun ? (
              <RotateCw className="size-3.5 animate-spin text-[#c6f432]" />
            ) : (
              <Play className="size-3.5 fill-current text-[#c6f432]" />
            )}
            <span>{testingRun ? "Running Flywheel..." : "⚡ Test Run Now"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-xs font-bold text-[var(--fg)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save & Activate Flywheel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

