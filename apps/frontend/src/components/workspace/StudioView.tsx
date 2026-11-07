"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface StudioViewProps {
  onOpenComposer: (post?: any) => void;
}

export function StudioView({ onOpenComposer }: StudioViewProps) {
  const { data: session } = useSession();
  const [promptText, setPromptText] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userName = session?.user?.name || "Alex";
  const firstName = userName.split(" ")[0] || "Alex";

  const handleCardClick = (cardName: string, promptPrefill: string) => {
    setSelectedCard(cardName);
    setPromptText(promptPrefill);
    textareaRef.current?.focus();
    toast.success(`${cardName} action selected`);
  };

  const handleSendPrompt = () => {
    if (!promptText.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    toast.success(`Prompt submitted: "${promptText.slice(0, 40)}..."`);
    onOpenComposer({ initialPrompt: promptText });
    setPromptText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <section className="flex-1 flex flex-col justify-center items-center px-6 py-8 md:py-10 max-w-4xl mx-auto w-full select-text">
      {/* Headline & Introduction */}
      <div className="text-center mb-9 space-y-2" data-purpose="dashboard-greeting">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 font-mono">
          Hi {firstName}, how can I help?
        </h1>
        <p className="text-sm sm:text-base font-normal text-slate-500 font-mono">
          Build agents, debug calls, and everything in-between
        </p>
      </div>

      {/* Action Cards (Build, Debug, Analyze) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-9" data-purpose="quick-action-cards">
        {/* Card 1: Build */}
        <div
          onClick={() => handleCardClick("Build", "Build an agent workflow to ")}
          className="tech-card bg-surface-subtle/50 hover:bg-white border border-surface-border hover:border-slate-300 rounded-lg p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group"
        >
          <div className="text-brand-500 mb-3.5 flex items-center justify-between">
            <svg className="w-5.5 h-5.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M12 6v14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              01
            </span>
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-1.5 font-mono">Build</h3>
          <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-mono">
            Build agents, debug calls, and everything in-between
          </p>
        </div>

        {/* Card 2: Debug */}
        <div
          onClick={() => handleCardClick("Debug", "Analyze and debug call session logs for ")}
          className="tech-card bg-surface-subtle/50 hover:bg-white border border-surface-border hover:border-slate-300 rounded-lg p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group"
        >
          <div className="text-brand-500 mb-3.5 flex items-center justify-between">
            <svg className="w-5.5 h-5.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v1m6 11h2m-6 0a4 4 0 01-8 0m8 0V9a4 4 0 00-8 0v7m-2 0H4m4-7h8m-8-3l-2-2m10 2l2-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              02
            </span>
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-1.5 font-mono">Debug</h3>
          <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-mono">
            Build agents, debug calls, and everything in-between
          </p>
        </div>

        {/* Card 3: Analyze */}
        <div
          onClick={() => handleCardClick("Analyze", "Analyze agent performance metrics and conversion rates for ")}
          className="tech-card bg-surface-subtle/50 hover:bg-white border border-surface-border hover:border-slate-300 rounded-lg p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group"
        >
          <div className="text-brand-500 mb-3.5 flex items-center justify-between">
            <svg className="w-5.5 h-5.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              03
            </span>
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-1.5 font-mono">Analyze</h3>
          <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-mono">
            Build agents, debug calls, and everything in-between
          </p>
        </div>
      </div>

      {/* Bottom Interactive Composer Bar */}
      <div className="w-full space-y-3" data-purpose="composer-prompt-container">
        <div className="bg-white border border-surface-border hover:border-slate-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 rounded-xl p-4 sm:p-5 shadow-xs transition-all duration-200">
          {/* Text Prompt Field */}
          <textarea
            ref={textareaRef}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none border-0 p-0 text-slate-800 placeholder-slate-400 font-mono text-sm sm:text-[15px] focus:ring-0 bg-transparent leading-relaxed focus:outline-none min-h-[84px]"
            placeholder="Find my longest..."
            rows={3}
          />

          {/* Composer Toolbar Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
            {/* Left: Attach Button */}
            <button
              type="button"
              onClick={() => onOpenComposer({ initialPrompt: promptText })}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-[13px] font-mono font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <span className="text-slate-400 font-bold text-sm">+</span>
              <span className="font-mono">Attach</span>
            </button>

            {/* Right: Voice & Submit Action */}
            <div className="flex items-center space-x-2">
              <button
                aria-label="Audio record"
                type="button"
                onClick={() => {
                  setIsRecording(!isRecording);
                  toast.info(isRecording ? "Voice recording stopped" : "Listening for voice prompt...");
                }}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isRecording ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
              <button
                aria-label="Send prompt"
                type="button"
                onClick={handleSendPrompt}
                className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <svg className="w-4.5 h-4.5 transform rotate-45 -translate-y-0.5 translate-x-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Technical Shortcuts & Quick Prompts Bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400 px-1 pt-0.5" data-purpose="quick-command-shortcuts">
          <div className="flex items-center space-x-3.5">
            <span className="inline-flex items-center">
              <kbd className="text-slate-600 font-bold mr-1 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[11px]">↵</kbd> to send
            </span>
            <span className="inline-flex items-center">
              <kbd className="text-slate-600 font-bold mr-1 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[11px]">⇧↵</kbd> for new line
            </span>
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => {
                setPromptText("/ Research competitors in my niche: ");
                textareaRef.current?.focus();
              }}
              className="hover:text-slate-700 hover:underline cursor-pointer"
            >
              / Research
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setPromptText("/ Performance-review for recent campaigns: ");
                textareaRef.current?.focus();
              }}
              className="hover:text-slate-700 hover:underline cursor-pointer"
            >
              / Performance-review
            </button>
            <span>•</span>
            <span
              onClick={() => toast.info("Available quick commands: /research, /performance-review, /ideas, /images")}
              className="cursor-pointer hover:text-slate-700"
            >
              ···
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
