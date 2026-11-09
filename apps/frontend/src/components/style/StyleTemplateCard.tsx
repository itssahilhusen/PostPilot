"use client";

import React from "react";
import { StyleTemplate } from "@/lib/mock/style-data";

interface StyleTemplateCardProps {
  template: StyleTemplate;
  isSelected?: boolean;
  onSelect?: (template: StyleTemplate) => void;
  onPreview?: (template: StyleTemplate) => void;
}

export function StyleTemplateCard({
  template,
  isSelected = false,
  onSelect,
  onPreview,
}: StyleTemplateCardProps) {
  const isLight = template.isLight ?? false;

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(template);
    }
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(template);
    } else if (onSelect) {
      onSelect(template);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-[#111414] hover:bg-[#14191a] border rounded-xl p-3 flex flex-col gap-2.5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-brand-lime/5 ${
        isSelected
          ? "border-brand-lime ring-1 ring-brand-lime/50 bg-[#14191a]"
          : "border-white/[0.08] hover:border-brand-lime/50"
      }`}
    >
      {/* 4/5 Aspect Ratio Preview Container */}
      <div
        className={`relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-white/5 flex flex-col justify-between p-3.5 group-hover:shadow-inner ${
          template.cardBgClass
        }`}
      >
        {/* Top bar inside card */}
        <div className="flex justify-between items-start gap-1">
          {template.category && (
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${template.categoryColor} ${template.categoryBg} ${template.categoryBorder}`}
            >
              {template.category}
            </span>
          )}
          {template.slideCountText && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isLight
                  ? "bg-neutral-900 text-white font-medium"
                  : "bg-black/70 backdrop-blur-md text-white/90 border border-white/10"
              }`}
            >
              {template.slideCount > 1 && (
                <svg
                  className={`w-3 h-3 ${isLight ? "text-neutral-300" : "text-neutral-400"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              )}
              {template.slideCountText}
            </span>
          )}
        </div>

        {/* Center Artwork / Content */}
        {renderCardCenter(template, isLight)}

        {/* Bottom row inside preview container */}
        {renderCardBottomInside(template, isLight)}
      </div>

      {/* Card Footer outside preview container */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-neutral-300">
            <svg
              className="w-3.5 h-3.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            </svg>
            {template.views}
          </span>
          <span className="flex items-center gap-1 text-neutral-300">
            <svg
              className="w-3.5 h-3.5 text-rose-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clipRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                fillRule="evenodd"
              />
            </svg>
            {template.likes}
          </span>
        </div>
        <button
          onClick={handleArrowClick}
          className="text-neutral-400 hover:text-brand-lime p-1 rounded-md hover:bg-white/5 transition-colors"
          title="Use Template"
          aria-label="Use Template"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 5l7 7m0 0l-7 7m7-7H3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function renderCardCenter(template: StyleTemplate, isLight: boolean) {
  // 1. Perspective quote card
  if (template.id === "quotes-perspective") {
    return (
      <div className="my-auto text-left py-2">
        <p className="text-sm font-black text-white uppercase tracking-tight leading-snug">
          &quot;A lot goes wrong before everything goes right.&quot;
        </p>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-neutral-600" />
          <span className="text-[9px] text-neutral-400 uppercase tracking-widest">
            {template.subtitle}
          </span>
        </div>
      </div>
    );
  }

  // 2. Growth FAIL -> WIN card
  if (template.id === "quotes-growth") {
    return (
      <div className="my-auto text-left py-2 font-mono">
        <p className="text-neutral-500 line-through text-xs font-semibold">FAIL</p>
        <p className="text-neutral-500 line-through text-xs font-semibold">FAIL</p>
        <p className="text-neutral-500 line-through text-xs font-semibold">FAIL</p>
        <p className="text-brand-lime text-base font-extrabold mt-1 tracking-tight">WIN.</p>
      </div>
    );
  }

  // 3. Marketing target audience card
  if (template.id === "quotes-marketing") {
    return (
      <div className="my-auto text-center py-2">
        <div className="w-8 h-8 rounded-full border-2 border-brand-lime mx-auto mb-2 flex items-center justify-center text-brand-lime font-bold text-xs">
          🎯
        </div>
        <h3 className="text-xs font-black text-white leading-snug uppercase tracking-tight">
          {template.heading}
        </h3>
      </div>
    );
  }

  // 4. Inversion card
  if (template.id === "quotes-framework") {
    return (
      <div className="my-auto text-center py-2">
        <p className="text-xs font-semibold uppercase text-brand-lime tracking-wider mb-1">
          {template.subtitle}
        </p>
        <h3 className="text-sm font-extrabold text-white leading-tight uppercase font-sans tracking-tight">
          {template.heading}
        </h3>
        <p className="text-[10px] text-neutral-400 mt-1 italic">{template.quote}</p>
      </div>
    );
  }

  // 5. Viral virtuoso rule #1
  if (template.id === "quotes-viral-virtuoso") {
    return (
      <div className="my-auto text-center py-2">
        <p className="text-xs font-semibold uppercase text-neutral-400 tracking-wider mb-2">
          {template.subtitle}
        </p>
        <h3 className="text-base font-black text-white leading-tight uppercase font-sans tracking-tight">
          {template.heading}
        </h3>
      </div>
    );
  }

  // 6. Cartoon cards with emojis
  if (template.emojis && template.emojis.length > 0) {
    const isFitness = template.id === "cartoon-fitness";
    return (
      <div className="my-auto py-2 text-center">
        {isFitness ? (
          <div className="flex justify-center items-center gap-2 text-xl mb-1 font-mono">
            <span className="text-2xl">{template.emojis[0]}</span>
            <span className="text-[11px] font-bold text-neutral-500">VS</span>
            <span className="text-2xl">{template.emojis[2]}</span>
          </div>
        ) : (
          <div className="flex justify-center gap-2 text-2xl mb-1">
            {template.emojis.map((emoji, idx) => (
              <span key={idx}>{emoji}</span>
            ))}
          </div>
        )}
        <h3 className="text-xs font-bold text-white leading-tight uppercase font-sans tracking-tight">
          {template.heading}
        </h3>
        {template.subtitle && (
          <p className="text-[10px] text-neutral-400 mt-1">{template.subtitle}</p>
        )}
      </div>
    );
  }

  // 7. Hard Truth cartoon with red bolt
  if (template.id === "cartoon-hard-truth") {
    return (
      <div className="my-auto py-2 text-center">
        <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 mx-auto mb-2 flex items-center justify-center text-xs">
          ⚡
        </div>
        <h3 className="text-sm font-black text-white leading-tight uppercase font-sans tracking-tight">
          {template.heading}
        </h3>
        <p className="text-[10px] text-neutral-400 mt-1">{template.subtitle}</p>
      </div>
    );
  }

  // 8. Productivity card with cyan bolt
  if (template.iconType === "bolt") {
    return (
      <div className="my-auto py-2 text-center">
        <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 mx-auto mb-2 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M13 10V3L4 14h7v7l9-11h-7z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h3 className="text-sm font-extrabold text-white leading-tight uppercase font-sans tracking-tight">
          {template.heading}
        </h3>
        <p className="text-[10px] text-neutral-400 mt-1">{template.subtitle}</p>
      </div>
    );
  }

  // 9. Communication white card
  if (isLight) {
    return (
      <div className="my-auto py-2 text-center">
        <h3 className="text-xs font-black text-neutral-950 leading-snug uppercase tracking-tight">
          {template.heading}
        </h3>
        <p className="text-[10px] text-neutral-500 mt-1 font-medium">{template.subtitle}</p>
      </div>
    );
  }

  // 10. Default / Step-by-Step cards (Habits, Career, Discipline)
  return (
    <div className="my-auto py-2 text-center">
      {template.subtitle && (
        <p className="text-neutral-400 text-[10px] font-semibold uppercase tracking-widest mb-1">
          {template.subtitle}
        </p>
      )}
      <h3 className="text-base font-extrabold text-white leading-tight uppercase font-sans tracking-tight">
        {template.heading}
      </h3>
      {template.accentDivider && (
        <div className={`w-8 h-0.5 ${template.accentDividerColor} mx-auto mt-2 rounded-full`} />
      )}
      {template.quote && (
        <p className="text-xs text-neutral-400 mt-2 italic">{template.quote}</p>
      )}
    </div>
  );
}

function renderCardBottomInside(template: StyleTemplate, isLight: boolean) {
  // If card has extra tags like SINGLE POST / 1080x1350 or EDITORIAL
  if (template.extraTagLeft || template.extraTagRight) {
    return (
      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
        <span>{template.extraTagLeft}</span>
        <span className={template.extraTagRight === "1080x1350" ? "text-brand-lime" : ""}>
          {template.extraTagRight}
        </span>
      </div>
    );
  }

  // Otherwise numbered slide indicators
  if (template.slideIndicators && template.slideIndicators.length > 0) {
    return (
      <div className="flex items-center gap-1 pt-1 justify-center">
        {template.slideIndicators.map((num, idx) => {
          const isActive = idx === 0;
          return (
            <span
              key={idx}
              className={`w-4 h-5 rounded-sm text-[8px] flex items-center justify-center font-bold ${
                isActive
                  ? isLight
                    ? "bg-neutral-900 border border-neutral-800 text-white"
                    : "bg-brand-lime/80 border border-brand-lime text-black"
                  : isLight
                  ? "bg-neutral-200 border border-neutral-300 text-neutral-700"
                  : "bg-neutral-800 border border-white/10 text-neutral-300"
              }`}
            >
              {num}
            </span>
          );
        })}
      </div>
    );
  }

  return null;
}

