"use client";

import React, { useState, useEffect } from "react";
import { StyleTemplate } from "@/lib/mock/style-data";

interface TemplatePreviewModalProps {
  template: StyleTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate?: (template: StyleTemplate) => void;
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onApplyTemplate,
}: TemplatePreviewModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
      setIsCopied(false);
    }
  }, [isOpen, template]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNextSlide();
      if (e.key === "ArrowLeft") handlePrevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!isOpen || !template) return null;

  const slides = template.previewSlides || [
    {
      slideNumber: 1,
      title: template.heading || template.title || "Template Slide 1",
      body: template.subtitle || template.quote || "Explore and customize this high-retention template.",
      bullets: ["High retention layout", "Optimized typography", "Ready for multi-platform publishing"]
    }
  ];

  const totalSlides = Math.max(slides.length, template.slideCount || 1);
  const activeSlide = slides[currentSlideIndex] || slides[0];

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0f1214] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-white overflow-hidden"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded border ${template.categoryColor} ${template.categoryBg} ${template.categoryBorder}`}
            >
              {template.category}
            </span>
            <span className="text-xs font-medium text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {template.slideCountText || `${totalSlides} slides`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
              }`}
              title="Favorite template"
            >
              <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-neutral-300 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {isCopied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Slide Visual Presentation */}
        <div className="relative aspect-[16/10] bg-neutral-950 border border-white/10 rounded-xl p-6 flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Header inside slide */}
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            <span className="text-brand-lime">PostPilot Studio</span>
          </div>

          {/* Slide Center */}
          <div className="my-auto py-4 max-w-lg mx-auto text-center flex flex-col items-center">
            {template.emojis && template.emojis.length > 0 && (
              <div className="text-3xl mb-3 flex gap-2">
                {template.emojis.map((emoji, idx) => (
                  <span key={idx}>{emoji}</span>
                ))}
              </div>
            )}
            <h3 className="text-xl font-extrabold text-white leading-tight uppercase font-sans tracking-tight mb-3">
              {activeSlide.title}
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed mb-4">
              {activeSlide.body}
            </p>
            {activeSlide.bullets && activeSlide.bullets.length > 0 && (
              <div className="flex flex-col gap-1.5 text-left bg-white/5 border border-white/10 rounded-lg p-3 w-full">
                {activeSlide.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slide Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevSlide}
              disabled={slides.length <= 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 transition-colors text-neutral-300"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlideIndex
                      ? "w-6 bg-brand-lime"
                      : "w-1.5 bg-neutral-600 hover:bg-neutral-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNextSlide}
              disabled={slides.length <= 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 transition-colors text-neutral-300"
              aria-label="Next slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              </svg>
              {template.views} total views
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" fillRule="evenodd" />
              </svg>
              {template.likes} saves
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (onApplyTemplate) onApplyTemplate(template);
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold bg-brand-lime text-black rounded-xl hover:bg-brand-limeHover transition-all flex items-center gap-2 shadow-lg shadow-brand-lime/20 cursor-pointer"
            >
              <span>Use This Template</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

