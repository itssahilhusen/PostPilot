"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Rss, 
  Filter, 
  Pencil, 
  Send, 
  CheckSquare, 
  Link2, 
  FileText, 
  Trophy,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Upstream diagram constants
const RAIL = 200;
const RAIL_I = 198;
const LOOP = 12;
const SPEED = 70;
const CYCLE = 6;
const GRID_WIDTH = 1008;

const LINE = "bg-muted-foreground/40";
const DASH = "border-dashed border-muted-foreground/50";
const EDGE_LABEL = "whitespace-nowrap text-[10px] font-medium text-muted-foreground";

const MEDAL_CLASS = ["bg-yellow-400", "bg-slate-300", "bg-amber-700"];
const MEDAL_KIND = ["gold", "silver", "bronze"] as const;

const CHIP_VARIANT = {
  ai: "border-violet-400 bg-violet-100 text-violet-950 dark:border-violet-500 dark:bg-violet-950 dark:text-violet-100",
  user: "border-foreground/50 bg-card text-card-foreground",
  link: "border-dashed border-sky-400 bg-sky-50 text-sky-950 dark:border-sky-500 dark:bg-sky-950 dark:text-sky-100",
};

const STAGES = [
  { key: "collector", label: "Collector", desc: "Auto-collects content ideas", Icon: Rss },
  { key: "picker", label: "Picker", desc: "Adds or picks content ideas", Icon: Filter },
  { key: "creator", label: "Creator", desc: "Content in your brand voice", Icon: Pencil },
  { key: "scheduler", label: "Scheduler", desc: "Multi-platform scheduling", Icon: Send },
  { key: "reviewer", label: "Reviewer", desc: "Turns results into next ideas", Icon: CheckSquare },
];

function Chevron({ dir }: { dir: "right" | "up" }) {
  return (
    <span
      className={cn(
        "block size-0 shrink-0",
        dir === "right" && "border-y-[4px] border-l-[6px] border-y-transparent border-l-muted-foreground/70",
        dir === "up" && "border-x-[4px] border-b-[6px] border-x-transparent border-b-muted-foreground/70"
      )}
    />
  );
}

function InnerChip({
  label,
  icon,
  variant = "user",
  className,
  style,
}: {
  label: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "ai" | "user" | "link";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-variant={variant}
      style={style}
      className={cn(
        "z-20 flex items-center overflow-hidden rounded-lg border font-semibold text-[10px] justify-center select-none shadow-sm",
        CHIP_VARIANT[variant],
        className
      )}
    >
      <span className="relative flex items-center gap-1">
        {icon}
        <span className="flex flex-col leading-tight items-center">
          <span className="whitespace-pre-line text-center">{label}</span>
        </span>
      </span>
    </div>
  );
}

const SHAPE_CLASSES = {
  rawDot: "size-1.5 rounded-full bg-muted-foreground",
  square: "size-1.5 bg-muted-foreground",
  triangle: "size-0 border-x-[4px] border-t-[7px] border-x-transparent border-t-muted-foreground",
  gold: "size-1.5 bg-yellow-400 rounded-full",
  silver: "size-1.5 bg-slate-300 rounded-full",
  bronze: "size-1.5 bg-amber-700 rounded-full",
};

function Journey({
  kind,
  points,
  delay,
  period = 6,
}: {
  kind: "rawDot" | "square" | "triangle" | "gold" | "silver" | "bronze";
  points: number[][];
  delay: number;
  period?: number;
}) {
  const s = [0];
  for (let e = 1; e < points.length; e++) {
    s.push(s[e - 1] + Math.hypot(points[e][0] - points[e - 1][0], points[e][1] - points[e - 1][1]));
  }
  const totalLength = s[s.length - 1];
  const dur = totalLength / SPEED;
  const c = {
    duration: dur,
    delay: delay,
    repeat: Infinity,
    repeatDelay: Math.max(0, period - dur),
    ease: "linear" as const,
  };

  return (
    <motion.span
      data-testid="flow-shape"
      aria-hidden="true"
      className={cn("absolute -translate-x-1/2 -translate-y-1/2", SHAPE_CLASSES[kind])}
      initial={{ opacity: 0 }}
      animate={{
        left: points.map((p) => p[0]),
        top: points.map((p) => p[1]),
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        ...c,
        times: s.map((d) => d / totalLength),
        opacity: { ...c, times: [0, 0.03, 0.97, 1] },
      }}
    />
  );
}

function polylineLength(points: number[][]) {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return length;
}

// Stage 1: Collector
const SOURCES = [
  { key: "instagram", name: "Instagram", nameW: 48, icon: "/images/platforms/instagram.svg" },
  { key: "tiktok", name: "TikTok", nameW: 34, icon: "/images/platforms/tiktok-light.svg" },
  { key: "youtube", name: "YouTube", nameW: 44, icon: "/images/platforms/youtube.svg" },
  { key: "x", name: "X", nameW: 10, icon: "/images/platforms/x-light.svg" },
  { key: "linkedin", name: "LinkedIn", nameW: 44, icon: "/images/platforms/linkedin.svg" },
  { key: "threads", name: "Threads", nameW: 40, icon: "/images/platforms/threads.svg" },
  { 
    key: "rss", 
    name: "RSS", 
    nameW: 22, 
    customSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-orange-500">
        <path d="M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        <path d="M4 4a16 16 0 0 1 16 16"></path>
        <path d="M4 11a9 9 0 0 1 9 9"></path>
      </svg>
    ) 
  },
  { 
    key: "telegram", 
    name: "Telegram", 
    nameW: 46, 
    customSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-[#26A5E4]">
        <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4"></path>
      </svg>
    ) 
  },
  { 
    key: "reddit", 
    name: "Reddit", 
    nameW: 32, 
    customSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-[#FF4500]">
        <path d="M12 8c2.648 0 5.028 .826 6.675 2.14a2.5 2.5 0 0 1 2.326 4.36c0 3.59 -4.03 6.5 -9 6.5c-4.875 0 -8.845 -2.8 -9 -6.294l-1 -.206a2.5 2.5 0 0 1 2.326 -4.36c1.646 -1.313 4.026 -2.14 6.674 -2.14z"></path>
        <path d="M12 8l1 -5l6 1"></path>
        <path d="M19 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        <circle cx="9" cy="13" r=".5" fill="currentColor"></circle>
        <circle cx="15" cy="13" r=".5" fill="currentColor"></circle>
        <path d="M10 17c.667 .333 1.333 .5 2 .5s1.333 -.167 2 -.5"></path>
      </svg>
    ) 
  },
  { 
    key: "github", 
    name: "GitHub", 
    nameW: 36, 
    customSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-foreground">
        <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path>
      </svg>
    ) 
  },
];

const SOURCE_Y = SOURCES.map((_, i) => 36 + 36 * i);

function CollectorStage() {
  return (
    <>
      <ul data-testid="source-icon-stack" className="absolute inset-y-0 left-2 flex flex-col justify-center gap-2">
        {SOURCES.map((source, i) => (
          <li key={source.key} className="flex h-7 items-center gap-1">
            <span className="flex w-7 shrink-0 justify-center">
              {source.customSvg ? (
                source.customSvg
              ) : (
                <Image
                  src={source.icon}
                  alt={source.name}
                  width={24}
                  height={24}
                  className={cn("size-6", source.key === "threads" && "dark:invert")}
                />
              )}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground">{source.name}</span>
          </li>
        ))}
      </ul>
      <svg aria-hidden="true" viewBox="0 0 172 396" className="absolute left-0 top-0 h-full w-[172px]">
        {SOURCES.map((source, i) => {
          const a = 45 + source.nameW;
          const n = SOURCE_Y[i];
          const d = `M ${a} ${n} C ${a + 0.45 * (172 - a)} ${n}, ${a + 0.55 * (172 - a)} ${RAIL_I}, 172 ${RAIL_I}`;
          return (
            <path
              key={source.key}
              d={d}
              fill="none"
              strokeWidth={1.5}
              className="stroke-muted-foreground/40"
            />
          );
        })}
      </svg>
    </>
  );
}

// Stage 2: Picker
const PICKER_CHOICE_Y = [165, 231];
const PICKER_INPUTS = [
  { key: "write", label: "Write", y: 30, Icon: Pencil },
  { key: "link", label: "Paste a link", y: 64, Icon: Link2 },
  { key: "file", label: "Upload files", y: 98, Icon: FileText },
  { 
    key: "spy", 
    label: "Spy", 
    y: 299, 
    variant: "ai" as const,
    customIcon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-muted-foreground">
        <path d="M3 11h18"></path>
        <path d="M5 11v-4a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v4"></path>
        <path d="M7 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
        <path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
        <path d="M10 17h4"></path>
      </svg>
    )
  },
];
const PICKER_RIGHT_TAPS = [...PICKER_CHOICE_Y, 30, 64, 98, 299, 344];

function PickerStage() {
  return (
    <>
      <span aria-hidden="true" className={cn("absolute left-0 h-px w-[17px] -translate-y-1/2", LINE)} style={{ top: RAIL_I }} />
      <span aria-hidden="true" className={cn("absolute left-[17px] top-[165px] h-[66px] w-px -translate-x-1/2", LINE)} />
      {PICKER_CHOICE_Y.map((y) => (
        <span key={y} aria-hidden="true" className={cn("absolute left-[17px] h-px w-[21px] -translate-y-1/2", LINE)} style={{ top: y }} />
      ))}
      <span aria-hidden="true" className={cn("absolute left-[155px] top-[30px] h-[314px] w-px -translate-x-1/2", LINE)} />
      {PICKER_RIGHT_TAPS.map((y) => (
        <span key={y} aria-hidden="true" className={cn("absolute left-[134px] h-px w-[21px] -translate-y-1/2", LINE)} style={{ top: y }} />
      ))}
      <span aria-hidden="true" className={cn("absolute left-[155px] h-px w-[17px] -translate-y-1/2", LINE)} style={{ top: RAIL_I }} />

      {PICKER_INPUTS.map((item) => (
        <span key={item.key}>
          <span className="absolute left-[24px] -translate-y-1/2 text-muted-foreground" style={{ top: item.y }}>
            {item.customIcon ? item.customIcon : item.Icon && <item.Icon className="size-3.5" />}
          </span>
          <span aria-hidden="true" className={cn("absolute left-[38px] h-px w-[20px] -translate-y-1/2", LINE)} style={{ top: item.y }} />
          <InnerChip
            label={item.label}
            variant={item.variant || "user"}
            className="absolute left-[58px] h-7 w-[76px] px-1"
            style={{ top: item.y - 14 }}
          />
        </span>
      ))}

      <InnerChip label="You pick" variant="user" className="absolute left-[38px] h-11 w-24" style={{ top: PICKER_CHOICE_Y[0] - 22 }} />
      <InnerChip label="AI picks" variant="ai" className="absolute left-[38px] h-11 w-24" style={{ top: PICKER_CHOICE_Y[1] - 22 }} />
      <InnerChip label="Repurpose" variant="user" className="absolute left-[38px] h-7 w-24 px-1" style={{ top: 330 }} />
      <span aria-hidden="true" className={cn("absolute left-[86px] top-[358px] h-[38px] -translate-x-1/2 border-l", DASH)} />
    </>
  );
}

// Stage 3: Creator
const CREATOR_FORMATS = [
  { key: "text", label: "Text", dx: -45, w: 36 },
  { key: "carousel", label: "Carousel", dx: 0, w: 46 },
  { key: "video", label: "Video", dx: 45, w: 36 },
];

const AI_MODELS = [
  {
    key: "chatgpt",
    label: "ChatGPT",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3 shrink-0">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
      </svg>
    ),
  },
  {
    key: "claude",
    label: "Claude",
    icon: (
      <svg viewBox="0 0 24 24" fill="#D97757" aria-hidden="true" className="size-3 shrink-0">
        <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
      </svg>
    ),
  },
  {
    key: "gemini",
    label: "Gemini",
    icon: (
      <svg viewBox="0 0 24 24" fill="#4285F4" aria-hidden="true" className="size-3 shrink-0">
        <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
      </svg>
    ),
  },
  {
    key: "hermes",
    label: "Hermes",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true" className="size-3 shrink-0">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    key: "grok",
    label: "GrokBot",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3 shrink-0">
        <path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815" />
      </svg>
    ),
  },
];

function CreatorStage() {
  return (
    <>
      <span aria-hidden="true" className={cn("absolute left-0 h-px w-[17px] -translate-y-1/2", LINE)} style={{ top: RAIL_I }} />
      <span aria-hidden="true" className={cn("absolute left-[17px] top-[30px] w-px -translate-x-1/2", LINE)} style={{ height: RAIL_I - 30 }} />
      <span aria-hidden="true" className={cn("absolute left-[17px] top-[30px] h-px w-[15px] -translate-y-1/2", LINE)} />
      <span className="absolute left-[32px] top-[30px] -translate-y-1/2">
        <Chevron dir="right" />
      </span>

      <span aria-hidden="true" className={cn("absolute left-[86px] top-[44px] h-[24px] w-px -translate-x-1/2", LINE)} />
      <span aria-hidden="true" className={cn("absolute left-[86px] top-[96px] h-[24px] w-px -translate-x-1/2", LINE)} />
      <span aria-hidden="true" className={cn("absolute left-[86px] top-[148px] h-[28px] w-px -translate-x-1/2", LINE)} />
      <span aria-hidden="true" className={cn("absolute left-[41px] top-[108px] h-px w-[90px] -translate-y-1/2", LINE)} />
      <span aria-hidden="true" className={cn("absolute left-[41px] top-[162px] h-px w-[90px] -translate-y-1/2", LINE)} />

      {[41, 131].map((x) => (
        <span key={x} aria-hidden="true">
          <span className={cn("absolute top-[108px] h-[12px] w-px -translate-x-1/2", LINE)} style={{ left: x }} />
          <span className={cn("absolute top-[148px] h-[14px] w-px -translate-x-1/2", LINE)} style={{ left: x }} />
        </span>
      ))}

      <span aria-hidden="true" className={cn("absolute left-[134px] h-px w-[38px] -translate-y-1/2", LINE)} style={{ top: RAIL_I }} />
      <span aria-hidden="true" className={cn("absolute left-[86px] top-[272px] h-[24px] w-px -translate-x-1/2", LINE)} />
      <span aria-hidden="true" className={cn("absolute left-[134px] top-[258px] h-px w-[38px] -translate-y-1/2", LINE)} />

      <InnerChip label="Brand voice" variant="ai" className="absolute left-[38px] h-7 w-24 px-1" style={{ top: 16 }} />
      <InnerChip label="Create content" variant="ai" className="absolute left-[38px] h-7 w-24 px-1" style={{ top: 68 }} />

      {CREATOR_FORMATS.map((fmt) => (
        <InnerChip
          key={fmt.key}
          label={fmt.label}
          variant="ai"
          className="absolute h-7 px-0 text-[9px]"
          style={{ top: 120, left: 86 + fmt.dx - fmt.w / 2, width: fmt.w }}
        />
      ))}

      <InnerChip label={"You review\n(or not)"} variant="user" className="absolute left-[38px] h-11 w-24" style={{ top: 176 }} />
      <InnerChip label="API & MCP" variant="link" className="absolute left-[38px] h-7 w-24 px-1" style={{ top: 244 }} />
    </>
  );
}

// Stage 4: Scheduler
const SCHEDULER_PLATFORMS = [
  { id: "instagram", icon: "/images/platforms/instagram.svg" },
  { id: "tiktok", icon: "/images/platforms/tiktok-light.svg" },
  { id: "youtube", icon: "/images/platforms/youtube.svg" },
  { id: "x", icon: "/images/platforms/x-light.svg" },
  { id: "linkedin", icon: "/images/platforms/linkedin.svg" },
  { id: "threads", icon: "/images/platforms/threads.svg" },
  { id: "facebook", icon: "/images/platforms/facebook.svg" },
  { 
    id: "rss", 
    customSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-orange-500">
        <path d="M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        <path d="M4 4a16 16 0 0 1 16 16"></path>
        <path d="M4 11a9 9 0 0 1 9 9"></path>
      </svg>
    ) 
  },
];

const SCHEDULER_Y = SCHEDULER_PLATFORMS.map((_, i) => 72 + 36 * i);
const pathOut = (y: number) => `M 0 ${RAIL_I} C 55 ${RAIL_I}, 45 ${y}, 100 ${y}`;
const pathIn = (y: number) => `M 0 ${y} C 45 ${y}, 55 ${RAIL_I}, 100 ${RAIL_I}`;

function SchedulerStage() {
  return (
    <>
      {/* Diverging Bezier Curves */}
      <svg aria-hidden="true" viewBox="0 0 100 396" preserveAspectRatio="none" className="absolute left-0 top-0 h-full w-[70px]">
        {SCHEDULER_Y.map((y) => (
          <path
            key={`out-${y}`}
            d={pathOut(y)}
            fill="none"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            className="stroke-muted-foreground/40"
          />
        ))}
        {SCHEDULER_Y.map((y) => (
          <path
            key={`dot-out-${y}`}
            d="M 0 0 L 0.001 0"
            strokeWidth={6}
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
            fill="none"
            className="stroke-muted-foreground"
          >
            <animateMotion dur="2.4s" repeatCount="indefinite" path={pathOut(y)} />
          </path>
        ))}
      </svg>

      {/* Platform Icons Stack */}
      <ul data-testid="platform-logo-stack" className="absolute left-[70px] top-[58px] flex w-7 flex-col items-center gap-2">
        {SCHEDULER_PLATFORMS.map((plat) => (
          <li key={plat.id} className="flex h-7 w-full items-center justify-center">
            {plat.customSvg ? (
              plat.customSvg
            ) : (
              <Image
                src={plat.icon}
                alt={plat.id}
                width={24}
                height={24}
                className={cn("size-6", plat.id === "threads" && "dark:invert")}
              />
            )}
          </li>
        ))}
      </ul>

      {/* Converging Bezier Curves */}
      <svg aria-hidden="true" viewBox="0 0 100 396" preserveAspectRatio="none" className="absolute left-[98px] top-0 h-full w-[74px]">
        {SCHEDULER_Y.map((y) => (
          <path
            key={`in-${y}`}
            d={pathIn(y)}
            fill="none"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            className="stroke-muted-foreground/40"
          />
        ))}
        {SCHEDULER_Y.map((y) => (
          <path
            key={`dot-in-${y}`}
            d="M 0 0 L 0.001 0"
            strokeWidth={6}
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
            fill="none"
            className="stroke-muted-foreground"
          >
            <animateMotion dur="2.4s" begin="-2.1s" repeatCount="indefinite" path={pathIn(y)} />
          </path>
        ))}
      </svg>
    </>
  );
}

// Stage 5: Reviewer
const REVIEWER_Y = [62, 96, 130, 164, 198];
const REVIEWER_WIDTHS = [40, 71, 24, 56, 82];
const REVIEWER_RANKS = [3, 1, 4, 2, 0];
const REVIEWER_DELAYS = REVIEWER_Y.map((_, i) => 0.3 + 0.8 * i);
const MEDAL_OUT_TIMES = [6.6, 6.9, 7.2];

function makeLoopTimeline(
  keyframes: Record<string, [number, number | string][]>,
  ease: string = "linear"
) {
  const animate: Record<string, (number | string)[]> = {};
  const transition: Record<string, any> = {};
  for (const [prop, pts] of Object.entries(keyframes)) {
    animate[prop] = [pts[0][1], ...pts.map(([, val]) => val), pts[pts.length - 1][1]];
    transition[prop] = {
      duration: LOOP,
      repeat: Infinity,
      ease,
      times: [0, ...pts.map(([t]) => t / LOOP), 1],
    };
  }
  return { animate, transition };
}

function ReviewerRow({ i }: { i: number }) {
  const rank = REVIEWER_RANKS[i];
  const maxW = REVIEWER_WIDTHS[i];
  const hasMedal = rank < 3;
  const medalClass = hasMedal ? MEDAL_CLASS[rank] : null;
  const medalOut = hasMedal ? MEDAL_OUT_TIMES[rank] : null;

  const barTime = REVIEWER_DELAYS[i];

  return (
    <>
      {medalClass && medalOut !== null ? (
        <>
          <motion.span
            className="absolute left-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-muted-foreground"
            {...makeLoopTimeline({
              opacity: [
                [medalOut, 1],
                [medalOut + 0.15, 0],
                [11.6, 0],
                [11.9, 1],
              ],
            })}
          />
          <motion.span
            className={cn("absolute left-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full", medalClass)}
            initial={{ opacity: 0 }}
            {...makeLoopTimeline({
              opacity: [
                [6, 0],
                [6.3, 1],
                [medalOut, 1],
                [medalOut + 0.15, 0],
              ],
            })}
          />
        </>
      ) : (
        <span className="absolute left-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-muted-foreground" />
      )}

      {/* Progress fill bar */}
      <motion.span
        className="absolute left-5 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary/40"
        {...makeLoopTimeline({
          width: [
            [barTime + 0.2, 0],
            [barTime + 0.9, maxW],
            [11.6, maxW],
            [11.9, 0],
          ],
        })}
      />
    </>
  );
}

function ReviewerStage() {
  return (
    <>
      <span aria-hidden="true" className={cn("absolute left-0 h-px w-[30px] -translate-y-1/2", LINE)} style={{ top: RAIL_I }} />
      <span aria-hidden="true" className={cn("absolute left-[17px] w-px -translate-x-1/2", LINE)} style={{ top: REVIEWER_Y[0], height: RAIL_I - REVIEWER_Y[0] }} />
      {REVIEWER_Y.slice(0, -1).map((y) => (
        <span key={y} aria-hidden="true" className={cn("absolute left-[17px] h-px w-[13px] -translate-y-1/2", LINE)} style={{ top: y }} />
      ))}
      <span aria-hidden="true" className={cn("absolute left-[155px] w-px -translate-x-1/2", LINE)} style={{ top: REVIEWER_Y[0], height: 344 - REVIEWER_Y[0] }} />
      {REVIEWER_Y.map((y) => (
        <span key={y} aria-hidden="true" className={cn("absolute left-[142px] h-px w-[13px] -translate-y-1/2", LINE)} style={{ top: y }} />
      ))}
      <span aria-hidden="true" className={cn("absolute left-[138px] h-px w-[17px] -translate-y-1/2", LINE)} style={{ top: 344 }} />
      <span aria-hidden="true" className={cn("absolute left-[86px] -translate-x-1/2 border-l", DASH)} style={{ top: 366, height: 30 }} />

      {REVIEWER_Y.map((y, idx) => {
        const origTop = REVIEWER_Y[idx] - 12;
        const sortedTop = REVIEWER_Y[REVIEWER_RANKS[idx]] - 12;
        const opacityTl = makeLoopTimeline({
          opacity: [
            [REVIEWER_DELAYS[idx], 0],
            [REVIEWER_DELAYS[idx] + 0.2, 1],
            [11.3, 1],
            [11.6, 0],
          ],
        });
        const posTl = makeLoopTimeline(
          {
            top: [
              [4.8, origTop],
              [5.6, sortedTop],
              [11.6, sortedTop],
              [11.9, origTop],
            ],
          },
          "easeInOut"
        );

        return (
          <motion.div
            key={idx}
            data-testid="reviewer-row"
            className="absolute left-[30px] z-20 h-6 w-[112px] rounded-md border bg-card shadow-sm"
            style={{ top: origTop }}
            initial={{ opacity: 0 }}
            animate={{ ...opacityTl.animate, ...posTl.animate }}
            transition={{ ...opacityTl.transition, ...posTl.transition }}
          >
            <ReviewerRow i={idx} />
          </motion.div>
        );
      })}

      <motion.div
        className="absolute left-[34px]"
        style={{ top: 226 }}
        initial={{ opacity: 0 }}
        {...makeLoopTimeline({
          opacity: [
            [5.8, 0],
            [5.95, 1],
            [6.1, 0.2],
            [6.25, 1],
            [6.4, 0.2],
            [6.55, 1],
            [11.3, 1],
            [11.6, 0],
          ],
        })}
      >
        <InnerChip label="Performance report" variant="ai" className="h-7 w-[104px] px-1" />
      </motion.div>

      <motion.div
        className="absolute left-[34px]"
        style={{ top: 266 }}
        initial={{ opacity: 0 }}
        {...makeLoopTimeline({
          opacity: [
            [5.8, 0],
            [5.95, 1],
            [6.1, 0.2],
            [6.25, 1],
            [6.4, 0.2],
            [6.55, 1],
            [11.3, 1],
            [11.6, 0],
          ],
        })}
      >
        <InnerChip label="CSV export" variant="user" className="h-7 w-[104px] px-1" />
      </motion.div>

      <InnerChip
        label="Repurpose"
        icon={<Trophy className="size-3 shrink-0" />}
        variant="user"
        className="absolute left-[34px] h-11 w-[104px] px-1"
        style={{ top: 322 }}
      />
    </>
  );
}

// Particle Journeys & Paths
const ee = [[435, 200], [435, 32], [504, 32]];
const et = {
  user: {
    die: [[210, 200], [227, 200], [227, 167], [248, 167], [296, 167]],
    live: [[210, 200], [227, 200], [227, 167], [248, 167], [344, 167], [365, 167], [365, 200], [382, 200], ...ee],
  },
  ai: {
    die: [[210, 200], [227, 200], [227, 233], [248, 233], [296, 233]],
    live: [[210, 200], [227, 200], [227, 233], [248, 233], [344, 233], [365, 233], [365, 200], [382, 200], ...ee],
  },
};

const es = [
  { cross: 0, branch: "user" as const, live: true },
  { cross: 1, branch: "ai" as const, live: false },
  { cross: 2, branch: "ai" as const, live: true },
  { cross: 3, branch: "ai" as const, live: false },
  { cross: 4.5, branch: "user" as const, live: false },
  { cross: 6, branch: "user" as const, live: true },
  { cross: 7, branch: "user" as const, live: false },
  { cross: 8, branch: "ai" as const, live: true },
  { cross: 9, branch: "ai" as const, live: false },
  { cross: 10.5, branch: "user" as const, live: false },
];

const PICKER_ARRIVALS = [
  { key: "write", arrive: 0.7, y: 30 },
  { key: "file", arrive: 2.7, y: 98 },
  { key: "link", arrive: 6.7, y: 64 },
  { key: "spy", arrive: 8.7, y: 299 },
].map(({ key, arrive, y }) => {
  const pts = [[241, y + 2], [308, y + 2], [365, y + 2], [365, 200], [382, 200], ...ee];
  return {
    key,
    points: pts,
    delay: (arrive - polylineLength(pts) / SPEED + LOOP) % LOOP,
  };
});

const en = [[516, 200], [628, 200]];
const eo = [[920, 358], [920, 420], [296, 420], [296, 346]];
const el = [[504, 350], [504, 260], [608, 260], [608, 200], [628, 200]];

const er = CREATOR_FORMATS.map(({ dx }) => 504 + dx);
const makePath = (x1: number, y1: number, x2: number, y2: number, midY: number) =>
  x1 === x2 ? [[x1, y1], [x2, y2]] : [[x1, y1], [x1, midY], [x2, midY], [x2, y2]];

const ec = [[504, 36], [504, 88]];
const ep = er.map((x) => makePath(504, 88, x, 132, 110));
const eu = er.map((x) => makePath(x, 140, 504, 188, 164));

const ed = [0.9, 2.4, 3.9, 5.4];
const makeTimedDelays = (offset: number, stagger: number = 0) =>
  ed.map((s, idx) => (s + offset + (idx % 2) * stagger) % CYCLE);

const eh = makeTimedDelays(1);
const ef = makeTimedDelays(2.6);
const ex = makeTimedDelays(4.3, 0.5);

const ey = REVIEWER_Y.map((y, idx) => {
  const pts =
    idx === REVIEWER_Y.length - 1
      ? [[798, 200], [876, 200]]
      : [[798, 200], [851, 200], [851, y + 2], [876, y + 2]];
  return {
    points: pts,
    delay: (REVIEWER_DELAYS[idx] - polylineLength(pts) / SPEED + LOOP) % LOOP,
  };
});

const eg = MEDAL_KIND.map((kind, idx) => ({
  kind,
  delay: MEDAL_OUT_TIMES[idx],
  points: [[966, REVIEWER_Y[idx] + 2], [989, REVIEWER_Y[idx] + 2], [989, 346], [972, 346], [960, 346]],
}));

const eb = [[308, 346], [365, 346], [365, 200], [382, 200], ...ee];

export function AutomationFlow() {
  return (
    <section id="automation-flow" className="w-full mt-2 md:mt-4 pt-2 md:pt-4 pb-8 overflow-hidden">
      <div className="mx-auto max-w-3xl text-center mb-8 px-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Sparkles className="size-3.5" />
          Autonomous Pipeline
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How reerts works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A continuous loop from topic discovery to published multi-platform posts and feedback analysis.
        </p>
      </div>

      <div className="mx-auto max-w-[1008px] overflow-x-clip" style={{ aspectRatio: `${GRID_WIDTH} / 520` }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          data-testid="automation-flow-grid"
          className="grid justify-center [zoom:.34] sm:[zoom:.6] md:[zoom:.73] lg:[zoom:1] grid-cols-[176px_32px_176px_32px_176px_32px_176px_32px_176px] grid-rows-[80px_400px_40px]"
        >
          {/* Row 1: Headers */}
          {STAGES.map((stage, idx) => (
            <div
              key={stage.key}
              style={{ gridColumnStart: 2 * idx + 1 }}
              className="flex flex-col items-center justify-end gap-1 text-center row-start-1 pb-3"
            >
              <p className="flex items-center gap-1.5 text-xl font-semibold leading-tight">
                <stage.Icon className="size-6 shrink-0" aria-hidden="true" />
                {stage.label}
              </p>
              <p className="text-xs leading-tight text-muted-foreground">{stage.desc}</p>
            </div>
          ))}

          {/* Row 2, Col 1: Collector Box */}
          <div
            style={{ gridColumnStart: 1 }}
            className="relative rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 row-start-2 shadow-sm"
          >
            <CollectorStage />
          </div>

          {/* Row 2, Col 2: Connector (1 -> 3) */}
          <div aria-hidden="true" style={{ gridColumnStart: 2 }} className="relative row-start-2">
            <div className="absolute inset-x-0 flex -translate-y-1/2 items-center" style={{ top: 200 }}>
              <span className={cn("h-px flex-1", LINE)} />
              <Chevron dir="right" />
            </div>
          </div>

          {/* Row 2, Col 3: Picker Box */}
          <div
            style={{ gridColumnStart: 3 }}
            className="relative rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 row-start-2 shadow-sm"
          >
            <PickerStage />
          </div>

          {/* Row 2, Col 4: Connector (3 -> 5) */}
          <div aria-hidden="true" style={{ gridColumnStart: 4 }} className="relative row-start-2">
            <div className="absolute inset-x-0 flex -translate-y-1/2 items-center" style={{ top: 200 }}>
              <span className={cn("h-px flex-1", LINE)} />
              <Chevron dir="right" />
            </div>
          </div>

          {/* Row 2, Col 5: Creator Stage (Box + AI Models) */}
          <div className="row-start-2 flex flex-col" style={{ gridColumnStart: 5 }}>
            <div className="relative rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 h-[300px] shadow-sm">
              <CreatorStage />
            </div>

            {/* AI Models Card */}
            <div className="relative mt-auto h-[100px]">
              <span aria-hidden="true" className={cn("absolute left-[88px] top-0 h-[18px] w-px -translate-x-1/2", LINE)} />
              <span className="absolute left-[88px] top-0 -translate-x-1/2">
                <Chevron dir="up" />
              </span>
              <div
                data-variant="link"
                className={cn(
                  "absolute left-0 top-[18px] z-20 flex h-[82px] w-full items-center rounded-lg border px-3 shadow-sm",
                  CHIP_VARIANT.link
                )}
              >
                <ul className="grid w-full grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-semibold">
                  {AI_MODELS.map((model) => (
                    <li key={model.key} className="flex items-center gap-1.5">
                      {model.icon}
                      {model.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Row 2, Col 6: Connector (5 -> 7) with API/MCP bypass branch */}
          <div aria-hidden="true" style={{ gridColumnStart: 6 }} className="relative row-start-2">
            <div className="absolute inset-x-0 flex -translate-y-1/2 items-center" style={{ top: 200 }}>
              <span className={cn("h-px flex-1", LINE)} />
              <Chevron dir="right" />
            </div>
            <span className={cn("absolute left-0 top-[260px] h-px w-4 -translate-y-1/2", LINE)} />
            <span className={cn("absolute left-4 top-[200px] h-[60px] w-px -translate-x-1/2", LINE)} />
          </div>

          {/* Row 2, Col 7: Scheduler Stage Box */}
          <div
            style={{ gridColumnStart: 7 }}
            className="relative rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 row-start-2 shadow-sm"
          >
            <SchedulerStage />
          </div>

          {/* Row 2, Col 8: Connector (7 -> 9) */}
          <div aria-hidden="true" style={{ gridColumnStart: 8 }} className="relative row-start-2">
            <div className="absolute inset-x-0 flex -translate-y-1/2 items-center" style={{ top: 200 }}>
              <span className={cn("h-px flex-1", LINE)} />
              <Chevron dir="right" />
            </div>
          </div>

          {/* Row 2, Col 9: Reviewer Stage Box */}
          <div
            style={{ gridColumnStart: 9 }}
            className="relative rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 row-start-2 shadow-sm"
          >
            <ReviewerStage />
          </div>

          {/* Row 3, Col 3-9: Feedback Loop ("recycle top content — back to ideas") */}
          <div aria-hidden="true" className="relative col-span-7 col-start-3 row-start-3">
            <span className={cn("absolute left-[712px] top-0 h-5 -translate-x-1/2 border-l", DASH)} />
            <span className={cn("absolute left-[88px] right-[88px] top-5 -translate-y-1/2 border-t", DASH)} />
            <span className={cn("absolute left-[88px] top-0 h-5 -translate-x-1/2 border-l", DASH)} />
            <span className="absolute left-[88px] top-0 -translate-x-1/2">
              <Chevron dir="up" />
            </span>
            <span className={cn(EDGE_LABEL, "absolute left-[400px] top-[26px] -translate-x-1/2 font-medium")}>
              recycle top content — back to ideas
            </span>
          </div>

          {/* Row 3, Col 1-2: Legend */}
          <ul className="col-span-2 col-start-1 row-start-3 flex items-start gap-3 whitespace-nowrap pt-2 text-[10px] leading-none text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn("inline-block size-2.5 shrink-0 rounded-[3px] border", CHIP_VARIANT.ai)}
              />
              AI / automatic
            </li>
            <li className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn("inline-block size-2.5 shrink-0 rounded-[3px] border", CHIP_VARIANT.user)}
              />
              You
            </li>
            <li className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn("inline-block size-2.5 shrink-0 rounded-[3px] border", CHIP_VARIANT.link)}
              />
              External
            </li>
          </ul>

          {/* Animated Traveling Shape Particles Layer */}
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-10 col-span-9 col-start-1 row-span-2 row-start-2"
          >
            {/* Collector -> Branchings */}
            {SOURCES.map((source, idx) => {
              const info = es[idx];
              const a = 45 + source.nameW;
              const n = SOURCE_Y[idx];
              const span = 172 - a;
              const l = [a, a + 0.45 * span, a + 0.55 * span, 172];
              const r = [n, n, RAIL_I, RAIL_I];
              const curvePts = [0, 0.25, 0.5, 0.75, 1].map((t) => {
                const inv = 1 - t;
                const b0 = inv * inv * inv;
                const b1 = 3 * inv * inv * t;
                const b2 = 3 * inv * t * t;
                const b3 = t * t * t;
                return [
                  2 + (b0 * l[0] + b1 * l[1] + b2 * l[2] + b3 * l[3]),
                  2 + (b0 * r[0] + b1 * r[1] + b2 * r[2] + b3 * r[3]),
                ];
              });

              const delay = (info.cross + 3.2 - polylineLength(curvePts) / SPEED + LOOP) % LOOP;

              return (
                <Journey
                  key={source.key}
                  kind="rawDot"
                  points={[...curvePts, ...et[info.branch][info.live ? "live" : "die"]]}
                  delay={delay}
                  period={LOOP}
                />
              );
            })}

            {/* Picker Inputs Arrivals */}
            {PICKER_ARRIVALS.map(({ key, points, delay }) => (
              <Journey key={key} kind="rawDot" points={points} delay={delay} period={LOOP} />
            ))}

            {/* Creator Format Feed Dots */}
            {ed.map((del, i) => (
              <Journey key={`in-${i}`} kind="rawDot" points={ec} delay={del} />
            ))}

            {/* Creator Fan-out Dots */}
            {eh.map((del, i) =>
              ep.map((pts, j) => (
                <Journey key={`fan-${i}-${j}`} kind="rawDot" points={pts} delay={del} />
              ))
            )}

            {/* Creator Fan-in Triangles */}
            {ef.map((del, i) =>
              eu.map((pts, j) => (
                <Journey key={`join-${i}-${j}`} kind="triangle" points={pts} delay={del} />
              ))
            )}

            {/* Creator -> Scheduler Squares */}
            {ex.map((del, i) => (
              <Journey key={`sq-${i}`} kind="square" points={en} delay={del} />
            ))}

            {/* Scheduler -> Reviewer Squares */}
            {ey.map(({ points, delay }, i) => (
              <Journey key={`rev-in-${i}`} kind="square" points={points} delay={delay} period={LOOP} />
            ))}

            {/* Medals from Reviewer */}
            {eg.map(({ kind, points, delay }) => (
              <Journey key={`medal-${kind}`} kind={kind} points={points} delay={delay} period={LOOP} />
            ))}

            {/* Gold recycle dot cycling through bottom loop */}
            <Journey kind="gold" points={eo} delay={11} period={LOOP} />

            {/* Repurposed rawDot cycling back */}
            <Journey kind="rawDot" points={eb} delay={10.3} period={LOOP} />

            {/* API & MCP square particle */}
            <Journey kind="square" points={el} delay={3} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
