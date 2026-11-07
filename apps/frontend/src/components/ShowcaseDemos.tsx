"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ReertsLogo } from "@/components/ReertsLogo";
import {
  ArrowRight,
  Sparkles,
  Check,
  MessageSquare,
  Rss,
  Calendar,
  Bookmark,
  Search,
  ShieldCheck,
  Send,
  FileText,
  Heart,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  Loader2,
  Share2,
  CheckCircle2,
} from "lucide-react";

// =========================================================================
// 1. REUSABLE DEMO FRAME SHELL (WHITE UI IN DARK MODE / DARK UI IN LIGHT MODE)
// =========================================================================

interface DemoFrameShellProps {
  title: string;
  badge: string;
  children: React.ReactNode;
  deviceType?: "macos" | "iphone";
  isWhiteUI?: boolean;
}

function DemoFrameShell({
  title,
  badge,
  children,
  deviceType = "macos",
  isWhiteUI = true,
}: DemoFrameShellProps) {
  if (deviceType === "iphone") {
    return (
      <div className="relative isolate mx-auto w-full max-w-[280px]">
        {/* Ambient Glow */}
        <div
          className={`absolute -inset-5 -z-10 rounded-[3.5rem] blur-2xl transition-opacity ${
            isWhiteUI ? "bg-primary/5 opacity-50" : "bg-primary/10 opacity-60"
          }`}
        />

        {/* Outer Phone Bezel */}
        <div className="relative rounded-[50px] bg-gradient-to-b from-neutral-400 via-neutral-700 to-neutral-500 p-[2.5px] shadow-2xl">
          {/* Side Hardware Buttons */}
          <span aria-hidden="true" className="absolute -left-[3px] top-[90px] h-6 w-[3px] rounded-l-md bg-neutral-500" />
          <span aria-hidden="true" className="absolute -left-[3px] top-[124px] h-10 w-[3px] rounded-l-md bg-neutral-500" />
          <span aria-hidden="true" className="absolute -right-[3px] top-[110px] h-12 w-[3px] rounded-r-md bg-neutral-500" />

          <div className="rounded-[47px] bg-black p-[3.5px]">
            <div
              className={`relative select-none overflow-hidden rounded-[44px] min-h-[500px] flex flex-col justify-between transition-colors duration-300 ${
                isWhiteUI
                  ? "bg-white text-neutral-900 border border-neutral-200"
                  : "bg-[#0d0d0d] text-white border border-neutral-800"
              }`}
            >
              {/* Dynamic Island */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-2 z-30 flex h-[24px] w-[86px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2 shadow-xs"
              >
                <span className="relative h-2.5 w-2.5 rounded-full bg-neutral-800">
                  <span className="absolute left-[3px] top-[3px] h-1 w-1 rounded-full bg-blue-500/70" />
                </span>
              </div>

              {/* Status Bar */}
              <div className="flex shrink-0 items-center justify-between px-6 pb-1 pt-2.5">
                <span
                  className={`text-[11px] font-semibold ${
                    isWhiteUI ? "text-neutral-900" : "text-white/90"
                  }`}
                >
                  9:41
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isWhiteUI ? "text-neutral-500" : "text-neutral-400"
                    }`}
                  >
                    {badge}
                  </span>
                </div>
              </div>

              {/* Screen Content */}
              <div className="relative flex-1 overflow-hidden flex flex-col">{children}</div>

              {/* Home Indicator Bar */}
              <div
                aria-hidden="true"
                className={`mx-auto my-1.5 h-1 w-28 rounded-full ${
                  isWhiteUI ? "bg-neutral-300" : "bg-neutral-700"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // macOS Window Style Frame
  return (
    <div className="relative isolate w-full">
      {/* Ambient Glow */}
      <div
        className={`absolute -inset-4 -z-10 rounded-3xl blur-2xl transition-opacity ${
          isWhiteUI ? "bg-neutral-400/10 opacity-70" : "bg-primary/10 opacity-60"
        }`}
      />

      <div
        className={`w-full select-none overflow-hidden rounded-2xl border shadow-2xl transition-colors duration-300 ${
          isWhiteUI
            ? "border-neutral-200/90 bg-white text-neutral-900 shadow-neutral-950/10"
            : "border-neutral-800 bg-[#161616] text-white shadow-black/40"
        }`}
      >
        {/* Title Bar */}
        <div
          className={`flex items-center justify-between border-b px-4 py-2 transition-colors ${
            isWhiteUI
              ? "border-neutral-200/80 bg-neutral-100/75 text-neutral-700"
              : "border-neutral-800 bg-[#1f1f1f] text-neutral-300"
          }`}
        >
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/90" />
            </div>
            <span
              className={`text-[11px] font-medium ml-2 hidden sm:inline-block ${
                isWhiteUI ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              {title}
            </span>
          </div>

          {/* Top Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                isWhiteUI
                  ? "border-neutral-200 bg-white/90 text-neutral-700 shadow-2xs"
                  : "border-neutral-700 bg-neutral-800/80 text-neutral-300"
              }`}
            >
              <ReertsLogo variant="symbol" size={11} iconClassName="size-2.5 object-contain" />
              {badge}
            </span>
          </div>
        </div>

        {/* Window Stage Canvas */}
        <div
          className={`relative overflow-hidden h-[26.5rem] flex flex-col transition-colors ${
            isWhiteUI ? "bg-white text-neutral-900" : "bg-[#161616] text-white"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Fluid Floating Cursor
function FluidCursor({
  x,
  y,
  clicking = false,
  visible = true,
  isWhiteUI = true,
}: {
  x: string | number;
  y: string | number;
  clicking?: boolean;
  visible?: boolean;
  isWhiteUI?: boolean;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute z-50"
      initial={false}
      animate={{
        left: x,
        top: y,
        opacity: visible ? 1 : 0,
        scale: clicking ? 0.82 : 1,
      }}
      transition={{
        left: { type: "spring", damping: 26, stiffness: 200 },
        top: { type: "spring", damping: 26, stiffness: 200 },
        opacity: { duration: 0.15 },
        scale: { duration: 0.12 },
      }}
    >
      <div
        className={`filter ${
          isWhiteUI
            ? "text-neutral-900 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke={isWhiteUI ? "white" : "black"}
          strokeWidth="1.2"
          className="h-5 w-5"
        >
          <path d="M4.5 3.5l14 7-6.5 1.5-1.5 6.5-6-15z" />
        </svg>
      </div>
      {clicking && (
        <span
          className={`absolute -left-2 -top-2 h-9 w-9 animate-ping rounded-full pointer-events-none ${
            isWhiteUI ? "bg-neutral-900/40" : "bg-primary/60"
          }`}
        />
      )}
    </motion.div>
  );
}

// Instant-Play on Scroll Loop Hook
function useInstantScrollLoop(totalDurationMs: number, inView: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // When not in view, reset so the exact millisecond the user scrolls into view it starts from 0s!
    if (!inView) {
      setElapsed(0);
      return;
    }

    const interval = 80;
    const timer = setInterval(() => {
      setElapsed((prev) => (prev + interval) % totalDurationMs);
    }, interval);
    return () => clearInterval(timer);
  }, [inView, totalDurationMs]);

  return { elapsed };
}

// =========================================================================
// 8 INDIVIDUAL ROW DEMOS (INSTANT PLAYBACK ON SCROLL)
// =========================================================================

// --- ROW 1: AI Carousel Maker ---
function RowCarousel({ isWhiteUI }: { isWhiteUI: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const { elapsed } = useInstantScrollLoop(8000, isInView);
  const sec = elapsed / 1000;

  // Stages: 0-1.4s import, 1.4-3.2s plan, 3.2-5.5s editor, 5.5-8.0s composer
  const step = sec < 1.4 ? "import" : sec < 3.2 ? "plan" : sec < 5.5 ? "editor" : "composer";
  const slideIndex = sec >= 3.2 && sec < 5.5 ? Math.min(4, Math.floor((sec - 3.2) * 1.5)) : 0;

  return (
    <div ref={ref} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <ReertsLogo variant="symbol" size={14} iconClassName="size-3.5 object-contain" />
          AI Carousel Maker
        </span>

        <h3 className="text-3xl font-bold tracking-tight text-balance leading-tight md:text-4xl text-foreground">
          Links, text, or a topic —<br />
          <span className="text-primary">carousels, fully designed</span>
        </h3>

        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty md:text-lg leading-relaxed">
          Drop in an article, blog, YouTube or social post link, a PDF or Word file, a note, or a one-line topic. AI plans every slide and handles the copy, images, and design. Paste a link to a carousel you want to benchmark to extract its design as a template, and schedule the result to multiple channels at once.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
          <Image src="/images/platforms/instagram.svg" alt="Instagram" width={22} height={22} />
          <Image src="/images/platforms/threads.svg" alt="Threads" width={22} height={22} className="dark:invert" />
          <Image src="/images/platforms/linkedin.svg" alt="LinkedIn" width={22} height={22} />
          <Image src="/images/platforms/x-light.svg" alt="X" width={22} height={22} />
          <Image src="/images/platforms/facebook.svg" alt="Facebook" width={22} height={22} />
          <Image src="/images/platforms/tiktok-light.svg" alt="TikTok" width={22} height={22} />
        </div>

        <Link
          href="/features/carousel"
          className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
        >
          Learn more
          <ArrowRight className="relative top-px h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full lg:pl-4">
        <DemoFrameShell
          title="Reerts AI Carousel Studio"
          badge="AI Carousel Maker"
          deviceType="macos"
          isWhiteUI={isWhiteUI}
        >
          <FluidCursor
            x={
              step === "import"
                ? sec < 0.7
                  ? "45%"
                  : "84%"
                : step === "plan"
                ? "88%"
                : step === "editor"
                ? "88%"
                : "85%"
            }
            y={
              step === "import"
                ? sec < 0.7
                  ? "30%"
                  : "30%"
                : step === "plan"
                ? "85%"
                : step === "editor"
                ? "16%"
                : "84%"
            }
            clicking={(sec > 0.8 && sec < 1.3) || (sec > 2.6 && sec < 3.1) || (sec > 4.8 && sec < 5.3)}
            visible={true}
            isWhiteUI={isWhiteUI}
          />

          <AnimatePresence mode="wait">
            {step === "import" && (
              <motion.div
                key="step-import"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full w-full flex-col gap-3 p-4 justify-between"
              >
                <div className="grid grid-cols-5 gap-1">
                  <span
                    className={`flex items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-semibold ${
                      isWhiteUI
                        ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                        : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5" /> Link
                  </span>
                  <span className={`flex items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] ${isWhiteUI ? "bg-neutral-100 text-neutral-600" : "bg-neutral-800 text-neutral-400"}`}>Post</span>
                  <span className={`flex items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] ${isWhiteUI ? "bg-neutral-100 text-neutral-600" : "bg-neutral-800 text-neutral-400"}`}>Text</span>
                  <span className={`flex items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] ${isWhiteUI ? "bg-neutral-100 text-neutral-600" : "bg-neutral-800 text-neutral-400"}`}>Topic</span>
                  <span className={`flex items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] ${isWhiteUI ? "bg-neutral-100 text-neutral-600" : "bg-neutral-800 text-neutral-400"}`}>File</span>
                </div>

                <div
                  className={`flex flex-col gap-2 rounded-lg border p-3 ${
                    isWhiteUI ? "border-amber-200 bg-amber-50/70" : "border-amber-500/30 bg-amber-500/10"
                  }`}
                >
                  <span className={`text-[10px] font-medium ${isWhiteUI ? "text-amber-900" : "text-amber-200"}`}>
                    Article or Social URL
                  </span>
                  <div className="flex gap-1.5">
                    <div
                      className={`flex h-8 min-w-0 flex-1 items-center rounded-md border px-2.5 text-[11px] font-mono truncate ${
                        isWhiteUI
                          ? "border-neutral-200 bg-white text-neutral-900 shadow-2xs"
                          : "border-neutral-700 bg-neutral-900 text-white"
                      }`}
                    >
                      {sec > 0.2 ? "https://blog.samaltman.com/what-i-wish-someone-told-me" : "https://..."}
                    </div>
                    <span
                      className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-3 text-[11px] font-medium transition-all ${
                        isWhiteUI ? "bg-neutral-900 text-white shadow-xs" : "bg-white text-neutral-900"
                      }`}
                    >
                      {sec > 0.8 && sec < 1.3 ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Import
                    </span>
                  </div>

                  {sec >= 0.9 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 rounded-md border p-2 shadow-2xs ${
                        isWhiteUI ? "border-neutral-200 bg-white" : "border-neutral-700 bg-neutral-900"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${
                          isWhiteUI ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-semibold">
                          5 carousel structures that get bookmarked in 2026
                        </span>
                        <span className={`line-clamp-1 text-[9.5px] ${isWhiteUI ? "text-neutral-500" : "text-neutral-400"}`}>
                          Extracted 1,420 words into core actionable framework
                        </span>
                      </span>
                    </motion.div>
                  )}
                </div>

                <div
                  className={`mt-auto flex justify-between items-center pt-2 border-t ${
                    isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-semibold ${
                      isWhiteUI ? "bg-purple-100 text-purple-900" : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" /> AI Visual Design
                  </span>
                  <span
                    className={`inline-flex h-8 items-center rounded-md px-3 text-[11px] font-medium ${
                      isWhiteUI ? "bg-neutral-900 text-white shadow-xs" : "bg-white text-neutral-900"
                    }`}
                  >
                    Plan carousel →
                  </span>
                </div>
              </motion.div>
            )}

            {step === "plan" && (
              <motion.div
                key="step-plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex h-full w-full flex-col gap-2 p-4 justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold">AI Slide Blueprint (5 Slides)</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ready for render</span>
                  </div>
                  <ol className="mt-2 flex flex-col gap-1.5">
                    {[
                      { step: "1", tag: "Cover", title: "5 Carousel Structures That Drive 10x Saves" },
                      { step: "2", tag: "Hook", title: "The Contrarian Angle (Stop the Scroll)" },
                      { step: "3", tag: "Tactics", title: "The Step-by-Step Action Plan" },
                      { step: "4", tag: "Proof", title: "Real Creator Metrics & Comparisons" },
                      { step: "5", tag: "CTA", title: "Save this post + Grab the Free Template" },
                    ].map((s, idx) => (
                      <motion.li
                        key={s.step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${
                          idx === 0
                            ? isWhiteUI
                              ? "border-neutral-900/40 bg-neutral-100 font-semibold"
                              : "border-primary/50 bg-primary/10"
                            : isWhiteUI
                            ? "border-neutral-200 bg-white text-neutral-600"
                            : "border-neutral-800 bg-neutral-900 text-neutral-400"
                        }`}
                      >
                        <span className={`w-3 text-[10px] font-bold ${isWhiteUI ? "text-neutral-500" : "text-neutral-400"}`}>
                          {s.step}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[8.5px] font-semibold uppercase ${
                            isWhiteUI ? "bg-blue-100 text-blue-800" : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {s.tag}
                        </span>
                        <span className="min-w-0 truncate text-[11px] font-medium">{s.title}</span>
                      </motion.li>
                    ))}
                  </ol>
                </div>

                <div
                  className={`mt-auto flex justify-end gap-2 pt-2 border-t ${
                    isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 items-center rounded-md px-3 text-[11px] font-medium shadow-xs ${
                      isWhiteUI ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                    }`}
                  >
                    Approve & Generate Slides →
                  </span>
                </div>
              </motion.div>
            )}

            {step === "editor" && (
              <motion.div
                key="step-editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full w-full flex-col p-4 justify-between"
              >
                <div
                  className={`flex items-center justify-between border-b pb-2 ${
                    isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                  }`}
                >
                  <span className="text-[12px] font-bold">Canvas Editor (Slide {slideIndex + 1}/5)</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-semibold shadow-xs ${
                      isWhiteUI ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                    }`}
                  >
                    Create Post
                  </span>
                </div>

                <div
                  className={`my-auto mx-auto w-64 aspect-[4/5] rounded-xl border p-4 flex flex-col justify-between shadow-lg ${
                    isWhiteUI
                      ? "border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 text-neutral-900"
                      : "border-neutral-700 bg-gradient-to-br from-[#1f1f1f] to-[#252525] text-white"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold">@reerts_growth</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                        isWhiteUI ? "bg-neutral-200 text-neutral-800" : "bg-neutral-800 text-neutral-200"
                      }`}
                    >
                      {slideIndex + 1}/5
                    </span>
                  </div>
                  <div className="py-2">
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider ${
                        isWhiteUI ? "text-blue-700" : "text-blue-400"
                      }`}
                    >
                      Slide {slideIndex + 1}: Strategy
                    </span>
                    <h4 className="text-sm font-bold leading-snug mt-1">
                      {slideIndex === 0
                        ? "5 carousel formats that get bookmarked in 2026."
                        : slideIndex === 1
                        ? "Format #1: The Tactical Teardown (Hook → Evidence → Playbook)."
                        : "Format #2: The Contrarian Reality Check (Data vs Opinions)."}
                    </h4>
                  </div>
                  <div
                    className={`text-[9.5px] flex items-center justify-between font-mono ${
                      isWhiteUI ? "text-neutral-500" : "text-neutral-400"
                    }`}
                  >
                    <span>Reerts Visual Engine</span>
                    <span className="text-emerald-600 font-bold">1080×1350 HD</span>
                  </div>
                </div>

                <div
                  className={`flex gap-1.5 justify-center pt-2 border-t ${
                    isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                  }`}
                >
                  {[1, 2, 3, 4, 5].map((num, idx) => (
                    <div
                      key={num}
                      className={`h-8 w-6 rounded border transition-all ${
                        idx === slideIndex
                          ? isWhiteUI
                            ? "border-neutral-900 bg-neutral-200 scale-105"
                            : "border-white bg-neutral-700 scale-105"
                          : isWhiteUI
                          ? "border-neutral-200 bg-white"
                          : "border-neutral-800 bg-neutral-900"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {step === "composer" && (
              <motion.div
                key="step-composer"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex h-full w-full flex-col p-4 justify-between ${
                  isWhiteUI ? "bg-white" : "bg-[#181818]"
                }`}
              >
                <div
                  className={`flex items-center justify-between border-b pb-2 ${
                    isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                  }`}
                >
                  <span className="text-xs font-bold">Multi-Channel Publisher</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Auto-Syncing</span>
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex items-center gap-1.5">
                    {["instagram", "threads", "linkedin", "x"].map((p) => (
                      <span
                        key={p}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          isWhiteUI ? "border-neutral-200 bg-neutral-50" : "border-neutral-700 bg-neutral-900"
                        }`}
                      >
                        <Image
                          src={`/images/platforms/${p === "x" ? "x-light" : p}.svg`}
                          alt={p}
                          width={13}
                          height={13}
                          className={p === "threads" && !isWhiteUI ? "invert" : ""}
                        />
                      </span>
                    ))}
                    <span
                      className={`text-[10px] font-semibold ml-1 ${
                        isWhiteUI ? "text-neutral-500" : "text-neutral-400"
                      }`}
                    >
                      4 Accounts Selected
                    </span>
                  </div>

                  <div
                    className={`rounded-lg border p-2.5 text-[11px] font-mono leading-relaxed ${
                      isWhiteUI ? "border-neutral-200 bg-neutral-50 text-neutral-800" : "border-neutral-700 bg-neutral-900 text-neutral-200"
                    }`}
                  >
                    5 carousel structures that founders use to generate 100k+ organic views weekly. A breakdown of slide 1-5 🧵👇
                  </div>

                  <div
                    className={`rounded-lg border p-2 text-[10.5px] flex items-center gap-2 ${
                      isWhiteUI
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span>Scheduled for Tuesday 9:00 AM across Instagram, LinkedIn, & Threads</span>
                  </div>
                </div>

                <div
                  className={`mt-auto flex justify-end gap-2 pt-2 border-t ${
                    isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                  }`}
                >
                  <span className="inline-flex h-8 items-center rounded-md bg-emerald-600 px-3 text-[11px] font-semibold text-white shadow-xs">
                    Scheduled to 4 Channels ✓
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DemoFrameShell>
      </div>
    </div>
  );
}

// --- ROW 2: Comment Auto-DM ---
function RowAutoDm({ isWhiteUI }: { isWhiteUI: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const { elapsed } = useInstantScrollLoop(7500, isInView);
  const sec = elapsed / 1000;

  const dmScreen = sec < 3.2 ? "post" : "dm";
  const dmCommented = sec >= 1.0;
  const dmAutoReply = sec >= 1.8;
  const dmEmailFilled = sec >= 5.0;

  return (
    <div ref={ref} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:order-2">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <ReertsLogo variant="symbol" size={14} iconClassName="size-3.5 object-contain" />
          Comment Auto-DM
        </span>

        <h3 className="text-3xl font-bold tracking-tight text-balance leading-tight md:text-4xl text-foreground">
          A comment comes in,<br />
          <span className="text-primary">DMs, replies and emails go out automatically</span>
        </h3>

        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty md:text-lg leading-relaxed">
          Reply to keyword comments, send your link in a button DM, and collect follows and emails as leads. No separate ManyChat needed: switch it on inside Reerts, where you already publish.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
          <Image src="/images/platforms/instagram.svg" alt="Instagram" width={22} height={22} />
          <Image src="/images/platforms/facebook.svg" alt="Facebook" width={22} height={22} />
          <Image src="/images/platforms/threads.svg" alt="Threads" width={22} height={22} className="dark:invert" />
        </div>

        <Link
          href="/features/auto-dm"
          className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
        >
          Learn more
          <ArrowRight className="relative top-px h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full lg:order-1 lg:pr-4 flex justify-center">
        <DemoFrameShell
          title="Comment Auto-DM"
          badge="Comment Auto-DM"
          deviceType="iphone"
          isWhiteUI={isWhiteUI}
        >
          <FluidCursor
            x={dmScreen === "post" ? "55%" : "70%"}
            y={dmScreen === "post" ? (dmCommented ? "72%" : "88%") : dmEmailFilled ? "82%" : "55%"}
            clicking={(sec > 0.9 && sec < 1.4) || (sec > 4.8 && sec < 5.3)}
            visible={true}
            isWhiteUI={isWhiteUI}
          />

          <AnimatePresence mode="wait">
            {dmScreen === "post" ? (
              <motion.div
                key="phone-post"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -30 }}
                className="flex flex-col flex-1 px-3 py-1 justify-between"
              >
                <div>
                  <div
                    className={`flex items-center gap-2 border-b pb-2 ${
                      isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                    }`}
                  >
                    <span className="inline-block shrink-0 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 size-6" />
                    <span className="text-[11px] font-semibold">cafe.moment</span>
                  </div>

                  <div className="relative mt-2 flex h-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 shadow-sm">
                    <span className="relative text-3xl drop-shadow-md">☕</span>
                  </div>

                  <div
                    className={`flex items-center gap-3 pt-2 ${
                      isWhiteUI ? "text-neutral-700" : "text-neutral-300"
                    }`}
                  >
                    <Heart className="size-4 text-rose-500 fill-rose-500" />
                    <MessageSquare className="size-4" />
                    <Send className="size-4" />
                  </div>

                  <p className="pt-1.5 text-[10.5px] leading-snug">
                    <span className="font-semibold">cafe.moment</span> Want our barista guide? Comment 'guide' below ☕
                  </p>

                  <div
                    className={`mt-2 space-y-1.5 border-t pt-1.5 ${
                      isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                    }`}
                  >
                    {dmCommented && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-lg p-1.5 text-[10px] ${
                          isWhiteUI ? "bg-neutral-100 text-neutral-800" : "bg-neutral-900 text-neutral-200"
                        }`}
                      >
                        <span className="font-semibold">@sarah_growth:</span> "guide"
                      </motion.div>
                    )}
                    {dmAutoReply && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-lg border p-1.5 text-[9.5px] font-medium ${
                          isWhiteUI
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        ✓ Auto-reply sent: "Sent to your DM! Check inbox 📬"
                      </motion.div>
                    )}
                  </div>
                </div>

                <div
                  className={`mt-2 rounded-lg py-1.5 text-[10px] font-semibold text-center animate-pulse ${
                    isWhiteUI ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                  }`}
                >
                  Opening Direct Message...
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="phone-dm"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col flex-1 px-3 py-1 justify-between"
              >
                <div>
                  <div
                    className={`flex items-center gap-2 border-b pb-2 ${
                      isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                    }`}
                  >
                    <span className="inline-block shrink-0 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 size-5" />
                    <span className="text-[11px] font-semibold">cafe.moment (Automated DM)</span>
                  </div>

                  <div className="space-y-2 py-2">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`max-w-[85%] rounded-2xl rounded-tl-xs p-2 text-[10px] ${
                        isWhiteUI ? "bg-neutral-100 text-neutral-800" : "bg-neutral-900 text-neutral-200"
                      }`}
                    >
                      Hey Sarah! Thanks for commenting. Here is your seasonal recipe guide:
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      className={`rounded-xl border p-2 text-[10px] shadow-2xs ${
                        isWhiteUI ? "border-neutral-200 bg-white" : "border-neutral-800 bg-[#161616]"
                      }`}
                    >
                      <p className="font-semibold">Seasonal_Coffee_Guide.pdf</p>
                      <span className="text-[9px] text-emerald-600 font-bold">✓ PDF Delivered via Bot</span>
                    </motion.div>

                    <div
                      className={`rounded-xl border p-2 text-[10px] space-y-1.5 ${
                        isWhiteUI ? "border-neutral-200 bg-neutral-50" : "border-neutral-800 bg-neutral-900"
                      }`}
                    >
                      <p className="font-semibold text-[9.5px]">Get weekly coffee recipes:</p>
                      <div className="flex gap-1">
                        <span
                          className={`flex-1 rounded border px-1.5 py-1 text-[9px] font-mono truncate ${
                            isWhiteUI ? "border-neutral-200 bg-white text-neutral-900" : "border-neutral-700 bg-neutral-800 text-white"
                          }`}
                        >
                          {dmEmailFilled ? "sarah@growth.co" : "sarah..."}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-[9px] font-bold text-white transition-colors ${
                            dmEmailFilled ? "bg-emerald-600" : isWhiteUI ? "bg-neutral-900" : "bg-primary"
                          }`}
                        >
                          {dmEmailFilled ? "Saved ✓" : "Submit"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-full border px-3 py-1 text-[9px] flex items-center justify-between ${
                    isWhiteUI ? "border-neutral-200 bg-neutral-50 text-neutral-500" : "border-neutral-800 bg-neutral-900 text-neutral-400"
                  }`}
                >
                  <span>Live on Instagram DM API</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DemoFrameShell>
      </div>
    </div>
  );
}

// --- ROW 3: Content Sources ---
function RowIdeas({ isWhiteUI }: { isWhiteUI: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const { elapsed } = useInstantScrollLoop(7500, isInView);
  const sec = elapsed / 1000;

  const ideasTab = sec < 2.5 ? "all" : "viral";
  const ideasDrafted = sec >= 4.0;

  return (
    <div ref={ref} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <ReertsLogo variant="symbol" size={14} iconClassName="size-3.5 object-contain" />
          Content Sources
        </span>

        <h3 className="text-3xl font-bold tracking-tight text-balance leading-tight md:text-4xl text-foreground">
          See the latest from every channel you follow <span className="text-primary">in one place</span>
        </h3>

        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty md:text-lg leading-relaxed">
          No more hunting for content. Add the sources you follow once, and Reerts pulls in their latest automatically — then turn it into a post in your brand voice with one click.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
          <span className="size-[22px] inline-flex items-center justify-center text-foreground">
            <Rss className="size-5" />
          </span>
          <Image src="/images/platforms/youtube.svg" alt="YouTube" width={22} height={15} />
          <Image src="/images/platforms/threads.svg" alt="Threads" width={22} height={22} className="dark:invert" />
          <Image src="/images/platforms/linkedin.svg" alt="LinkedIn" width={22} height={22} />
          <Image src="/images/platforms/x-light.svg" alt="X" width={22} height={22} />
        </div>

        <Link
          href="/features/ideas"
          className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
        >
          Learn more
          <ArrowRight className="relative top-px h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full lg:pl-4">
        <DemoFrameShell
          title="Content Radar & Feed Aggregator"
          badge="Content Sources"
          deviceType="macos"
          isWhiteUI={isWhiteUI}
        >
          <FluidCursor
            x={ideasDrafted ? "80%" : ideasTab === "viral" ? "75%" : "40%"}
            y={ideasDrafted ? "80%" : "32%"}
            clicking={(sec > 0.8 && sec < 1.3) || (sec > 3.6 && sec < 4.1)}
            visible={true}
            isWhiteUI={isWhiteUI}
          />

          <div className="flex h-full w-full">
            <div
              className={`w-40 border-r p-3 flex flex-col gap-1.5 shrink-0 ${
                isWhiteUI ? "border-neutral-200 bg-neutral-50/70" : "border-neutral-800 bg-neutral-900/50"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                  isWhiteUI ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                Sources
              </span>
              {[
                { label: "All Feeds", count: "34", active: ideasTab === "all" },
                { label: "Top Viral 🔥", count: "8", active: ideasTab === "viral" },
                { label: "YouTube Clips", count: "12", active: false },
                { label: "Threads Radar", count: "14", active: false },
              ].map((f) => (
                <div
                  key={f.label}
                  className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-medium transition-all ${
                    f.active
                      ? isWhiteUI
                        ? "bg-neutral-900 text-white font-semibold shadow-2xs"
                        : "bg-white text-neutral-900 font-semibold shadow-2xs"
                      : isWhiteUI
                      ? "text-neutral-600 hover:bg-neutral-100"
                      : "text-neutral-400 hover:bg-neutral-800"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="text-[9.5px] opacity-75">{f.count}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 p-3.5 flex flex-col justify-between overflow-hidden">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">
                    {ideasTab === "viral" ? "Viral Radar (Sorted by Engagement)" : "Latest Stream"}
                  </span>
                  <span className={`text-[10px] font-mono font-medium ${isWhiteUI ? "text-neutral-500" : "text-neutral-400"}`}>
                    Sync: 2m ago
                  </span>
                </div>

                {[
                  {
                    author: "Linus Ekenstam",
                    content: "The biggest mistake founders make with AI agents is treating them like junior interns instead of autonomous systems.",
                    views: "42.8k",
                    viral: "98% Viral",
                  },
                  {
                    author: "Alex Hormozi",
                    content: "If you want to scale to $10M, stop doing $10/hour tasks. Automate distribution first.",
                    views: "89.2k",
                    viral: "94% Viral",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border p-2.5 transition-all ${
                      idx === 0 && ideasTab === "viral"
                        ? isWhiteUI
                          ? "border-neutral-900/30 bg-neutral-100/70 shadow-xs"
                          : "border-primary/50 bg-primary/10 shadow-md"
                        : isWhiteUI
                        ? "border-neutral-200 bg-white"
                        : "border-neutral-800 bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold">{item.author}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          isWhiteUI ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {item.viral}
                      </span>
                    </div>
                    <p className={`mt-1 line-clamp-2 text-[10.5px] ${isWhiteUI ? "text-neutral-600" : "text-neutral-400"}`}>
                      {item.content}
                    </p>
                    <div
                      className={`mt-2 flex items-center justify-between pt-1 border-t text-[9.5px] ${
                        isWhiteUI ? "border-neutral-200 text-neutral-500" : "border-neutral-800 text-neutral-400"
                      }`}
                    >
                      <span>{item.views} views</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${isWhiteUI ? "text-neutral-900" : "text-primary"}`}>
                        <Sparkles className="size-3" /> Turn into post →
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {ideasDrafted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border p-2 shadow-lg flex items-center justify-between ${
                    isWhiteUI ? "border-neutral-300 bg-white text-neutral-900" : "border-neutral-700 bg-neutral-900 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10.5px] font-semibold">
                      Drafted in your Brand Voice!
                    </span>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[9.5px] font-bold ${
                      isWhiteUI ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                    }`}
                  >
                    Open in Studio
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </DemoFrameShell>
      </div>
    </div>
  );
}

// --- ROW 4: Best Content Remix ---
function RowRemix({ isWhiteUI }: { isWhiteUI: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const { elapsed } = useInstantScrollLoop(7000, isInView);
  const sec = elapsed / 1000;

  const remixAngle = sec < 2.0 ? "story" : sec < 4.5 ? "contrarian" : "framework";

  return (
    <div ref={ref} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:order-2">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <ReertsLogo variant="symbol" size={14} iconClassName="size-3.5 object-contain" />
          Best Content Remix
        </span>

        <h3 className="text-3xl font-bold tracking-tight text-balance leading-tight md:text-4xl text-foreground">
          Don't start from scratch.<br />
          <span className="text-primary">Remix what already worked.</span>
        </h3>

        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty md:text-lg leading-relaxed">
          Pick your best-performing content and turn it into something new in seconds. No more starting from a blank page every time.
        </p>

        <Link
          href="/features/best-content-remix"
          className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
        >
          Learn more
          <ArrowRight className="relative top-px h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full lg:order-1 lg:pr-4">
        <DemoFrameShell
          title="Content Remixer Studio"
          badge="Best Content Remix"
          deviceType="macos"
          isWhiteUI={isWhiteUI}
        >
          <FluidCursor
            x={remixAngle === "contrarian" ? "42%" : "68%"}
            y="15%"
            clicking={sec > 1.8 && sec < 2.3}
            visible={true}
            isWhiteUI={isWhiteUI}
          />

          <div className="flex h-full w-full flex-col p-4 justify-between">
            <div
              className={`flex items-center gap-2 border-b pb-2.5 ${
                isWhiteUI ? "border-neutral-200" : "border-neutral-800"
              }`}
            >
              <span className={`text-[11px] font-bold ${isWhiteUI ? "text-neutral-500" : "text-neutral-400"}`}>
                Remix Angle:
              </span>
              {[
                { key: "story", label: "Storytelling" },
                { key: "contrarian", label: "Contrarian Angle 🔥" },
                { key: "framework", label: "Actionable Framework" },
              ].map((ang) => (
                <span
                  key={ang.key}
                  className={`rounded-md px-2 py-1 text-[10.5px] font-semibold transition-all ${
                    remixAngle === ang.key
                      ? isWhiteUI
                        ? "bg-neutral-900 text-white shadow-2xs"
                        : "bg-white text-neutral-900 shadow-2xs"
                      : isWhiteUI
                      ? "bg-neutral-100 text-neutral-600"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {ang.label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 my-auto">
              <div
                className={`rounded-xl border p-3 space-y-2 ${
                  isWhiteUI ? "border-neutral-200 bg-neutral-50/80" : "border-neutral-800 bg-neutral-900/60"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${isWhiteUI ? "text-neutral-500" : "text-neutral-400"}`}>Original (Oct 2025)</span>
                  <span className={`rounded px-1.5 py-0.5 ${isWhiteUI ? "bg-neutral-200 text-neutral-700" : "bg-neutral-800 text-neutral-300"}`}>
                    42.1k views
                  </span>
                </div>
                <p className={`text-[10.5px] leading-relaxed font-mono ${isWhiteUI ? "text-neutral-600" : "text-neutral-300"}`}>
                  "I spent 500 hours learning social media automation so you don't have to. Here are the 3 tools you actually need:"
                </p>
              </div>

              <motion.div
                key={remixAngle}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl border p-3 space-y-2 shadow-md ${
                  isWhiteUI ? "border-neutral-900/20 bg-white" : "border-neutral-700 bg-neutral-900"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-bold flex items-center gap-1 ${isWhiteUI ? "text-neutral-900" : "text-white"}`}>
                    <Sparkles className="size-3 text-purple-600" /> 2026 AI Remix
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-bold ${
                      isWhiteUI ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    96% Virality Score
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed font-mono">
                  {remixAngle === "contrarian"
                    ? "Most founders think social media automation looks spammy. In 2026, the opposite is true: manual posting is what kills your distribution. Here is why:"
                    : "Here is the exact step-by-step framework we used to 10x our multi-channel reach without hiring a full agency:"}
                </p>
              </motion.div>
            </div>

            <div
              className={`flex items-center justify-between pt-2 border-t text-[10px] ${
                isWhiteUI ? "border-neutral-200 text-neutral-500" : "border-neutral-800 text-neutral-400"
              }`}
            >
              <span>Maintains your established tone of voice</span>
              <span
                className={`inline-flex items-center gap-1 rounded px-3 py-1 font-semibold ${
                  isWhiteUI ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                }`}
              >
                Publish Remix →
              </span>
            </div>
          </div>
        </DemoFrameShell>
      </div>
    </div>
  );
}

// --- ROW 5: Recurring Posts ---
function RowRecurring({ isWhiteUI }: { isWhiteUI: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const { elapsed } = useInstantScrollLoop(7000, isInView);
  const sec = elapsed / 1000;

  const recurPopulated = sec >= 0.8;

  return (
    <div ref={ref} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <ReertsLogo variant="symbol" size={14} iconClassName="size-3.5 object-contain" />
          Recurring posts
        </span>

        <h3 className="text-3xl font-bold tracking-tight text-balance leading-tight md:text-4xl text-foreground">
          Content you post on repeat.<br />
          <span className="text-primary">Schedule it all at once.</span>
        </h3>

        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty md:text-lg leading-relaxed">
          Pick the cadence and the end date, and every occurrence lands on your calendar at once. Each one is a real scheduled post — open a single occurrence to rewrite it or move it.
        </p>

        <Link
          href="/features/recurring-posts"
          className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
        >
          Learn more
          <ArrowRight className="relative top-px h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full lg:pl-4">
        <DemoFrameShell
          title="Cadence Automation Calendar"
          badge="Recurring posts"
          deviceType="macos"
          isWhiteUI={isWhiteUI}
        >
          <FluidCursor
            x={recurPopulated ? "65%" : "35%"}
            y={recurPopulated ? "55%" : "20%"}
            clicking={sec > 0.6 && sec < 1.1}
            visible={true}
            isWhiteUI={isWhiteUI}
          />

          <div className="flex h-full w-full flex-col p-4 justify-between">
            <div
              className={`flex items-center justify-between border-b pb-2.5 ${
                isWhiteUI ? "border-neutral-200" : "border-neutral-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className={`size-4 ${isWhiteUI ? "text-neutral-900" : "text-primary"}`} />
                <span className="text-xs font-bold">Cadence: Every Tue & Thu @ 9:00 AM</span>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                  isWhiteUI ? "bg-neutral-100 text-neutral-800" : "bg-neutral-800 text-neutral-200"
                }`}
              >
                4-Week Batch
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 my-auto">
              {["Week 1", "Week 2", "Week 3", "Week 4"].map((wk) => (
                <div
                  key={wk}
                  className={`rounded-xl border p-2.5 flex flex-col gap-2 shadow-2xs ${
                    isWhiteUI ? "border-neutral-200 bg-white" : "border-neutral-800 bg-neutral-900"
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isWhiteUI ? "text-neutral-500" : "text-neutral-400"}`}>
                    {wk}
                  </span>

                  <motion.div
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: recurPopulated ? 1 : 0.4 }}
                    className={`rounded-md p-1.5 text-[9.5px] border ${
                      recurPopulated
                        ? isWhiteUI
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : isWhiteUI
                        ? "border-neutral-200 bg-neutral-100/60 text-neutral-400"
                        : "border-neutral-800 bg-neutral-800/60 text-neutral-500"
                    }`}
                  >
                    <span className="font-bold">Tue 9:00 AM</span>
                    <div className="truncate text-[9px] mt-0.5">Founders Playbook</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: recurPopulated ? 1 : 0.4 }}
                    className={`rounded-md p-1.5 text-[9.5px] border ${
                      recurPopulated
                        ? isWhiteUI
                          ? "border-blue-200 bg-blue-50 text-blue-800"
                          : "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : isWhiteUI
                        ? "border-neutral-200 bg-neutral-100/60 text-neutral-400"
                        : "border-neutral-800 bg-neutral-800/60 text-neutral-500"
                    }`}
                  >
                    <span className="font-bold">Thu 9:00 AM</span>
                    <div className="truncate text-[9px] mt-0.5">Weekly Case Study</div>
                  </motion.div>
                </div>
              ))}
            </div>

            <div
              className={`flex items-center justify-between pt-2 border-t text-[10px] ${
                isWhiteUI ? "border-neutral-200 text-neutral-500" : "border-neutral-800 text-neutral-400"
              }`}
            >
              <span>8 posts scheduled across next month</span>
              <span className="text-emerald-600 font-bold">Zero overlapping conflicts</span>
            </div>
          </div>
        </DemoFrameShell>
      </div>
    </div>
  );
}

// --- ROW 6: Mobile Share → Content ---
function RowShare({ isWhiteUI }: { isWhiteUI: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const { elapsed } = useInstantScrollLoop(6500, isInView);
  const sec = elapsed / 1000;

  const shareSheetOpen = sec >= 1.0 && sec < 2.5;
  const shareDraftOpen = sec >= 2.5;

  return (
    <div ref={ref} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:order-2">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <ReertsLogo variant="symbol" size={14} iconClassName="size-3.5 object-contain" />
          Mobile Share → Content
        </span>

        <h3 className="text-3xl font-bold tracking-tight text-balance leading-tight md:text-4xl text-foreground">
          Saved links you never reopen?<br />
          <span className="text-primary">One share</span> turns them into drafts
        </h3>

        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty md:text-lg leading-relaxed">
          You know those links you copy to read later and never do. Send them to Reerts with your phone's share button — AI drafts the post in your brand voice.
        </p>

        <Link
          href="/features/share-to-content"
          className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
        >
          Learn more
          <ArrowRight className="relative top-px h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full lg:order-1 lg:pr-4 flex justify-center">
        <DemoFrameShell
          title="iOS Share to Reerts"
          badge="Share → Content"
          deviceType="iphone"
          isWhiteUI={isWhiteUI}
        >
          <FluidCursor
            x={shareDraftOpen ? "80%" : shareSheetOpen ? "45%" : "85%"}
            y={shareDraftOpen ? "82%" : shareSheetOpen ? "65%" : "90%"}
            clicking={(sec > 0.8 && sec < 1.3) || (sec > 2.2 && sec < 2.7)}
            visible={true}
            isWhiteUI={isWhiteUI}
          />

          <div className="relative flex-1 flex flex-col justify-between p-3 overflow-hidden">
            <div>
              <div
                className={`rounded-lg px-2 py-1 text-[9.5px] font-mono flex items-center justify-between ${
                  isWhiteUI ? "bg-neutral-100 text-neutral-600" : "bg-neutral-900 text-neutral-400"
                }`}
              >
                <span>techcrunch.com</span>
                <Share2 className="size-3 text-blue-600" />
              </div>
              <div className="mt-3 space-y-1.5">
                <span className="text-[8.5px] uppercase font-bold text-blue-600">Tech Trends</span>
                <h4 className="text-xs font-bold leading-tight">
                  Why Autonomous AI Distribution Is Replacing Traditional Agencies
                </h4>
                <p className={`text-[10px] line-clamp-3 ${isWhiteUI ? "text-neutral-500" : "text-neutral-400"}`}>
                  High-growth startups are shifting away from manual social media agencies toward continuous AI pipelines...
                </p>
              </div>
            </div>

            <div
              className={`flex items-center justify-between border-t pt-1.5 px-2 ${
                isWhiteUI ? "border-neutral-200 text-neutral-500" : "border-neutral-800 text-neutral-400"
              }`}
            >
              <ChevronLeft className="size-4" />
              <ChevronRight className="size-4" />
              <Share2 className="size-4 text-blue-600" />
              <Bookmark className="size-4" />
            </div>

            <AnimatePresence>
              {shareSheetOpen && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`absolute inset-x-2 bottom-2 z-30 rounded-2xl p-3 shadow-2xl border ${
                    isWhiteUI
                      ? "bg-white/95 backdrop-blur-xl border-neutral-200 text-neutral-900"
                      : "bg-neutral-900/95 backdrop-blur-xl border-neutral-700 text-white"
                  }`}
                >
                  <span className="text-[9.5px] font-bold uppercase tracking-wider block mb-2 opacity-60">
                    Share Link
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1 cursor-pointer">
                      <span
                        className={`flex size-11 items-center justify-center rounded-2xl shadow-md ring-2 ${
                          isWhiteUI ? "bg-neutral-900 text-white ring-neutral-400" : "bg-white text-neutral-900 ring-neutral-700"
                        }`}
                      >
                        <ReertsLogo variant="symbol" size={20} />
                      </span>
                      <span className="text-[9px] font-bold">Reerts</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50">
                      <span
                        className={`flex size-11 items-center justify-center rounded-2xl ${
                          isWhiteUI ? "bg-neutral-100 text-neutral-700" : "bg-neutral-800 text-white"
                        }`}
                      >
                        <MessageSquare className="size-5" />
                      </span>
                      <span className="text-[9px]">Messages</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {shareDraftOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-2 z-40 rounded-2xl border p-3 shadow-2xl flex flex-col justify-between ${
                    isWhiteUI ? "border-neutral-300 bg-white" : "border-neutral-700 bg-neutral-900"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600">
                      <Sparkles className="size-3.5" />
                      <span>Drafted in your Brand Voice!</span>
                    </div>
                    <p className={`mt-2 text-[10.5px] font-mono leading-relaxed ${isWhiteUI ? "text-neutral-800" : "text-neutral-200"}`}>
                      3 key takeaways from TechCrunch's report: 1. Manual posting is dead. 2. Real-time repurposing wins...
                    </p>
                  </div>
                  <span
                    className={`rounded-lg py-1.5 text-[10px] font-bold text-center ${
                      isWhiteUI ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                    }`}
                  >
                    Schedule Draft →
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DemoFrameShell>
      </div>
    </div>
  );
}

// --- ROW 7: Competitor Spy ---
function RowSpy({ isWhiteUI }: { isWhiteUI: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const { elapsed } = useInstantScrollLoop(6500, isInView);
  const sec = elapsed / 1000;

  const spyHookAnalyzed = sec >= 1.2;

  return (
    <div ref={ref} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <ReertsLogo variant="symbol" size={14} iconClassName="size-3.5 object-contain" />
          Competitor Spy
        </span>

        <h3 className="text-3xl font-bold tracking-tight text-balance leading-tight md:text-4xl text-foreground">
          Track everything your competitors do <span className="text-primary">in one place</span>
        </h3>

        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty md:text-lg leading-relaxed">
          Compare Threads and TikTok competitor profiles and post performance in one dashboard. Repurpose top Threads posts in your own brand voice.
        </p>

        <Link
          href="/features/competitor-spy"
          className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
        >
          Learn more
          <ArrowRight className="relative top-px h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full lg:pl-4">
        <DemoFrameShell
          title="Competitor Radar Analytics"
          badge="Competitor Spy"
          deviceType="macos"
          isWhiteUI={isWhiteUI}
        >
          <FluidCursor
            x={spyHookAnalyzed ? "80%" : "50%"}
            y={spyHookAnalyzed ? "78%" : "45%"}
            clicking={sec > 0.9 && sec < 1.4}
            visible={true}
            isWhiteUI={isWhiteUI}
          />

          <div className="flex h-full w-full flex-col p-4 justify-between">
            <div
              className={`flex items-center justify-between border-b pb-2.5 ${
                isWhiteUI ? "border-neutral-200" : "border-neutral-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className={`size-4 ${isWhiteUI ? "text-neutral-900" : "text-primary"}`} />
                <span className="text-xs font-bold">Rivals Radar: @growth_academy</span>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[9.5px] font-bold ${
                  isWhiteUI ? "bg-rose-100 text-rose-800" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                +14.2% Growth
              </span>
            </div>

            <div
              className={`rounded-xl border p-3 space-y-2 shadow-2xs my-auto ${
                isWhiteUI ? "border-neutral-200 bg-white" : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold">Top Performing Post (78k Views)</span>
                <span className="text-[10px] text-emerald-600 font-bold">Viral Hook Detected</span>
              </div>
              <p className={`text-[10.5px] font-mono ${isWhiteUI ? "text-neutral-600" : "text-neutral-300"}`}>
                "Stop using 10 different social media tabs. Here is the autonomous stack we replaced it with:"
              </p>

              {spyHookAnalyzed && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border p-2 text-[10px] space-y-1 ${
                    isWhiteUI
                      ? "border-purple-200 bg-purple-50 text-purple-900"
                      : "border-purple-500/30 bg-purple-500/10 text-purple-300"
                  }`}
                >
                  <span className="font-bold">Hook Formula: Contrarian Statement + Stack Breakdown</span>
                  <p className="opacity-80">AI rewritten for your brand voice ready for Studio.</p>
                </motion.div>
              )}
            </div>

            <div
              className={`flex items-center justify-between pt-2 border-t text-[10px] ${
                isWhiteUI ? "border-neutral-200 text-neutral-500" : "border-neutral-800 text-neutral-400"
              }`}
            >
              <span>Tracking Threads, TikTok & LinkedIn</span>
              <span
                className={`inline-flex items-center gap-1 rounded px-3 py-1 font-semibold ${
                  isWhiteUI ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                }`}
              >
                Repurpose Hook →
              </span>
            </div>
          </div>
        </DemoFrameShell>
      </div>
    </div>
  );
}

// --- ROW 8: Client Account Connection ---
function RowClientConnect({ isWhiteUI }: { isWhiteUI: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const { elapsed } = useInstantScrollLoop(7000, isInView);
  const sec = elapsed / 1000;

  const clientView = sec < 2.5 ? "agency" : "client";
  const clientAuthorized = sec >= 4.2;

  return (
    <div ref={ref} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:order-2">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <ReertsLogo variant="symbol" size={14} iconClassName="size-3.5 object-contain" />
          Client account connection
        </span>

        <h3 className="text-3xl font-bold tracking-tight text-balance leading-tight md:text-4xl text-foreground">
          Connect client accounts<br />
          <span className="text-primary">without their passwords</span>
        </h3>

        <p className="mt-5 max-w-xl text-base text-muted-foreground text-pretty md:text-lg leading-relaxed">
          Invite your client with the Client role, and they connect their own accounts on each platform's official login screen. No passing around usernames and passwords, no waiting on two-factor codes.
        </p>

        <Link
          href="/features/client-account-connect"
          className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
        >
          Learn more
          <ArrowRight className="relative top-px h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="w-full lg:order-1 lg:pr-4">
        <DemoFrameShell
          title="Passwordless Client Connect Flow"
          badge="Client account connection"
          deviceType="macos"
          isWhiteUI={isWhiteUI}
        >
          <FluidCursor
            x={clientAuthorized ? "75%" : clientView === "client" ? "50%" : "70%"}
            y={clientAuthorized ? "75%" : "55%"}
            clicking={(sec > 1.0 && sec < 1.5) || (sec > 3.8 && sec < 4.3)}
            visible={true}
            isWhiteUI={isWhiteUI}
          />

          <AnimatePresence mode="wait">
            {clientView === "agency" ? (
              <motion.div
                key="agency-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex h-full w-full flex-col p-4 justify-between"
              >
                <div>
                  <div
                    className={`flex items-center justify-between border-b pb-2 ${
                      isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                    }`}
                  >
                    <span className="text-xs font-bold">Agency Portal: Invite Client</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        isWhiteUI ? "bg-neutral-100 text-neutral-800" : "bg-neutral-800 text-neutral-200"
                      }`}
                    >
                      Client Role
                    </span>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    <p className={`text-[11px] ${isWhiteUI ? "text-neutral-600" : "text-neutral-400"}`}>
                      Generate a secure magic link for your client to connect their accounts:
                    </p>
                    <div
                      className={`flex items-center gap-2 rounded-lg border p-2 text-[11px] font-mono ${
                        isWhiteUI ? "border-neutral-200 bg-neutral-50 text-neutral-800" : "border-neutral-700 bg-neutral-900 text-white"
                      }`}
                    >
                      <span className="truncate flex-1">https://reerts.com/connect/acme-growth-2026</span>
                      <span
                        className={`rounded px-2.5 py-1 text-[10px] font-bold shrink-0 ${
                          isWhiteUI ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                        }`}
                      >
                        Copy Link ✓
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-lg border p-2 text-[10px] ${
                    isWhiteUI
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  ✓ No passwords or 2FA codes required from your clients.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="client-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex h-full w-full flex-col p-4 justify-between ${
                  isWhiteUI ? "bg-white" : "bg-[#181818]"
                }`}
              >
                <div>
                  <div
                    className={`flex items-center justify-between border-b pb-2 ${
                      isWhiteUI ? "border-neutral-200" : "border-neutral-800"
                    }`}
                  >
                    <span className="text-xs font-bold">Client Authorization Screen</span>
                    <span className={`text-[10px] ${isWhiteUI ? "text-neutral-500" : "text-neutral-400"}`}>Official OAuth</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className={`text-[10.5px] ${isWhiteUI ? "text-neutral-600" : "text-neutral-400"}`}>
                      Acme Agency is requesting permission to schedule posts to your social channels:
                    </p>
                    <div className="space-y-1.5">
                      {["Instagram & Facebook (Meta)", "LinkedIn Company Page", "TikTok Creator"].map((acc) => (
                        <div
                          key={acc}
                          className={`flex items-center justify-between rounded-lg border p-2 text-[11px] ${
                            isWhiteUI ? "border-neutral-200 bg-neutral-50" : "border-neutral-800 bg-neutral-900"
                          }`}
                        >
                          <span className="font-semibold">{acc}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-[9.5px] font-bold ${
                              clientAuthorized
                                ? "bg-emerald-600 text-white"
                                : isWhiteUI
                                ? "bg-neutral-900 text-white"
                                : "bg-white text-neutral-900"
                            }`}
                          >
                            {clientAuthorized ? "Connected ✓" : "Authorize"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-lg border p-2 text-[9.5px] flex items-center justify-between ${
                    isWhiteUI ? "border-neutral-200 bg-neutral-50 text-neutral-600" : "border-neutral-800 bg-neutral-900 text-neutral-400"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    Encrypted by Official Platform APIs
                  </span>
                  <span className="text-emerald-600 font-bold">100% Secure</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DemoFrameShell>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN EXPORT
// =========================================================================

export function ShowcaseDemos({ isDark = false }: { isDark?: boolean }) {
  const isWhiteUI = !isDark;

  return (
    <section id="showcase-demos" className="border-t border-border py-20 bg-background transition-colors">
      {/* Section Heading */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center mb-16">
        <div className="inline-flex items-center justify-center shrink-0 select-none">
          <ReertsLogo variant="symbol" size={36} iconClassName="size-9 object-contain" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl text-foreground">
          Wait, it does that too?
        </h2>
        <p className="max-w-2xl text-base text-muted-foreground text-pretty md:text-lg">
          Automated live demonstrations showing every capability built for high-velocity founders and agencies.
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-24 lg:gap-28 max-w-7xl mx-auto px-4 sm:px-6">
        <RowCarousel isWhiteUI={isWhiteUI} />
        <RowAutoDm isWhiteUI={isWhiteUI} />
        <RowIdeas isWhiteUI={isWhiteUI} />
        <RowRemix isWhiteUI={isWhiteUI} />
        <RowRecurring isWhiteUI={isWhiteUI} />
        <RowShare isWhiteUI={isWhiteUI} />
        <RowSpy isWhiteUI={isWhiteUI} />
        <RowClientConnect isWhiteUI={isWhiteUI} />
      </div>
    </section>
  );
}
