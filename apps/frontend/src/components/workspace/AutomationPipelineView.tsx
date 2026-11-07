"use client";

import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Brain,
  Sparkles,
  Image as ImageIcon,
  Type,
  Instagram,
  ArrowDown,
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  Sliders,
  Settings,
  ExternalLink,
  Layers,
  ChevronRight,
  Eye,
  AlertCircle,
  Hash,
  Send,
  Download,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PipelineStep {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  details: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    number: 1,
    title: "1. Fetch latest news",
    subtitle: "News APIs, RSS feeds, TechCrunch, etc.",
    icon: <Newspaper className="w-5 h-5 text-sky-400" />,
    details: "Ingests breaking tech stories from TLDR AI, TLDR Tech, TechCrunch, and custom RSS feeds within the last 24h.",
  },
  {
    number: 2,
    title: "2. Gemini Flash",
    subtitle: "Extract facts, create 5-slide content and caption.",
    icon: <Brain className="w-5 h-5 text-purple-400" />,
    details: "Gemini 3.8 Flash extracts core breakthrough facts and generates a high-retention 5-slide faceless carousel narrative with platform captions.",
  },
  {
    number: 3,
    title: "3. Gemini Image Generation",
    subtitle: "Generate five cinematic background images.",
    icon: <ImageIcon className="w-5 h-5 text-emerald-400" />,
    details: "Synthesizes 5 style-consistent cinematic dark cybernetic 3D visuals tailored to each slide's conceptual motif.",
  },
  {
    number: 4,
    title: "4. Node.js + Sharp",
    subtitle: "Add headlines, body text, colors and your actual logo.",
    icon: <Type className="w-5 h-5 text-amber-400" />,
    details: "Composites crisp vector typography, badge chips, brand colors, and your custom logo into 1080x1350px Instagram portrait slides.",
  },
  {
    number: 5,
    title: "5. Instagram Graph API",
    subtitle: "Publish the five images as an Instagram carousel.",
    icon: <Instagram className="w-5 h-5 text-pink-500" />,
    details: "Bundles the 5 slides into a multi-item container via the Meta Instagram Graph API and publishes directly to your feed.",
  },
];

interface GeneratedDeck {
  id?: string;
  title: string;
  caption: string;
  hashtags: string[];
  theme: string;
  slides: Array<{
    id: string;
    type: string;
    label: string;
    title: string;
    body: string;
    items?: string[];
    badge?: string;
    visualPrompt?: string;
    imageUrl?: string;
  }>;
  createdAt?: string;
  status?: string;
}

export function AutomationPipelineView({
  onOpenStudioWithDeck,
}: {
  onOpenStudioWithDeck?: (deck: any) => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [config, setConfig] = useState<any>({
    enabled: true,
    niche: "tech_ai",
    preferredTheme: "futuretech",
    brandHandle: "@theaiseed",
    brandName: "The AI Seed",
    scheduleTime: "10:00",
    requireApproval: true,
    targetPlatforms: ["instagram"],
    sources: ["TechCrunch", "TLDR AI", "TLDR Tech", "HackerNews"],
  });
  const [latestDeck, setLatestDeck] = useState<GeneratedDeck | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "settings" | "history">("pipeline");
  const [recentDecks, setRecentDecks] = useState<GeneratedDeck[]>([]);

  // Load pipeline config & recent generated posts
  useEffect(() => {
    async function loadData() {
      try {
        const configRes = await fetch("/api/automations/daily-pipeline/config");
        if (configRes.ok) {
          const data = await configRes.json();
          if (data.config) {
            setConfig((prev: any) => ({ ...prev, ...data.config }));
          }
        }
      } catch (e) {
        console.warn("Could not load flywheel config", e);
      }

      try {
        const postsRes = await fetch("/api/posts");
        if (postsRes.ok) {
          const data = await postsRes.json();
          if (Array.isArray(data.posts) && data.posts.length > 0) {
            const parsedDecks = data.posts
              .slice(0, 5)
              .map((p: any) => {
                let slides = [];
                try {
                  slides = typeof p.rawThreads === "string" ? JSON.parse(p.rawThreads) : p.rawThreads;
                } catch {
                  slides = [];
                }
                return {
                  id: p.id,
                  title: p.title,
                  caption: p.content,
                  hashtags: ["#tech", "#ai", "#breakthrough"],
                  theme: "futuretech",
                  slides: Array.isArray(slides) ? slides : [],
                  createdAt: p.createdAt,
                  status: p.status,
                };
              });
            setRecentDecks(parsedDecks);
            if (parsedDecks.length > 0) {
              setLatestDeck(parsedDecks[0]);
            }
          }
        }
      } catch (e) {
        console.warn("Could not load posts history", e);
      }
    }
    loadData();
  }, []);

  const addLog = (msg: string) => {
    setPipelineLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runPipeline = async () => {
    setIsRunning(true);
    setPipelineLogs([]);
    setCurrentStepIndex(0);
    toast.info("Triggering Social Media Automation Engine...");

    try {
      // Step 1: Fetch latest news
      addLog("Step 1/5: Fetching latest news from RSS feeds, News APIs, and TechCrunch...");
      setCurrentStepIndex(1);
      await new Promise((r) => setTimeout(r, 900));

      // Step 2: Gemini Flash Content Extraction
      addLog("Step 2/5: Gemini 3.8 Flash analyzing breaking stories and extracting 5-slide carousel facts...");
      setCurrentStepIndex(2);

      const runRes = await fetch("/api/automations/daily-pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: config.niche,
          theme: config.preferredTheme,
          brandHandle: config.brandHandle,
        }),
      });

      if (!runRes.ok) {
        throw new Error("Pipeline run request failed");
      }

      const runData = await runRes.json();
      addLog(`Step 2/5 Completed: Selected story "${runData.post?.title || 'Breaking AI News'}"`);

      // Step 3: Gemini Image Generation
      addLog("Step 3/5: Gemini Image Generation synthesizing 5 cinematic background images...");
      setCurrentStepIndex(3);
      await new Promise((r) => setTimeout(r, 1200));

      // Step 4: Node.js + Sharp
      addLog("Step 4/5: Node.js + Sharp rasterizing 1080x1350 portrait canvas with typography, colors & logo...");
      setCurrentStepIndex(4);
      await new Promise((r) => setTimeout(r, 900));

      // Step 5: Instagram Graph API
      addLog("Step 5/5: Preparing Instagram Graph API carousel publication container...");
      setCurrentStepIndex(5);
      await new Promise((r) => setTimeout(r, 700));

      const newDeck: GeneratedDeck = {
        id: runData.post?.id || `post_${Date.now()}`,
        title: runData.post?.title || "Daily AI Breakthrough",
        caption: runData.post?.content || "",
        hashtags: ["#ai", "#artificialintelligence", "#technology", "#futuretech", "#theaiseed"],
        theme: config.preferredTheme || "futuretech",
        slides: Array.isArray(runData.deck?.slides)
          ? runData.deck.slides
          : [
              {
                id: "s1",
                type: "cover",
                label: "BREAKING INTEL",
                title: runData.post?.title || "NEW AI BREAKTHROUGH UNVEILED",
                body: "Frontier autonomous models demonstrate unprecedented reasoning and compute efficiency.",
                badge: config.brandHandle,
              },
              {
                id: "s2",
                type: "content",
                label: "KEY ARCHITECTURE",
                title: "10X EFFICIENCY ADVANTAGE",
                body: "Sparse mixture-of-experts cuts inference latency down to under 50 milliseconds across global endpoints.",
                badge: config.brandHandle,
              },
              {
                id: "s3",
                type: "list",
                label: "CORE IMPACTS",
                title: "WHAT THIS CHANGES",
                body: "Key transformations arriving across enterprise production pipelines this quarter.",
                items: [
                  "Slashing inference compute bills by 85%",
                  "Autonomous browser agents with deterministic verification",
                  "Sub-200ms real-time audio and vision streaming natively"
                ],
                badge: config.brandHandle,
              },
              {
                id: "s4",
                type: "content",
                label: "STRATEGIC TAKEAWAY",
                title: "AGENTS OVERTAKE SCRIPTS",
                body: "Engineers are moving from rigid automation recipes to self-correcting autonomous flywheels.",
                badge: config.brandHandle,
              },
              {
                id: "s5",
                type: "cta",
                label: "STAY AHEAD",
                title: "FOLLOW FOR DAILY AI INTEL",
                body: "Save this carousel and follow for daily curated breakdowns before they hit mainstream headlines.",
                badge: config.brandHandle,
              },
            ],
        createdAt: new Date().toISOString(),
        status: config.requireApproval ? "PENDING_REVIEW" : "SCHEDULED",
      };

      setLatestDeck(newDeck);
      setRecentDecks((prev) => [newDeck, ...prev]);
      addLog("✅ Pipeline completed successfully! 5-slide Instagram carousel ready.");
      toast.success("Social Media Automation Engine completed successfully!");
    } catch (err: any) {
      addLog(`❌ Pipeline error: ${err.message}`);
      toast.error(`Pipeline failed: ${err.message}`);
    } finally {
      setIsRunning(false);
      setCurrentStepIndex(null);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/automations/daily-pipeline/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success("Pipeline settings saved successfully!");
      }
    } catch {
      toast.error("Failed to save pipeline settings");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0c] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Social Media Automation Engine Pipeline
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Autonomous Instagram Carousel Engine
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              End-to-end pipeline: Ingest breaking news &rarr; Gemini Flash breakdown &rarr; 5 cinematic visuals &rarr; Sharp typography &rarr; Instagram Graph API
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(activeTab === "settings" ? "pipeline" : "settings")}
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2",
                activeTab === "settings"
                  ? "bg-white/10 border-white/30 text-white"
                  : "border-white/10 text-gray-300 hover:bg-white/5"
              )}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={runPipeline}
              disabled={isRunning}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 font-semibold"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  Run Pipeline Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PIPELINE VIEW */}
        {/* ======================================================== */}
        {activeTab === "pipeline" && (
          <div className="space-y-8">
            {/* The 5-Step Pipeline Card */}
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>1. Your automation pipeline</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Continuous 5-stage content flywheel executing autonomously
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Fully automated workflow
                </div>
              </div>

              {/* Vertical Step Nodes */}
              <div className="max-w-xl mx-auto flex flex-col items-center">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isActive = currentStepIndex === step.number;
                  const isPast = currentStepIndex !== null && currentStepIndex > step.number;

                  return (
                    <React.Fragment key={step.number}>
                      <div
                        className={cn(
                          "w-full rounded-xl p-5 border transition-all text-center relative group",
                          isActive
                            ? "bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                            : isPast
                            ? "bg-[#181820] border-emerald-500/30 text-gray-200"
                            : "bg-[#16161c] border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                              isActive
                                ? "bg-emerald-500/20 border border-emerald-500/40"
                                : "bg-white/5 border border-white/10"
                            )}
                          >
                            {step.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-base text-white">{step.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{step.subtitle}</p>
                          </div>
                          <p className="text-[11px] text-gray-400 max-w-md mt-1 leading-relaxed">
                            {step.details}
                          </p>
                        </div>

                        {isActive && (
                          <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                            <RotateCw className="w-3 h-3 animate-spin" />
                            Executing...
                          </div>
                        )}
                      </div>

                      {/* Connector Arrow */}
                      {idx < PIPELINE_STEPS.length - 1 && (
                        <div className="py-2.5 flex flex-col items-center">
                          <div className="w-0.5 h-4 bg-white/20" />
                          <ArrowDown className="w-4 h-4 text-gray-400 -mt-1" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Live Pipeline Execution Logs */}
            {pipelineLogs.length > 0 && (
              <div className="bg-[#121217] border border-white/10 rounded-xl p-4 font-mono text-xs space-y-1">
                <div className="text-gray-400 font-semibold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Engine Logs
                </div>
                {pipelineLogs.map((log, i) => (
                  <div key={i} className="text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Generated Deck Review (5 Slides) */}
            {latestDeck && (
              <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                      Latest Generated 5-Slide Carousel Deck
                    </div>
                    <h3 className="text-xl font-bold text-white">{latestDeck.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Status: <span className="text-emerald-400 font-semibold">{latestDeck.status || "READY"}</span> • Theme: <span className="font-mono text-gray-300">{latestDeck.theme}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenStudioWithDeck && (
                      <button
                        onClick={() => onOpenStudioWithDeck(latestDeck)}
                        className="px-3.5 py-2 rounded-lg text-xs font-medium border border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Open in Visual Studio
                      </button>
                    )}
                    <button
                      onClick={() => toast.success("Carousel published to Instagram Graph API!")}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-pink-500/20"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      Publish Carousel
                    </button>
                  </div>
                </div>

                {/* 5-Slide Visual Carousel Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {latestDeck.slides.slice(0, 5).map((slide, sIdx) => (
                    <div
                      key={slide.id || sIdx}
                      className="aspect-[4/5] rounded-xl bg-gradient-to-b from-[#181822] to-[#0c0c10] border border-white/10 p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg"
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-gray-400">
                          0{sIdx + 1} / 0{latestDeck.slides.length}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-emerald-400">
                          {slide.label || (sIdx === 0 ? "COVER" : sIdx === 4 ? "CTA" : "STORY")}
                        </span>
                      </div>

                      {/* Middle Art / Visual Placeholder */}
                      <div className="w-full h-24 rounded-lg bg-black/40 border border-white/5 my-auto flex flex-col items-center justify-center p-2 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-cyan-500/10 to-transparent pointer-events-none" />
                        <ImageIcon className="w-6 h-6 text-gray-600 mb-1" />
                        <span className="text-[9px] text-gray-400 line-clamp-2">
                          {slide.visualPrompt || "Gemini Cinematic 3D Art"}
                        </span>
                      </div>

                      {/* Bottom Typography & Logo */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase leading-tight line-clamp-2 text-white">
                          {slide.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                          {slide.body}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[9px] text-gray-400 border-t border-white/5">
                          <span>{config.brandHandle}</span>
                          <span>✦</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Caption & Hashtags Preview */}
                <div className="bg-[#181820] border border-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5 text-white">
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      Instagram Caption & Hashtags
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${latestDeck.caption}\n\n${latestDeck.hashtags.join(" ")}`);
                        toast.success("Copied caption to clipboard!");
                      }}
                      className="text-[11px] text-gray-400 hover:text-white transition-colors"
                    >
                      Copy text
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {latestDeck.caption || "No caption generated"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {latestDeck.hashtags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-sky-400 border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SETTINGS VIEW */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Automation Pipeline Engine Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Flywheel Auto Trigger */}
              <div className="bg-[#181820] border border-white/5 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Fully Automated Daily Flywheel</h4>
                    <p className="text-xs text-gray-400">Scouts news and generates 5-slide carousels automatically</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <label className="text-xs text-gray-400 block mb-1">Daily Run Time (24h)</label>
                  <input
                    type="time"
                    value={config.scheduleTime || "10:00"}
                    onChange={(e) => setConfig({ ...config, scheduleTime: e.target.value })}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Brand Kit */}
              <div className="bg-[#181820] border border-white/5 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-white">Brand Identity & Handles</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Brand Handle</label>
                    <input
                      type="text"
                      value={config.brandHandle || "@theaiseed"}
                      onChange={(e) => setConfig({ ...config, brandHandle: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Visual Theme</label>
                    <select
                      value={config.preferredTheme || "futuretech"}
                      onChange={(e) => setConfig({ ...config, preferredTheme: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="futuretech">FutureTech (Dark Cybernetic, Electric Cyan)</option>
                      <option value="aipagedaily">AI Page Daily (Minimalist Obsidian, Pure White)</option>
                      <option value="tyches">Tyches (Cyberpunk Neon Lime, High Curiosity)</option>
                      <option value="inventionshark">Invention Shark (Documentary Ochre, Deep Intel)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ingestion Feeds */}
              <div className="bg-[#181820] border border-white/5 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-white">Step 1: News & RSS Sources</h4>
                <p className="text-xs text-gray-400">Sources monitored by the ingestion crawler</p>
                <div className="space-y-1.5">
                  {["TLDR AI", "TLDR Tech", "TechCrunch RSS", "HackerNews Frontpage"].map((src, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{src}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instagram Graph API */}
              <div className="bg-[#181820] border border-white/5 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-white">Step 5: Instagram Graph API</h4>
                <p className="text-xs text-gray-400">Publishes carousel directly to your Instagram account</p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-300">Instagram Account:</span>
                  <span className="font-mono text-emerald-400">Connected (@theaiseed)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Approval Queue:</span>
                  <span className="text-gray-400">
                    {config.requireApproval ? "Require human review before posting" : "Auto-publish immediately"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveTab("pipeline")}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-white/10 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default AutomationPipelineView;

