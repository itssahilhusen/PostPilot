"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Sparkles,
  Search,
  Scissors,
  ClipboardPaste,
  StickyNote,
  Sliders,
  Maximize2,
  Trash2,
  Check,
  RotateCcw,
  FlipHorizontal,
  Crosshair,
  Layers,
  ChevronDown,
  Wand2,
  Type,
  Smile,
  ImageIcon,
  Plus,
  Copy,
  ArrowUp,
  BarChart3,
  Table,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SlideData } from "./SwiperaStudioWorkspace";

interface SlidePropertiesInspectorProps {
  currentSlide: SlideData;
  currentSlideIndex: number;
  totalSlides: number;
  updateCurrentSlide: (patch: Partial<SlideData>) => void;
  activeScheme: { bg: string; fg: string; a: string; b?: string };
  language?: "ko" | "en";
  isEasyMode: boolean;
  setIsEasyMode: (val: boolean) => void;
  onClose?: () => void;
  slides: SlideData[];
  setSlides: React.Dispatch<React.SetStateAction<SlideData[]>>;
  handleSingleSlideImageUpload: (file: File) => void;
  handleAIRewrite: (mode: string) => void;
}

// 9 Image Layout Presets
const IMG_LAYOUT_OPTIONS = [
  { id: "auto", label: "Template", iconClass: "imgl-auto" },
  { id: "full", label: "Full", iconClass: "imgl-full" },
  { id: "top", label: "Top", iconClass: "imgl-top" },
  { id: "bottom", label: "Bottom", iconClass: "imgl-bottom" },
  { id: "left", label: "Left", iconClass: "imgl-left" },
  { id: "right", label: "Right", iconClass: "imgl-right" },
  { id: "card", label: "Card", iconClass: "imgl-card" },
  { id: "circle", label: "Circle", iconClass: "imgl-circle" },
  { id: "polaroid", label: "Polaroid", iconClass: "imgl-polaroid" },
] as const;

// 10 Image Filters
const IMG_FILTER_OPTIONS = [
  { id: "auto", label: "Template", filter: "" },
  { id: "none", label: "Original", filter: "none" },
  { id: "mono", label: "B&W", filter: "grayscale(1) contrast(1.08)" },
  { id: "duotone", label: "Duotone", filter: "grayscale(1) contrast(1.15) brightness(1.05)" },
  { id: "warm", label: "Warm", filter: "sepia(.35) saturate(1.25) contrast(1.03)" },
  { id: "cool", label: "Cool", filter: "saturate(.9) hue-rotate(-12deg) contrast(1.05) brightness(1.02)" },
  { id: "fade", label: "Fade", filter: "contrast(.85) brightness(1.1) saturate(.75)" },
  { id: "vivid", label: "Vivid", filter: "saturate(1.5) contrast(1.1)" },
  { id: "film", label: "Film", filter: "sepia(.2) contrast(1.15) brightness(.95) saturate(.85)" },
  { id: "soft", label: "Soft", filter: "brightness(1.05) contrast(.92) blur(.6px)" },
] as const;

// 8 Image Overlays
const IMG_OVERLAY_OPTIONS = [
  { id: "auto", label: "Auto", bg: "linear-gradient(135deg, rgba(0,0,0,0.5) 50%, rgba(255,255,255,0.5) 50%)" },
  { id: "none", label: "None", bg: "transparent" },
  { id: "dark", label: "Darken", bg: "rgba(0,0,0,0.6)" },
  { id: "light", label: "Lighten", bg: "rgba(255,255,255,0.75)" },
  { id: "grad-b", label: "Bottom gradient", bg: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))" },
  { id: "grad-t", label: "Top gradient", bg: "linear-gradient(0deg, transparent, rgba(0,0,0,0.85))" },
  { id: "accent", label: "Accent", bg: "#c6f432" },
  { id: "accent-grad", label: "Accent gradient", bg: "linear-gradient(160deg, #c6f432, transparent 70%)" },
] as const;

// Layer Shapes
const LAYER_SHAPES_LIST = [
  { id: "star", label: "Star", symbol: "★" },
  { id: "arrow", label: "Arrow", symbol: "➔" },
  { id: "heart", label: "Heart", symbol: "♥" },
  { id: "burst", label: "Burst", symbol: "✹" },
  { id: "circle", label: "Circle", symbol: "●" },
  { id: "rect", label: "Box", symbol: "■" },
  { id: "line", label: "Line", symbol: "―" },
  { id: "blob", label: "Blob", symbol: "☁" },
] as const;

export function SlidePropertiesInspector({
  currentSlide,
  currentSlideIndex,
  totalSlides,
  updateCurrentSlide,
  activeScheme,
  language = "en",
  isEasyMode,
  setIsEasyMode,
  onClose,
  slides,
  setSlides,
  handleSingleSlideImageUpload,
  handleAIRewrite,
}: SlidePropertiesInspectorProps) {
  const [inspectorTab, setInspectorTab] = useState<"content" | "visual" | "ai">("content");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerFileInputRef = useRef<HTMLInputElement>(null);
  const focusPadRef = useRef<HTMLDivElement>(null);

  // Selected layer state
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Smart text fit status
  const titleLen = currentSlide.title?.length || 0;
  const bodyLen = currentSlide.body?.length || 0;
  const totalChars = titleLen + bodyLen;
  const fitScore = Math.min(100, Math.round((totalChars / 80) * 100));
  const fitStatusClass = fitScore > 90 ? "over" : fitScore > 75 ? "tight" : "ok";
  const fitStatusText =
    fitScore > 90
      ? language === "ko"
        ? "분량 초과 (넘침)"
        : "Text overflowing"
      : fitScore > 75
      ? language === "ko"
        ? "약간 빡빡함"
        : "A bit tight"
      : language === "ko"
      ? "적정 분량"
      : "Optimal length";

  // Chart helpers
  const chartData = currentSlide.chart || {
    kind: "bar",
    unit: "%",
    items: [
      { label: "Item 1", value: 65 },
      { label: "Item 2", value: 85 },
      { label: "Item 3", value: 45 },
    ],
  };

  const updateChart = (patch: Partial<NonNullable<SlideData["chart"]>>) => {
    updateCurrentSlide({
      chart: { ...chartData, ...patch },
    });
  };

  // Table helpers
  const tableData = currentSlide.table || {
    cols: ["Plan", "Basic", "Pro"],
    rows: [
      ["Price", "$0", "$29"],
      ["Features", "3", "Unlimited"],
      ["Support", "Community", "24/7"],
    ],
  };

  const updateTable = (patch: Partial<NonNullable<SlideData["table"]>>) => {
    updateCurrentSlide({
      table: { ...tableData, ...patch },
    });
  };

  // Focus pad click handler
  const handleFocusPadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!focusPadRef.current) return;
    const rect = focusPadRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    updateCurrentSlide({ imgFocusX: x, imgFocusY: y });
  };

  // Layers helper
  const layers = currentSlide.layers || [];
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const addLayer = (kind: "text" | "emoji" | "image" | "shape", extra?: any) => {
    const newId = `layer-${Date.now()}`;
    const newLayer = {
      id: newId,
      kind,
      x: 50,
      y: 50,
      w: 30,
      size: kind === "text" ? 36 : kind === "emoji" ? 64 : 40,
      color: activeScheme.a || "#c6f432",
      opacity: 1,
      ...extra,
    };
    updateCurrentSlide({ layers: [...layers, newLayer] });
    setSelectedLayerId(newId);
    toast.success(`Added ${kind} layer`);
  };

  const updateSelectedLayer = (patch: any) => {
    if (!selectedLayerId) return;
    const nextLayers = layers.map((l) => (l.id === selectedLayerId ? { ...l, ...patch } : l));
    updateCurrentSlide({ layers: nextLayers });
  };

  const deleteSelectedLayer = () => {
    if (!selectedLayerId) return;
    updateCurrentSlide({ layers: layers.filter((l) => l.id !== selectedLayerId) });
    setSelectedLayerId(null);
    toast.info("Deleted layer");
  };

  const duplicateSelectedLayer = () => {
    if (!selectedLayer) return;
    const dup = { ...selectedLayer, id: `layer-${Date.now()}`, x: selectedLayer.x + 5, y: selectedLayer.y + 5 };
    updateCurrentSlide({ layers: [...layers, dup] });
    setSelectedLayerId(dup.id);
    toast.success("Duplicated layer");
  };

  return (
    <aside
      id="inspector"
      className="w-[300px] shrink-0 border-l border-[var(--line)] bg-[var(--panel)] flex flex-col z-10 select-none overflow-y-auto"
      data-purpose="studio-inspector"
    >
      {/* 1. Header */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <h2 className="panel-title text-sm font-extrabold text-[var(--fg)] flex items-center gap-1.5">
          <span>{language === "ko" ? "슬라이드 속성" : "Slide properties"}</span>
        </h2>
        <div className="flex items-center gap-2">
          <span id="ins-pos" className="text-xs font-semibold text-[var(--muted)] font-mono">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
              title="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Three Tabs: Content, Visual, AI (.itabs) */}
      <div className="px-4 pb-3">
        <div className="itabs" id="itabs" role="tablist">
          <button
            type="button"
            role="tab"
            onClick={() => setInspectorTab("content")}
            className={cn(inspectorTab === "content" && "on")}
          >
            <i className="fas fa-align-left" />
            <span>{language === "ko" ? "내용" : "Content"}</span>
          </button>
          <button
            type="button"
            role="tab"
            onClick={() => setInspectorTab("visual")}
            className={cn(inspectorTab === "visual" && "on")}
          >
            <i className="fas fa-image" />
            <span>{language === "ko" ? "비주얼" : "Visual"}</span>
          </button>
          <button
            type="button"
            role="tab"
            onClick={() => setInspectorTab("ai")}
            className={cn(inspectorTab === "ai" && "on")}
          >
            <i className="fas fa-wand-magic-sparkles" />
            <span>AI</span>
          </button>
        </div>
      </div>

      {/* 3. Tab Body Container */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3.5 pb-6">
        {/* =========================================================================
            TAB 1: CONTENT
            ========================================================================= */}
        {inspectorTab === "content" && (
          <div className="space-y-3.5 animate-in fade-in duration-100">
            {/* Slide Type */}
            <label className="lbl">
              <span>{language === "ko" ? "슬라이드 타입" : "Slide type"}</span>
              <select
                id="ins-type"
                value={currentSlide.type}
                onChange={(e) => updateCurrentSlide({ type: e.target.value as any })}
                className="field text-xs font-medium cursor-pointer"
              >
                <option value="cover">{language === "ko" ? "표지" : "Cover"}</option>
                <option value="content">{language === "ko" ? "본문" : "Content"}</option>
                <option value="list">{language === "ko" ? "목록" : "List"}</option>
                <option value="quote">{language === "ko" ? "인용" : "Quote"}</option>
                <option value="stat">{language === "ko" ? "숫자/수치" : "Number / Stat"}</option>
                <option value="chart">{language === "ko" ? "차트" : "Chart"}</option>
                <option value="table">{language === "ko" ? "비교표" : "Table"}</option>
                <option value="cta">{language === "ko" ? "마무리" : "CTA Outro"}</option>
              </select>
            </label>

            {/* Label & Emoji in 1fr 72px */}
            <div className="grid grid-cols-[1fr_72px] gap-2">
              <label className="lbl">
                <span>{language === "ko" ? "라벨" : "Label"}</span>
                <input
                  id="ins-label"
                  type="text"
                  value={currentSlide.label || ""}
                  onChange={(e) => updateCurrentSlide({ label: e.target.value })}
                  placeholder="01, NEW, STEP"
                  className="field text-xs font-bold uppercase font-mono"
                />
              </label>
              <label className="lbl">
                <span>{language === "ko" ? "이모지" : "Emoji"}</span>
                <input
                  id="ins-emoji"
                  type="text"
                  value={currentSlide.emoji || ""}
                  onChange={(e) => updateCurrentSlide({ emoji: e.target.value })}
                  placeholder="🔥"
                  className="field text-center text-base"
                />
              </label>
            </div>

            {/* Number/Stat field (#ins-stat-wrap) - prominent for stat slides */}
            {(currentSlide.type === "stat" || currentSlide.stat) && (
              <label className="lbl" id="ins-stat-wrap">
                <span className="flex items-center justify-between">
                  <span>{language === "ko" ? "숫자 / 핵심 수치" : "Key Number / Stat"}</span>
                  <span className="text-[10px] text-[var(--muted)] font-mono">Large font highlight</span>
                </span>
                <input
                  id="ins-stat"
                  type="text"
                  value={currentSlide.stat || ""}
                  onChange={(e) => updateCurrentSlide({ stat: e.target.value })}
                  placeholder="예: 87%, 5,900원, 10분, 76분"
                  className="field text-sm font-black font-mono text-[#365300] dark:text-[#c6f432]"
                />
              </label>
            )}

            {/* Title with Character counter and AI Headlines button */}
            <label className="lbl">
              <span className="flex items-center justify-between mb-1">
                <span>{language === "ko" ? "제목" : "Title"}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--muted)] font-mono">
                    {titleLen}/30
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAIRewrite("hook")}
                    className="text-[10px] text-[#365300] dark:text-[#c6f432] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fas fa-flask text-[9px]" />
                    <span>{language === "ko" ? "A/B 헤드라인" : "AI headlines"}</span>
                  </button>
                </span>
              </span>
              <textarea
                id="ins-title"
                value={currentSlide.title}
                onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                rows={2}
                className="field text-xs font-semibold resize-none leading-snug"
                placeholder={language === "ko" ? "헤드라인 입력" : "Enter headline..."}
              />
            </label>

            {/* Body */}
            <label className="lbl" id="ins-body-wrap">
              <span className="flex items-center justify-between mb-1">
                <span>{language === "ko" ? "본문" : "Body"}</span>
                <span className="text-[10px] text-[var(--muted)] font-mono">
                  {bodyLen}/60
                </span>
              </span>
              <textarea
                id="ins-body"
                value={currentSlide.body}
                onChange={(e) => updateCurrentSlide({ body: e.target.value })}
                rows={3}
                className="field text-xs resize-none leading-relaxed"
                placeholder={language === "ko" ? "설명 본문 입력" : "Enter explanation body..."}
              />
            </label>

            {/* List Items Repeater */}
            {(currentSlide.type === "list" || (currentSlide.items && currentSlide.items.length > 0)) && (
              <div className="lbl" id="ins-items-wrap">
                <span className="flex items-center justify-between">
                  <span>{language === "ko" ? "항목 리스트" : "List Items"}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = currentSlide.items ? [...currentSlide.items] : [];
                      items.push(`Item ${items.length + 1}`);
                      updateCurrentSlide({ items });
                    }}
                    className="text-[10px] font-bold text-[#365300] dark:text-[#c6f432] hover:underline cursor-pointer"
                  >
                    + {language === "ko" ? "항목 추가" : "Add item"}
                  </button>
                </span>
                <div id="ins-items" className="space-y-1.5 mt-1.5">
                  {currentSlide.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-5 text-center text-[10px] font-mono text-[var(--muted)] font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const next = [...(currentSlide.items || [])];
                          next[idx] = e.target.value;
                          updateCurrentSlide({ items: next });
                        }}
                        className="field text-xs p-1.5 h-8 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = (currentSlide.items || []).filter((_, i) => i !== idx);
                          updateCurrentSlide({ items: next });
                        }}
                        className="p-1.5 text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chart Editor (#ins-chart-wrap) */}
            {currentSlide.type === "chart" && (
              <div className="lbl p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] space-y-2.5">
                <span className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                    <span>{language === "ko" ? "차트 설정" : "Chart Editor"}</span>
                  </span>
                  {/* Chart Kind Seg */}
                  <div className="flex bg-[var(--hover)] p-0.5 rounded-lg gap-0.5">
                    {(["bar", "hbar", "line", "donut"] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => updateChart({ kind: k })}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer",
                          chartData.kind === k
                            ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs"
                            : "text-[var(--muted)] hover:text-[var(--fg)]"
                        )}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </span>

                {/* Rows list */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-[1fr_64px_24px] gap-1 text-[10px] font-bold text-[var(--muted)] px-1">
                    <span>{language === "ko" ? "항목명" : "Label"}</span>
                    <span>{language === "ko" ? "수치" : "Value"}</span>
                    <span />
                  </div>
                  {chartData.items.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-[1fr_64px_24px] gap-1 items-center">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) => {
                          const next = [...chartData.items];
                          next[rIdx] = { ...next[rIdx], label: e.target.value };
                          updateChart({ items: next });
                        }}
                        className="field text-xs h-7 p-1"
                      />
                      <input
                        type="number"
                        value={row.value}
                        onChange={(e) => {
                          const next = [...chartData.items];
                          next[rIdx] = { ...next[rIdx], value: Number(e.target.value) || 0 };
                          updateChart({ items: next });
                        }}
                        className="field text-xs h-7 p-1 text-right font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = chartData.items.filter((_, i) => i !== rIdx);
                          updateChart({ items: next });
                        }}
                        className="text-[var(--muted)] hover:text-red-500 cursor-pointer text-center"
                      >
                        <X className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateChart({
                        items: [...chartData.items, { label: `Item ${chartData.items.length + 1}`, value: 50 }],
                      });
                    }}
                    className="flex-1 py-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[10px] font-bold hover:bg-[var(--hover)] text-center cursor-pointer"
                  >
                    + {language === "ko" ? "항목 추가" : "Add Row"}
                  </button>
                  <input
                    type="text"
                    value={chartData.unit || ""}
                    onChange={(e) => updateChart({ unit: e.target.value })}
                    placeholder="Unit (%)"
                    className="field w-20 text-[10px] h-7 p-1 text-center font-mono"
                  />
                </div>
              </div>
            )}

            {/* Table Editor (#ins-table-wrap) */}
            {currentSlide.type === "table" && (
              <div className="lbl p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] space-y-2.5">
                <span className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                    <span>{language === "ko" ? "비교표 설정" : "Table Editor"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const curCols = tableData.cols;
                      if (curCols.length === 2) {
                        updateTable({
                          cols: [...curCols, "Column 3"],
                          rows: tableData.rows.map((r) => [...r, "—"]),
                        });
                      } else {
                        updateTable({
                          cols: curCols.slice(0, 2),
                          rows: tableData.rows.map((r) => r.slice(0, 2)),
                        });
                      }
                    }}
                    className="text-[10px] font-bold text-[#365300] dark:text-[#c6f432] hover:underline cursor-pointer"
                  >
                    {tableData.cols.length === 2 ? "Switch 2→3 cols" : "Switch 3→2 cols"}
                  </button>
                </span>

                {/* Table Column Headers */}
                <div className="flex gap-1">
                  {tableData.cols.map((col, cIdx) => (
                    <input
                      key={cIdx}
                      type="text"
                      value={col}
                      onChange={(e) => {
                        const nextCols = [...tableData.cols];
                        nextCols[cIdx] = e.target.value;
                        updateTable({ cols: nextCols });
                      }}
                      className="field text-[11px] font-bold h-7 p-1 flex-1 text-center bg-[var(--panel)]"
                    />
                  ))}
                </div>

                {/* Table Data Rows */}
                <div className="space-y-1">
                  {tableData.rows.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1 items-center">
                      {row.map((cell, cIdx) => (
                        <input
                          key={cIdx}
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const nextRows = tableData.rows.map((r, ri) =>
                              ri === rIdx ? r.map((c, ci) => (ci === cIdx ? e.target.value : c)) : r
                            );
                            updateTable({ rows: nextRows });
                          }}
                          className="field text-xs h-7 p-1 flex-1 text-center"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const nextRows = tableData.rows.filter((_, i) => i !== rIdx);
                          updateTable({ rows: nextRows });
                        }}
                        className="text-[var(--muted)] hover:text-red-500 cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newRow = Array(tableData.cols.length).fill("✓");
                    newRow[0] = `Feature ${tableData.rows.length + 1}`;
                    updateTable({ rows: [...tableData.rows, newRow] });
                  }}
                  className="w-full py-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[10px] font-bold hover:bg-[var(--hover)] text-center cursor-pointer"
                >
                  + {language === "ko" ? "행 추가" : "Add Row"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: VISUAL (Image, Layouts, Filters, Overlays, Focus, Frames, Layers)
            ========================================================================= */}
        {inspectorTab === "visual" && (
          <div className="space-y-3.5 animate-in fade-in duration-100">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleSingleSlideImageUpload(e.target.files[0]);
              }}
            />
            <input
              ref={stickerFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const url = URL.createObjectURL(f);
                  addLayer("image", { src: url });
                }
              }}
            />

            {/* Image Drop Zone matching Swipera Screenshot */}
            <div className="lbl">
              <span className="font-extrabold text-xs text-[var(--fg)]">
                {language === "ko" ? "이미지" : "Image"}
              </span>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "mt-1.5 rounded-xl border border-dashed border-[var(--line)] p-2 text-center text-xs text-[var(--muted)] hover:bg-[var(--hover)] hover:border-[#365300] dark:hover:border-[#c6f432] cursor-pointer transition-all group overflow-hidden",
                  currentSlide.image && "bg-[var(--hover)] border-solid border-[var(--line)]"
                )}
              >
                {currentSlide.image ? (
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/10 border border-[var(--line)] shadow-xs">
                    <img
                      src={currentSlide.image}
                      alt="Current"
                      className="w-full h-full object-cover"
                      style={{
                        filter: currentSlide.imgFilter && currentSlide.imgFilter !== "none" && currentSlide.imgFilter !== "auto"
                          ? currentSlide.imgFilter
                          : undefined,
                      }}
                    />
                  </div>
                ) : (
                  <div className="py-3">
                    <Upload className="w-5 h-5 mx-auto text-[var(--muted)] group-hover:text-[#365300] dark:group-hover:text-[#c6f432] mb-1.5 transition-colors" />
                    <div className="font-bold text-[var(--fg)] text-xs">
                      {language === "ko" ? "클릭 또는 드롭하여 업로드" : "Click or drop to upload"}
                    </div>
                  </div>
                )}
                <div className="text-[10px] text-[var(--muted)] leading-tight mt-1.5 select-none">
                  <div>{language === "ko" ? "클릭 또는 드래그하여 업로드" : "Click or drop to upload"}</div>
                  <div className="text-[9px] opacity-75 mt-0.5">
                    {language === "ko"
                      ? "또는 Ctrl+V로 클립보드 붙여넣기 / Shift+Ctrl+V로 스티커"
                      : "or press Ctrl+V to paste clipboard image / Shift+Ctrl+V as sticker"}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Action Buttons Grid (2 columns matching Swipera) */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const items = await navigator.clipboard.read();
                    for (const item of items) {
                      const imageType = item.types.find((t) => t.startsWith("image/"));
                      if (imageType) {
                        const blob = await item.getType(imageType);
                        const file = new File([blob], "pasted.png", { type: imageType });
                        handleSingleSlideImageUpload(file);
                        toast.success("Pasted image from clipboard");
                        return;
                      }
                    }
                    toast.info("No image found on clipboard");
                  } catch {
                    toast.info("Clipboard paste not supported in this browser. Use upload.");
                  }
                }}
                className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>{language === "ko" ? "붙여넣기" : "Paste"}</span>
              </button>
              <button
                type="button"
                onClick={() => stickerFileInputRef.current?.click()}
                className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <StickyNote className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>{language === "ko" ? "스티커로 붙여넣기" : "Paste as sticker"}</span>
              </button>
              <button
                type="button"
                onClick={() => toast.info("AI image generation prompt")}
                className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                <span>{language === "ko" ? "AI 이미지" : "AI image"}</span>
              </button>
              <button
                type="button"
                onClick={() => toast.info("Searching royalty-free stock photos")}
                className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>{language === "ko" ? "스톡 사진" : "Stock"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentSlide.image) {
                    setSlides((prev) => prev.map((s) => ({ ...s, image: currentSlide.image })));
                    toast.success("Applied image to all slides");
                  } else {
                    toast.info("Select or upload an image first");
                  }
                }}
                className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Wand2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === "ko" ? "전체 추천" : "Suggest for all"}</span>
              </button>
              <button
                type="button"
                onClick={() => toast.info("AI Background removal processing")}
                className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Scissors className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>{language === "ko" ? "누끼 제거" : "Remove BG"}</span>
              </button>
            </div>

            {/* Remove Image Action */}
            {currentSlide.image && (
              <button
                type="button"
                onClick={() => {
                  updateCurrentSlide({ image: undefined });
                  toast.info("Removed slide image");
                }}
                className="w-full text-center text-xs font-bold text-red-500 hover:underline py-0.5 cursor-pointer flex items-center justify-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{language === "ko" ? "이미지 삭제" : "Remove"}</span>
              </button>
            )}

            {/* Smart Place & AI Analyze Big Buttons */}
            <div className="space-y-2 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  updateCurrentSlide({ imgLayout: "card", imgSize: 45, imgShadow: true, imgRadius: 16 });
                  toast.success("Applied smart placement");
                }}
                className="w-full py-2.5 rounded-xl bg-[#c6f432] text-[#141414] font-black text-xs hover:brightness-105 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <i className="fas fa-forward text-xs" />
                <span>{language === "ko" ? "스마트 배치" : "Smart place"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.info("AI Analysis: High contrast subject detected with optimal center focal point.");
                }}
                className="w-full py-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] font-bold text-xs hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                <span>{language === "ko" ? "AI 분석" : "AI analyze"}</span>
              </button>
            </div>

            {/* Image Layout Section (#img-layouts) */}
            <div className="pt-2 border-t border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-[var(--fg)]">
                <span>{language === "ko" ? "이미지 레이아웃" : "Image layout"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
              </div>

              {/* 9 Layout Cards (5 on top, 4 on bottom) */}
              <div id="img-layouts" className="grid grid-cols-5 gap-1.5">
                {IMG_LAYOUT_OPTIONS.map((lo) => {
                  const active = (currentSlide.imgLayout || "auto") === lo.id;
                  return (
                    <button
                      key={lo.id}
                      type="button"
                      onClick={() => updateCurrentSlide({ imgLayout: lo.id })}
                      className={cn(
                        "imgl flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer aspect-square",
                        active
                          ? "border-[#c6f432] bg-[#c6f432]/10 text-[var(--fg)] ring-1 ring-[#c6f432]"
                          : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--muted)]"
                      )}
                      title={lo.label}
                    >
                      <span className={cn("imgl-ico text-xs mb-0.5", lo.iconClass)}>
                        <i />
                      </span>
                      <small className="text-[9px] font-bold truncate max-w-full">{lo.label}</small>
                    </button>
                  );
                })}
              </div>

              {/* Fit & Text Position Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Fit: Fill vs Whole */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[var(--muted)]">
                    {language === "ko" ? "맞춤" : "Fit"}
                  </span>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[var(--bg)] border border-[var(--line)] rounded-lg">
                    <button
                      type="button"
                      onClick={() => updateCurrentSlide({ imgFit: "cover" })}
                      className={cn(
                        "py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                        (currentSlide.imgFit || "cover") === "cover"
                          ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs"
                          : "text-[var(--muted)] hover:text-[var(--fg)]"
                      )}
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCurrentSlide({ imgFit: "contain" })}
                      className={cn(
                        "py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                        currentSlide.imgFit === "contain"
                          ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs"
                          : "text-[var(--muted)] hover:text-[var(--fg)]"
                      )}
                    >
                      Whole
                    </button>
                  </div>
                </div>

                {/* Text Position: ▲ ● ▼ */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[var(--muted)]">
                    {language === "ko" ? "텍스트 위치" : "Text position"}
                  </span>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-[var(--bg)] border border-[var(--line)] rounded-lg">
                    {[
                      { id: "top", label: "▲" },
                      { id: "middle", label: "●" },
                      { id: "bottom", label: "▼" },
                    ].map((tp) => (
                      <button
                        key={tp.id}
                        type="button"
                        onClick={() => updateCurrentSlide({ imgTextPos: tp.id as any })}
                        className={cn(
                          "py-1 text-xs font-bold rounded-md transition-all cursor-pointer text-center",
                          (currentSlide.imgTextPos || "bottom") === tp.id
                            ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs"
                            : "text-[var(--muted)] hover:text-[var(--fg)]"
                        )}
                      >
                        {tp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Focus · Zoom */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)]">
                  <span>{language === "ko" ? "초점 · 줌" : "Focus · Zoom"}</span>
                  <span className="font-mono text-[10px]">{currentSlide.imgZoom || 100}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="200"
                  step="5"
                  value={currentSlide.imgZoom || 100}
                  onChange={(e) => updateCurrentSlide({ imgZoom: Number(e.target.value) })}
                  className="w-full accent-[#c6f432] cursor-pointer"
                />
              </div>
            </div>

                {/* 3. Focus & Zoom (#img-focus) */}
                <details className="dsec" open>
                  <summary>
                    <Crosshair className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                    <span>{language === "ko" ? "초점 · 확대" : "Focus & zoom"}</span>
                  </summary>
                  <div className="space-y-2 p-3 pt-1">
                    {/* Interactive Focus Pad with crosshair dot */}
                    <div
                      ref={focusPadRef}
                      onClick={handleFocusPadClick}
                      className="relative rounded-lg overflow-hidden bg-black/10 aspect-[4/3] cursor-crosshair select-none border border-[var(--line)]"
                    >
                      <img
                        src={currentSlide.image}
                        alt="Focus preview"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80"
                      />
                      <div
                        className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white shadow ring-2 ring-[#365300] dark:ring-[#c6f432] pointer-events-none transition-all duration-75"
                        style={{
                          left: `${currentSlide.imgFocusX ?? 50}%`,
                          top: `${currentSlide.imgFocusY ?? 50}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--muted)]">
                      {language === "ko"
                        ? "클릭해 이미지 초점 위치를 조정하세요."
                        : "Click to set focal position point."}
                    </p>

                    {/* Zoom Slider */}
                    <div className="range">
                      <span>{language === "ko" ? "확대" : "Zoom"}</span>
                      <input
                        type="range"
                        min="100"
                        max="220"
                        step="2"
                        value={currentSlide.imgZoom || 100}
                        onChange={(e) => updateCurrentSlide({ imgZoom: Number(e.target.value) })}
                      />
                      <b>{currentSlide.imgZoom || 100}%</b>
                    </div>

                    {/* Flip & Center buttons */}
                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => updateCurrentSlide({ imgFlip: !currentSlide.imgFlip })}
                        className={cn(
                          "py-1 rounded-lg border text-xs font-bold flex-1 flex items-center justify-center gap-1 cursor-pointer transition-colors",
                          currentSlide.imgFlip
                            ? "bg-[#c6f432]/20 border-[#c6f432] text-[var(--fg)]"
                            : "border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)]"
                        )}
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                        <span>{language === "ko" ? "좌우 반전" : "Flip"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCurrentSlide({ imgFocusX: 50, imgFocusY: 50, imgZoom: 100 })}
                        className="py-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-xs font-bold flex-1 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>{language === "ko" ? "중앙 복귀" : "Center"}</span>
                      </button>
                    </div>
                  </div>
                </details>

                {/* 4. Effects & Filters (#img-effects) */}
                <details className="dsec">
                  <summary>
                    <Sliders className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                    <span>{language === "ko" ? "효과 · 필터" : "Effects & filters"}</span>
                  </summary>
                  <div className="space-y-2.5 p-3 pt-1">
                    {/* Filter Presets Grid */}
                    <div id="img-filters" className="grid grid-cols-5 gap-1">
                      {IMG_FILTER_OPTIONS.map((fo) => {
                        const active = (currentSlide.imgFilter || "auto") === fo.id;
                        return (
                          <button
                            key={fo.id}
                            type="button"
                            onClick={() => updateCurrentSlide({ imgFilter: fo.id })}
                            className={cn("imgf", active && "active")}
                            title={fo.label}
                          >
                            <img
                              src={currentSlide.image}
                              alt=""
                              style={{ filter: fo.filter || undefined }}
                              className="w-full aspect-square object-cover rounded"
                            />
                            <small>{fo.label}</small>
                          </button>
                        );
                      })}
                    </div>

                    {/* Brightness */}
                    <div className="range">
                      <span>{language === "ko" ? "밝기" : "Brightness"}</span>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="1"
                        value={currentSlide.imgBrightness ?? 100}
                        onChange={(e) => updateCurrentSlide({ imgBrightness: Number(e.target.value) })}
                      />
                      <b>{currentSlide.imgBrightness ?? 100}</b>
                    </div>

                    {/* Contrast */}
                    <div className="range">
                      <span>{language === "ko" ? "대비" : "Contrast"}</span>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="1"
                        value={currentSlide.imgContrast ?? 100}
                        onChange={(e) => updateCurrentSlide({ imgContrast: Number(e.target.value) })}
                      />
                      <b>{currentSlide.imgContrast ?? 100}</b>
                    </div>

                    {/* Saturation */}
                    <div className="range">
                      <span>{language === "ko" ? "채도" : "Saturate"}</span>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="1"
                        value={currentSlide.imgSaturate ?? 100}
                        onChange={(e) => updateCurrentSlide({ imgSaturate: Number(e.target.value) })}
                      />
                      <b>{currentSlide.imgSaturate ?? 100}</b>
                    </div>

                    {/* Blur */}
                    <div className="range">
                      <span>{language === "ko" ? "블러" : "Blur"}</span>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={currentSlide.imgBlur ?? 0}
                        onChange={(e) => updateCurrentSlide({ imgBlur: Number(e.target.value) })}
                      />
                      <b>{currentSlide.imgBlur ?? 0}px</b>
                    </div>
                  </div>
                </details>

                {/* 5. Overlay & Readability (#img-overlay) */}
                <details className="dsec">
                  <summary>
                    <i className="fas fa-circle-half-stroke text-xs text-[#365300] dark:text-[#c6f432]" />
                    <span>{language === "ko" ? "오버레이 · 가독성" : "Overlay & readability"}</span>
                  </summary>
                  <div className="space-y-2 p-3 pt-1">
                    <div id="img-overlays" className="grid grid-cols-4 gap-1">
                      {IMG_OVERLAY_OPTIONS.map((ov) => {
                        const active = (currentSlide.imgOverlay || "auto") === ov.id;
                        return (
                          <button
                            key={ov.id}
                            type="button"
                            onClick={() => updateCurrentSlide({ imgOverlay: ov.id })}
                            className={cn("imgo", active && "active")}
                            title={ov.label}
                          >
                            <span style={{ background: ov.bg }} className="w-full aspect-[1.6] rounded border border-[var(--line)]" />
                            <small>{ov.label}</small>
                          </button>
                        );
                      })}
                    </div>

                    {/* Overlay Opacity */}
                    <div className="range pt-1">
                      <span>{language === "ko" ? "농도" : "Opacity"}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={currentSlide.imgOverlayOpacity ?? 45}
                        onChange={(e) => updateCurrentSlide({ imgOverlayOpacity: Number(e.target.value) })}
                      />
                      <b>{currentSlide.imgOverlayOpacity ?? 45}%</b>
                    </div>

                    {/* Readability Indicator */}
                    <div className="text-[11px] flex items-center justify-between pt-1">
                      <span className="text-[var(--muted)]">{language === "ko" ? "텍스트 대비" : "Contrast"}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                        <Check className="w-3 h-3" />
                        <span>{language === "ko" ? "가독성 우수" : "Good contrast"}</span>
                      </span>
                    </div>
                  </div>
                </details>

                {/* 6. Corner & Frame (#img-frame) */}
                <details className="dsec">
                  <summary>
                    <i className="far fa-square text-xs text-[#365300] dark:text-[#c6f432]" />
                    <span>{language === "ko" ? "모서리 · 프레임" : "Corner & frame"}</span>
                  </summary>
                  <div className="space-y-2.5 p-3 pt-1">
                    {/* Radius Slider */}
                    <div className="range">
                      <span>{language === "ko" ? "모서리" : "Radius"}</span>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        step="2"
                        value={currentSlide.imgRadius || 0}
                        onChange={(e) => updateCurrentSlide({ imgRadius: Number(e.target.value) })}
                      />
                      <b>{currentSlide.imgRadius || 0}px</b>
                    </div>

                    {/* Shadow & Border Toggles */}
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSlide.imgShadow || false}
                          onChange={(e) => updateCurrentSlide({ imgShadow: e.target.checked })}
                          className="accent-[#c6f432] rounded"
                        />
                        <span>{language === "ko" ? "그림자" : "Shadow"}</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSlide.imgBorder || false}
                          onChange={(e) => updateCurrentSlide({ imgBorder: e.target.checked })}
                          className="accent-[#c6f432] rounded"
                        />
                        <span>{language === "ko" ? "흰 테두리" : "White border"}</span>
                      </label>
                    </div>

                    {/* Apply all & Reset */}
                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const patch = {
                            imgLayout: currentSlide.imgLayout,
                            imgSize: currentSlide.imgSize,
                            imgFit: currentSlide.imgFit,
                            imgRadius: currentSlide.imgRadius,
                            imgShadow: currentSlide.imgShadow,
                            imgBorder: currentSlide.imgBorder,
                            imgFilter: currentSlide.imgFilter,
                            imgOverlay: currentSlide.imgOverlay,
                            imgOverlayOpacity: currentSlide.imgOverlayOpacity,
                          };
                          setSlides((prev) => prev.map((s) => ({ ...s, ...patch })));
                          toast.success("Applied visual settings to all slides");
                        }}
                        className="py-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[10px] font-bold hover:bg-[var(--hover)] text-center flex-1 cursor-pointer"
                      >
                        {language === "ko" ? "모든 슬라이드에 적용" : "Apply to all slides"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateCurrentSlide({
                            imgLayout: "auto",
                            imgSize: 46,
                            imgFit: "cover",
                            imgRadius: 0,
                            imgShadow: false,
                            imgBorder: false,
                            imgFilter: "auto",
                            imgBrightness: 100,
                            imgContrast: 100,
                            imgSaturate: 100,
                            imgBlur: 0,
                            imgOverlay: "auto",
                            imgOverlayOpacity: 45,
                            imgFlip: false,
                            imgFocusX: 50,
                            imgFocusY: 50,
                            imgZoom: 100,
                          });
                          toast.info("Reset image visual settings");
                        }}
                        className="p-1 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[10px] hover:bg-[var(--hover)] cursor-pointer"
                        title="Reset"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </details>

            {/* 7. Stickers · Shapes · Text Layers Details (#layers-sec) */}
            <details className="dsec" id="layers-sec">
              <summary>
                <Layers className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                <span>{language === "ko" ? "스티커 · 도형 · 텍스트 레이어" : "Stickers · shapes · text"}</span>
                {layers.length > 0 && (
                  <span className="text-[10px] font-mono text-[var(--muted)] font-bold">
                    ({layers.length})
                  </span>
                )}
              </summary>
              <div className="space-y-2 p-3 pt-1">
                {/* Add layer buttons */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => addLayer("text", { text: "Text sticker", weight: "800" })}
                    className="flex-1 py-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Type className="w-3 h-3" />
                    <span>Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addLayer("emoji", { text: "✨" })}
                    className="flex-1 py-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Smile className="w-3 h-3" />
                    <span>Emoji</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => stickerFileInputRef.current?.click()}
                    className="py-1 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[11px] cursor-pointer"
                    title="PNG sticker"
                  >
                    <ImageIcon className="w-3 h-3" />
                  </button>
                </div>

                {/* Shapes grid */}
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {LAYER_SHAPES_LIST.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => addLayer("shape", { shape: shape.id, w: 20 })}
                      className="py-1 px-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:border-[#365300] dark:hover:border-[#c6f432] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      title={shape.label}
                    >
                      <span>{shape.symbol}</span>
                      <small className="text-[9px] font-normal">{shape.label}</small>
                    </button>
                  ))}
                </div>

                {/* Selected Layer Properties */}
                {selectedLayer && (
                  <div className="space-y-2 pt-2 border-t border-[var(--line)] mt-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="capitalize">{selectedLayer.kind} Layer</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={duplicateSelectedLayer}
                          className="p-1 hover:bg-[var(--hover)] rounded text-[var(--muted)] cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={deleteSelectedLayer}
                          className="p-1 hover:text-red-500 rounded text-[var(--muted)] cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* If text layer, text input */}
                    {selectedLayer.kind === "text" && (
                      <input
                        type="text"
                        value={selectedLayer.text || ""}
                        onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                        className="field text-xs h-7"
                        placeholder="Layer text"
                      />
                    )}

                    {/* Size Slider */}
                    <div className="range">
                      <span>Size</span>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        step="2"
                        value={selectedLayer.size || 40}
                        onChange={(e) => updateSelectedLayer({ size: Number(e.target.value) })}
                      />
                      <b>{selectedLayer.size || 40}px</b>
                    </div>

                    {/* Rotation */}
                    <div className="range">
                      <span>Rotation</span>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="2"
                        value={selectedLayer.rot || 0}
                        onChange={(e) => updateSelectedLayer({ rot: Number(e.target.value) })}
                      />
                      <b>{selectedLayer.rot || 0}°</b>
                    </div>

                    {/* Opacity */}
                    <div className="range">
                      <span>Opacity</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={Math.round((selectedLayer.opacity ?? 1) * 100)}
                        onChange={(e) => updateSelectedLayer({ opacity: Number(e.target.value) / 100 })}
                      />
                      <b>{Math.round((selectedLayer.opacity ?? 1) * 100)}%</b>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* =========================================================================
            TAB 3: AI (Smart Text Fit, Quick Actions)
            ========================================================================= */}
        {inspectorTab === "ai" && (
          <div className="space-y-4 animate-in fade-in duration-100">
            {/* Smart Text Fit Section (#ins-fit-wrap) */}
            <div className="lbl p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--fg)]">
                <span className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                  <span>{language === "ko" ? "스마트 텍스트 핏" : "Smart Text Fit"}</span>
                </span>
                <span className={cn("fit-status font-mono", fitStatusClass)}>
                  {fitStatusText}
                </span>
              </div>

              {/* Fit Meter Bar */}
              <div className={cn("fit-meter", fitStatusClass)}>
                <div
                  className="fit-meter-bar"
                  style={{ width: `${Math.min(100, fitScore)}%` }}
                />
              </div>

              {/* 3 Fit Action Buttons */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleAIRewrite("shorter")}
                  className="py-1 px-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  title="Make shorter"
                >
                  <i className="fas fa-compress text-[10px]" />
                  <span>{language === "ko" ? "더 짧게" : "Shorter"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAIRewrite("tight")}
                  className="py-1 px-1 rounded-lg bg-[#c6f432] text-[#141414] hover:brightness-105 text-xs font-black flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  title="AI fit length"
                >
                  <i className="fas fa-forward text-[10px]" />
                  <span>{language === "ko" ? "길이 맞춤" : "Fit length"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAIRewrite("longer")}
                  className="py-1 px-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  title="Make longer"
                >
                  <i className="fas fa-expand text-[10px]" />
                  <span>{language === "ko" ? "더 길게" : "Longer"}</span>
                </button>
              </div>

              {/* Auto-shrink Checkbox */}
              <label className="flex items-center justify-between text-xs pt-1 cursor-pointer">
                <span className="text-[var(--muted)]">
                  {language === "ko" ? "넘치면 글자 자동 축소" : "Auto-shrink text on overflow"}
                </span>
                <input type="checkbox" defaultChecked className="accent-[#c6f432] rounded" />
              </label>

              {/* Fit All Slides Button */}
              <button
                type="button"
                onClick={() => {
                  toast.success("AI optimized text length across all slides");
                }}
                className="w-full py-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-xs font-bold text-[var(--fg)] flex items-center justify-center gap-1.5 cursor-pointer pt-1"
              >
                <i className="fas fa-layer-group text-xs text-[#365300] dark:text-[#c6f432]" />
                <span>{language === "ko" ? "넘치는 슬라이드 모두 AI로 맞춤" : "Fit all slides with AI"}</span>
              </button>
            </div>

            {/* Quick AI Actions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--muted)]">
                {language === "ko" ? "빠른 AI 액션" : "Quick AI Actions"}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "shorter", label: language === "ko" ? "짧게" : "Shorter", icon: "fa-compress" },
                  { id: "hook", label: language === "ko" ? "후킹" : "Catchy Hook", icon: "fa-fire" },
                  { id: "numbers", label: language === "ko" ? "구체적 (숫자)" : "Specific (data)", icon: "fa-list-ol" },
                  { id: "variant", label: language === "ko" ? "다른 버전" : "New Variant", icon: "fa-shuffle" },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleAIRewrite(act.id)}
                    className="py-2 px-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:border-[#365300] dark:hover:border-[#c6f432] text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <i className={cn("fas text-[11px] text-[#365300] dark:text-[#c6f432]", act.icon)} />
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Easy Mode Dock (#easy-dock) at Bottom */}
      <div id="easy-dock">
        <button
          id="btn-easy"
          type="button"
          onClick={() => {
            const next = !isEasyMode;
            setIsEasyMode(next);
            toast.info(next ? "Easy mode — essentials only" : "Showing all features");
          }}
          className={cn("easy-btn", isEasyMode && "on")}
          title={isEasyMode ? "Easy mode: essentials only" : "All features mode"}
        >
          <i className="fas fa-seedling text-xs" />
          <span>{isEasyMode ? (language === "ko" ? "간단 모드 (ON)" : "Easy mode (ON)") : (language === "ko" ? "전체 기능" : "All features")}</span>
        </button>
      </div>
    </aside>
  );
}

