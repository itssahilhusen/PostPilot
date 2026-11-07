"use client";

import React, { useState, useMemo } from "react";
import { X, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { swiperaExamplesData, swiperaExampleCategories } from "@/data/swiperaExamples";
import swiperaTemplatesData from "@/data/swiperaTemplates";

interface ExampleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (example: any) => void;
  language?: "ko" | "en";
}

// Map template IDs to fast lookup
const TEMPLATE_MAP = new Map(swiperaTemplatesData.map((t) => [t.id, t]));

/**
 * Visual 4:5 Card Thumbnail Preview for Example Gallery matching Swipera Screenshot
 */
export function ExampleCardPreview({ example }: { example: any }) {
  const tpl = TEMPLATE_MAP.get(example.template) || swiperaTemplatesData[0];
  const scheme = tpl.schemes?.[example.scheme || 0] || tpl.schemes?.[0] || {
    bg: "#ffffff",
    fg: "#0f172a",
    a: "#c6f432",
    name: "Default",
  };
  const slide0 = example.slides?.[0] || {
    title: example.name,
    body: "",
    label: "01",
    emoji: "",
  };

  // Thematic background & styling overrides matching Swipera's visual styles
  const isOrange = example.template === "orange";
  const isMagazine = example.template === "magazine";
  const isNeonGeo = example.template === "neongeo";
  const isMinimal = example.template === "minimal";
  const isFinance = example.template === "finance";
  const isPastel = example.template === "pastel";
  const isFashion = example.template === "fashion";
  const isSale = example.template === "sale";
  const isBrutalism = example.template === "brutalism";
  const isDark = example.template === "dark";

  return (
    <div
      className="w-full aspect-[4/5] rounded-xl overflow-hidden relative shadow-sm border border-[var(--line)] select-none transition-all flex flex-col justify-between p-3.5 box-border"
      style={{
        backgroundColor: scheme.bg || "#ffffff",
        color: scheme.fg || "#0f172a",
      }}
    >
      {/* 1. Header Row (Label Badge or Minimal Dot) */}
      <div className="flex items-center justify-between w-full z-10">
        {isMinimal ? (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        ) : isOrange ? (
          <span className="text-[9px] font-black uppercase tracking-widest text-white/80">
            {slide0.label || "RECIPE"}
          </span>
        ) : (
          <span
            className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{
              backgroundColor: scheme.a ? `${scheme.a}25` : "rgba(0,0,0,0.06)",
              color: scheme.fg || "inherit",
              border: `1px solid ${scheme.a || "transparent"}40`,
            }}
          >
            {slide0.label || "01"}
          </span>
        )}

        {/* Brand or slide count dot */}
        <span className="text-[9px] font-mono opacity-50 font-bold">
          1/{example.slides?.length || 5}
        </span>
      </div>

      {/* 2. Visual Center Content */}
      <div className="my-auto flex flex-col justify-center relative z-10 w-full">
        {/* Special layout for Orange Poster */}
        {isOrange ? (
          <div className="relative">
            <div className="text-5xl font-black leading-none text-black/90 tracking-tighter mb-1">
              1
            </div>
            <div className="bg-white text-black p-2 rounded-lg shadow-sm">
              <h4 className="text-[11px] font-black leading-tight">
                {slide0.title}
              </h4>
              {slide0.body && (
                <p className="text-[8.5px] text-zinc-600 mt-1 line-clamp-1 leading-snug">
                  {slide0.body}
                </p>
              )}
            </div>
          </div>
        ) : isMagazine ? (
          /* Magazine Editorial with large 01 watermark */
          <div className="relative">
            <div className="text-4xl font-serif font-black text-black/15 absolute -top-5 left-0 select-none">
              01
            </div>
            <div className="relative pt-3">
              <h4 className="text-xs font-serif font-black leading-snug tracking-tight">
                {slide0.title}
              </h4>
              {slide0.body && (
                <p className="text-[9px] opacity-75 mt-1 font-serif line-clamp-2">
                  {slide0.body}
                </p>
              )}
            </div>
          </div>
        ) : isNeonGeo ? (
          /* Neon Geo Brutalism */
          <div className="relative">
            <h4 className="text-xs font-black tracking-tight leading-snug uppercase">
              {slide0.title}
            </h4>
            {slide0.body && (
              <p className="text-[9px] font-mono opacity-80 mt-1 line-clamp-1">
                {slide0.body}
              </p>
            )}
            {/* Geo wireframe accent */}
            <div className="mt-2 flex items-center gap-1 opacity-70">
              <span className="text-xs font-mono font-black">✦ ✤ ✖</span>
            </div>
          </div>
        ) : isFinance ? (
          /* Finance / Modern Poster */
          <div className="relative">
            <h4 className="text-xs font-black tracking-tight leading-snug">
              {slide0.title}
            </h4>
            {slide0.body && (
              <p className="text-[9px] opacity-80 mt-1 line-clamp-2">
                {slide0.body}
              </p>
            )}
            <div className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              &rarr;
            </div>
          </div>
        ) : (
          /* Standard / Pastel / Minimal / Pop / Brutalism */
          <div className="relative">
            {slide0.emoji && (
              <div className="text-xl mb-1.5 leading-none select-none">
                {slide0.emoji}
              </div>
            )}
            <h4 className="text-xs font-extrabold leading-snug tracking-tight">
              {slide0.title}
            </h4>
            {slide0.body && (
              <p className="text-[9px] opacity-75 mt-1 line-clamp-2 leading-relaxed">
                {slide0.body}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Footer Accent / Swipera touch */}
      <div className="flex items-center justify-between text-[8px] font-mono opacity-60 z-10 pt-1 border-t border-black/5 dark:border-white/5">
        <span className="truncate max-w-[80px]">{tpl.name}</span>
        <span>Swipe &rarr;</span>
      </div>
    </div>
  );
}

export function ExampleGalleryModal({
  isOpen,
  onClose,
  onSelectExample,
  language = "en",
}: ExampleGalleryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredExamples = useMemo(() => {
    if (selectedCategory === "all") return swiperaExamplesData;
    return swiperaExamplesData.filter((ex) => ex.cat === selectedCategory);
  }, [selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[940px] max-h-[88vh] bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-start justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[var(--fg)] flex items-center gap-2">
              <Images className="w-5 h-5 text-[#365300] dark:text-[#c6f432]" />
              <span>{language === "ko" ? "완성 예시 갤러리" : "Example gallery"}</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              {language === "ko"
                ? "마음에 드는 예시를 골라 글자만 바꿔보세요. AI 없이 즉시 열립니다."
                : "Open an example you like and swap in your words. Opens instantly, no AI needed."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Category Filter Pills */}
        <div className="px-4 py-2.5 border-b border-[var(--line)] bg-[var(--bg)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {swiperaExampleCategories.map((cat) => {
            const isAll = cat.id === "all";
            const label = isAll
              ? language === "ko"
                ? `전체 ${swiperaExamplesData.length}`
                : `All ${swiperaExamplesData.length}`
              : language === "ko"
              ? cat.ko
              : cat.en;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  selectedCategory === cat.id
                    ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                    : "border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--muted)]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 3. 5-Column Responsive Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredExamples.map((ex: any) => {
              const tpl = TEMPLATE_MAP.get(ex.template) || swiperaTemplatesData[0];
              const catObj = swiperaExampleCategories.find((c) => c.id === ex.cat);
              const catLabel = language === "ko" ? catObj?.ko : catObj?.en;
              const slidesCount = ex.slides?.length || 5;

              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => onSelectExample(ex)}
                  className="flex flex-col text-left group p-1.5 rounded-xl hover:bg-[var(--hover)] transition-all cursor-pointer border border-transparent hover:border-[#365300]/30 dark:hover:border-[#c6f432]/40"
                >
                  {/* Card Visual Preview */}
                  <ExampleCardPreview example={ex} />

                  {/* Card Title & Meta Info */}
                  <div className="mt-2 px-1">
                    <b className="text-xs font-extrabold text-[var(--fg)] group-hover:text-[#365300] dark:group-hover:text-[#c6f432] transition-colors line-clamp-1 block">
                      {ex.name}
                    </b>
                    <small className="text-[10px] text-[var(--muted)] block truncate mt-0.5 font-medium">
                      {catLabel || ex.cat} · {slidesCount} {language === "ko" ? "장" : "slides"} · {tpl.name}
                    </small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

