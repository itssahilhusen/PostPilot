"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PostPilotLogoProps {
  className?: string;
  iconClassName?: string;
  variant?: "badge" | "symbol" | "full" | "tactile";
  theme?: "dark" | "light" | "monochrome" | "auto";
  styleType?: "twin" | "ligature" | "interlocking";
  size?: number;
}

export function PostPilotLogo({
  className,
  iconClassName,
  variant = "badge",
  theme = "auto",
  styleType = "twin",
  size = 40,
}: PostPilotLogoProps) {
  const isLight = theme === "light";
  const isMono = theme === "monochrome";

  // App's Lime background token (#C5F52A)
  const boxBg = isLight ? "#16A34A" : isMono ? "#FFFFFF" : "#C5F52A";
  // The PP glyph is pure solid black (#000000)
  const glyphColor = isMono && !isLight ? "#FFFFFF" : "#000000";

  // 1. STYLE 1: MASTER TWIN "PP" (Side-by-side, 100% instant legibility, exact Amie font curves)
  const renderTwinPP = (color: string) => (
    <g fill={color}>
      {/* P1 (Left Post) */}
      <path
        fillRule="evenodd"
        d="M 16 21 L 25 21 C 31 19.5, 39 19, 44 23.5 C 49 28, 48.5 37, 44 42.5 C 39.5 47, 32 48.5, 25 48.5 L 25 79 L 16 79 Z M 25 28.5 L 32 28.5 C 37 28.5, 40 31, 39.5 35 C 39 39, 36 41.5, 30.5 41.5 L 25 41.5 Z"
      />
      {/* P2 (Right Pilot) */}
      <path
        fillRule="evenodd"
        d="M 53 21 L 62 21 C 68 19.5, 76 19, 81 23.5 C 86 28, 85.5 37, 81 42.5 C 76.5 47, 69 48.5, 62 48.5 L 62 79 L 53 79 Z M 62 28.5 L 69 28.5 C 74 28.5, 77 31, 76.5 35 C 76 39, 73 41.5, 67.5 41.5 L 62 41.5 Z"
      />
    </g>
  );

  // 2. STYLE 2: AERODYNAMIC LIGATURE "PP" (Connected waistline bridge, Amie fluid swoops)
  const renderLigaturePP = (color: string) => (
    <g fill={color}>
      <path
        fillRule="evenodd"
        d="M 16 21 L 25.5 21 C 32 19.5, 40 19, 45 23.5 C 50 28, 49.5 37, 45 42.5 C 41 46.5, 35 48, 28 48.5 C 34 48.5, 44 48.5, 52 48.5 L 52 79 L 43.5 79 L 43.5 54.5 L 25.5 54.5 L 25.5 79 L 16 79 Z M 25.5 28.5 L 33 28.5 C 38 28.5, 41 31, 40.5 35 C 40 39, 37 41.5, 31 41.5 L 25.5 41.5 Z"
      />
      <path
        fillRule="evenodd"
        d="M 52 21 L 61.5 21 C 68 19.5, 76 19, 81 23.5 C 86 28, 85.5 37, 81 42.5 C 76.5 47, 69 48.5, 62 48.5 L 62 79 L 52 79 L 52 48.5 Z M 62 28.5 L 69 28.5 C 74 28.5, 77 31, 76.5 35 C 76 39, 73 41.5, 67.5 41.5 L 62 41.5 Z"
      />
    </g>
  );

  // 3. STYLE 3: INTERLOCKING SCULPTED "PP" (Nested display monogram)
  const renderInterlockingPP = (color: string) => (
    <g fill={color}>
      <path
        fillRule="evenodd"
        d="M 18 20 L 28 20 C 35 18.5, 45 18, 51 23 C 57 28, 56.5 38, 51 44 C 45 49, 36 51, 28 51 L 28 80 L 18 80 Z M 28 28 L 36 28 C 42 28, 46 31, 45.5 35.5 C 45 40, 41 43, 34 43 L 28 43 Z"
      />
      <path
        fillRule="evenodd"
        d="M 48 34 L 57.5 34 C 64.5 32.5, 74.5 32, 80.5 37 C 86.5 42, 86 52, 80.5 58 C 74.5 63, 65.5 65, 57.5 65 L 57.5 80 L 48 80 Z M 57.5 42 L 65.5 42 C 71.5 42, 75.5 45, 75 49.5 C 74.5 54, 70.5 57, 63.5 57 L 57.5 57 Z"
      />
    </g>
  );

  const getGlyph = (color: string) => {
    switch (styleType) {
      case "ligature":
        return renderLigaturePP(color);
      case "interlocking":
        return renderInterlockingPP(color);
      case "twin":
      default:
        return renderTwinPP(color);
    }
  };

  // VARIANT: Tactile 3D Embossed Squircle (Image 3 & 5 Hardware Style)
  if (variant === "tactile") {
    return (
      <div
        className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className={cn("w-full h-full drop-shadow-md", iconClassName)}>
          <defs>
            <linearGradient id="pp-bevel-rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E4FFA1" />
              <stop offset="35%" stopColor="#C5F52A" />
              <stop offset="100%" stopColor="#8BB80D" />
            </linearGradient>
            <linearGradient id="pp-cap-surface" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D7FA48" />
              <stop offset="100%" stopColor="#B6E41D" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="94" height="94" rx="26" fill="url(#pp-bevel-rim)" />
          <rect x="6.5" y="5.5" width="87" height="87" rx="24" fill="url(#pp-cap-surface)" />
          <rect x="6.5" y="5.5" width="87" height="87" rx="24" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.35" />
          <g transform="translate(0, 0.5)">{getGlyph("#000000")}</g>
        </svg>
      </div>
    );
  }

  // VARIANT: Badge (The signature 100% Pure Lime Box with Solid Black PP)
  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center shrink-0 select-none cursor-pointer transition-transform hover:scale-105 duration-200",
          className
        )}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className={cn("w-full h-full", iconClassName)}>
          <rect width="100" height="100" rx="26" fill={boxBg} />
          {getGlyph(glyphColor)}
        </svg>
      </div>
    );
  }

  // VARIANT: Symbol-Only (Unenclosed standalone glyph)
  if (variant === "symbol") {
    return (
      <div
        className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className={cn("w-full h-full", iconClassName)}>
          {getGlyph(isLight ? "#0A0A0A" : "#C5F52A")}
        </svg>
      </div>
    );
  }

  // VARIANT: Full Wordmark (Lime Box Badge + "PostPilot" text)
  return (
    <div className={cn("inline-flex items-center gap-3 shrink-0 select-none", className)}>
      <div style={{ width: size, height: size }} className="shrink-0">
        <svg viewBox="0 0 100 100" className={cn("w-full h-full", iconClassName)}>
          <rect width="100" height="100" rx="26" fill={boxBg} />
          {getGlyph(glyphColor)}
        </svg>
      </div>
      <span
        className={cn(
          "font-bold tracking-tight text-white leading-none",
          isLight && "text-neutral-900"
        )}
        style={{ fontSize: Math.round(size * 0.6) }}
      >
        Post
        <span className={cn("font-extrabold text-[#C5F52A]", isLight && "text-emerald-600")}>
          Pilot
        </span>
      </span>
    </div>
  );
}
