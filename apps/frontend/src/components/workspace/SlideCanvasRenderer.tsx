"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { SlideData } from "./SwiperaStudioWorkspace";

interface SlideCanvasRendererProps {
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
}

export function SlideCanvasRenderer({
  slide,
  slideIndex,
  totalSlides,
  aspectRatio,
  templateId = "hero",
  activeScheme,
  titleFont,
  bodyFont,
  brand,
  site,
  swipeText = "Swipe →",
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
  isInteractive = false,
  onUpdateSlide,
  nativeW,
  nativeH,
}: SlideCanvasRendererProps) {
  // Preset filters
  const filterPresets: Record<string, string> = {
    none: "",
    mono: "grayscale(1) contrast(1.08)",
    duotone: "grayscale(1) contrast(1.15) brightness(1.05)",
    warm: "sepia(0.35) saturate(1.25) contrast(1.03)",
    cool: "saturate(0.9) hue-rotate(190deg)",
    vivid: "saturate(1.4) contrast(1.08)",
    film: "contrast(1.1) brightness(1.02) saturate(0.95) sepia(0.12)",
    dramatic: "contrast(1.3) saturate(1.1) brightness(0.95)",
    fade: "contrast(0.9) brightness(1.08) saturate(0.85)",
    invert: "invert(1)",
  };

  const adjustments: string[] = [];
  if (slide.imgBrightness !== undefined && slide.imgBrightness !== 100) {
    adjustments.push(`brightness(${slide.imgBrightness / 100})`);
  }
  if (slide.imgContrast !== undefined && slide.imgContrast !== 100) {
    adjustments.push(`contrast(${slide.imgContrast / 100})`);
  }
  if (slide.imgSaturate !== undefined && slide.imgSaturate !== 100) {
    adjustments.push(`saturate(${slide.imgSaturate / 100})`);
  }
  if (slide.imgBlur) {
    adjustments.push(`blur(${slide.imgBlur}px)`);
  }
  const presetFilter = filterPresets[slide.imgFilter || "none"] || "";
  const combinedFilter = [presetFilter, ...adjustments].filter(Boolean).join(" ");

  // Overlays
  const overlayOpacity = (slide.imgOverlayOpacity ?? 45) / 100;
  const getOverlayStyle = (): React.CSSProperties | null => {
    switch (slide.imgOverlay) {
      case "dark":
        return { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` };
      case "light":
        return { backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})` };
      case "grad-b":
        return {
          backgroundImage: `linear-gradient(180deg, transparent 20%, rgba(0, 0, 0, ${Math.min(1, overlayOpacity * 1.9)}))`,
        };
      case "grad-t":
        return {
          backgroundImage: `linear-gradient(0deg, transparent 20%, rgba(0, 0, 0, ${Math.min(1, overlayOpacity * 1.9)}))`,
        };
      case "accent":
        return {
          backgroundColor: activeScheme.a,
          opacity: overlayOpacity,
          mixBlendMode: "multiply",
        };
      case "accent-grad":
        return {
          backgroundImage: `linear-gradient(160deg, ${activeScheme.a} 0%, transparent 70%)`,
          opacity: Math.min(1, overlayOpacity * 1.6),
        };
      default:
        return null;
    }
  };

  const imageTransformStyle: React.CSSProperties = {
    objectPosition: `${slide.imgFocusX ?? 50}% ${slide.imgFocusY ?? 50}%`,
    transformOrigin: `${slide.imgFocusX ?? 50}% ${slide.imgFocusY ?? 50}%`,
    transform: [
      slide.imgZoom && slide.imgZoom !== 100 ? `scale(${slide.imgZoom / 100})` : "",
      slide.imgFlip ? "scaleX(-1)" : "",
    ].filter(Boolean).join(" ") || undefined,
    filter: combinedFilter || undefined,
    objectFit: (slide.imgFit || "cover") as "cover" | "contain",
  };

  const isPhotoTemplate = ["hero", "editorial", "glass", "gradient"].includes(templateId);
  const imgLayout = slide.imgLayout || "auto";
  const hasImage = Boolean(slide.image);
  const effectiveLayout =
    imgLayout === "auto"
      ? (isPhotoTemplate || slideIndex === 0 || slide.type === "cover" ? "full" : "top")
      : imgLayout;

  // Chart Rendering
  const renderChart = () => {
    const chart = slide.chart;
    if (!chart || !Array.isArray(chart.items) || chart.items.length === 0) return null;
    const items = chart.items.slice(0, 8);
    const unit = chart.unit || "";
    const kind = chart.kind || "bar";
    const maxVal = Math.max(...items.map((i) => Math.abs(i.value)), 1e-9);
    const w = 912;
    const h = kind === "hbar" ? Math.min(560, 70 * items.length + 40) : 520;

    if (kind === "bar") {
      const n = items.length;
      const gap = 28;
      const barW = (w - gap * (n + 1)) / n;
      const baseline = h - 70;
      return (
        <div className="w-full my-6 flex justify-center">
          <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
            {items.map((item, i) => {
              const barH = Math.max(6, (Math.abs(item.value) / maxVal) * (baseline - 80));
              const x = gap + i * (barW + gap);
              const y = baseline - barH;
              const fill = i === 0 ? activeScheme.a : "rgba(255,255,255,0.22)";
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={barH} rx={14} fill={fill} />
                  <text
                    x={x + barW / 2}
                    y={y - 18}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize={32}
                    fontWeight={900}
                    fontFamily={titleFont}
                  >
                    {item.value}{unit}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={baseline + 44}
                    textAnchor="middle"
                    fill="currentColor"
                    opacity={0.75}
                    fontSize={26}
                    fontFamily={bodyFont}
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
            <line x1={0} y1={baseline} x2={w} y2={baseline} stroke="currentColor" strokeWidth={2} opacity={0.3} />
          </svg>
        </div>
      );
    }

    if (kind === "hbar") {
      const rowH = (h - 20) / items.length;
      const labelW = 220;
      return (
        <div className="w-full my-6 flex justify-center">
          <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
            {items.map((item, i) => {
              const barW = Math.max(8, (Math.abs(item.value) / maxVal) * (w - labelW - 160));
              const y = 10 + i * rowH;
              const fill = i === 0 ? activeScheme.a : "rgba(255,255,255,0.22)";
              return (
                <g key={i}>
                  <text
                    x={labelW - 20}
                    y={y + rowH / 2 + 10}
                    textAnchor="end"
                    fill="currentColor"
                    opacity={0.8}
                    fontSize={28}
                    fontFamily={bodyFont}
                  >
                    {item.label}
                  </text>
                  <rect x={labelW} y={y + rowH * 0.2} width={barW} height={rowH * 0.6} rx={12} fill={fill} />
                  <text
                    x={labelW + barW + 18}
                    y={y + rowH / 2 + 10}
                    fill="currentColor"
                    fontSize={28}
                    fontWeight={900}
                    fontFamily={titleFont}
                  >
                    {item.value}{unit}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }

    if (kind === "line") {
      const n = items.length;
      const padX = 50;
      const baseline = h - 70;
      const points = items.map((item, i) => [
        padX + (i * (w - padX * 2)) / Math.max(1, n - 1),
        baseline - (Math.abs(item.value) / maxVal) * (baseline - 90),
      ]);
      const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
      const areaD = `${pathD} L${points[points.length - 1][0].toFixed(1)} ${baseline} L${points[0][0].toFixed(1)} ${baseline} Z`;
      return (
        <div className="w-full my-6 flex justify-center">
          <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
            <path d={areaD} fill={activeScheme.a} opacity={0.16} />
            <path d={pathD} fill="none" stroke={activeScheme.a} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r={14} fill={activeScheme.bg} stroke={activeScheme.a} strokeWidth={8} />
                <text
                  x={p[0]}
                  y={p[1] - 28}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize={28}
                  fontWeight={900}
                  fontFamily={titleFont}
                >
                  {items[i].value}{unit}
                </text>
                <text
                  x={p[0]}
                  y={baseline + 44}
                  textAnchor="middle"
                  fill="currentColor"
                  opacity={0.75}
                  fontSize={24}
                  fontFamily={bodyFont}
                >
                  {items[i].label}
                </text>
              </g>
            ))}
            <line x1={0} y1={baseline} x2={w} y2={baseline} stroke="currentColor" strokeWidth={2} opacity={0.3} />
          </svg>
        </div>
      );
    }

    // Donut chart
    const total = items.reduce((acc, curr) => acc + Math.abs(curr.value), 0) || 1;
    const cx = 260;
    const cy = h / 2;
    const r = 180;
    const strokeWidth = 60;
    let startAngle = -Math.PI / 2;

    return (
      <div className="w-full my-6 flex justify-center">
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
          {items.map((item, i) => {
            const angle = (Math.abs(item.value) / total) * Math.PI * 2;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            startAngle += angle;
            const x2 = cx + r * Math.cos(startAngle);
            const y2 = cy + r * Math.sin(startAngle);
            const largeArc = angle > Math.PI ? 1 : 0;
            const strokeColor = i === 0 ? activeScheme.a : "currentColor";
            const opacity = i === 0 ? 1 : Math.max(0.2, 0.75 - i * 0.15);
            return (
              <path
                key={i}
                d={`M${x1} ${y1} A${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
              />
            );
          })}
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize={42} fontWeight={900} fill="currentColor" fontFamily={titleFont}>
            {items[0].value}{unit}
          </text>
          {items.map((item, i) => {
            const legendY = cy - (items.length * 56) / 2 + i * 56 + 20;
            const swatchFill = i === 0 ? activeScheme.a : "currentColor";
            const swatchOpacity = i === 0 ? 1 : Math.max(0.2, 0.75 - i * 0.15);
            const pct = Math.round((Math.abs(item.value) / total) * 100);
            return (
              <g key={i} transform={`translate(540, ${legendY})`}>
                <rect width={24} height={24} rx={6} fill={swatchFill} opacity={swatchOpacity} />
                <text x={38} y={20} fill="currentColor" opacity={0.85} fontSize={26} fontFamily={bodyFont}>
                  {item.label}
                </text>
                <text x={w - 560} y={20} textAnchor="end" fill="currentColor" fontWeight={900} fontSize={26} fontFamily={titleFont}>
                  {pct}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Table Rendering
  const renderTable = () => {
    const table = slide.table;
    if (!table || !Array.isArray(table.cols) || table.cols.length === 0) return null;
    const cols = table.cols.slice(0, 3);
    const rows = (table.rows || []).slice(0, 6);

    const isYes = (val: string) => /^(o|✓|✔|yes|가능|포함|있음)$/i.test(String(val).trim());
    const isNo = (val: string) => /^(x|✕|✗|no|불가|미포함|없음|-)$/i.test(String(val).trim());

    return (
      <div className="w-full my-6 overflow-hidden rounded-2xl border-2 border-current/20 bg-black/10 backdrop-blur-sm">
        <table className="w-full border-collapse text-left" style={{ fontSize: "28px" }}>
          <thead>
            <tr className="border-b-2 border-current/20 bg-current/5">
              {cols.map((col, cIdx) => (
                <th key={cIdx} className="p-4 font-black tracking-wide" style={{ fontFamily: titleFont }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-current/10 last:border-b-0">
                <td className="p-4 font-bold opacity-90" style={{ fontFamily: titleFont }}>
                  {row[0] || ""}
                </td>
                {row.slice(1, cols.length).map((val, vIdx) => {
                  const check = isYes(val);
                  const cross = isNo(val);
                  return (
                    <td key={vIdx} className="p-4">
                      {check ? (
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-black"
                          style={{ backgroundColor: activeScheme.a }}
                        >
                          ✓
                        </span>
                      ) : cross ? (
                        <span className="opacity-40 font-mono text-3xl">—</span>
                      ) : (
                        <span className="opacity-80">{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Stat Rendering
  const renderStat = () => {
    if (!slide.stat && slide.type !== "stat") return null;
    return (
      <div className="my-6">
        <div
          className="font-black tracking-tight"
          style={{
            fontFamily: titleFont,
            fontSize: "140px",
            lineHeight: 0.95,
            color: activeScheme.a,
          }}
          contentEditable={isInteractive}
          suppressContentEditableWarning
          onBlur={(e) => onUpdateSlide?.({ stat: e.currentTarget.textContent || "" })}
        >
          {slide.stat || "87%"}
        </div>
      </div>
    );
  };

  // List Rendering
  const renderList = () => {
    if (!slide.items || slide.items.length === 0) return null;
    return (
      <ul className="w-full space-y-4 my-6">
        {slide.items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs"
          >
            <span
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-xl"
              style={{ backgroundColor: activeScheme.a }}
            >
              {idx + 1}
            </span>
            <span
              className="flex-1 text-3xl font-medium leading-relaxed pt-1"
              contentEditable={isInteractive}
              suppressContentEditableWarning
              onBlur={(e) => {
                const nextItems = [...slide.items!];
                nextItems[idx] = e.currentTarget.textContent || "";
                onUpdateSlide?.({ items: nextItems });
              }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Layers Overlay (stickers, emoji, shapes, text layers)
  const renderLayers = () => {
    if (!slide.layers || slide.layers.length === 0) return null;
    return (
      <div className="absolute inset-0 pointer-events-none z-20">
        {slide.layers.map((layer: any) => {
          const kind = layer.kind || layer.type || "text";
          const rot = layer.rot || layer.rotation || 0;
          const sz = layer.size || layer.w || 36;
          const rawOpacity = layer.opacity ?? 100;
          const op = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;
          const col = layer.color || activeScheme.a;

          return (
            <div
              key={layer.id}
              className="absolute select-none pointer-events-none"
              style={{
                top: `${layer.y}%`,
                left: `${layer.x}%`,
                transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                opacity: op,
                color: col,
              }}
            >
              {kind === "emoji" && (
                <span style={{ fontSize: `${sz * 1.8}px` }}>{layer.text || layer.content || "✨"}</span>
              )}
              {(kind === "image" || kind === "sticker") && (layer.src || layer.content) && (
                <img
                  src={layer.src || layer.content}
                  alt="Sticker"
                  style={{ width: `${sz * 2.5}px`, height: `${sz * 2.5}px`, objectFit: "contain" }}
                />
              )}
              {kind === "shape" && (
                <div
                  style={{
                    width: `${sz * 2.5}px`,
                    height: `${sz * 2.5}px`,
                    backgroundColor: col,
                    borderRadius:
                      (layer.shape || layer.content) === "circle"
                        ? "50%"
                        : (layer.shape || layer.content) === "badge"
                        ? "18px"
                        : "8px",
                  }}
                />
              )}
              {kind === "text" && (
                <span
                  className="font-black px-4 py-2 rounded-xl backdrop-blur-md"
                  style={{
                    fontSize: `${sz}px`,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: col,
                  }}
                >
                  {layer.text || layer.content || ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Image frame for top, bottom, left, right, card, circle, polaroid
  const renderFramedImage = () => {
    if (!hasImage) return null;
    const isPolaroid = effectiveLayout === "polaroid";
    const isCircle = effectiveLayout === "circle";
    const isCard = effectiveLayout === "card";

    let wrapStyle: React.CSSProperties = {
      position: "relative",
      overflow: "hidden",
      borderRadius: !isCircle && !isPolaroid ? `${slide.imgRadius ?? 24}px` : undefined,
      boxShadow: slide.imgShadow ? "0 24px 48px rgba(0,0,0,0.35)" : undefined,
      border: slide.imgBorder && !isCircle ? `4px solid ${activeScheme.a}` : undefined,
    };

    if (effectiveLayout === "top" || effectiveLayout === "bottom") {
      wrapStyle.height = `${slide.imgSize || 46}%`;
      wrapStyle.width = "100%";
      wrapStyle.margin = "16px 0";
      wrapStyle.flexShrink = 0;
    } else if (effectiveLayout === "left" || effectiveLayout === "right") {
      wrapStyle.width = `${slide.imgSize || 46}%`;
      wrapStyle.height = "100%";
      wrapStyle.flexShrink = 0;
    } else if (isCircle) {
      wrapStyle.width = `${(slide.imgSize || 52) * 8}px`;
      wrapStyle.height = `${(slide.imgSize || 52) * 8}px`;
      wrapStyle.borderRadius = "50%";
      wrapStyle.border = `14px solid ${activeScheme.a}`;
      wrapStyle.margin = "16px auto";
    } else if (isPolaroid) {
      wrapStyle.width = `${(slide.imgSize || 56) * 8}px`;
      wrapStyle.height = `${(slide.imgSize || 56) * 9.5}px`;
      wrapStyle.backgroundColor = "#ffffff";
      wrapStyle.padding = "24px 24px 80px 24px";
      wrapStyle.boxShadow = "0 20px 50px rgba(0,0,0,0.3)";
      wrapStyle.transform = "rotate(-1.5deg)";
      wrapStyle.margin = "16px auto";
    } else if (isCard) {
      wrapStyle.width = `${(slide.imgSize || 42) * 12}px`;
      wrapStyle.height = `${(slide.imgSize || 42) * 9}px`;
      wrapStyle.borderRadius = "32px";
      wrapStyle.boxShadow = "0 30px 60px rgba(0,0,0,0.35)";
      wrapStyle.border = "2px solid rgba(255,255,255,0.2)";
      wrapStyle.margin = "16px auto";
    }

    return (
      <div className={cn("c-img", isPolaroid && "polaroid-wrap")} style={wrapStyle}>
        <img
          src={slide.image}
          alt={slide.title || "Slide Image"}
          className="w-full h-full select-none pointer-events-none"
          style={imageTransformStyle}
        />
        {getOverlayStyle() && (
          <div className="absolute inset-0 pointer-events-none" style={getOverlayStyle()!} />
        )}
        {isPolaroid && (
          <div className="absolute bottom-5 left-6 right-6 text-center font-bold text-2xl text-slate-800 tracking-wider font-mono">
            {slide.title || "Daily Moments"}
          </div>
        )}
      </div>
    );
  };

  // Main Text Length Classes
  const titleLen = slide.title?.length || 0;
  const bodyLen = slide.body?.length || 0;

  // Render Full Bleed Image Layout (matching Swipera Image 2)
  if (hasImage && effectiveLayout === "full") {
    return (
      <article
        className={cn(
          "card",
          `tpl-${templateId}`,
          `type-${slide.type || (slideIndex === 0 ? "cover" : "content")}`,
          `ratio-${aspectRatio.replace(":", "-")}`,
          "has-img img-explicit img-full select-text"
        )}
        style={{
          width: `${nativeW}px`,
          height: `${nativeH}px`,
          position: "relative",
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: aspectRatio === "9:16" ? "110px 84px" : "84px",
          backgroundColor: activeScheme.bg || "#141414",
          color: activeScheme.fg || "#ffffff",
          fontFamily: bodyFont,
          lineHeight: 1.2,
          wordBreak: "keep-all",
        }}
        data-index={slideIndex}
      >
        {/* Full Bleed Image Frame */}
        <div className="c-img" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src={slide.image}
            alt={slide.title || "Slide Image"}
            className="w-full h-full select-none pointer-events-none"
            style={imageTransformStyle}
          />
          {/* Authentic Swipera Hero Gradient Overlay */}
          <div
            className="deco hero-grad"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 28%, transparent 40%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.92) 100%)",
              pointerEvents: "none",
            }}
          />
          {getOverlayStyle() && (
            <div className="absolute inset-0 pointer-events-none z-[1]" style={getOverlayStyle()!} />
          )}
        </div>

        {/* Top Header (Label & Brand watermark) */}
        <header className="c-top" style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            className="c-label"
            contentEditable={isInteractive}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateSlide?.({ label: e.currentTarget.textContent || "" })}
            style={{
              background: "#ffffff24",
              border: "2px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(10px)",
              padding: "8px 24px",
              borderRadius: "999px",
              fontSize: "24px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {slide.label || (slideIndex === 0 ? "FIND" : `SLIDE ${slideIndex + 1}`)}
          </span>
          <span className="c-brand" style={{ fontSize: "26px", fontWeight: 500, color: "rgba(255,255,255,0.85)", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            {brand || "@theabreed"}
          </span>
        </header>

        {/* Main Center / Bottom Content */}
        <div
          className="c-main"
          style={{
            position: "relative",
            zIndex: 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: slide.imgTextPos === "top" ? "flex-start" : slide.imgTextPos === "middle" ? "center" : "flex-end",
            gap: "24px",
            minHeight: 0,
            textAlign: textAlign || "left",
          }}
        >
          {slide.emoji && (
            <div className="c-emoji" style={{ fontSize: "84px", lineHeight: 1 }}>
              {slide.emoji}
            </div>
          )}
          {renderStat()}
          <h2
            className={cn(
              "c-title",
              titleLen > 30 ? "len-l" : titleLen > 18 ? "len-m" : ""
            )}
            contentEditable={isInteractive}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateSlide?.({ title: e.currentTarget.textContent || "" })}
            style={{
              fontFamily: titleFont,
              color: "#ffffff",
              fontWeight: titleWeight || 800,
              fontSize: aspectRatio === "1:1" ? "88px" : "80px",
              letterSpacing: `${tracking}em`,
              lineHeight: leading || 1.15,
              textTransform: titleCase === "uppercase" ? "uppercase" : "none",
              textShadow: "0 6px 30px rgba(0,0,0,0.6)",
              margin: 0,
            }}
          >
            {slide.title || (slideIndex === 0 ? "브라우저에서 음성 AI가 작동할까?" : "Catchy Slide Title")}
          </h2>
          {(slide.body || slideIndex === 0) && (
            <p
              className={cn("c-body", bodyLen > 100 ? "len-l" : "")}
              contentEditable={isInteractive}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateSlide?.({ body: e.currentTarget.textContent || "" })}
              style={{
                fontFamily: bodyFont,
                color: "rgba(255,255,255,0.92)",
                fontSize: "36px",
                lineHeight: 1.5,
                fontWeight: 500,
                textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                margin: 0,
              }}
            >
              {slide.body || (slideIndex === 0 ? "31.7MB 크기의 모델 데모가 그 해답을 보여줍니다." : "")}
            </p>
          )}
          {renderChart()}
          {renderTable()}
          {renderList()}
        </div>

        {/* Layers */}
        {renderLayers()}

        {/* Footer */}
        <footer className="c-bottom" style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "20px" }}>
          <span className="c-page" style={{ fontSize: "26px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            {slideIndex + 1} / {totalSlides}
          </span>
          <span className="c-site" style={{ fontSize: "26px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            {site || "TechCrunch"}
          </span>
          <span
            className="c-swipe"
            style={{
              background: activeScheme.a || "#c6f432",
              color: "#141414",
              padding: "8px 24px",
              borderRadius: "999px",
              fontSize: "24px",
              fontWeight: 800,
              display: (slideIndex < totalSlides - 1 || totalSlides === 1) ? "inline-flex" : "none",
            }}
          >
            {swipeText || "Swipe →"}
          </span>
        </footer>
      </article>
    );
  }

  // Standard or Framed Layouts (top, bottom, left, right, card, circle, polaroid)
  return (
    <article
      className={cn(
        "card",
        `tpl-${templateId}`,
        `type-${slide.type || (slideIndex === 0 ? "cover" : "content")}`,
        `ratio-${aspectRatio.replace(":", "-")}`,
        hasImage ? `has-img img-explicit img-${effectiveLayout}` : "no-img",
        "select-text"
      )}
      style={{
        width: `${nativeW}px`,
        height: `${nativeH}px`,
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: aspectRatio === "9:16" ? "110px 84px" : "84px",
        backgroundColor: activeScheme.bg || "#141414",
        backgroundImage: isGradientBg
          ? `linear-gradient(${gradientAngle}deg, ${activeScheme.bg}, ${gradientEndColor})`
          : undefined,
        color: activeScheme.fg || "#ffffff",
        fontFamily: bodyFont,
        lineHeight: 1.2,
        wordBreak: "keep-all",
      }}
      data-index={slideIndex}
    >
      {/* Top Header */}
      <header className="c-top" style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          className="c-label"
          contentEditable={isInteractive}
          suppressContentEditableWarning
          onBlur={(e) => onUpdateSlide?.({ label: e.currentTarget.textContent || "" })}
          style={{
            border: `2px solid ${activeScheme.a || "#c6f432"}`,
            color: activeScheme.a || "#c6f432",
            padding: "6px 20px",
            borderRadius: "8px",
            fontSize: "26px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {slide.label || (slideIndex === 0 ? "ACTION" : `STEP ${slideIndex}`)}
        </span>
        <div className="flex items-center gap-3">
          {brand && (
            <span className="c-brand" style={{ fontSize: "26px", fontWeight: 500, color: "var(--muted)", opacity: 0.8 }}>
              {brand}
            </span>
          )}
          <span className="c-page" style={{ fontSize: "26px", fontWeight: 500, color: "var(--muted)", opacity: 0.8 }}>
            {slideIndex + 1} / {totalSlides}
          </span>
        </div>
      </header>

      {/* If layout is Top: Framed Image at Top */}
      {hasImage && effectiveLayout === "top" && renderFramedImage()}

      {/* Main Content Area */}
      <div
        className={cn(
          "c-main",
          (effectiveLayout === "left" || effectiveLayout === "right") && "flex-row items-center gap-8"
        )}
        style={{
          position: "relative",
          zIndex: 3,
          flex: 1,
          display: "flex",
          flexDirection: effectiveLayout === "left" ? "row" : effectiveLayout === "right" ? "row-reverse" : "column",
          justifyContent: "center",
          gap: "28px",
          minHeight: 0,
          textAlign: textAlign || "left",
        }}
      >
        {/* Left or Right framed image */}
        {hasImage && (effectiveLayout === "left" || effectiveLayout === "right") && renderFramedImage()}

        {/* Center Card, Circle, or Polaroid image */}
        {hasImage && (effectiveLayout === "card" || effectiveLayout === "circle" || effectiveLayout === "polaroid") && renderFramedImage()}

        <div className="flex-1 flex flex-col justify-center">
          {slide.emoji && (
            <div className="c-emoji mb-3 select-none" style={{ fontSize: "84px", lineHeight: 1 }}>
              {slide.emoji}
            </div>
          )}

          {renderStat()}

          <h2
            className={cn(
              "c-title",
              titleLen > 30 ? "len-l" : titleLen > 18 ? "len-m" : ""
            )}
            contentEditable={isInteractive}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateSlide?.({ title: e.currentTarget.textContent || "" })}
            style={{
              fontFamily: titleFont,
              color: activeScheme.fg || "#ffffff",
              fontSize: aspectRatio === "1:1" ? "84px" : "76px",
              letterSpacing: `${tracking}em`,
              lineHeight: leading || 1.15,
              fontWeight: titleWeight || 900,
              textTransform: titleCase === "uppercase" ? "uppercase" : "none",
              textShadow: hasTitleShadow ? "0 4px 10px rgba(0,0,0,0.3)" : undefined,
              margin: 0,
            }}
          >
            {slide.title}
          </h2>

          {slide.body && (
            <p
              className={cn("c-body", bodyLen > 100 ? "len-l" : "")}
              contentEditable={isInteractive}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateSlide?.({ body: e.currentTarget.textContent || "" })}
              style={{
                fontFamily: bodyFont,
                color: activeScheme.fg || "#ffffff",
                opacity: 0.85,
                fontSize: "36px",
                lineHeight: 1.55,
                fontWeight: 500,
                marginTop: "16px",
                margin: 0,
              }}
            >
              {slide.body}
            </p>
          )}

          {renderChart()}
          {renderTable()}
          {renderList()}
        </div>
      </div>

      {/* If layout is Bottom: Framed Image at Bottom */}
      {hasImage && effectiveLayout === "bottom" && renderFramedImage()}

      {/* Layers */}
      {renderLayers()}

      {/* Bottom Footer */}
      <footer className="c-bottom" style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="c-page" style={{ fontSize: "26px", fontWeight: 500, color: "var(--muted)", opacity: 0.8 }}>
          {slideIndex + 1} / {totalSlides}
        </span>
        <span className="c-site" style={{ fontSize: "26px", fontWeight: 500, color: "var(--muted)", opacity: 0.8 }}>
          {site || "TechCrunch"}
        </span>
        <span
          className="c-swipe"
          style={{
            color: activeScheme.a || "#c6f432",
            fontSize: "26px",
            fontWeight: 800,
            display: (slideIndex < totalSlides - 1 || totalSlides === 1) ? "inline-flex" : "none",
          }}
        >
          {swipeText || "Swipe →"}
        </span>
      </footer>
    </article>
  );
}
