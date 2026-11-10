"use client";

import React, { useState, useRef } from "react";
import {
  WORKFLOW_TEMPLATES,
  INITIAL_WORKFLOW_STATE,
  NodeTemplate,
} from "@/lib/mock/workflow-data";
import { useToast } from "@/components/design-system/Toast";
import { cn } from "@/lib/utils";

export function WorkflowView() {
  const { toast } = useToast();

  // Search filter for Node Templates
  const [searchQuery, setSearchQuery] = useState("");

  // Canvas zoom & tool state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isZoomDropdownOpen, setIsZoomDropdownOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<"pan" | "title" | "box" | "polyline">("pan");
  const [isExecuting, setIsExecuting] = useState(false);

  // Workflow Data State
  const [credits, setCredits] = useState(INITIAL_WORKFLOW_STATE.credits);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Text Iterator State
  const [textSockets, setTextSockets] = useState<string[]>(
    INITIAL_WORKFLOW_STATE.textIterator.items
  );
  const [newSocketInput, setNewSocketInput] = useState("");
  const [isAddingSocket, setIsAddingSocket] = useState(false);

  // Prompt Node State
  const [promptText, setPromptText] = useState(INITIAL_WORKFLOW_STATE.promptNode.text);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // LLM Node State
  const [llmModel, setLlmModel] = useState(INITIAL_WORKFLOW_STATE.llmNode.model);
  const [llmPage, setLlmPage] = useState(INITIAL_WORKFLOW_STATE.llmNode.page);
  const [isLlmDropdownOpen, setIsLlmDropdownOpen] = useState(false);

  // Image Gen Node State
  const [imageModel, setImageModel] = useState(INITIAL_WORKFLOW_STATE.imageGenNode.model);
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);

  // Video Gen Node State
  const [videoModel, setVideoModel] = useState(INITIAL_WORKFLOW_STATE.videoGenNode.model);
  const [videoPage, setVideoPage] = useState(INITIAL_WORKFLOW_STATE.videoGenNode.page);
  const [isVideoDropdownOpen, setIsVideoDropdownOpen] = useState(false);

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hello! I am your Pipeline Assistant. You have 5 connected nodes running Claude Opus 5 and Seedance 2.0. Need help optimizing prompt chains or adding LoRA styles?",
    },
  ]);
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; alt: string; title: string } | null>(null);

  // Filter templates
  const filteredTemplates = WORKFLOW_TEMPLATES.filter((tpl) =>
    tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tpl.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions
  const handleAddSocket = () => {
    if (!newSocketInput.trim()) {
      setIsAddingSocket(false);
      return;
    }
    setTextSockets((prev) => [...prev, newSocketInput.trim()]);
    setNewSocketInput("");
    setIsAddingSocket(false);
    toast(`Added "${newSocketInput.trim()}" socket to Text Iterator`, "success");
  };

  const handleRemoveSocket = (index: number) => {
    const removed = textSockets[index];
    setTextSockets((prev) => prev.filter((_, i) => i !== index));
    toast(`Removed socket "${removed}"`, "info");
  };

  const handleExecuteWorkflow = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    toast("Executing pipeline: Text Iterator → Claude Opus 5 → Seedance 2.0...", "info");

    setTimeout(() => {
      setCredits((prev) => Math.max(0, prev - 15));
      setIsExecuting(false);
      toast("Pipeline complete! New video variation rendered in 4.2s (15 credits used).", "success");
    }, 2200);
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage.trim();
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatMessage("");

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Applied optimization for "${userMsg}": Added low-poly mesh filter weights and tuned prompt tokens for 60fps render consistency.`,
        },
      ]);
    }, 700);
  };

  const handleTemplateClick = (tpl: NodeTemplate) => {
    toast(`Loaded template "${tpl.name}" into canvas palette.`, "info");
  };

  return (
    <main
      className="flex-1 flex flex-row gap-3 overflow-hidden relative select-none"
      style={{
        background: "transparent",
        padding: "0px",
      }}
    >
      {/* ============================================================== */}
      {/* 1. LEFT SIDEBAR PANEL: "Node Templates" / Library Palette      */}
      {/* ============================================================== */}
      <div
        className="w-64 h-full shrink-0 flex flex-col rounded-2xl backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden p-3.5 z-20"
        style={{
          background: "rgba(14, 18, 19, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow:
            "rgba(0, 0, 0, 0.5) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
        }}
      >
        {/* Search input with lime icon */}
        <div className="relative flex items-center mb-3 shrink-0">
          <svg
            className="absolute left-2.5 w-4 h-4 text-[#c5f52a]/70 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="2" />
            <line x1="16" y1="16" x2="21" y2="21" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-white/[0.08] text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#c5f52a]/60 transition-colors"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          />
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between px-1 mb-3 shrink-0">
          <span className="text-[10.5px] font-bold text-neutral-300 tracking-wider uppercase font-mono">
            Node Templates
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#c5f52a] font-semibold tracking-wide"
            style={{
              background: "rgba(197, 245, 42, 0.12)",
              border: "1px solid rgba(197, 245, 42, 0.25)",
            }}
          >
            275
          </span>
        </div>

        {/* 2-Column Template Grid */}
        <div className="grid grid-cols-2 gap-2 overflow-y-auto hide-scrollbar flex-1 pr-0.5">
          {filteredTemplates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleTemplateClick(tpl)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white/10 border border-white/[0.08] hover:border-[#c5f52a]/40 transition-all text-neutral-300 group shadow-sm text-center"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}
              title={tpl.description}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm mb-1.5 shadow-sm group-hover:scale-105 transition-transform"
                style={{
                  color: tpl.color,
                  background: tpl.bg,
                  border: `1px solid ${tpl.border}`,
                }}
              >
                {tpl.iconType === "letter" ? (
                  <span>{tpl.letter}</span>
                ) : tpl.iconName === "import" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : tpl.iconName === "export" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : tpl.iconName === "preview" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : tpl.iconName === "model" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : tpl.iconName === "lora" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : tpl.iconName === "multi-lora" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : tpl.iconName === "chatgpt" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polygon points="12 3 22 21 2 21 12 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[10px] font-medium text-white/90 group-hover:text-white leading-tight">
                {tpl.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FLOATING WORKFLOW CANVAS CARD                              */}
      {/* ============================================================== */}
      <div
        className="flex-1 h-full rounded-2xl bg-[#0e0f12]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative"
        style={{
          background: "rgba(14, 18, 19, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow:
            "rgba(0, 0, 0, 0.5) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
        }}
      >
        {/* Central Node Graph Area with Dot Matrix Grid Background */}
        <div
          className="relative flex-1 h-full bg-[#101114] overflow-hidden"
          style={{ background: "rgb(0, 0, 0)" }}
        >
          {/* Dot Matrix Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Interactive Luminescent SVG Connecting Wires */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{
              overflow: "visible",
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
            }}
          >
            <defs>
              <filter id="wire-green-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.6" />
              </filter>
              <filter id="wire-lime-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#c5f52a" floodOpacity="0.65" />
              </filter>
            </defs>

            {/* Wire 1: Text Iterator Right Socket -> LLM Models Top-Left Socket */}
            <path
              d="M 216 65 C 275 65, 290 125, 345 125 C 385 125, 380 73, 420 73"
              fill="none"
              stroke="#10b981"
              strokeWidth={isExecuting ? "2" : "1"}
              filter="url(#wire-green-glow)"
              strokeLinecap="round"
              className={cn("transition-all duration-300", isExecuting && "animate-pulse")}
            />

            {/* Wire 2: Prompt Node Right Socket -> LLM Models Bottom-Left Input Socket */}
            <path
              d="M 256 370 C 370 370, 310 169, 420 169"
              fill="none"
              stroke="#10b981"
              strokeWidth={isExecuting ? "2" : "1"}
              filter="url(#wire-green-glow)"
              strokeLinecap="round"
              className={cn("transition-all duration-300", isExecuting && "animate-pulse")}
            />

            {/* Wire 3: LLM Models Right Output Socket -> Video Generation Top Input Socket */}
            <path
              d="M 628 73 C 715 73, 705 145, 792 145"
              fill="none"
              stroke="#c5f52a"
              strokeWidth={isExecuting ? "2.5" : "1"}
              filter="url(#wire-lime-glow)"
              strokeLinecap="round"
              className={cn("transition-all duration-300", isExecuting && "animate-pulse")}
            />

            {/* Wire 4: Image Generations Right Output Socket -> Video Gen mid input */}
            <path
              d="M 368 729 C 490 729, 560 290, 792 177"
              fill="none"
              stroke="#c5f52a"
              strokeWidth={isExecuting ? "2.5" : "1"}
              filter="url(#wire-lime-glow)"
              strokeLinecap="round"
              className={cn("transition-all duration-300", isExecuting && "animate-pulse")}
            />

            {/* Wire 5: Import Node Right Output Socket -> Video Generation Bottom-Left Input Socket */}
            <path
              d="M 700 729 C 765 729, 740 270, 792 209"
              fill="none"
              stroke="#c5f52a"
              strokeWidth={isExecuting ? "2.5" : "1"}
              filter="url(#wire-lime-glow)"
              strokeLinecap="round"
              className={cn("transition-all duration-300", isExecuting && "animate-pulse")}
            />
          </svg>

          {/* ============================================================== */}
          {/* Canvas Nodes Workspace (Scaled with Zoom level)                */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 p-5 overflow-hidden z-20"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
            }}
          >
            {/* ------------------------------------------------------------ */}
            {/* NODE 1: Text Iterator                                        */}
            {/* ------------------------------------------------------------ */}
            <div
              onClick={() => setSelectedNodeId("text-iterator")}
              className={cn(
                "absolute top-6 left-6 w-48 rounded-2xl p-3 backdrop-blur-md transition-all cursor-pointer group",
                selectedNodeId === "text-iterator" ? "ring-1 ring-[#c5f52a] shadow-[0_0_20px_rgba(197,245,42,0.25)]" : ""
              )}
              style={{
                background: "rgba(20, 24, 24, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "rgba(0, 0, 0, 0.5) 0px 12px 32px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
              }}
            >
              {/* Output Socket */}
              <div
                className="absolute -right-1 top-[41px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#10b981] ring-1 ring-black shadow-[0_0_8px_#10b981] z-20"
                title="String Output Socket"
              />

              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-neutral-200">
                <span className="text-xs font-semibold text-white/90 tracking-wide">
                  Text Iterator
                </span>
                <button
                  className="text-white/40 hover:text-white transition-colors flex items-center justify-center p-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast("Text Iterator: Emits cyclical string seeds into downstream LLMs.", "info");
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                {textSockets.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-7 px-3 rounded-lg flex items-center justify-between text-[10.5px] text-neutral-300 font-sans group/item"
                    style={{
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <span>{item}</span>
                    {textSockets.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSocket(idx);
                        }}
                        className="text-neutral-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity ml-1"
                        title="Delete socket"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                {isAddingSocket && (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Socket string..."
                      value={newSocketInput}
                      onChange={(e) => setNewSocketInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSocket()}
                      className="h-7 px-2 w-full text-[10px] rounded bg-black/60 border border-white/20 text-white focus:outline-none focus:border-[#c5f52a]"
                    />
                    <button
                      onClick={handleAddSocket}
                      className="px-2 h-7 rounded bg-[#c5f52a] text-black text-[10px] font-bold"
                    >
                      ✓
                    </button>
                  </div>
                )}
              </div>

              {/* Add New Socket Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingSocket(true);
                }}
                className="w-full mt-2.5 py-1.5 px-2 rounded-lg text-[10px] text-neutral-300 hover:text-[#c5f52a] flex items-center justify-center gap-1.5 transition-colors"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px dashed rgba(255, 255, 255, 0.15)",
                }}
              >
                <span className="text-xs font-bold">+</span> Add New Text Socket
              </button>

              {/* Floating Collaborator Polina Cursor Badge */}
              <div
                className="absolute top-[78px] -right-7 pointer-events-none z-30 flex items-start gap-0.5 animate-bounce"
                style={{ animationDuration: "2.5s" }}
              >
                <svg
                  className="w-4 h-4 text-[#c5f52a] drop-shadow-md -rotate-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3l7 18 3-7 7-3L3 3z" />
                </svg>
                <span className="px-2 py-0.5 rounded-full bg-[#c5f52a] text-black text-[10px] font-bold tracking-wide shadow-lg">
                  Polina
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NODE 2: Prompt Node                                          */}
            {/* ------------------------------------------------------------ */}
            <div
              onClick={() => setSelectedNodeId("prompt")}
              className={cn(
                "absolute top-[305px] left-12 w-52 rounded-2xl p-3 backdrop-blur-md transition-all cursor-pointer",
                selectedNodeId === "prompt" ? "ring-1 ring-[#c5f52a] shadow-[0_0_20px_rgba(197,245,42,0.25)]" : ""
              )}
              style={{
                background: "rgba(20, 24, 24, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "rgba(0, 0, 0, 0.5) 0px 12px 32px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
              }}
            >
              {/* Output Socket */}
              <div
                className="absolute -right-1 top-[65px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#10b981] ring-1 ring-black shadow-[0_0_8px_#10b981] z-20"
                title="Prompt Output Socket"
              />

              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-neutral-200">
                <span className="text-xs font-semibold text-white/90 tracking-wide">
                  Prompt
                </span>
                <button
                  className="text-white/40 hover:text-white transition-colors flex items-center justify-center p-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingPrompt(!isEditingPrompt);
                  }}
                  title="Edit prompt text"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>

              {isEditingPrompt ? (
                <div>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={3}
                    className="w-full p-2 rounded-xl text-[10px] leading-relaxed text-white bg-black/60 border border-[#c5f52a]/40 focus:outline-none"
                  />
                  <button
                    onClick={() => setIsEditingPrompt(false)}
                    className="mt-1 px-2 py-0.5 rounded bg-[#c5f52a] text-black text-[9px] font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div
                  onDoubleClick={() => setIsEditingPrompt(true)}
                  className="p-2.5 rounded-xl text-[10px] leading-relaxed text-neutral-300 font-sans cursor-text hover:text-white transition-colors"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                  title="Double click to edit"
                >
                  {promptText}
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NODE 3: LLM Models Node                                      */}
            {/* ------------------------------------------------------------ */}
            <div
              onClick={() => setSelectedNodeId("llm-models")}
              className={cn(
                "absolute top-6 left-[420px] w-52 rounded-2xl p-3 backdrop-blur-md transition-all cursor-pointer",
                selectedNodeId === "llm-models" ? "ring-1 ring-[#c5f52a] shadow-[0_0_20px_rgba(197,245,42,0.25)]" : ""
              )}
              style={{
                background: "rgba(20, 24, 24, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "rgba(0, 0, 0, 0.5) 0px 12px 32px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
              }}
            >
              {/* Input Sockets on Left */}
              <div
                className="absolute -left-1 top-[49px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#10b981] ring-1 ring-black shadow-[0_0_8px_#10b981] z-20"
                title="Input: Iterator Seed"
              />
              <div
                className="absolute -left-1 top-[145px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#10b981] ring-1 ring-black shadow-[0_0_8px_#10b981] z-20"
                title="Input: System Prompt"
              />

              {/* Output Socket on Right */}
              <div
                className="absolute -right-1 top-[49px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c5f52a] ring-1 ring-black shadow-[0_0_8px_#c5f52a] z-20"
                title="Output: Synthesized Prompt"
              />

              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-neutral-200">
                <span className="text-xs font-semibold text-white/90 tracking-wide">
                  LLM Models
                </span>
                <button
                  className="text-white/40 hover:text-white transition-colors flex items-center justify-center p-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast("LLM Models: Generates scene directions & low-poly shaders.", "info");
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>

              {/* Text Container with Pagination */}
              <div
                className="p-2.5 rounded-xl text-[9.5px] leading-relaxed text-neutral-300 font-sans h-[195px] overflow-hidden relative flex flex-col justify-between"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <p className="text-neutral-300 overflow-y-auto hide-scrollbar pr-0.5">
                  {INITIAL_WORKFLOW_STATE.llmNode.outputPages[llmPage - 1]}
                </p>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-2 text-neutral-400 font-mono text-[9px] bg-gradient-to-t from-black via-black/80 to-transparent pt-3 pb-0.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLlmPage((p) => (p > 1 ? p - 1 : 3));
                    }}
                    className="hover:text-white font-bold px-1"
                  >
                    &lt;
                  </button>
                  <span className="text-white font-semibold">
                    {llmPage} / 3
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLlmPage((p) => (p < 3 ? p + 1 : 1));
                    }}
                    className="hover:text-white font-bold px-1"
                  >
                    &gt;
                  </button>
                </div>
              </div>

              {/* Model Selector Pill */}
              <div className="relative mt-2.5">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLlmDropdownOpen(!isLlmDropdownOpen);
                  }}
                  className="h-8 px-2.5 rounded-xl flex items-center justify-between text-[11px] text-neutral-200 cursor-pointer transition-colors group hover:bg-white/10"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#c5f52a] to-emerald-400 flex items-center justify-center text-[8px] font-bold text-black">
                      ✦
                    </span>
                    <span className="font-medium text-[11px] group-hover:text-white">
                      {llmModel}
                    </span>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#c5f52a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {isLlmDropdownOpen && (
                  <div
                    className="absolute top-10 left-0 right-0 z-50 rounded-xl p-1 bg-black/95 border border-white/15 shadow-2xl backdrop-blur-xl"
                  >
                    {INITIAL_WORKFLOW_STATE.llmNode.models.map((m) => (
                      <button
                        key={m}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLlmModel(m);
                          setIsLlmDropdownOpen(false);
                          toast(`Model switched to ${m}`, "info");
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-[10.5px] transition-colors flex items-center justify-between",
                          llmModel === m
                            ? "bg-[#c5f52a]/15 text-[#c5f52a] font-semibold"
                            : "text-neutral-300 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span>{m}</span>
                        {llmModel === m && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NODE 4: Image Generations Node                               */}
            {/* ------------------------------------------------------------ */}
            <div
              onClick={() => setSelectedNodeId("image-gen")}
              className={cn(
                "absolute bottom-10 left-[160px] w-52 rounded-2xl p-3 backdrop-blur-md transition-all cursor-pointer",
                selectedNodeId === "image-gen" ? "ring-1 ring-[#c5f52a] shadow-[0_0_20px_rgba(197,245,42,0.25)]" : ""
              )}
              style={{
                background: "rgba(20, 24, 24, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "rgba(0, 0, 0, 0.5) 0px 12px 32px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
              }}
            >
              {/* Output Socket */}
              <div
                className="absolute -right-1 top-[125px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c5f52a] ring-1 ring-black shadow-[0_0_8px_#c5f52a] z-20"
                title="Image Output Socket"
              />

              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-neutral-200">
                <span className="text-xs font-semibold text-white/90 tracking-wide">
                  Image Generations
                </span>
                <button
                  className="text-white/40 hover:text-white transition-colors flex items-center justify-center p-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast("Image Generations: Synthesizes initial frame reference.", "info");
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>

              {/* Image Preview Container */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewModalImage({
                    url: INITIAL_WORKFLOW_STATE.imageGenNode.imageUrl,
                    alt: INITIAL_WORKFLOW_STATE.imageGenNode.alt,
                    title: "Image Generations — Fox Synth Style",
                  });
                }}
                className="w-full h-44 rounded-xl overflow-hidden relative flex items-center justify-center cursor-pointer group/img"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <img
                  src={INITIAL_WORKFLOW_STATE.imageGenNode.imageUrl}
                  alt={INITIAL_WORKFLOW_STATE.imageGenNode.alt}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] text-white font-mono bg-black/70 px-2 py-1 rounded-full">
                    Click to Inspect
                  </span>
                </div>
              </div>

              {/* Model Selector Pill */}
              <div className="relative mt-2.5">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageDropdownOpen(!isImageDropdownOpen);
                  }}
                  className="h-8 px-2.5 rounded-xl flex items-center justify-between text-[11px] text-neutral-200 cursor-pointer transition-colors group hover:bg-white/10"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#c5f52a] text-xs font-bold">✦</span>
                    <span className="font-medium text-[11px] group-hover:text-white">
                      {imageModel}
                    </span>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#c5f52a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {isImageDropdownOpen && (
                  <div
                    className="absolute bottom-10 left-0 right-0 z-50 rounded-xl p-1 bg-black/95 border border-white/15 shadow-2xl backdrop-blur-xl"
                  >
                    {INITIAL_WORKFLOW_STATE.imageGenNode.models.map((m) => (
                      <button
                        key={m}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageModel(m);
                          setIsImageDropdownOpen(false);
                          toast(`Image Generator switched to ${m}`, "info");
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-[10.5px] transition-colors flex items-center justify-between",
                          imageModel === m
                            ? "bg-[#c5f52a]/15 text-[#c5f52a] font-semibold"
                            : "text-neutral-300 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span>{m}</span>
                        {imageModel === m && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NODE 5: Import Node                                          */}
            {/* ------------------------------------------------------------ */}
            <div
              onClick={() => setSelectedNodeId("import")}
              className={cn(
                "absolute bottom-10 left-[492px] w-52 rounded-2xl p-3 backdrop-blur-md transition-all cursor-pointer",
                selectedNodeId === "import" ? "ring-1 ring-[#c5f52a] shadow-[0_0_20px_rgba(197,245,42,0.25)]" : ""
              )}
              style={{
                background: "rgba(20, 24, 24, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "rgba(0, 0, 0, 0.5) 0px 12px 32px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
              }}
            >
              {/* Output Socket */}
              <div
                className="absolute -right-1 top-[125px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c5f52a] ring-1 ring-black shadow-[0_0_8px_#c5f52a] z-20"
                title="Import Output Socket"
              />

              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-neutral-200">
                <span className="text-xs font-semibold text-white/90 tracking-wide">
                  Import
                </span>
                <button
                  className="text-white/40 hover:text-white transition-colors flex items-center justify-center p-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast("Import Node: Reference visual keyframe input.", "info");
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>

              {/* Imported Image */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewModalImage({
                    url: INITIAL_WORKFLOW_STATE.importNode.imageUrl,
                    alt: INITIAL_WORKFLOW_STATE.importNode.alt,
                    title: "Import Reference Asset — Cinematic Lighting Keyframe",
                  });
                }}
                className="w-full h-44 rounded-xl overflow-hidden relative flex items-center justify-center cursor-pointer group/import"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <img
                  src={INITIAL_WORKFLOW_STATE.importNode.imageUrl}
                  alt={INITIAL_WORKFLOW_STATE.importNode.alt}
                  className="w-full h-full object-cover group-hover/import:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/import:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] text-white font-mono bg-black/70 px-2 py-1 rounded-full">
                    Click to Inspect
                  </span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* FLOATING VIDEO CONTROLS TOOLBAR (Above Video Generation)      */}
            {/* ------------------------------------------------------------ */}
            <div
              className="absolute top-12 right-8 flex items-center justify-between px-3 py-1.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-md gap-3 z-30"
              style={{
                background: "rgba(20, 24, 24, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow:
                  "rgba(0, 0, 0, 0.4) 0px 8px 20px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
              }}
            >
              {/* Left: Run button & Credits */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting}
                  className={cn(
                    "w-6 h-6 rounded-full bg-brand-lime text-black flex items-center justify-center hover:bg-[#b1de22] transition-transform active:scale-95 shadow-sm font-bold",
                    isExecuting && "animate-spin"
                  )}
                  title="Run / Execute Pipeline (15 credits)"
                >
                  <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-white/80">
                  <svg
                    className="w-3.5 h-3.5 text-[#C5F52A]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>{" "}
                  {credits}
                </span>
              </div>

              {/* Right: Note, Download, Delete actions */}
              <div className="flex items-center gap-2 text-neutral-400">
                <button
                  onClick={() => toast("Exporting pipeline execution log...", "info")}
                  className="w-5 h-5 rounded hover:text-white flex items-center justify-center transition-colors"
                  title="View / Edit Run Notes"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => toast("Downloading high-definition MP4 master file...", "success")}
                  className="w-5 h-5 rounded hover:text-white flex items-center justify-center transition-colors"
                  title="Download Generated Video"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    toast("Resetting pipeline cache.", "info");
                  }}
                  className="w-5 h-5 rounded hover:text-red-400 flex items-center justify-center transition-colors"
                  title="Clear Output Cache"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* NODE 6: Video Generation Node                                */}
            {/* ------------------------------------------------------------ */}
            <div
              onClick={() => setSelectedNodeId("video-gen")}
              className={cn(
                "absolute top-24 right-8 w-64 rounded-2xl p-3 backdrop-blur-md transition-all cursor-pointer",
                selectedNodeId === "video-gen" ? "ring-1 ring-[#c5f52a] shadow-[0_0_20px_rgba(197,245,42,0.25)]" : ""
              )}
              style={{
                background: "rgba(20, 24, 24, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "rgba(0, 0, 0, 0.5) 0px 12px 32px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
              }}
            >
              {/* 3 Input Sockets on Left */}
              <div
                className="absolute -left-1 top-[49px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c5f52a] ring-1 ring-black shadow-[0_0_8px_#c5f52a] z-20"
                title="Input: LLM Direction"
              />
              <div
                className="absolute -left-1 top-[81px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c5f52a] ring-1 ring-black shadow-[0_0_8px_#c5f52a] z-20"
                title="Input: Image Synth Reference"
              />
              <div
                className="absolute -left-1 top-[113px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c5f52a] ring-1 ring-black shadow-[0_0_8px_#c5f52a] z-20"
                title="Input: Keyframe Import"
              />

              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.06] text-neutral-200">
                <span className="text-xs font-semibold text-white/90 tracking-wide">
                  Video Generation
                </span>
                <button
                  className="text-white/40 hover:text-white transition-colors flex items-center justify-center p-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast("Video Generation: Seedance 2.0 multi-conditioned video renderer.", "info");
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>

              {/* Video Preview with Carousel and Overlay */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewModalImage({
                    url: INITIAL_WORKFLOW_STATE.videoGenNode.variations[videoPage - 1].imageUrl,
                    alt: INITIAL_WORKFLOW_STATE.videoGenNode.variations[videoPage - 1].alt,
                    title: `Video Generation — Variation ${videoPage} (${videoModel})`,
                  });
                }}
                className="w-full h-80 rounded-xl overflow-hidden relative group/vid shadow-inner cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <img
                  src={INITIAL_WORKFLOW_STATE.videoGenNode.variations[videoPage - 1].imageUrl}
                  alt={INITIAL_WORKFLOW_STATE.videoGenNode.variations[videoPage - 1].alt}
                  className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-500"
                />

                {/* Duration Tag */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-white/90">
                  {INITIAL_WORKFLOW_STATE.videoGenNode.variations[videoPage - 1].duration}
                </div>

                {/* Carousel Controls */}
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 text-neutral-300 font-mono text-[10px] bg-gradient-to-t from-black/80 via-black/40 to-transparent py-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoPage((p) => (p > 1 ? p - 1 : 3));
                    }}
                    className="hover:text-white font-bold px-1.5 py-0.5"
                  >
                    &lt;
                  </button>
                  <span className="text-white font-semibold">
                    {videoPage} / 3
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoPage((p) => (p < 3 ? p + 1 : 1));
                    }}
                    className="hover:text-white font-bold px-1.5 py-0.5"
                  >
                    &gt;
                  </button>
                </div>
              </div>

              {/* Generator Model Selector Pill */}
              <div className="relative mt-2.5">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoDropdownOpen(!isVideoDropdownOpen);
                  }}
                  className="h-8 px-2.5 rounded-xl flex items-center justify-between text-[11px] text-neutral-200 cursor-pointer transition-colors group hover:bg-white/10"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#c5f52a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2" strokeLinecap="round" />
                      <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="font-medium text-[11px] group-hover:text-white">
                      {videoModel}
                    </span>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#c5f52a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {isVideoDropdownOpen && (
                  <div
                    className="absolute bottom-10 left-0 right-0 z-50 rounded-xl p-1 bg-black/95 border border-white/15 shadow-2xl backdrop-blur-xl"
                  >
                    {INITIAL_WORKFLOW_STATE.videoGenNode.models.map((m) => (
                      <button
                        key={m}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoModel(m);
                          setIsVideoDropdownOpen(false);
                          toast(`Video Engine switched to ${m}`, "info");
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-[10.5px] transition-colors flex items-center justify-between",
                          videoModel === m
                            ? "bg-[#c5f52a]/15 text-[#c5f52a] font-semibold"
                            : "text-neutral-300 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span>{m}</span>
                        {videoModel === m && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* Bottom Floating Workflow Toolbar Puck                          */}
          {/* ============================================================== */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.8)]"
            style={{
              background: "rgba(14, 18, 19, 0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow:
                "rgba(0, 0, 0, 0.6) 0px 12px 32px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset",
            }}
          >
            {/* 1. Pan Tool */}
            <button
              onClick={() => setActiveTool("pan")}
              className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center shadow-sm font-semibold transition-transform hover:scale-105",
                activeTool === "pan" ? "bg-brand-lime text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
              title="Hand / Pan Tool"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 11V7a2 2 0 014 0v4m0-4a2 2 0 014 0v4m0-4a2 2 0 014 0v7a6 6 0 01-12 0v-3a2 2 0 014 0v3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* 2. Title Tool */}
            <button
              onClick={() => setActiveTool("title")}
              className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center transition-colors",
                activeTool === "title" ? "bg-brand-lime text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
              title="Text / Title Tool"
            >
              <span className="font-bold text-xs">T</span>
            </button>

            {/* 3. Crop / Square Tool */}
            <button
              onClick={() => setActiveTool("box")}
              className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center transition-colors",
                activeTool === "box" ? "bg-brand-lime text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
              title="Box / Region Tool"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
              </svg>
            </button>

            {/* 4. Polyline / Connector Tool */}
            <button
              onClick={() => setActiveTool("polyline")}
              className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center transition-colors",
                activeTool === "polyline" ? "bg-brand-lime text-black" : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
              title="Polyline / Wire Tool"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="4 7 10 17 14 11 20 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="h-4 w-[1px] bg-neutral-700/60 mx-1" />

            {/* 5. Zoom Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsZoomDropdownOpen(!isZoomDropdownOpen)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>{zoomLevel}%</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {isZoomDropdownOpen && (
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 rounded-xl p-1 bg-black/95 border border-white/15 shadow-2xl backdrop-blur-xl flex flex-col gap-0.5 w-24 z-50">
                  {[50, 75, 100, 125, 150].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setZoomLevel(lvl);
                        setIsZoomDropdownOpen(false);
                      }}
                      className={cn(
                        "px-2 py-1 text-[10px] font-mono text-left rounded-lg transition-colors",
                        zoomLevel === lvl ? "bg-[#c5f52a] text-black font-bold" : "text-neutral-300 hover:bg-white/10"
                      )}
                    >
                      {lvl}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-neutral-700/60 mx-1" />

            {/* 6. Undo */}
            <button
              onClick={() => toast("Undo: Reverted last node edit.", "info")}
              className="w-7 h-7 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
              title="Undo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 10h10a5 5 0 015 5v2M3 10l6-6M3 10l6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* 7. Redo */}
            <button
              onClick={() => toast("Redo: Restored next action.", "info")}
              className="w-7 h-7 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
              title="Redo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 10H11a5 5 0 00-5 5v2M21 10l-6-6M21 10l-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* ============================================================== */}
          {/* Floating Action Chat / Assistant Button                        */}
          {/* ============================================================== */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="absolute bottom-4 right-4 z-30 w-11 h-11 rounded-2xl bg-brand-lime text-black flex items-center justify-center shadow-[0_8px_25px_rgba(197,245,42,0.4)] hover:bg-[#b1de22] transition-transform hover:scale-105 active:scale-95 font-bold"
            title="Open Pipeline AI Assistant"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* AI Assistant Chat Modal / Drawer                               */}
      {/* ============================================================== */}
      {isChatOpen && (
        <div
          className="absolute right-4 bottom-18 w-80 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 flex flex-col gap-3"
          style={{
            background: "rgba(10, 14, 15, 0.95)",
            border: "1px solid rgba(197, 245, 42, 0.3)",
            boxShadow:
              "rgba(0, 0, 0, 0.7) 0px 16px 40px, rgba(197, 245, 42, 0.15) 0px 0px 30px",
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c5f52a] animate-ping" />
              <span className="text-xs font-bold text-white tracking-wide">
                Pipeline AI Copilot
              </span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-neutral-400 hover:text-white text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 max-h-60 overflow-y-auto hide-scrollbar space-y-2 text-xs">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-2.5 rounded-xl leading-relaxed",
                  item.role === "assistant"
                    ? "bg-white/5 text-neutral-200 border border-white/5"
                    : "bg-[#c5f52a]/15 text-[#c5f52a] border border-[#c5f52a]/25 ml-4"
                )}
              >
                {item.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
            <input
              type="text"
              placeholder="Ask copilot to tune nodes..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c5f52a]"
            />
            <button
              onClick={handleSendChatMessage}
              className="px-3 py-1.5 rounded-xl bg-[#c5f52a] text-black text-xs font-bold hover:bg-[#b1de22]"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Modal: Fullscreen Asset Preview                                */}
      {/* ============================================================== */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full rounded-2xl overflow-hidden bg-[#0d0f12] border border-white/15 p-4 flex flex-col gap-3 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-sm font-semibold text-white">
                {previewModalImage.title}
              </span>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="text-neutral-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>
            <div className="w-full max-h-[70vh] rounded-xl overflow-hidden flex items-center justify-center bg-black">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.alt}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
              <span>High-fidelity synthetic asset frame</span>
              <button
                onClick={() => toast("Asset saved to local Media Library.", "success")}
                className="px-3 py-1.5 rounded-lg bg-[#c5f52a] text-black font-semibold text-xs hover:bg-[#b1de22]"
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

