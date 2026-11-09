"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FONT_OPTIONS,
  STYLE_PRESETS,
  HIGHLIGHT_STYLES,
  INITIAL_VIDEO_STATE,
  VideoFontOption,
  VideoStylePreset,
  VideoHighlightStyle,
} from "@/lib/mock/raw-video-data";

export function RawVideoStudioView() {
  const [videoState, setVideoState] = useState(INITIAL_VIDEO_STATE);
  const [selectedFont, setSelectedFont] = useState<VideoFontOption>(FONT_OPTIONS[0]);
  const [selectedPreset, setSelectedPreset] = useState<VideoStylePreset>(STYLE_PRESETS[0]);
  const [selectedHighlight, setSelectedHighlight] = useState<VideoHighlightStyle>(HIGHLIGHT_STYLES[0]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const [isHighlightDropdownOpen, setIsHighlightDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 3000);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
    showToast(!isPlaying ? "Playing preview" : "Paused preview");
  };

  const handleReplaceFootage = () => {
    showToast("Opening footage file selector...");
  };

  return (
    <>
      <main
        className="flex-1 flex flex-col min-w-0 bg-[#08090a] overflow-hidden rounded-2xl border border-white/[0.08]"
        data-purpose="video-workspace"
      >
        {/* Studio Main Stage Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-3 md:p-4 gap-3 md:gap-4">
          {/* Central Textured Stage Area */}
          <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0c0d10] overflow-hidden relative shrink-0 lg:shrink">
            {/* Main Canvas Viewport with Centerpiece Video Frame */}
            <div
              className="flex-1 flex items-center justify-center relative p-3 sm:p-6 select-none overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(35, 40, 48, 0.45) 0%, rgba(12, 13, 16, 0.95) 75%), linear-gradient(180deg, #12151c 0%, #08090a 100%)",
              }}
            >
              <div
                className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#08090a] group flex flex-col my-auto max-w-[360px] sm:max-w-[460px] lg:max-w-[680px]"
                style={{
                  maxHeight: "calc(-120px + 100vh)",
                }}
              >
                <div className="relative w-full overflow-hidden rounded-2xl">
                  {/* Video & Hook Image */}
                  <Image
                    src={videoState.thumbnailUrl}
                    alt="Video Preview"
                    width={680}
                    height={850}
                    priority
                    className="w-full h-auto object-cover rounded-2xl block"
                  />

                  {/* Play Button Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ paddingTop: "15%" }}
                  >
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="pointer-events-auto w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-105 hover:bg-black/70 hover:border-white/40 transition-all shadow-xl cursor-pointer group/play"
                      title={isPlaying ? "Pause Preview" : "Play Preview"}
                      aria-label={isPlaying ? "Pause Preview" : "Play Preview"}
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5 sm:ml-1 transition-transform group-hover/play:scale-110"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Workflow Side Panel (Upload & Captions Configuration) */}
          <div className="w-full lg:w-80 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0c0d10] p-4 space-y-4 shrink-0 overflow-y-auto">
            {/* Video Upload Dropzone (Compact) */}
            <div
              onClick={handleReplaceFootage}
              className="rounded-xl border border-dashed border-white/20 hover:border-[#C5F52A]/60 bg-white/[0.02] hover:bg-white/[0.04] p-3 flex items-center justify-between transition cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] group-hover:bg-[#C5F52A] group-hover:text-black text-white/80 flex items-center justify-center shrink-0 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-white truncate">{videoState.fileName}</p>
                  <p className="text-[10px] text-white/40">{videoState.specs}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplaceFootage();
                }}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/10 transition shrink-0 cursor-pointer"
              >
                Replace
              </button>
            </div>

            {/* Caption Text Input Field on Raw Footage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/90">
                  Caption Text on Footage
                </label>
                <span className="text-[10px] text-white/40 font-mono">Auto-synced</span>
              </div>
              <div className="relative">
                <textarea
                  rows={2}
                  value={videoState.captionText}
                  onChange={(e) =>
                    setVideoState((prev) => ({ ...prev, captionText: e.target.value }))
                  }
                  className="w-full rounded-xl bg-white/[0.035] border border-white/10 focus:border-[#C5F52A]/60 focus:ring-1 focus:ring-[#C5F52A]/40 text-xs text-white p-2.5 placeholder-white/30 resize-none outline-none transition-colors"
                  placeholder="Type custom caption overlay..."
                />
              </div>
            </div>

            {/* Font Family Selection Studio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M4 7V4h16v3M9 20h6M12 4v16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Select Caption Font</span>
                </label>
                <span className="text-[10px] text-white/80 font-mono font-medium">Active</span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                  className="w-full p-2.5 rounded-xl border border-white/20 bg-white/[0.035] hover:bg-white/[0.06] flex items-center justify-between text-left transition group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-sm shrink-0">
                      Aa
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white truncate">{selectedFont.name}</p>
                        {selectedFont.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-white/10 text-white border border-white/20 uppercase">
                            {selectedFont.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/40 font-mono truncate">
                        {selectedFont.description}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-white/60 group-hover:text-white transition-transform shrink-0 ${
                      isFontDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>

                {/* Dropdown Options */}
                {isFontDropdownOpen && (
                  <div className="absolute top-full mt-1.5 inset-x-0 z-30 bg-[#14171a] border border-white/15 rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in duration-150">
                    {FONT_OPTIONS.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          setSelectedFont(f);
                          setIsFontDropdownOpen(false);
                          showToast(`Font switched to ${f.name}`);
                        }}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-left transition-colors ${
                          selectedFont.id === f.id
                            ? "bg-white/10 text-white border border-white/15"
                            : "hover:bg-white/5 text-neutral-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{f.name}</span>
                            {f.badge && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-white/10 text-white font-mono">
                                {f.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">{f.description}</span>
                        </div>
                        {selectedFont.id === f.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Typography Sizing & Color Styling Controls */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Font Styling &amp; Colors</span>
                </label>
                <span className="text-[10px] text-white/70 font-mono">Custom</span>
              </div>
              <div className="relative rounded-xl border border-white/10 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                  className="w-full p-2.5 bg-white/[0.035] hover:bg-white/[0.06] flex items-center justify-between text-left transition rounded-xl cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-3 h-3 rounded-full bg-white ring-2 ring-white/30 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {selectedPreset.name}
                      </p>
                      <p className="text-[10px] text-white/40 font-mono">
                        {selectedPreset.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-white/60">
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isPresetDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </button>

                {/* Preset Dropdown Options */}
                {isPresetDropdownOpen && (
                  <div className="absolute top-full mt-1.5 inset-x-0 z-30 bg-[#14171a] border border-white/15 rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in duration-150">
                    {STYLE_PRESETS.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPreset(p);
                          setIsPresetDropdownOpen(false);
                          showToast(`Style preset switched to ${p.name}`);
                        }}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-left transition-colors ${
                          selectedPreset.id === p.id
                            ? "bg-white/10 text-white border border-white/15"
                            : "hover:bg-white/5 text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: p.colorHex }}
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">{p.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{p.description}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Word Box Highlight Style Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M4 7V4h16v3M9 20h6M12 4v16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Select Caption Font</span>
                </label>
                <span className="text-[10px] text-white/80 font-mono font-medium">Active</span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsHighlightDropdownOpen(!isHighlightDropdownOpen)}
                  className="w-full p-2.5 rounded-xl border border-white/20 bg-white/[0.035] hover:bg-white/[0.06] flex items-center justify-between text-left transition group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-sm shrink-0">
                      Aa
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white truncate">
                          {selectedHighlight.name}
                        </p>
                        {selectedHighlight.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-white/10 text-white border border-white/20 uppercase">
                            {selectedHighlight.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/40 font-mono truncate">
                        {selectedHighlight.description}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-white/60 group-hover:text-white transition-transform shrink-0 ${
                      isHighlightDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>

                {/* Highlight Dropdown Options */}
                {isHighlightDropdownOpen && (
                  <div className="absolute top-full mt-1.5 inset-x-0 z-30 bg-[#14171a] border border-white/15 rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in duration-150">
                    {HIGHLIGHT_STYLES.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          setSelectedHighlight(h);
                          setIsHighlightDropdownOpen(false);
                          showToast(`Highlight style switched to ${h.name}`);
                        }}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-left transition-colors ${
                          selectedHighlight.id === h.id
                            ? "bg-white/10 text-white border border-white/15"
                            : "hover:bg-white/5 text-neutral-300"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{h.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{h.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
