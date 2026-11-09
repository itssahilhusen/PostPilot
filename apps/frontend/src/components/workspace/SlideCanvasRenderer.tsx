"use client";

import React, { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import type { SlideData } from "./SwiperaStudioWorkspace";
import { CN_TEMPLATES } from "@/lib/swiperaTemplatesEngine";

export interface SlideCanvasRendererProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  aspectRatio: "1:1" | "4:5" | "9:16" | "16:9";
  templateId?: string;
  activeScheme: {
    bg: string;
    fg: string;
    a: string;
    b?: string;
    muted?: string;
  };
  titleFont: string;
  bodyFont: string;
  brand?: string;
  site?: string;
  swipeText?: string;
  textAlign?: "left" | "center" | "right";
  titleWeight?: number | string;
  titleCase?: any;
  tracking?: number;
  leading?: number;
  hasTitleShadow?: boolean;
  isGradientBg?: boolean;
  gradientAngle?: number;
  gradientEndColor?: string;
  showImageTextOverlay?: boolean;
  showSafeArea?: boolean;
  platformName?: string;
  isInteractive?: boolean;
  onUpdateSlide?: (updates: Partial<SlideData>) => void;
  nativeW: number;
  nativeH: number;
  selectedSchemeIndex?: number;
  customAccent?: string | null;
}

export function SlideCanvasRenderer({
  slide,
  slideIndex,
  totalSlides,
  aspectRatio,
  templateId = "brutalism",
  activeScheme,
  titleFont,
  bodyFont,
  brand,
  site,
  swipeText = "SWIPE →",
  textAlign = "left",
  titleWeight = 900,
  titleCase = "none",
  tracking = 0,
  leading = 1.15,
  hasTitleShadow = false,
  isGradientBg = false,
  gradientAngle = 135,
  gradientEndColor = "#000000",
  showImageTextOverlay = true,
  showSafeArea = false,
  platformName = "Instagram",
  isInteractive = true,
  onUpdateSlide,
  nativeW,
  nativeH,
  selectedSchemeIndex = 0,
  customAccent = null,
}: SlideCanvasRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate authentic Swipera template card HTML
  const cardHtml = useMemo(() => {
    try {
      const engine =
        typeof window !== "undefined" && (window as any).CN_TEMPLATES
          ? (window as any).CN_TEMPLATES
          : CN_TEMPLATES;
      if (!engine || typeof engine.renderCard !== "function") return "";

      const effectiveTemplateId = templateId || "brutalism";
      const isLastSlide = slideIndex === totalSlides - 1 && totalSlides > 1;

      const ctx: any = {
        template: effectiveTemplateId,
        scheme: selectedSchemeIndex ?? 0,
        accent: customAccent || (activeScheme?.a ?? null),
        ratio: aspectRatio || "4:5",
        index: slideIndex,
        total: totalSlides,
        brand: brand !== undefined ? brand : "@swipera",
        site: site !== undefined ? site : "SWIPERA",
        swipe: !isLastSlide,
        swipeText: swipeText || "SWIPE →",
        pageNum: true,
        editable: Boolean(isInteractive),
        showEmoji: Boolean(slide?.emoji),
        design: {
          bg: isGradientBg ? undefined : activeScheme?.bg,
          fg: activeScheme?.fg,
          a: customAccent || activeScheme?.a,
          b: activeScheme?.b,
          muted: activeScheme?.muted,
          titleFont: titleFont || undefined,
          bodyFont: bodyFont || undefined,
          letterSpacing: tracking ? tracking * 100 : 0,
          lineHeight: leading ? leading * 100 : 115,
          textAlign: textAlign || "left",
          titleShadow: Boolean(hasTitleShadow),
        },
      };

      return engine.renderCard(slide, ctx);
    } catch (err) {
      console.error("[SlideCanvasRenderer] renderCard error:", err);
      return "";
    }
  }, [
    slide,
    slideIndex,
    totalSlides,
    aspectRatio,
    templateId,
    activeScheme,
    titleFont,
    bodyFont,
    brand,
    site,
    swipeText,
    textAlign,
    titleWeight,
    titleCase,
    tracking,
    leading,
    hasTitleShadow,
    isGradientBg,
    gradientAngle,
    gradientEndColor,
    isInteractive,
    selectedSchemeIndex,
    customAccent,
  ]);

  // Handle direct inline contentEditable editing on card
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const field = target.getAttribute("data-field");
    if (!field || !onUpdateSlide) return;

    const text = target.innerText?.trim?.() ?? "";
    if (field === "title") {
      onUpdateSlide({ title: text });
    } else if (field === "body") {
      onUpdateSlide({ body: text });
    } else if (field === "label") {
      onUpdateSlide({ label: text });
    } else if (field === "stat") {
      onUpdateSlide({ stat: text });
    } else if (field === "item") {
      const itemIdx = target.getAttribute("data-i");
      if (itemIdx !== null && slide.items) {
        const idx = parseInt(itemIdx, 10);
        const newItems = [...slide.items];
        newItems[idx] = text;
        onUpdateSlide({ items: newItems });
      }
    }
  };

  // Safe area overlay guides
  const renderSafeArea = () => {
    if (!showSafeArea) return null;
    const plat = (platformName || "Instagram").toLowerCase();
    let safe = { top: 10, bottom: 18, right: 0, left: 0 };
    if (plat.includes("tiktok")) safe = { top: 14, bottom: 24, right: 14, left: 0 };
    else if (plat.includes("linkedin")) safe = { top: 8, bottom: 12, right: 0, left: 0 };
    else if (plat.includes("threads")) safe = { top: 8, bottom: 14, right: 0, left: 0 };
    else if (plat.includes("x")) safe = { top: 6, bottom: 10, right: 0, left: 0 };

    return (
      <div
        className="safe-area pointer-events-none select-none"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 40,
          width: `${nativeW}px`,
          height: `${nativeH}px`,
        }}
      >
        <div
          className="sa-tag"
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "rgba(0,0,0,0.85)",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "999px",
            fontSize: "18px",
            fontWeight: 800,
            letterSpacing: "0.02em",
            backdropFilter: "blur(6px)",
          }}
        >
          {platformName || "Instagram"} · Safe area
        </div>
        {safe.top > 0 && (
          <div
            className="sa-zone"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${nativeW}px`,
              height: `${(nativeH * safe.top) / 100}px`,
              background: "rgba(239, 68, 68, 0.14)",
              borderBottom: "3px dashed rgba(239, 68, 68, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(239, 68, 68, 0.95)",
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            <span>Top UI Zone</span>
          </div>
        )}
        {safe.bottom > 0 && (
          <div
            className="sa-zone"
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: `${nativeW}px`,
              height: `${(nativeH * safe.bottom) / 100}px`,
              background: "rgba(239, 68, 68, 0.14)",
              borderTop: "3px dashed rgba(239, 68, 68, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(239, 68, 68, 0.95)",
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            <span>Caption & Action Zone</span>
          </div>
        )}
        {safe.right > 0 && (
          <div
            className="sa-zone"
            style={{
              position: "absolute",
              right: 0,
              top: `${(nativeH * safe.top) / 100}px`,
              width: `${(nativeW * safe.right) / 100}px`,
              height: `${nativeH * (1 - (safe.top + safe.bottom) / 100)}px`,
              background: "rgba(239, 68, 68, 0.14)",
              borderLeft: "3px dashed rgba(239, 68, 68, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(239, 68, 68, 0.95)",
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            <span>Buttons</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onBlur={handleBlur}
      className="relative select-text"
      style={{
        width: `${nativeW}px`,
        height: `${nativeH}px`,
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: cardHtml }}
        style={{ width: "100%", height: "100%" }}
      />
      {renderSafeArea()}
    </div>
  );
}
