"use client";

import React, { useState } from "react";
import { StyleSectionData, StyleTemplate } from "@/lib/mock/style-data";
import { StyleTemplateCard } from "./StyleTemplateCard";

interface StyleSectionProps {
  section: StyleSectionData;
  selectedTemplateIds: string[];
  onSelectTemplate: (template: StyleTemplate) => void;
  onPreviewTemplate: (template: StyleTemplate) => void;
  onPickTwo?: () => void;
  isPickTwoActive?: boolean;
}

export function StyleSection({
  section,
  selectedTemplateIds,
  onSelectTemplate,
  onPreviewTemplate,
  onPickTwo,
  isPickTwoActive = false,
}: StyleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If section 3 grid class in Stitch has `grid-cols-1 md:grid-cols-2 gap-3.5 xl:grid-cols-5`
  const gridClass =
    section.id === "minimalist-quotes"
      ? "grid grid-cols-1 md:grid-cols-2 gap-3.5 xl:grid-cols-5"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5";

  return (
    <section className="flex flex-col gap-3.5 mb-6 last:mb-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg ${section.iconBgClass} border ${section.iconBorderClass} ${section.iconColorClass} flex items-center justify-center shrink-0`}
          >
            {renderSectionIcon(section.iconType)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                {section.title}
              </h2>
              <span className="text-[11px] font-medium text-neutral-400 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-md">
                {section.templateCountText}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">{section.description}</p>
          </div>
        </div>

        {/* Section Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {section.badgeText && (
            <button
              onClick={onPickTwo}
              className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                isPickTwoActive
                  ? "bg-brand-lime text-black border-brand-lime font-bold shadow-md shadow-brand-lime/20"
                  : "text-brand-lime bg-brand-lime/10 border-brand-lime/20 hover:bg-brand-lime/20"
              }`}
            >
              {isPickTwoActive ? "✓ Pick 2 Active" : section.badgeText}
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isExpanded ? "Collapse ↑" : "View All →"}
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className={gridClass}>
        {section.templates.map((template) => {
          const isSelected = selectedTemplateIds.includes(template.id);
          return (
            <StyleTemplateCard
              key={template.id}
              template={template}
              isSelected={isSelected}
              onSelect={onSelectTemplate}
              onPreview={onPreviewTemplate}
            />
          );
        })}
      </div>
    </section>
  );
}

function renderSectionIcon(type: "tips" | "cartoon" | "quotes") {
  if (type === "tips") {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (type === "cartoon") {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  // quotes
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

