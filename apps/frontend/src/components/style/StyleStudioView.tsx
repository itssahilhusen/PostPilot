"use client";

import React, { useState } from "react";
import { STYLE_SECTIONS, StyleTemplate } from "@/lib/mock/style-data";
import { StyleSection } from "./StyleSection";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

export function StyleStudioView() {
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<StyleTemplate | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  const handleSelectTemplate = (template: StyleTemplate) => {
    setSelectedTemplateIds((prev) => {
      if (prev.includes(template.id)) {
        return prev.filter((id) => id !== template.id);
      }
      return [...prev, template.id];
    });
  };

  const handlePickTwo = () => {
    // Pick the two recommended templates
    const recommended = ["habits-psychology", "communication-traps"];
    const isAlreadyPicked =
      selectedTemplateIds.includes("habits-psychology") &&
      selectedTemplateIds.includes("communication-traps");

    if (isAlreadyPicked) {
      setSelectedTemplateIds((prev) =>
        prev.filter((id) => !recommended.includes(id))
      );
      showToast("Cleared Pick 2 selection");
    } else {
      setSelectedTemplateIds((prev) => {
        const next = new Set([...prev, ...recommended]);
        return Array.from(next);
      });
      showToast("Selected recommended 2-template pair: Habits + Communication");
    }
  };

  const handleApplyTemplate = (template: StyleTemplate) => {
    if (!selectedTemplateIds.includes(template.id)) {
      setSelectedTemplateIds((prev) => [...prev, template.id]);
    }
    showToast(`Template applied: ${template.heading || template.title || template.category}`);
  };

  const isPickTwoActive =
    selectedTemplateIds.includes("habits-psychology") &&
    selectedTemplateIds.includes("communication-traps");

  return (
    <>
      <main
        className="flex-1 min-h-0 bg-[#050505] border-[#1a1a1a] flex flex-col overflow-hidden relative rounded-[20px] p-5 overflow-y-auto"
        style={{
          background: "rgba(14, 18, 19, 0.75)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          boxShadow:
            "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
        }}
      >
        {STYLE_SECTIONS.map((section) => (
          <StyleSection
            key={section.id}
            section={section}
            selectedTemplateIds={selectedTemplateIds}
            onSelectTemplate={handleSelectTemplate}
            onPreviewTemplate={(template) => setPreviewTemplate(template)}
            onPickTwo={section.badgeText ? handlePickTwo : undefined}
            isPickTwoActive={section.badgeText ? isPickTwoActive : false}
          />
        ))}

        {/* Selected Floating Action Bar */}
        {selectedTemplateIds.length > 0 && (
          <div className="sticky bottom-2 mt-4 z-30 mx-auto bg-neutral-900/90 border border-brand-lime/40 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-200">
            <span className="text-xs text-white font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
              <span>{selectedTemplateIds.length} template{selectedTemplateIds.length > 1 ? "s" : ""} chosen</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTemplateIds([])}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 transition-colors"
              >
                Clear
              </button>
              <a
                href="/result"
                className="text-xs font-bold bg-brand-lime text-black px-3.5 py-1.5 rounded-full hover:bg-brand-limeHover transition-colors flex items-center gap-1 shadow-md shadow-brand-lime/20"
              >
                Create Carousel →
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Slide Deck Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#15191c] border border-brand-lime/40 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <svg className="w-4 h-4 text-brand-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

