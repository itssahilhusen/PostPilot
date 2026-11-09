"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { INITIAL_RESULT_SLIDES, ResultSlide } from "@/lib/mock/result-data";

export function ResultStudioView() {
  const [slides, setSlides] = useState<ResultSlide[]>(INITIAL_RESULT_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState(1); // Slide 2 is active by default
  const [promptInput, setPromptInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const trackContainerRef = useRef<HTMLDivElement>(null);
  const activeSlideRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 3000);
  };

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  // Center active card smoothly on mobile/tablet
  useEffect(() => {
    if (activeSlideRef.current && trackContainerRef.current) {
      const container = trackContainerRef.current;
      const card = activeSlideRef.current;

      if (container.scrollWidth > container.clientWidth) {
        const cardOffset = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
        container.scrollTo({
          left: Math.max(0, cardOffset),
          behavior: "smooth",
        });
      }
    }
  }, [activeSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") handlePrevSlide();
      if (e.key === "ArrowRight") handleNextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handlePrevSlide();
      else handleNextSlide();
    }
    touchStartXRef.current = null;
  };

  // AI Prompt tweak handlers
  const handleQuickTweak = (tweakType: string) => {
    setIsProcessingAI(true);
    setTimeout(() => {
      setSlides((prev) =>
        prev.map((s, idx) => {
          if (idx !== activeSlideIndex) return s;
          if (tweakType === "Shorter hook") {
            return {
              ...s,
              heading: "The emerald formula: balance > intensity",
              body: "Genuine luxury doesn't shout. Architectural heart notes deliver 18+ hour sillage with zero synthetic cloy.",
            };
          }
          if (tweakType === "Add data stats") {
            return {
              ...s,
              heading: "The 18-Hour Sillage Rule: 94% Natural Heart Notes",
              body: "Tested across 1,200 formulations: balance beats volume every single time. Luxury is restraint engineered to perfection.",
            };
          }
          if (tweakType === "Punchy tone") {
            return {
              ...s,
              heading: "Stop wearing loud scents. Wear enduring ones.",
              body: "Cheap cologne yells. Real extraction lingers. Discover the architectural fragrance formula high-rollers swear by.",
            };
          }
          if (tweakType === "Rephrase") {
            return {
              ...s,
              heading: "Architectural heart notes: The art of balance",
              body: "When rare ingredients define luxury, less is infinitely more. 18 hours of quiet, undeniable presence.",
            };
          }
          return s;
        })
      );
      setIsProcessingAI(false);
      showToast(`AI updated slide ${activeSlideIndex + 1} with "${tweakType}"`);
    }, 400);
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsProcessingAI(true);
    const query = promptInput.trim();
    setPromptInput("");

    setTimeout(() => {
      setSlides((prev) =>
        prev.map((s, idx) => {
          if (idx !== activeSlideIndex) return s;
          return {
            ...s,
            body: `${s.body || ""} [Refined: ${query}]`,
          };
        })
      );
      setIsProcessingAI(false);
      showToast(`AI refined slide ${activeSlideIndex + 1}: "${query}"`);
    }, 450);
  };

  const handleAddSlide = () => {
    const newSlideNumber = slides.length + 1;
    const newSlide: ResultSlide = {
      id: `slide-${newSlideNumber}`,
      slideNumber: newSlideNumber,
      totalSlides: newSlideNumber,
      type: "FRAMEWORK",
      tag: "Signature Blend",
      tagColor: "text-brand-lime",
      heading: "Building your signature fragrance profile",
      body: "Layer base notes with intentional restraint for an aura that belongs exclusively to you.",
      image:
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
    };

    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
    showToast(`Added Slide ${newSlideNumber}`);
  };

  return (
    <>
      <main
        className="flex-1 flex flex-col h-full overflow-hidden rounded-2xl relative"
        data-purpose="studio-editor-workspace"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(20, 26, 28, 0.6) 0%, rgba(6, 8, 9, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "rgba(0, 0, 0, 0.6) 0px 10px 40px",
        }}
      >
        {/* Central Immersive Carousel Panoramic Presentation Stage */}
        <div
          ref={trackContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 relative flex items-center xl:justify-center overflow-x-auto overflow-y-hidden px-4 md:px-8 py-3 select-none no-scrollbar"
        >
          {/* Prominent Floating Left / Right Carousel Navigation Arrows (visible from sm breakpoint) */}
          <button
            onClick={handlePrevSlide}
            className="hidden sm:flex absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/80 hover:bg-black border border-white/20 hover:border-brand-lime text-white hover:text-brand-lime items-center justify-center transition-all shadow-2xl backdrop-blur-md group hover:scale-105 cursor-pointer"
            title="Previous Slide"
            aria-label="Previous Slide"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
          </button>

          <button
            onClick={handleNextSlide}
            className="hidden sm:flex absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/80 hover:bg-black border border-white/20 hover:border-brand-lime text-white hover:text-brand-lime items-center justify-center transition-all shadow-2xl backdrop-blur-md group hover:scale-105 cursor-pointer"
            title="Next Slide"
            aria-label="Next Slide"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
          </button>

          {/* Carousel Continuous Track / Deck View */}
          <div className="flex items-center gap-4 md:gap-6 py-2 transition-all duration-300 min-w-max mx-auto xl:mx-0">
            {slides.map((slide, idx) => {
              const isActive = idx === activeSlideIndex;
              const isAdjacent = Math.abs(idx - activeSlideIndex) === 1;

              if (isActive) {
                return (
                  <div
                    key={slide.id}
                    ref={activeSlideRef}
                    onClick={() => setActiveSlideIndex(idx)}
                    className="w-[260px] xs:w-[280px] sm:w-[310px] h-[370px] sm:h-[410px] rounded-2xl relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-2 border-brand-lime shrink-0 group transition-all duration-300 scale-100 ring-4 ring-brand-lime/20 cursor-pointer"
                  >
                    <Image
                      alt={`Slide ${slide.slideNumber} Active`}
                      src={slide.image}
                      fill
                      sizes="310px"
                      priority
                      className="object-cover filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Card Header Meta */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 sm:left-4 sm:right-4 flex items-center justify-between font-mono text-white/90">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-brand-lime text-black font-extrabold text-[9px] sm:text-[10px] shadow-sm whitespace-nowrap shrink-0">
                          0{slide.slideNumber} / 0{slides.length}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-white/60 tracking-wider whitespace-nowrap shrink-0">
                          {`// ${slide.type}`}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-white/90 bg-black/60 px-1.5 sm:px-2 py-0.5 rounded-md border border-white/15 whitespace-nowrap shrink-0">
                        {slide.handle || "@halcyon.studio"}
                      </span>
                    </div>

                    {/* Card Bottom Content */}
                    <div className="absolute bottom-3.5 sm:bottom-4 left-3.5 sm:left-4 right-3.5 sm:right-4 flex flex-col gap-1.5 sm:gap-2 text-left">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[9px] sm:text-[10px] text-brand-lime font-bold uppercase tracking-wider w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                        {slide.tag}
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight drop-shadow-md font-sans">
                        {slide.heading}
                      </h3>
                      {slide.body && (
                        <p className="text-[11px] sm:text-xs text-neutral-200 leading-snug drop-shadow font-normal">
                          {slide.body}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-white/15 text-[9px] sm:text-[10px] text-neutral-400 font-mono">
                        <span className="text-white/80 font-bold whitespace-nowrap">
                          {slide.footerNote || "SWIPE FOR THE NOTES →"}
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-300 font-semibold whitespace-nowrap">
                          {slide.brandName || "Halcyon & Co"}
                          <span className="w-3.5 h-1.5 bg-brand-lime rounded-full inline-block" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Adjacent or outer slides
              const isSlide3 = idx === 2;
              const cardWidth = isAdjacent ? "w-[210px] sm:w-[230px]" : "w-[190px] sm:w-[210px]";
              const cardHeight = isAdjacent ? "h-[320px] sm:h-[340px]" : "h-[290px] sm:h-[310px]";
              const opacityClass = isAdjacent
                ? isSlide3
                  ? "opacity-80 hover:opacity-100 scale-95 border-white/15"
                  : "opacity-55 hover:opacity-85 scale-95 border-white/10"
                : "opacity-55 hover:opacity-85 scale-90 border-white/10";

              return (
                <div
                  key={slide.id}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`${cardWidth} ${cardHeight} rounded-2xl relative overflow-hidden transition-all duration-300 border shrink-0 shadow-xl cursor-pointer group ${opacityClass}`}
                >
                  <Image
                    alt={`Slide ${slide.slideNumber}`}
                    src={slide.image}
                    fill
                    sizes="230px"
                    className="object-cover filter brightness-75 group-hover:brightness-95 transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

                  {/* Header */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-black/70 border border-white/20 text-white font-semibold">
                      0{slide.slideNumber}/0{slides.length}
                    </span>
                    <span
                      className={
                        slide.type === "CTA"
                          ? "text-brand-lime font-bold"
                          : "text-white/70"
                      }
                    >
                      {slide.type}
                    </span>
                  </div>

                  {/* Bottom */}
                  <div className="absolute bottom-3 inset-x-3 text-left">
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold ${slide.tagColor}`}
                    >
                      {slide.tag}
                    </span>
                    <h4 className="text-sm font-extrabold text-white leading-tight mt-0.5">
                      {slide.heading}
                    </h4>
                    {isSlide3 && slide.body && (
                      <p className="text-[10px] text-neutral-300 line-clamp-2 mt-1">
                        {slide.body}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Full-Width Slide Filmstrip Scrubber & Control Deck */}
        <div className="relative z-30 px-3 sm:px-6 pb-2.5 sm:pb-2 -mt-14 sm:-mt-16 flex flex-col items-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-2xl flex flex-col gap-2 items-center">
            {/* Quick Action Chips */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full select-none py-0.5 no-scrollbar">
              {[
                "Shorter hook",
                "Add data stats",
                "Punchy tone",
                "Rephrase",
              ].map((tweak) => (
                <button
                  key={tweak}
                  onClick={() => handleQuickTweak(tweak)}
                  disabled={isProcessingAI}
                  className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-neutral-900 border border-white/10 hover:border-brand-lime/40 text-[10px] sm:text-[11px] font-medium text-neutral-300 hover:text-white transition-all backdrop-blur-md flex items-center gap-1 shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-brand-lime text-[10px]">✦</span> {tweak}
                </button>
              ))}
            </div>

            {/* AI Prompt Input Bar */}
            <form
              onSubmit={handleCustomPromptSubmit}
              className="w-full flex items-center gap-2 sm:gap-3 bg-[#131619]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-3 sm:px-4 py-2 hover:border-white/20 transition-all ring-1 ring-white/5"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-brand-lime/10 flex items-center justify-center shrink-0">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-lime"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4L12 2z" />
                </svg>
              </div>

              <input
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                disabled={isProcessingAI}
                className="flex-1 bg-transparent border-0 text-[11px] sm:text-xs text-white placeholder-neutral-400 focus:outline-none focus:ring-0 p-0 font-normal min-w-0"
                placeholder={
                  isProcessingAI
                    ? "AI is synthesizing refinement..."
                    : "Ask AI to polish slide, refine tone, or improve copy..."
                }
                type="text"
              />

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => showToast("Voice recognition ready")}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Voice input"
                  aria-label="Voice input"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => showToast("Upload reference screenshot or PDF")}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Attach reference"
                  aria-label="Attach reference"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>

                <button
                  type="submit"
                  disabled={isProcessingAI || !promptInput.trim()}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-brand-lime hover:bg-brand-limeHover text-black flex items-center justify-center transition-colors shadow-sm cursor-pointer disabled:opacity-40"
                  title="Generate"
                  aria-label="Generate"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Filmstrip Thumbs */}
            <div className="pointer-events-auto mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full py-1 no-scrollbar">
              {slides.map((slide, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <div
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`relative w-14 sm:w-16 h-18 sm:h-20 overflow-hidden shadow-md cursor-pointer transition-all shrink-0 rounded-2xl group ${
                      isActive
                        ? "border-2 border-brand-lime shadow-[0_0_15px_rgba(197,245,42,0.4)] ring-2 ring-brand-lime/30"
                        : "border border-white/20 opacity-75 hover:opacity-100 hover:border-brand-lime/60"
                    }`}
                  >
                    <Image
                      alt={`Thumb ${slide.slideNumber}`}
                      src={slide.image}
                      fill
                      sizes="64px"
                      className="object-cover object-top"
                    />
                    <span
                      className={`absolute top-1 left-1 px-1.5 py-0.2 rounded font-mono text-[8px] sm:text-[9px] font-bold ${
                        isActive
                          ? "bg-brand-lime text-black font-extrabold"
                          : "bg-black/80 text-white"
                      }`}
                    >
                      {slide.slideNumber}
                    </span>
                    <span
                      className={`absolute bottom-1 inset-x-1 py-0.5 rounded text-[6px] sm:text-[7px] text-center font-bold uppercase truncate px-0.5 ${
                        isActive
                          ? "bg-black/90 text-brand-lime"
                          : "bg-black/80 text-neutral-300"
                      }`}
                    >
                      {slide.type}
                    </span>
                  </div>
                );
              })}

              {/* Add Slide Button */}
              <button
                type="button"
                onClick={handleAddSlide}
                className="w-14 sm:w-16 h-18 sm:h-20 border border-dashed border-white/20 hover:border-white/40 text-white/90 hover:text-white flex flex-col items-center justify-center gap-1 transition-all shrink-0 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl shadow-sm group cursor-pointer"
                title="Add New Slide"
              >
                <span className="text-base sm:text-lg font-light leading-none text-white/80 group-hover:text-white group-hover:scale-105 transition-transform">
                  +
                </span>
                <span className="text-[8px] sm:text-[9px] font-medium tracking-tight text-white/80 group-hover:text-white">
                  Add Slide
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

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
