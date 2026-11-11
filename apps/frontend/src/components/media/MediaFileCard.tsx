"use client";

import React, { useState, useEffect, useRef } from "react";
import { MediaItem } from "@/lib/mock/media-data";
import { cn } from "@/lib/utils";

interface MediaFileCardProps {
  item: MediaItem;
  isSelected: boolean;
  isMenuOpen: boolean;
  onSelectToggle?: (e: React.MouseEvent) => void;
  onOpenModal: (item: MediaItem) => void;
  onToggleMenu: (e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onDeleteItem: (id: string) => void;
  onCopyUrl: (url: string) => void;
}

// Crisp SVGs for all document & media content types matching target design
export function RenderDocumentIcon({ ext }: { ext?: MediaItem["fileExt"] }) {
  switch (ext) {
    case "png":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#031E2B"
              stroke="#0284C7"
              strokeWidth="1.3"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#38BDF8"
              opacity="0.95"
            />
            <circle cx="14" cy="22" r="2" fill="#38BDF8" />
            <path d="M10 32 L18 24 L24 30 L27 27 L31 32 Z" fill="#38BDF8" opacity="0.9" />
            <text
              x="20"
              y="43"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              PNG
            </text>
          </svg>
        </div>
      );

    case "jpg":
    case "jpeg":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#2A1205"
              stroke="#EA580C"
              strokeWidth="1.3"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#FB923C"
              opacity="0.95"
            />
            <circle cx="14" cy="22" r="2" fill="#FB923C" />
            <path d="M10 32 L18 24 L24 30 L27 27 L31 32 Z" fill="#FB923C" opacity="0.9" />
            <text
              x="20"
              y="43"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              JPG
            </text>
          </svg>
        </div>
      );

    case "mp4":
    case "mov":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#4C1D95"
              stroke="#8B5CF6"
              strokeWidth="1.3"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#8B5CF6"
              opacity="0.95"
            />
            <polygon points="17,21 27,27 17,33" fill="#FFFFFF" />
            <text
              x="20"
              y="43"
              fill="#FFFFFF"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              MP4
            </text>
          </svg>
        </div>
      );

    case "mp3":
    case "wav":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#064E3B"
              stroke="#059669"
              strokeWidth="1.3"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#34D399"
              opacity="0.95"
            />
            <rect x="11" y="24" width="2" height="8" rx="1" fill="#34D399" />
            <rect x="15" y="21" width="2" height="14" rx="1" fill="#34D399" />
            <rect x="19" y="19" width="2" height="18" rx="1" fill="#34D399" />
            <rect x="23" y="22" width="2" height="12" rx="1" fill="#34D399" />
            <rect x="27" y="25" width="2" height="6" rx="1" fill="#34D399" />
            <text
              x="20"
              y="43"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              MP3
            </text>
          </svg>
        </div>
      );

    case "webp":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#1E1B4B"
              stroke="#6366F1"
              strokeWidth="1.3"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#818CF8"
              opacity="0.95"
            />
            <circle cx="14" cy="22" r="2" fill="#818CF8" />
            <path d="M10 32 L18 24 L24 30 L27 27 L31 32 Z" fill="#818CF8" opacity="0.9" />
            <text
              x="20"
              y="43"
              fill="#FFFFFF"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              WEBP
            </text>
          </svg>
        </div>
      );

    case "svg":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#451A03"
              stroke="#D97706"
              strokeWidth="1.3"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#F59E0B"
              opacity="0.95"
            />
            <circle cx="15" cy="22" r="2.5" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="26" cy="26" r="2.5" stroke="#F59E0B" strokeWidth="1.5" />
            <line x1="16.5" y1="23.5" x2="24.5" y2="25" stroke="#F59E0B" strokeWidth="1.5" />
            <text
              x="20"
              y="43"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              SVG
            </text>
          </svg>
        </div>
      );

    case "pdf":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#DC2626"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#EF4444"
              opacity="0.95"
            />
            <text
              x="20"
              y="33.5"
              fill="#FFFFFF"
              fontSize="11.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              PDF
            </text>
          </svg>
        </div>
      );

    case "docx":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#F1F5F9"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            {/* Subtle horizontal text lines */}
            <line x1="24" y1="22" x2="33" y2="22" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="27" x2="33" y2="27" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="32" x2="33" y2="32" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            {/* Blue "W" badge */}
            <rect x="5.5" y="21" width="15" height="17" rx="2.5" fill="#2563EB" />
            <text
              x="13"
              y="33.5"
              fill="#FFFFFF"
              fontSize="10.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              W
            </text>
          </svg>
        </div>
      );

    case "psd":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#031628"
              stroke="#0284C7"
              strokeWidth="1.3"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#0284C7"
              opacity="0.95"
            />
            <text
              x="20"
              y="29.5"
              fill="#38BDF8"
              fontSize="14.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              Ps
            </text>
            <text
              x="20"
              y="42"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.05em"
            >
              PSD
            </text>
          </svg>
        </div>
      );

    case "ai":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#1C1105"
              stroke="#D97706"
              strokeWidth="1.3"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#D97706"
              opacity="0.95"
            />
            <text
              x="20"
              y="29.5"
              fill="#F59E0B"
              fontSize="14.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              Ai
            </text>
            <text
              x="20"
              y="42"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.05em"
            >
              AI
            </text>
          </svg>
        </div>
      );

    case "xlsx":
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#F1F5F9"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            <line x1="24" y1="22" x2="33" y2="22" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="27" x2="33" y2="27" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="32" x2="33" y2="32" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="5.5" y="21" width="15" height="17" rx="2.5" fill="#059669" />
            <text
              x="13"
              y="33.5"
              fill="#FFFFFF"
              fontSize="10.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              X
            </text>
          </svg>
        </div>
      );

    default:
      return (
        <div className="relative shrink-0 select-none drop-shadow-sm">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 5C0 2.23858 2.23858 0 5 0H26L40 14V45C40 47.7614 37.7614 50 35 50H5C2.23858 50 0 47.7614 0 45V5Z"
              fill="#1F2937"
              stroke="#4B5563"
              strokeWidth="1.2"
            />
            <path
              d="M26 0V11.5C26 12.8807 27.1193 14 28.5 14H40L26 0Z"
              fill="#374151"
              opacity="0.95"
            />
            <text
              x="20"
              y="33.5"
              fill="#E5E7EB"
              fontSize="9.5"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.04em"
            >
              FILE
            </text>
          </svg>
        </div>
      );
  }
}

export function MediaFileCard({
  item,
  isSelected,
  isMenuOpen,
  onOpenModal,
  onToggleMenu,
  onCloseMenu,
  onDeleteItem,
  onCopyUrl,
}: MediaFileCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ width: 365, height: 137 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize((prev) => {
          if (Math.abs(prev.width - rect.width) < 0.5 && Math.abs(prev.height - rect.height) < 0.5) {
            return prev;
          }
          return { width: Math.round(rect.width), height: Math.round(rect.height) };
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = size.width;
  const H = size.height;

  // Geometry tokens
  const Rc = 20;   // Outer corner radius (increased by 4px for rounder corners matching target)
  const Wn = 50;   // Notch width from right edge (accommodates 40px button + even ~4px gap)
  const Hn = 48;   // Notch height from top edge (accommodates 40px button + even ~4px gap)
  const R1 = 12;   // Top concave fillet
  const R2 = 12;   // Inner concave fillet
  const R3 = 8;    // Right convex fillet
  const d = 3;     // Outer ring offset (3px outside)

  const dMain = [
    `M ${Rc} 0`,
    `L ${W - Wn - R1} 0`,
    `A ${R1} ${R1} 0 0 1 ${W - Wn} ${R1}`,
    `L ${W - Wn} ${Hn - R2}`,
    `A ${R2} ${R2} 0 0 0 ${W - Wn + R2} ${Hn}`,
    `L ${W - R3} ${Hn}`,
    `A ${R3} ${R3} 0 0 1 ${W} ${Hn + R3}`,
    `L ${W} ${H - Rc}`,
    `A ${Rc} ${Rc} 0 0 1 ${W - Rc} ${H}`,
    `L ${Rc} ${H}`,
    `A ${Rc} ${Rc} 0 0 1 0 ${H - Rc}`,
    `L 0 ${Rc}`,
    `A ${Rc} ${Rc} 0 0 1 ${Rc} 0`,
    `Z`,
  ].join(" ");

  const RcOut = Rc + d;

  // Outer round box enclosing the entire card perimeter, wrapping over and around the 3-dot button
  const dOuter = [
    `M ${Rc} ${-d}`,
    `L ${W + d - RcOut} ${-d}`,
    `A ${RcOut} ${RcOut} 0 0 1 ${W + d} ${-d + RcOut}`,
    `L ${W + d} ${H + d - RcOut}`,
    `A ${RcOut} ${RcOut} 0 0 1 ${W + d - RcOut} ${H + d}`,
    `L ${Rc} ${H + d}`,
    `A ${RcOut} ${RcOut} 0 0 1 ${-d} ${H - Rc}`,
    `L ${-d} ${Rc}`,
    `A ${RcOut} ${RcOut} 0 0 1 ${Rc} ${-d}`,
    `Z`,
  ].join(" ");

  return (
    <article
      ref={cardRef}
      onClick={() => onOpenModal(item)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenModal(item);
        }
      }}
      className={cn(
        "group relative min-h-[137px] p-4 sm:p-[17px] flex flex-col justify-between cursor-pointer select-none transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#C5F52A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      )}
      style={{
        filter: isSelected
          ? "drop-shadow(0 0 16px rgba(197, 245, 42, 0.22))"
          : "drop-shadow(0 6px 20px rgba(0, 0, 0, 0.35))",
      }}
    >
      {/* Absolute SVG shape: outer ring + main border + card fill */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        aria-hidden="true"
      >
        {/* Outer 1px faint ring (3px outside) */}
        <path
          d={dOuter}
          fill="none"
          stroke={
            isSelected
              ? "rgba(197, 245, 42, 0.30)"
              : "rgba(255, 255, 255, 0.04)"
          }
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          className={cn(
            "transition-colors duration-200",
            !isSelected && "group-hover:stroke-white/[0.08]"
          )}
        />
        {/* Main 1px border and fill */}
        <path
          d={dMain}
          fill={isSelected ? "rgba(22, 26, 29, 0.95)" : "rgba(18, 21, 23, 0.75)"}
          stroke={
            isSelected
              ? "#C5F52A"
              : "rgba(255, 255, 255, 0.10)"
          }
          strokeWidth={isSelected ? "1.5" : "1"}
          vectorEffect="non-scaling-stroke"
          className={cn(
            "transition-colors duration-200",
            !isSelected && "group-hover:stroke-white/[0.22]"
          )}
        />
      </svg>

      {/* 3-dot Button in Top-Right Notch */}
      <div className="absolute top-[4px] right-[4px] z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(e);
          }}
          className={cn(
            "w-[40px] h-[40px] rounded-[12px] flex flex-col items-center justify-center gap-[3.5px] transition-all cursor-pointer",
            "bg-[#121517]/85 hover:bg-[#1A1E22] border border-white/10 hover:border-white/25",
            "focus-visible:ring-2 focus-visible:ring-[#C5F52A] focus-visible:outline-none"
          )}
          aria-label="More options"
          aria-expanded={isMenuOpen}
          title="More options"
        >
          <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#9CA3AF] group-hover:bg-neutral-300 transition-colors" />
          <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#9CA3AF] group-hover:bg-neutral-300 transition-colors" />
          <span className="w-[3.5px] h-[3.5px] rounded-full bg-[#9CA3AF] group-hover:bg-neutral-300 transition-colors" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-[44px] w-36 py-1 z-30 rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-100"
            style={{
              background: "rgba(18, 20, 22, 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                onOpenModal(item);
                onCloseMenu();
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={() => {
                onCopyUrl(item.imageUrl);
                onCloseMenu();
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              Copy Image URL
            </button>
            <div className="border-t border-white/10 my-1" />
            <button
              type="button"
              onClick={() => {
                onDeleteItem(item.id);
                onCloseMenu();
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Delete Asset
            </button>
          </div>
        )}
      </div>

      {/* TOP ROW: File Icon + File Name & Meta info */}
      <div className="flex items-start gap-3 min-w-0 pr-[52px] z-10">
        <RenderDocumentIcon ext={item.fileExt} />
        <div className="min-w-0 flex-1 pt-0.5">
          {/* File Name with single-line ellipsis truncation */}
          <h4
            className="text-[15px] font-medium text-white/95 group-hover:text-white truncate tracking-tight leading-snug"
            title={item.fileName}
          >
            {item.fileName}
          </h4>
          {/* Meta row: Size + Solid Dot + Preview link */}
          <div className="flex items-center mt-1.5 text-[13px] leading-none">
            <span className="text-[#9CA3AF] font-normal">{item.fileSize}</span>
            <span className="w-[6.5px] h-[6.5px] rounded-full bg-[#818CF8] mx-2 shrink-0 inline-block select-none" aria-hidden="true" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(item);
              }}
              className="text-[#818CF8] hover:text-[#A5B4FC] hover:underline font-normal cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:outline-none rounded transition-colors"
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="border-t border-white/[0.08] my-3 z-10" />

      {/* BOTTOM ROW: Avatar + Uploader Name + Right-aligned Date */}
      <div className="flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          {item.uploaderAvatar ? (
            <img
              src={item.uploaderAvatar}
              alt={item.uploaderName}
              className="w-[30px] h-[30px] rounded-full object-cover shrink-0 ring-1 ring-white/15"
            />
          ) : (
            <div className="w-[30px] h-[30px] rounded-full bg-brand-lime/20 text-brand-lime flex items-center justify-center text-[11px] font-bold shrink-0">
              {item.uploaderName.charAt(0)}
            </div>
          )}
          <span className="text-[13.5px] text-white/90 font-normal truncate max-w-[170px]">
            {item.uploaderName}
          </span>
        </div>

        <span className="text-[13px] text-[#9CA3AF] font-normal shrink-0">
          {item.formattedDate}
        </span>
      </div>
    </article>
  );
}
