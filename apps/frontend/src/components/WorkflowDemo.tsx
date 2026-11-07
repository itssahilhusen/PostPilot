"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReertsLogo } from "@/components/ReertsLogo";
import { cn } from "@/lib/utils";
import {
  Users,
  Rss,
  Wand2,
  Calendar,
  FileText,
  MessageCircle,
  Image as ImageIcon,
  BarChart3,
  Target,
  Flame,
  Pencil,
  Sparkles,
  Bookmark,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Search,
  Check,
  Download,
  Loader2,
  Globe,
  Radio,
  Clock,
  Filter,
  Send,
  Save,
  Repeat,
  Share2,
} from "lucide-react";

// ==========================================
// 0. PLATFORM ICONS & HELPERS
// ==========================================
export function PlatformIcon({
  platform,
  size = 14,
  className = "",
  invertTheme = false,
}: {
  platform: string;
  size?: number;
  className?: string;
  invertTheme?: boolean;
}) {
  switch (platform.toLowerCase()) {
    case "threads":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 192 192" fill="currentColor" className={className}>
          <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4184 44.7441 97.2749 44.7441 97.1313 44.745C75.377 44.745 57.6587 58.745 52.4704 80.645C47.882 100.005 53.642 120.675 67.8937 136.215C81.042 150.545 99.4187 157.945 119.59 157.145C138.487 156.395 153.945 148.645 163.794 135.045C171.189 124.845 175.549 111.445 176.435 96.245C177.587 76.545 171.937 57.745 160.545 43.345C148.427 28.045 129.845 19.345 108.245 18.845C78.4454 18.145 52.4454 30.645 35.5454 53.945C18.6454 77.245 13.0454 108.345 19.8454 141.345C20.4454 144.245 23.2454 146.045 26.1454 145.445C29.0454 144.845 30.8454 142.045 30.2454 139.145C24.1454 109.545 29.1454 81.645 44.3454 60.745C59.5454 39.845 82.9454 28.645 108.045 29.245C126.945 29.645 143.145 37.245 153.745 50.645C163.645 63.145 168.545 79.445 167.545 96.545C166.745 109.745 162.945 121.345 156.545 130.145C148.045 141.845 134.645 148.445 118.245 149.145C100.845 149.845 84.9454 143.445 73.5454 131.045C61.2454 117.645 56.2454 99.745 60.2454 82.945C64.6454 64.345 79.7454 52.345 98.3454 52.345C118.445 52.445 128.945 64.645 129.945 86.845C123.345 84.945 116.145 84.045 108.645 84.145C86.7454 84.445 72.8454 96.245 73.9454 113.645C74.4454 122.245 78.5454 129.345 85.5454 133.545C92.2454 137.645 100.845 138.845 109.845 137.045C122.345 134.545 131.745 125.745 136.645 111.945C140.445 115.645 144.945 118.545 150.145 120.345C152.845 121.345 155.845 119.845 156.745 117.145C157.745 114.445 156.245 111.445 153.545 110.545C148.245 108.745 143.745 105.445 140.245 100.745C141.345 93.345 141.845 84.845 141.537 88.9883ZM128.645 100.745C124.645 111.445 117.545 118.045 107.845 119.945C101.645 121.245 95.8454 120.345 91.6454 117.745C87.2454 115.145 84.5454 110.445 84.2454 104.945C83.7454 94.445 92.5454 86.845 108.245 86.645C115.345 86.545 122.245 87.545 128.645 89.645V100.745Z" />
        </svg>
      );
    case "x":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 1200 1227" fill="currentColor" className={className}>
          <path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 72 72" fill="currentColor" className={className}>
          <path d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case "tiktok":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.34 6.34 0 0 0 1.94-4.52V8.92a8.28 8.28 0 0 0 4.83 1.54V7.02c-.34-.03-.68-.14-1-.33Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "facebook":
      return (
        <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    default:
      return <Radio style={{ width: size, height: size }} className={className} />;
  }
}

// 5 Step definitions matching Reerts exactly
const STEPS = [
  { key: "persona", label: "Brand voice", duration: 18000 },
  { key: "discover", label: "Suggested ideas", duration: 15000 },
  { key: "draft", label: "Auto-generate", duration: 12400 },
  { key: "schedule", label: "Schedule", duration: 12000 },
  { key: "analyze", label: "Analytics", duration: 16000 },
];

const SELECTOR_PLATFORMS = ["threads", "x", "linkedin", "instagram", "tiktok", "youtube", "facebook"];

// Hook to drive sequential scene beats
function useSceneBeat(active: boolean, beats: number[]) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!active) {
      setBeat(0);
      return;
    }
    if (beat >= beats.length) return;
    const timer = setTimeout(() => {
      setBeat((prev) => prev + 1);
    }, beats[beat]);
    return () => clearTimeout(timer);
  }, [active, beat, beats]);

  return beat;
}

// ==========================================
// DEMO SELECT COMPONENT (WITH REAL DROPDOWN POPUP)
// ==========================================
function DemoSelect({
  label,
  value,
  valueIcon,
  muted = false,
  open = false,
  options = [],
  optionIcons,
  selectedIndex = -1,
  align = "left",
  fullWidth = false,
  scrollClass,
  cursorId,
  optionCursor,
}: {
  label: string;
  value: string;
  valueIcon?: React.ReactNode;
  muted?: boolean;
  open?: boolean;
  options?: string[];
  optionIcons?: React.ReactNode[];
  selectedIndex?: number;
  align?: "left" | "right";
  fullWidth?: boolean;
  scrollClass?: string;
  cursorId?: string;
  optionCursor?: { index: number; id: string };
}) {
  return (
    <div className={cn("relative min-w-0", !fullWidth && "flex-1", open && "z-30")}>
      <div className="mb-1 truncate text-[10px] font-medium text-muted-foreground">{label}</div>
      <div
        data-cursor={cursorId}
        className={cn(
          "flex items-center gap-1 rounded-md border px-2 py-1.5 transition-colors cursor-pointer",
          open ? "border-primary/50 bg-background ring-2 ring-primary/20 shadow-xs" : "bg-background/60"
        )}
      >
        {valueIcon && <span className="shrink-0">{valueIcon}</span>}
        <span className={cn("min-w-0 flex-1 truncate text-[11px] font-medium transition-colors", muted ? "text-muted-foreground/40" : "text-foreground/80")}>
          {value}
        </span>
        <ChevronsUpDown className="h-3 w-3 shrink-0 text-muted-foreground/50" />
      </div>

      {options.length > 0 && (
        <motion.div
          initial={false}
          animate={{ opacity: open ? 1 : 0, y: open ? 0 : -4 }}
          transition={{ duration: 0.15 }}
          aria-hidden={!open}
          className={cn(
            "absolute top-full z-40 mt-1 flex flex-col gap-0.5 rounded-md border border-border bg-popover p-1 shadow-xl",
            scrollClass && `${scrollClass} overflow-y-auto`,
            fullWidth ? "left-0 right-0" : cn("min-w-[7.5rem]", align === "right" ? "right-0" : "left-0"),
            !open && "pointer-events-none hidden"
          )}
        >
          {options.map((opt, idx) => {
            const isSelected = idx === selectedIndex;
            const isTarget = optionCursor && idx === optionCursor.index;
            return (
              <div
                key={opt}
                data-cursor={isTarget ? optionCursor.id : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium cursor-pointer transition-colors",
                  isSelected ? "bg-primary/10 text-foreground font-semibold" : "text-foreground/75 hover:bg-muted/50"
                )}
              >
                {optionIcons?.[idx] && <span className="shrink-0">{optionIcons[idx]}</span>}
                <span className="min-w-0 flex-1 truncate">{opt}</span>
                {isSelected && <Check className="h-3 w-3 shrink-0 text-primary stroke-[2.5]" />}
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// ==========================================
// DEMO CURSOR (Realistic Pointer Simulation)
// ==========================================
function DemoCursor({
  beat,
  targets,
  clickBeats,
  visibleRange,
}: {
  beat: number;
  targets: Record<number, string>;
  clickBeats: number[];
  visibleRange: [number, number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: string; y: string } | null>(null);

  useLayoutEffect(() => {
    if (!targets) return;
    let targetId: string | undefined;
    for (let t = beat; t >= 0; t--) {
      if (targets[t] !== undefined) {
        targetId = targets[t];
        break;
      }
    }
    if (!targetId) return;

    let raf = 0;
    const start = performance.now();
    const update = () => {
      const parent = ref.current?.offsetParent as HTMLElement | null;
      const el = parent?.querySelector(`[data-cursor="${targetId}"]`) as HTMLElement | null;
      const parentRect = parent?.getBoundingClientRect();
      if (el && parentRect && parentRect.width > 0 && parentRect.height > 0) {
        const r = el.getBoundingClientRect();
        const next = {
          x: `${((r.left + r.width / 2 - parentRect.left) / parentRect.width) * 100}%`,
          y: `${((r.top + r.height / 2 - parentRect.top) / parentRect.height) * 100}%`,
        };
        setPos((prev) => (prev && prev.x === next.x && prev.y === next.y ? prev : next));
      }
      if (performance.now() - start < 500) {
        raf = requestAnimationFrame(update);
      }
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [beat, targets]);

  const isVisible = beat >= visibleRange[0] && beat <= visibleRange[1] && !!pos;
  const isClicking = clickBeats.includes(beat);

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{
        left: pos?.x ?? "50%",
        top: pos?.y ?? "50%",
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        left: { duration: 0.45, ease: "easeInOut" },
        top: { duration: 0.45, ease: "easeInOut" },
        opacity: { duration: 0.2 },
      }}
      className="pointer-events-none absolute z-[80] -translate-x-1 -translate-y-1"
      aria-hidden="true"
    >
      <motion.span
        initial={false}
        animate={{ scale: isClicking ? 0.72 : 1 }}
        transition={{ duration: 0.12 }}
        className="block drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-white stroke-neutral-900"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
        </svg>
      </motion.span>
    </motion.div>
  );
}

// ==========================================
// MAIN COMPONENT: WORKFLOW DEMO
// ==========================================
export function WorkflowDemo({ isDark = false }: { isDark?: boolean }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Inverted Demo Theme Class:
  // When main website is black/dark: the demo window is crisp white ("theme-light")!
  // When main website is white/light: the demo window is sleek black ("dark")!
  const demoThemeClass = isDark ? "dark" : "theme-light";

  // Auto rotation across 5 steps
  useEffect(() => {
    if (isPaused) return;
    const currentDuration = STEPS[activeStep].duration;
    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, currentDuration);
    return () => clearTimeout(timer);
  }, [activeStep, isPaused]);

  return (
    <section id="workflow-demo" className="px-4 py-20 bg-background text-foreground transition-colors">
      {/* 1. Header: Mirror of Reerts ShowcaseHeading */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center">
        <div className="flex items-center justify-center">
          <ReertsLogo size={32} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl text-foreground">
          See reerts in action
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-5xl">
        {/* 2. Step Selector Pills Bar with Progress Line */}
        <div
          className="mx-auto flex w-full max-w-5xl items-stretch gap-1 rounded-lg bg-muted p-1.5"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {STEPS.map((st, idx) => {
            const isActive = idx === activeStep;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => {
                  setActiveStep(idx);
                  setIsPaused(false);
                }}
                aria-current={isActive ? "step" : undefined}
                aria-label={st.label}
                className={`relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-md px-2 py-2 text-sm transition-colors md:text-base ${
                  isActive
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="hidden md:inline">{st.label}</span>

                {/* Animated progress bar under active button */}
                {isActive && !isPaused && (
                  <motion.span
                    key={`progress-${idx}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: st.duration / 1000, ease: "linear" }}
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                    aria-hidden={true}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. macOS Window Shell with INVERTED Theme */}
        <div className="relative mx-auto mt-6 w-full max-w-5xl md:mt-8">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/5 blur-2xl" />

          <div
            role="group"
            className={cn(
              "w-full select-none overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl transition-all duration-300",
              demoThemeClass
            )}
            aria-label="reerts workflow demo"
          >
            {/* Title Bar */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs">
                <ReertsLogo size={11} />
                <span className="font-semibold text-foreground/85">reerts</span>
                <span>•</span>
                <span>{STEPS[activeStep].label}</span>
              </span>
            </div>

            {/* Video-like Animation Canvas Stage */}
            <div className="relative h-[29rem] md:h-[35rem] overflow-hidden bg-card text-card-foreground">
              <ScenePersona active={activeStep === 0} />
              <SceneDiscover active={activeStep === 1} />
              <SceneDraft active={activeStep === 2} />
              <SceneSchedule active={activeStep === 3} />
              <SceneAnalyze active={activeStep === 4} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// DEMO SIDEBAR COMPONENT
// ==========================================
function DemoSidebar({ activeItem }: { activeItem: string }) {
  const navGroups = [
    {
      group: "Create",
      items: [
        { key: "personas", label: "Brand Voice", icon: Users },
        { key: "ideas", label: "Ideas", icon: Rss },
        { key: "studio", label: "Studio", icon: Wand2 },
      ],
    },
    {
      group: "Operate",
      items: [
        { key: "calendar", label: "Calendar", icon: Calendar },
        { key: "posts", label: "Posts", icon: FileText },
        { key: "comments", label: "Comments", icon: MessageCircle },
        { key: "mediaLibrary", label: "Media", icon: ImageIcon },
      ],
    },
    {
      group: "Explore",
      items: [
        { key: "analytics", label: "Analytics", icon: BarChart3 },
        { key: "spy", label: "Spy", icon: Target },
      ],
    },
  ];

  return (
    <div className="flex h-full w-52 shrink-0 flex-col gap-3 border-r border-border bg-muted/30 p-3 select-none">
      <div className="flex items-center gap-2 px-1 py-1">
        <ReertsLogo size={18} />
        <span className="text-sm font-bold tracking-tight text-foreground uppercase">
          REERTS
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        {navGroups.map((grp) => (
          <div key={grp.group} className="flex flex-col gap-1">
            <span className="px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
              {grp.group}
            </span>
            {grp.items.map((it) => {
              const isSelected = it.key === activeItem;
              const IconComp = it.icon;
              return (
                <div
                  key={it.key}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? "bg-primary/10 font-semibold text-foreground shadow-2xs border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <IconComp className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{it.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-md border border-border bg-background/60 px-2 py-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
          R
        </span>
        <span className="min-w-0 truncate text-[11px] font-medium text-foreground/90">
          Reerts Creator
        </span>
      </div>
    </div>
  );
}

// ==========================================
// SCENE 1: BRAND VOICE (VIDEO AUTOMATION)
// ==========================================
function ScenePersona({ active }: { active: boolean }) {
  const beats = useMemo(
    () => [500, 550, 550, 500, 550, 500, 1500, 550, 550, 500, 550, 500, 450, 550, 550, 500, 450, 550, 550, 600, 800, 800, 800, 800, 700, 700, 700],
    []
  );
  const beat = useSceneBeat(active, beats);

  const targets: Record<number, string> = {
    1: "account-chip",
    3: "account-item",
    5: "add-persona",
    7: "method-card",
    9: "popular-toggle",
    11: "analysis-lang-select",
    13: "analysis-lang-option",
    15: "content-lang-select",
    17: "content-lang-option",
    19: "generate-btn",
  };

  const accountDropdownOpen = beat >= 2 && beat <= 4;
  const accountSelected = beat >= 4;
  const modalVisible = beat >= 6 && beat <= 23;
  const modalPhase = beat <= 8 ? "method" : beat <= 20 ? "setup" : "progress";
  const popularOn = beat >= 10;
  const analysisLangOpen = beat >= 12 && beat <= 14;
  const analysisLangSelected = beat >= 14;
  const contentLangOpen = beat >= 16 && beat <= 18;
  const contentLangSelected = beat >= 18;
  const createPressing = beat === 20;
  const progressStep = beat === 21 ? 0 : beat === 22 ? 1 : beat >= 23 ? 2 : -1;
  const cardVisible = beat >= 24;
  const openAccordion = beat >= 24 ? Math.min(beat - 24, 3) : -1;

  const langOptions = ["English", "Español", "한국어", "日本語", "中文", "Deutsch", "Français"];

  const sections = [
    {
      title: "Profile concept",
      icon: Users,
      content: "A marketing automation expert for agency marketers and solo founders — shares insider tips in a 'dark marketer' voice.",
    },
    {
      title: "Target audience",
      icon: Target,
      content: "Demographics: Agency marketers, founders 20s–40s\nImplicit promise: Become a dark marketer who ships 10x faster.",
    },
    {
      title: "Hook",
      icon: Flame,
      content: "Hook tone: Confident, insider-tip tone\nPatterns: Target callout · curiosity bait · blunt declaration.",
    },
    {
      title: "Writing style",
      icon: Pencil,
      content: "~9 words/36 chars, line breaks by meaning + arrows (→) for process. Mixes polite and punchy endings.",
    },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className={cn("absolute inset-0 flex h-full w-full overflow-hidden", !active && "pointer-events-none")}
    >
      <div className="hidden md:flex">
        <DemoSidebar activeItem="personas" />
      </div>

      <div className="relative min-w-0 flex-1 flex flex-col gap-3 p-4 md:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" strokeWidth={1.75} />
            <span className="text-lg font-bold text-foreground">Brand voice setup</span>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            15 posts analyzed
          </span>
        </div>

        {/* Account Selector Pill */}
        <div className="relative">
          <div
            data-cursor="account-chip"
            className="flex w-52 items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1.5 transition-all cursor-pointer"
          >
            <PlatformIcon platform="threads" size={13} />
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <ReertsLogo size={11} />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/90">
              {accountSelected ? "reerts.app" : "Select account"}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </div>

          {/* Account Dropdown */}
          <AnimatePresence>
            {accountDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 top-full z-40 mt-1 w-52 rounded-md border border-border bg-popover p-1 shadow-xl"
              >
                <div
                  data-cursor="account-item"
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-xs bg-primary/10 font-semibold text-foreground cursor-pointer"
                >
                  <PlatformIcon platform="threads" size={12} />
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <ReertsLogo size={9} />
                  </span>
                  <span>reerts.app</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {/* Active Card */}
          <div
            className={cn(
              "flex flex-col gap-2 rounded-xl border border-border bg-background/80 p-3.5 shadow-xs transition-all duration-300",
              cardVisible ? "opacity-100 scale-100" : "opacity-40 scale-[0.98]"
            )}
          >
            <div className="flex shrink-0 items-center gap-2 pb-2 border-b border-border/50">
              <PlatformIcon platform="threads" size={14} />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ReertsLogo size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-foreground/90">The Dark Marketer</div>
                <div className="text-[10px] text-muted-foreground">reerts.app</div>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
                My account
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
              {sections.map((sec, idx) => {
                const isOpen = idx === openAccordion;
                const SecIcon = sec.icon;
                return (
                  <div
                    key={sec.title}
                    className={cn(
                      "rounded-lg border transition-all duration-200",
                      isOpen ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background/40"
                    )}
                  >
                    <div className="flex items-center justify-between px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        <SecIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-foreground/80">{sec.title}</span>
                      </div>
                      <ChevronDown
                        className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </div>
                    {isOpen && (
                      <div className="px-2.5 pb-2.5 pt-1 border-t border-primary/10 text-[10px] text-foreground/75 leading-relaxed whitespace-pre-line">
                        {sec.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Persona Action Card */}
          <div
            data-cursor="add-persona"
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border bg-background shadow-xs">
              <Plus className="h-6 w-6 text-primary" />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">Add brand voice</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Analyze another profile or benchmark competitors
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="rounded-md border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Analyze profile
              </span>
              <span className="rounded-md border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                Reference account
              </span>
            </div>
          </div>
        </div>

        {/* Automated Modal Dialog Overlay */}
        <AnimatePresence>
          {modalVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-2xl space-y-3"
              >
                {modalPhase === "method" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-foreground">Add brand voice</div>
                    <div
                      data-cursor="method-card"
                      className="rounded-lg border border-primary/40 bg-primary/5 p-3 flex items-center justify-between cursor-pointer hover:border-primary"
                    >
                      <div>
                        <div className="text-xs font-semibold text-foreground">Analyze my profile &amp; posts</div>
                        <div className="text-[10px] text-muted-foreground">Learn writing style from my posts</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}

                {modalPhase === "setup" && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-foreground">Analyze my profile &amp; posts</div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Brand voice name</span>
                      <div className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                        The Dark Marketer
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground">Posts to analyze</span>
                      <div className="relative h-2 w-full rounded-full bg-muted">
                        <div className="absolute inset-y-0 left-0 w-3/5 rounded-full bg-primary/60" />
                        <div className="absolute left-3/5 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-xs" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground">Analyze top posts only</span>
                      <span
                        data-cursor="popular-toggle"
                        className={cn(
                          "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors cursor-pointer",
                          popularOn ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      >
                        <motion.span
                          initial={false}
                          animate={{ x: popularOn ? 13 : 2 }}
                          transition={{ duration: 0.2 }}
                          className="h-3 w-3 rounded-full bg-white shadow"
                        />
                      </span>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <DemoSelect
                        label="Analysis language"
                        value={analysisLangSelected ? "English" : "Select language"}
                        open={analysisLangOpen}
                        options={langOptions}
                        selectedIndex={analysisLangSelected ? 0 : -1}
                        scrollClass="max-h-[5.5rem]"
                        cursorId="analysis-lang-select"
                        optionCursor={{ index: 0, id: "analysis-lang-option" }}
                      />
                      <DemoSelect
                        label="Post language"
                        value={contentLangSelected ? "English" : "Select language"}
                        open={contentLangOpen}
                        options={langOptions}
                        selectedIndex={contentLangSelected ? 0 : -1}
                        align="right"
                        scrollClass="max-h-[5.5rem]"
                        cursorId="content-lang-select"
                        optionCursor={{ index: 0, id: "content-lang-option" }}
                      />
                    </div>

                    <motion.div
                      data-cursor="generate-btn"
                      animate={{ scale: createPressing ? 0.96 : 1 }}
                      transition={{ duration: 0.15 }}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Create brand voice</span>
                    </motion.div>
                  </div>
                )}

                {modalPhase === "progress" && (
                  <div className="py-4 space-y-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs font-semibold text-foreground">
                        {progressStep === 0 && "Collecting posts…"}
                        {progressStep === 1 && "AI is analyzing content…"}
                        {progressStep >= 2 && "Saving results…"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "20%" }}
                        animate={{
                          width: progressStep === 0 ? "35%" : progressStep === 1 ? "75%" : "100%",
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <DemoCursor
          beat={beat}
          targets={targets}
          clickBeats={[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]}
          visibleRange={[1, 20]}
        />
      </div>
    </motion.div>
  );
}

// ==========================================
// SCENE 2: SUGGESTED IDEAS (DISCOVER)
// ==========================================
function SceneDiscover({ active }: { active: boolean }) {
  const beats = useMemo(
    () => [500, 550, 500, 550, 550, 550, 450, 450, 550, 550, 1000, 550, 500, 550, 500, 450, 550, 550, 700, 900, 650, 650, 750],
    []
  );
  const beat = useSceneBeat(active, beats);

  const targets: Record<number, string> = {
    1: "find-content-btn",
    3: "method-auto-search",
    5: "freshness-select",
    7: "freshness-option",
    9: "source-select",
    11: "grouping-toggle",
    13: "language-select",
    15: "language-option",
    17: "search-cta",
    20: "material-column",
  };

  const dropdownOpen = beat >= 2 && beat <= 4;
  const searchModalOpen = beat >= 4 && beat <= 19;
  const freshnessOpen = beat >= 6 && beat <= 8;
  const freshnessChanged = beat >= 8;
  const sourceOpen = beat === 10;
  const groupingOn = beat >= 12;
  const languageOpen = beat >= 14 && beat <= 16;
  const languageChanged = beat >= 16;
  const searchPressing = beat === 18;
  const isSearching = beat >= 18 && beat <= 19;
  const cardsCount = beat >= 20 ? Math.min(beat - 19, 3) : 0;

  const freshnessOptions = ["Past 24 hours", "Past week", "Past month"];
  const sourceOptions = ["All sources", "Threads only", "X (Twitter)", "Reddit"];
  const langOptions = ["English", "Español", "한국어", "日本語", "Deutsch"];

  const kanbanColumns = [
    { key: "material", title: "Content Ideas", dotColor: "bg-zinc-400", count: cardsCount },
    { key: "draft", title: "Drafts", dotColor: "bg-amber-400", count: 1 },
    { key: "scheduled", title: "Scheduled", dotColor: "bg-emerald-500", count: 2 },
    { key: "published", title: "Published", dotColor: "bg-blue-500", count: 5 },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className={cn("absolute inset-0 flex h-full w-full overflow-hidden", !active && "pointer-events-none")}
    >
      <div className="hidden md:flex">
        <DemoSidebar activeItem="studio" />
      </div>

      <div className="relative min-w-0 flex-1 flex flex-col gap-3 p-4 md:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" strokeWidth={1.75} />
            <span className="text-lg font-bold text-foreground">Content Studio</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex w-44 items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1.5">
              <PlatformIcon platform="threads" size={13} />
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ReertsLogo size={11} />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/90">
                reerts.app
              </span>
            </div>

            <div className="relative">
              <div
                data-cursor="find-content-btn"
                className="flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-xs font-medium text-foreground cursor-pointer"
              >
                <Search className="h-3.5 w-3.5 text-primary" />
                <span>Discover Ideas</span>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-md border border-border bg-popover p-1 shadow-xl">
                  <div
                    data-cursor="method-auto-search"
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-xs bg-primary/10 text-foreground font-semibold cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Auto Idea Search</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board Columns */}
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-4 gap-3 overflow-y-auto">
          {kanbanColumns.map((col, idx) => (
            <div
              key={col.key}
              data-cursor={idx === 0 ? "material-column" : undefined}
              className="flex min-h-0 flex-col rounded-xl border border-border bg-muted/20 p-2.5"
            >
              <div className="flex shrink-0 items-center justify-between pb-2 mb-2 border-b border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                  <span className="text-[11px] font-semibold text-foreground/90">{col.title}</span>
                </div>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                  {col.count}
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
                {idx === 0 && cardsCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-primary/40 bg-card p-3 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-primary uppercase">
                        2026 shifts
                      </span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600">
                        98 virality
                      </span>
                    </div>
                    <div className="text-xs font-bold text-foreground leading-snug">
                      2026 social algorithm shifts report
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      The algorithm shift rewards consistency and engagement signals across multi-channel accounts.
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="text-[9px] text-muted-foreground">1,200 accounts</span>
                      <span className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        <Wand2 className="h-2.5 w-2.5" /> Draft
                      </span>
                    </div>
                  </motion.div>
                )}

                {idx === 0 && cardsCount > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-2"
                  >
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase">@sns_insights</span>
                    <div className="text-xs font-semibold text-foreground">Creator economy: top 3 tactics</div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      Newsletter hooks that lifted subscribe rates plus short-form repurposing tactics.
                    </p>
                  </motion.div>
                )}

                {idx === 1 && (
                  <div className="rounded-lg border border-amber-500/40 bg-card p-3 shadow-xs space-y-2">
                    <span className="text-[9px] font-semibold text-amber-600 uppercase">In Review</span>
                    <div className="text-xs font-semibold text-foreground">12 short-form hook patterns</div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      Twelve opening hooks that stop the scroll in 3 seconds.
                    </p>
                  </div>
                )}

                {idx === 2 && (
                  <div className="rounded-lg border border-emerald-500/30 bg-card p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-emerald-600">Wed, 2:00 PM</span>
                      <div className="flex items-center gap-1">
                        <PlatformIcon platform="threads" size={11} />
                        <PlatformIcon platform="x" size={11} />
                      </div>
                    </div>
                    <div className="text-xs font-medium text-foreground line-clamp-2">
                      The algorithm changed again. Consistency wins.
                    </div>
                  </div>
                )}

                {idx === 3 && (
                  <div className="rounded-lg border border-blue-500/30 bg-card p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-blue-600">Yesterday</span>
                      <span className="text-[9px] font-bold text-muted-foreground">32.6k views</span>
                    </div>
                    <div className="text-xs font-medium text-foreground line-clamp-2">
                      One share and your pipeline is scheduled across 7 channels.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Discover Modal Dialog with Real Select Dropdowns */}
        <AnimatePresence>
          {searchModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-2xl space-y-3"
              >
                {!isSearching ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Auto Idea Search</span>
                    </div>

                    <div className="flex gap-2">
                      <DemoSelect
                        label="Freshness"
                        value={freshnessChanged ? "Past 24 hours" : "Past week"}
                        open={freshnessOpen}
                        options={freshnessOptions}
                        selectedIndex={freshnessChanged ? 0 : 1}
                        cursorId="freshness-select"
                        optionCursor={{ index: 0, id: "freshness-option" }}
                      />
                      <DemoSelect
                        label="Source"
                        value={sourceOptions[0]}
                        open={sourceOpen}
                        options={sourceOptions}
                        selectedIndex={0}
                        align="right"
                        cursorId="source-select"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground">Group by topic</span>
                      <span
                        data-cursor="grouping-toggle"
                        className={cn(
                          "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors cursor-pointer",
                          groupingOn ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      >
                        <motion.span
                          initial={false}
                          animate={{ x: groupingOn ? 13 : 2 }}
                          transition={{ duration: 0.2 }}
                          className="h-3 w-3 rounded-full bg-white shadow"
                        />
                      </span>
                    </div>

                    <DemoSelect
                      label="Query language"
                      value={languageChanged ? "English" : "All languages"}
                      open={languageOpen}
                      options={langOptions}
                      selectedIndex={languageChanged ? 0 : -1}
                      fullWidth={true}
                      cursorId="language-select"
                      optionCursor={{ index: 0, id: "language-option" }}
                    />

                    <motion.div
                      data-cursor="search-cta"
                      animate={{ scale: searchPressing ? 0.96 : 1 }}
                      transition={{ duration: 0.15 }}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>Search ideas</span>
                    </motion.div>
                  </div>
                ) : (
                  <div className="py-6 space-y-3 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <div className="text-xs font-semibold text-foreground">Searching for trending topics…</div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <DemoCursor
          beat={beat}
          targets={targets}
          clickBeats={[2, 4, 6, 8, 10, 12, 14, 16, 18]}
          visibleRange={[1, 23]}
        />
      </div>
    </motion.div>
  );
}

// ==========================================
// SCENE 3: AUTO-GENERATE (DRAFT)
// ==========================================
function SceneDraft({ active }: { active: boolean }) {
  const beats = useMemo(
    () => [500, 600, 1100, 850, 700, 850, 500, 480, 480, 480, 480, 480, 480, 480, 480, 480, 480, 800, 650, 1200],
    []
  );
  const beat = useSceneBeat(active, beats);

  const targets: Record<number, string> = {
    1: "draft-btn",
    4: "review-btn",
    6: "account-x",
    8: "account-linkedin",
    10: "account-instagram",
    12: "account-tiktok",
    14: "account-youtube",
    16: "account-facebook",
    18: "schedule-btn",
  };

  const draftPressing = beat === 2;
  const draftCardPhase = beat >= 4 ? "done" : beat >= 2 ? "generating" : "hidden";
  const isReviewOpen = beat >= 5;
  const reviewPressing = beat === 5;
  const schedulePressing = beat === 19;

  const selectedChannels = useMemo(() => {
    const list = ["threads"];
    if (beat >= 7) list.push("x");
    if (beat >= 9) list.push("linkedin");
    if (beat >= 11) list.push("instagram");
    if (beat >= 13) list.push("tiktok");
    if (beat >= 15) list.push("youtube");
    if (beat >= 17) list.push("facebook");
    return list;
  }, [beat]);

  const pressingPlatform =
    beat === 7 ? "x" : beat === 9 ? "linkedin" : beat === 11 ? "instagram" : beat === 13 ? "tiktok" : beat === 15 ? "youtube" : beat === 17 ? "facebook" : null;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className={cn("absolute inset-0 flex h-full w-full overflow-hidden", !active && "pointer-events-none")}
    >
      <div className="hidden md:flex">
        <DemoSidebar activeItem="studio" />
      </div>

      <div className="relative min-w-0 flex-1 flex flex-col gap-3 p-4 md:p-6 overflow-hidden">
        {/* Background Kanban Studio Stage */}
        <div className="flex h-full w-full flex-col gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" strokeWidth={1.75} />
            <span className="text-lg font-bold text-foreground">Content Studio</span>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-4 gap-2">
            {/* Column 1: Ideas */}
            <div className="flex flex-col rounded-xl border border-border bg-muted/20 p-2.5">
              <div className="flex shrink-0 items-center justify-between pb-1.5 mb-1.5 border-b border-border/50 text-[11px] font-semibold text-foreground/80">
                <span>Content Ideas</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">1</span>
              </div>
              <div className="rounded-lg border border-primary/40 bg-card p-3 shadow-xs space-y-2">
                <span className="text-[9px] font-semibold text-primary uppercase">2026 shifts</span>
                <div className="text-xs font-bold text-foreground leading-snug">2026 social algorithm shifts report</div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">
                  The algorithm shift rewards consistency and engagement signals across multi-channel accounts.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-[9px] text-muted-foreground">1,200 accounts</span>
                  <motion.div
                    data-cursor="draft-btn"
                    animate={{ scale: draftPressing ? 0.94 : 1 }}
                    className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground shadow-xs cursor-pointer"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>Create draft</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Column 2: Drafts */}
            <div className="flex flex-col rounded-xl border border-border bg-muted/20 p-2.5">
              <div className="flex shrink-0 items-center justify-between pb-1.5 mb-1.5 border-b border-border/50 text-[11px] font-semibold text-foreground/80">
                <span>Drafts</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                  {draftCardPhase !== "hidden" ? 1 : 0}
                </span>
              </div>
              {draftCardPhase !== "hidden" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-amber-500/40 bg-card p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-amber-600 uppercase">
                      {draftCardPhase === "generating" ? "Generating…" : "Draft Ready"}
                    </span>
                    {draftCardPhase === "generating" && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  </div>
                  <div className="text-xs font-semibold text-foreground">The algorithm changed again. Consistency wins.</div>
                  <motion.div
                    data-cursor="review-btn"
                    animate={{ scale: reviewPressing ? 0.94 : 1 }}
                    className="flex items-center justify-center gap-1 rounded bg-primary py-1 text-[10px] font-semibold text-primary-foreground shadow-xs cursor-pointer"
                  >
                    <Calendar className="h-3 w-3" />
                    <span>Review &amp; Schedule</span>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Column 3: Scheduled */}
            <div className="hidden md:flex flex-col rounded-xl border border-border bg-muted/20 p-2.5 opacity-60">
              <div className="flex shrink-0 items-center justify-between pb-1.5 mb-1.5 border-b border-border/50 text-[11px] font-semibold text-foreground/80">
                <span>Scheduled</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">2</span>
              </div>
            </div>

            {/* Column 4: Published */}
            <div className="hidden md:flex flex-col rounded-xl border border-border bg-muted/20 p-2.5 opacity-60">
              <div className="flex shrink-0 items-center justify-between pb-1.5 mb-1.5 border-b border-border/50 text-[11px] font-semibold text-foreground/80">
                <span>Published</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sliding Draft Review Drawer Overlay */}
        <motion.div
          data-testid="hero-draft-sheet"
          initial={false}
          animate={{ x: isReviewOpen ? "0%" : "-100%" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-hidden={!isReviewOpen}
          className={cn(
            "absolute inset-y-0 left-0 z-40 flex flex-col gap-2.5 border-r border-border bg-card p-4 shadow-2xl w-full md:w-[62%]",
            !isReviewOpen && "pointer-events-none"
          )}
        >
          {/* Action Bar */}
          <div className="flex shrink-0 items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground truncate">2026 social algorithm shifts</span>
            </div>
            <motion.div
              data-cursor="schedule-btn"
              animate={{ scale: schedulePressing ? 0.94 : 1 }}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Post</span>
            </motion.div>
          </div>

          {/* Persona Chip */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PlatformIcon platform="threads" size={13} />
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10">
              <ReertsLogo size={9} />
            </span>
            <span className="font-semibold text-foreground/90">The Dark Marketer</span>
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
              My account
            </span>
          </div>

          {/* Platform Selector with Interactive Click Checkmarks */}
          <div className="flex items-center gap-2 py-1">
            {SELECTOR_PLATFORMS.map((plat) => {
              const isSelected = selectedChannels.includes(plat);
              const isPressing = pressingPlatform === plat;
              return (
                <motion.div
                  key={plat}
                  data-cursor={plat === "threads" ? undefined : `account-${plat}`}
                  animate={{ scale: isPressing ? 0.86 : 1 }}
                  transition={{ duration: 0.15 }}
                  className="relative cursor-pointer"
                >
                  <div
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
                      isSelected ? "border-primary/40 bg-primary/10" : "border-border/60 bg-muted/40 opacity-40 grayscale"
                    )}
                  >
                    <PlatformIcon platform={plat} size={15} />
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs"
                      >
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Multi-Platform Tab Bar */}
          <div className="flex items-center gap-1 rounded-md border border-border bg-muted p-1 text-[10px] font-semibold text-muted-foreground">
            <span className="rounded bg-background px-2 py-0.5 text-foreground shadow-2xs">Base</span>
            {selectedChannels.map((p) => (
              <span key={p} className="flex items-center gap-0.5 px-1.5 py-0.5">
                <PlatformIcon platform={p} size={10} />
              </span>
            ))}
          </div>

          {/* Post Thread Preview Slides */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <div className="rounded-lg border border-border bg-background/60 p-2.5 text-xs space-y-1">
              <span className="text-[10px] font-bold text-primary">Slide 1 • Hook</span>
              <p className="whitespace-pre-line text-foreground/90 font-medium">
                The algorithm changed again.{"\n"}Consistency wins.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-2.5 text-xs space-y-1">
              <span className="text-[10px] font-bold text-primary">Slide 2 • Body</span>
              <p className="whitespace-pre-line text-foreground/90 font-medium">
                Posting 3+ times a week grew followers 2.4x faster across 1,200 accounts.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-2.5 text-xs space-y-1">
              <span className="text-[10px] font-bold text-primary">Slide 3 • Call To Action</span>
              <p className="whitespace-pre-line text-foreground/90 font-medium">
                Same time slot, one topic, go deep.{"\n"}→ Start free, link in bio.
              </p>
            </div>
          </div>
        </motion.div>

        <DemoCursor
          beat={beat}
          targets={targets}
          clickBeats={[2, 5, 7, 9, 11, 13, 15, 17, 19]}
          visibleRange={[1, 19]}
        />
      </div>
    </motion.div>
  );
}

// ==========================================
// SCENE 4: SCHEDULE (CALENDAR)
// ==========================================
function SceneSchedule({ active }: { active: boolean }) {
  const beats = useMemo(
    () => [600, 550, 550, 500, 480, 480, 450, 500, 550, 550, 500, 500, 480, 600, 650, 700, 1000, 500, 900, 500, 1300],
    []
  );
  const beat = useSceneBeat(active, beats);

  const targets: Record<number, string> = {
    2: "datetime-btn",
    4: "date-17",
    6: "pm-btn",
    8: "hour-2",
    10: "tz-select",
    12: "tz-option-seoul",
    14: "schedule-confirm-btn",
    16: "day-17",
    18: "day-22",
  };

  const dialogVisible = beat >= 1 && beat <= 15;
  const popoverOpen = beat >= 3 && beat <= 9;
  const dateSelected = beat >= 5;
  const pmSelected = beat >= 7;
  const timeSelected = beat >= 9;
  const tzOpen = beat >= 11 && beat <= 13;
  const tzSelected = beat >= 13;
  const confirmPressing = beat === 15;

  const isDragging = beat === 17 || beat === 18;
  const scheduledDay = beat >= 18 ? 22 : 17;
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className={cn("absolute inset-0 flex h-full w-full overflow-hidden", !active && "pointer-events-none")}
    >
      <div className="hidden md:flex">
        <DemoSidebar activeItem="calendar" />
      </div>

      <div className="relative min-w-0 flex-1 flex flex-col gap-3 p-4 md:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" strokeWidth={1.75} />
            <span className="text-lg font-bold text-foreground">Calendar</span>
            <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              May 2028
            </span>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
            ● Scheduled to 7 platforms
          </span>
        </div>

        {/* Month Grid */}
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-background shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] font-semibold text-muted-foreground py-1.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-5 flex-1 divide-x divide-y divide-border text-[11px]">
            {daysInMonth.map((day) => {
              const isTarget = day === scheduledDay;
              const cursorId = day === 17 ? "day-17" : day === 22 ? "day-22" : undefined;
              return (
                <div
                  key={day}
                  data-cursor={cursorId}
                  className={cn(
                    "p-1.5 flex flex-col justify-between transition-colors relative",
                    isTarget && "bg-primary/5"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className={cn("font-semibold text-[10px]", day === scheduledDay ? "text-primary font-bold" : "text-muted-foreground")}>
                      {day}
                    </span>
                    {day === 12 && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                  </div>

                  {isTarget && (
                    <motion.div
                      layoutId="schedule-pill"
                      className={cn(
                        "rounded-md border border-emerald-500/30 p-1 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 transition-all",
                        isDragging ? "bg-emerald-500/30 shadow-lg scale-105 z-20 ring-2 ring-emerald-500/50" : "bg-emerald-500/10"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">14:00</span>
                        <div className="flex items-center gap-0.5">
                          <PlatformIcon platform="threads" size={9} />
                          <PlatformIcon platform="x" size={9} />
                          <PlatformIcon platform="linkedin" size={9} />
                        </div>
                      </div>
                      <div className="truncate text-[8px] text-foreground/80">Consistency wins...</div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Dialog Overlay with Nested Mini Calendar Popover */}
        <AnimatePresence>
          {dialogVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-2xl space-y-3 relative"
              >
                <div className="text-xs font-bold text-foreground">Schedule Multi-Platform Post</div>

                {/* Date Input with Popover */}
                <div className="relative space-y-1">
                  <span className="text-[10px] text-muted-foreground">Date</span>
                  <div
                    data-cursor="datetime-btn"
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium flex justify-between items-center cursor-pointer"
                  >
                    <span>{dateSelected ? "May 17, 2028" : "Select date"}</span>
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* Popover Calendar Grid */}
                  {popoverOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 top-full z-40 mt-1 w-full rounded-md border border-border bg-popover p-2 shadow-xl"
                    >
                      <div className="text-[10px] font-bold text-foreground text-center mb-1">May 2028</div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                        {[15, 16, 17, 18, 19, 20, 21].map((d) => (
                          <div
                            key={d}
                            data-cursor={d === 17 ? "date-17" : undefined}
                            className={cn(
                              "rounded py-1 font-semibold cursor-pointer",
                              d === 17 ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-muted text-foreground/80"
                            )}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Time & Timezone with Popover */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Time</span>
                    <div className="flex gap-1">
                      <div
                        data-cursor="hour-2"
                        className={cn(
                          "flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-center font-bold",
                          timeSelected && "ring-1 ring-primary/40 text-primary"
                        )}
                      >
                        02:00
                      </div>
                      <div
                        data-cursor="pm-btn"
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-bold cursor-pointer transition-colors",
                          pmSelected ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground"
                        )}
                      >
                        PM
                      </div>
                    </div>
                  </div>

                  <div className="relative space-y-1">
                    <span className="text-[10px] text-muted-foreground">Timezone</span>
                    <div
                      data-cursor="tz-select"
                      className="rounded-md border border-border bg-background px-2 py-1 text-[11px] flex justify-between items-center cursor-pointer"
                    >
                      <span>{tzSelected ? "GMT+9 (Seoul)" : "Select timezone"}</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </div>

                    {tzOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-full z-40 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-xl text-[10px]"
                      >
                        <div
                          data-cursor="tz-option-seoul"
                          className="rounded px-2 py-1 bg-primary/10 text-foreground font-semibold cursor-pointer"
                        >
                          GMT+9 (Seoul)
                        </div>
                        <div className="rounded px-2 py-1 text-muted-foreground">UTC (GMT+0)</div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <motion.div
                  data-cursor="schedule-confirm-btn"
                  animate={{ scale: confirmPressing ? 0.96 : 1 }}
                  className="mt-3 flex items-center justify-center rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
                >
                  Confirm Schedule
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <DemoCursor
          beat={beat}
          targets={targets}
          clickBeats={[3, 5, 7, 9, 11, 13, 15, 17, 19]}
          visibleRange={[1, 19]}
        />
      </div>
    </motion.div>
  );
}

// ==========================================
// SCENE 5: ANALYTICS (PERFORMANCE LOOP)
// ==========================================
function SceneAnalyze({ active }: { active: boolean }) {
  const beats = useMemo(
    () => [500, 550, 650, 550, 700, 1000, 1000, 900, 700, 600, 1000, 1000, 700, 600, 600, 550, 550, 600, 1000, 1300],
    []
  );
  const beat = useSceneBeat(active, beats);

  const targets: Record<number, string> = {
    1: "period-select",
    3: "period-14d",
    9: "tab-profile",
    13: "tab-posts",
    15: "download-btn",
    17: "download-csv",
  };

  const subTab = beat >= 14 ? "posts" : beat >= 10 ? "profile" : "ai";
  const periodOpen = beat >= 2 && beat <= 4;
  const periodSelected = beat >= 4;
  const downloadOpen = beat >= 16 && beat <= 18;
  const downloadToast = beat >= 18;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      className={cn("absolute inset-0 flex h-full w-full overflow-hidden", !active && "pointer-events-none")}
    >
      <div className="hidden md:flex">
        <DemoSidebar activeItem="analytics" />
      </div>

      <div className="relative min-w-0 flex-1 flex flex-col gap-3 p-4 md:p-6 overflow-hidden">
        {/* Toast */}
        <AnimatePresence>
          {downloadToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-6 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-xl"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </span>
              <span>CSV file downloaded</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" strokeWidth={1.75} />
            <span className="text-lg font-bold text-foreground">Analytics</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Date Filter Dropdown with Active Options */}
            <div className="relative">
              <div
                data-cursor="period-select"
                className={cn(
                  "flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground cursor-pointer transition-colors",
                  periodOpen && "border-primary ring-2 ring-primary/20"
                )}
              >
                <span>{periodSelected ? "Last 14 days" : "Last 30 days"}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
              {periodOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full z-40 mt-1 w-32 rounded-md border border-border bg-popover p-1 shadow-xl text-xs"
                >
                  <div
                    data-cursor="period-14d"
                    className="rounded px-2 py-1 bg-primary/10 text-foreground font-semibold cursor-pointer"
                  >
                    Last 14 days
                  </div>
                  <div className="rounded px-2 py-1 text-muted-foreground">Last 30 days</div>
                </motion.div>
              )}
            </div>

            {/* Sub-tab Switcher */}
            <div className="flex items-center rounded-lg border border-border bg-muted p-1">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all",
                  subTab === "ai" ? "bg-background text-foreground shadow-xs border border-border/80" : "text-muted-foreground"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>AI</span>
              </div>
              <div
                data-cursor="tab-profile"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                  subTab === "profile" ? "bg-background text-foreground shadow-xs border border-border/80" : "text-muted-foreground"
                )}
              >
                <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                <span>Profile</span>
              </div>
              <div
                data-cursor="tab-posts"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                  subTab === "posts" ? "bg-background text-foreground shadow-xs border border-border/80" : "text-muted-foreground"
                )}
              >
                <FileText className="h-3.5 w-3.5 text-amber-500" />
                <span>Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {subTab === "ai" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Best hours by views</span>
                    <span className="text-[10px] text-muted-foreground">Apr 18 ~ May 17</span>
                  </div>
                  <div className="relative h-20 flex items-end gap-1.5 pt-4">
                    {[25, 50, 18, 28, 75, 100, 40, 22].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className={cn("w-full rounded-sm", h > 60 ? "bg-primary" : "bg-muted-foreground/30")}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    {["12 AM", "8 AM", "10 AM", "3 PM", "5 PM", "7 PM", "9 PM", "11 PM"].map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Best days by views</span>
                    <span className="text-[10px] text-muted-foreground">Apr 18 ~ May 17</span>
                  </div>
                  <div className="relative h-20 flex items-end gap-1.5 pt-4">
                    {[90, 70, 72, 35, 100, 72, 60].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className={cn("w-full rounded-sm", h > 80 ? "bg-primary" : "bg-muted-foreground/30")}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {subTab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: "Followers", value: "821", delta: "+55%", dir: "up" },
                  { label: "Views", value: "29,721", delta: "-46%", dir: "down" },
                  { label: "Likes", value: "219", delta: "-62%", dir: "down" },
                  { label: "Comments", value: "37", delta: "-46%", dir: "down" },
                  { label: "Reposts", value: "87", delta: "-58%", dir: "down" },
                  { label: "Quotes", value: "6", delta: "0.0%", dir: "flat" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg border border-border bg-background p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground">
                      <span>{kpi.label}</span>
                      <span className={kpi.dir === "up" ? "text-emerald-500" : "text-rose-500"}>
                        {kpi.delta}
                      </span>
                    </div>
                    <div className="text-base font-bold text-foreground">{kpi.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab === "posts" && (
            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Post Performance Overview</span>
                <div className="relative">
                  <div
                    data-cursor="download-btn"
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </div>
                  {downloadOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full z-40 mt-1 w-32 rounded-md border border-border bg-popover p-1 shadow-xl text-xs"
                    >
                      <div
                        data-cursor="download-csv"
                        className="rounded px-2 py-1 bg-primary/10 text-foreground font-semibold cursor-pointer"
                      >
                        Download CSV
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="divide-y divide-border/60 text-xs">
                <div className="grid grid-cols-12 py-2 text-muted-foreground font-semibold text-[10px]">
                  <span className="col-span-6">Post Content</span>
                  <span className="col-span-2 text-right">Views</span>
                  <span className="col-span-2 text-right">Likes</span>
                  <span className="col-span-2 text-right">Shares</span>
                </div>
                <div className="grid grid-cols-12 py-2 items-center text-foreground font-medium">
                  <span className="col-span-6 truncate">The algorithm changed again. Consistency wins.</span>
                  <span className="col-span-2 text-right">14,280</span>
                  <span className="col-span-2 text-right text-emerald-500">842</span>
                  <span className="col-span-2 text-right">312</span>
                </div>
                <div className="grid grid-cols-12 py-2 items-center text-foreground font-medium">
                  <span className="col-span-6 truncate">12 short-form hook patterns that stop the scroll</span>
                  <span className="col-span-2 text-right">9,410</span>
                  <span className="col-span-2 text-right text-emerald-500">620</span>
                  <span className="col-span-2 text-right">184</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DemoCursor
          beat={beat}
          targets={targets}
          clickBeats={[2, 4, 10, 14, 16, 18]}
          visibleRange={[1, 18]}
        />
      </div>
    </motion.div>
  );
}
