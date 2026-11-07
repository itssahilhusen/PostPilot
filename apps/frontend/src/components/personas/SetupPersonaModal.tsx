"use client";

import React, { useState } from "react";
import {
  X,
  UserCheck,
  Compass,
  Copy,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PersonaData } from "@/lib/persona-defaults";

interface SetupPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: number; // 0 or 1
  selectedAccountId?: string | null;
  existingPersonas?: PersonaData[];
  onSuccess: (newPersona: any) => void;
}

type MethodType = "my-account" | "reference" | "load" | "ai-generate";

export function SetupPersonaModal({
  isOpen,
  onClose,
  targetSlot,
  selectedAccountId,
  existingPersonas = [],
  onSuccess,
}: SetupPersonaModalProps) {
  const [step, setStep] = useState<"select-method" | "setup-form" | "generating">("select-method");
  const [selectedMethod, setSelectedMethod] = useState<MethodType>("my-account");
  const [progressText, setProgressText] = useState("Analyzing your posts...");

  // My Account form state
  const [myAccountName, setMyAccountName] = useState("");
  const [maxPosts, setMaxPosts] = useState(25);
  const [topPostsOnly, setTopPostsOnly] = useState(false);
  const [topPostsCriteria, setTopPostsCriteria] = useState("views");
  const [analysisLanguage, setAnalysisLanguage] = useState("en");
  const [contentLanguage, setContentLanguage] = useState("en");

  // Reference form state
  const [refPlatform, setRefPlatform] = useState("threads");
  const [refHandle, setRefHandle] = useState("");
  const [refBlogUrl, setRefBlogUrl] = useState("");
  const [refName, setRefName] = useState("");
  const [isBlogMode, setIsBlogMode] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);

  // Load / Clone form state
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [cloneName, setCloneName] = useState("");

  // AI Generate form state
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [samples, setSamples] = useState<Array<{ type: "text" | "url"; content: string }>>([
    { type: "text", content: "" },
  ]);
  const [aiPersonaName, setAiPersonaName] = useState("");

  if (!isOpen) return null;

  const handleStartMethod = (method: MethodType) => {
    setSelectedMethod(method);
    if (method === "my-account") {
      setMyAccountName(`Brand Voice ${targetSlot === 0 ? "A" : "B"}`);
    } else if (method === "reference") {
      setRefName(refHandle ? `@${refHandle.replace(/^@/, "")} Reference` : `Reference Voice ${targetSlot === 0 ? "A" : "B"}`);
    } else if (method === "load" && existingPersonas.length > 0) {
      setSelectedSourceId(existingPersonas[0].id);
      setCloneName(`${existingPersonas[0].name} (Copy)`);
    } else if (method === "ai-generate") {
      setAiPersonaName("Modern Brand Voice");
    }
    setStep("setup-form");
  };

  const handleFetchBlogPosts = async () => {
    if (!refBlogUrl) return;
    setIsLoadingBlog(true);
    try {
      const res = await fetch("/api/ai/persona/reference/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: refBlogUrl }),
      });
      const data = await res.json();
      if (data.posts) {
        setBlogPosts(data.posts);
        toast.success(`Found ${data.posts.length} analyzable posts!`);
      }
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setIsLoadingBlog(false);
    }
  };

  const handleSubmit = async () => {
    setStep("generating");
    setProgressText("Initializing AI analysis engine...");

    try {
      setTimeout(() => setProgressText("Extracting narrative styles and engagement hooks..."), 700);
      setTimeout(() => setProgressText("Synthesizing writing patterns and guardrails..."), 1400);

      let res: Response;

      if (selectedMethod === "my-account") {
        res = await fetch("/api/ai/persona/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_id: selectedAccountId || null,
            persona_number: targetSlot,
            name: myAccountName,
            max_posts: maxPosts,
            top_posts_only: topPostsOnly,
            top_posts_criteria: topPostsCriteria,
            language: analysisLanguage,
            content_language: contentLanguage,
          }),
        });
      } else if (selectedMethod === "reference") {
        res = await fetch("/api/ai/persona/reference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle: refHandle || refBlogUrl || "reference_account",
            platform: refPlatform,
            persona_number: targetSlot,
            name: refName,
            max_posts: maxPosts,
            language: analysisLanguage,
            content_language: contentLanguage,
          }),
        });
      } else if (selectedMethod === "load") {
        res = await fetch("/api/ai/persona/clone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_persona_id: selectedSourceId,
            account_id: selectedAccountId || null,
            persona_number: targetSlot,
            name: cloneName,
          }),
        });
      } else {
        // ai-generate
        res = await fetch("/api/ai/persona/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand_name: brandName,
            brand_description: brandDescription,
            samples: samples.filter((s) => s.content.trim().length > 0),
            name: aiPersonaName,
            language: analysisLanguage,
            content_language: contentLanguage,
          }),
        });
      }

      const result = await res.json();
      if (result.success && result.persona) {
        toast.success("Brand voice successfully created!");
        onSuccess(result.persona);
        onClose();
      } else {
        throw new Error(result.error || "Creation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create brand voice");
      setStep("setup-form");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {step === "setup-form" && (
              <button
                type="button"
                onClick={() => setStep("select-method")}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted mr-1"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {step === "select-method"
                  ? `Add Brand Voice (Slot ${targetSlot === 0 ? "A" : "B"})`
                  : selectedMethod === "my-account"
                  ? "Analyze Profile & Posts"
                  : selectedMethod === "reference"
                  ? "Reference Other Account"
                  : selectedMethod === "load"
                  ? "Load Existing Brand Voice"
                  : "Create from Brand Description"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === "select-method"
                  ? "Choose how you'd like to create your brand voice."
                  : "Configure analysis parameters and target styles."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* STEP 1: Method Selector Grid */}
        {step === "select-method" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: My Account */}
            <div
              onClick={() => handleStartMethod("my-account")}
              className="flex flex-col justify-between rounded-xl border border-border bg-accent/40 dark:bg-neutral-900/40 p-5 hover:border-primary hover:bg-background transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary">
                  <UserCheck className="size-5 text-primary" />
                  <span>Analyze My Account</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-1">
                  <li>• Learn your voice from your actual posts</li>
                  <li>• Analyzes recent thread pacing & hooks</li>
                </ul>
              </div>
              <button
                type="button"
                className="w-full mt-4 rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Card 2: Reference Account */}
            <div
              onClick={() => handleStartMethod("reference")}
              className="flex flex-col justify-between rounded-xl border border-border bg-accent/40 dark:bg-neutral-900/40 p-5 hover:border-primary hover:bg-background transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary">
                  <Compass className="size-5 text-primary" />
                  <span>Reference Other Accounts</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-1">
                  <li>• Benchmark competitor profiles on X/Threads</li>
                  <li>• Extract tone & viral hooks from blog URLs</li>
                </ul>
              </div>
              <button
                type="button"
                className="w-full mt-4 rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Card 3: Load Existing */}
            <div
              onClick={() => handleStartMethod("load")}
              className="flex flex-col justify-between rounded-xl border border-border bg-accent/40 dark:bg-neutral-900/40 p-5 hover:border-primary hover:bg-background transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary">
                  <Copy className="size-5 text-primary" />
                  <span>Load Existing Voice</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-1">
                  <li>• Duplicate an existing voice to Slot {targetSlot === 0 ? "A" : "B"}</li>
                  <li>• Fast baseline for A/B split comparisons</li>
                </ul>
              </div>
              <button
                type="button"
                className="w-full mt-4 rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Load Voice
              </button>
            </div>

            {/* Card 4: AI Generate */}
            <div
              onClick={() => handleStartMethod("ai-generate")}
              className="flex flex-col justify-between rounded-xl border border-border bg-accent/40 dark:bg-neutral-900/40 p-5 hover:border-primary hover:bg-background transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary">
                  <Sparkles className="size-5 text-primary" />
                  <span>Create from Description</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-1">
                  <li>• Synthesize voice from brand mission</li>
                  <li>• Add custom writing samples & guidelines</li>
                </ul>
              </div>
              <button
                type="button"
                className="w-full mt-4 rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Sub-Setup Forms */}
        {step === "setup-form" && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Form A: My Account */}
            {selectedMethod === "my-account" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Brand Voice Name</label>
                  <input
                    type="text"
                    value={myAccountName}
                    onChange={(e) => setMyAccountName(e.target.value)}
                    placeholder="e.g. My Account Voice"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">Posts to Analyze</span>
                    <span className="text-muted-foreground">{maxPosts} posts</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={maxPosts}
                    onChange={(e) => setMaxPosts(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Connected sub-threads are analyzed together to learn conversational cadence.
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-card p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-foreground block">Analyze top posts only</span>
                      <span className="text-[10px] text-muted-foreground block">
                        Rank posts by engagement metrics and analyze your highest performing content.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={topPostsOnly}
                      onChange={(e) => setTopPostsOnly(e.target.checked)}
                      className="size-4 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  {topPostsOnly && (
                    <div className="pt-2 border-t border-border/50 flex items-center gap-3">
                      <span className="text-xs font-medium text-foreground">Rank by:</span>
                      <div className="flex gap-2">
                        {["views", "reactions", "engagement_rate"].map((crit) => (
                          <button
                            key={crit}
                            type="button"
                            onClick={() => setTopPostsCriteria(crit)}
                            className={cn(
                              "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                              topPostsCriteria === crit
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {crit.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Analysis Language</label>
                    <select
                      value={analysisLanguage}
                      onChange={(e) => setAnalysisLanguage(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="en">English</option>
                      <option value="ko">한국어</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Content Output Language</label>
                    <select
                      value={contentLanguage}
                      onChange={(e) => setContentLanguage(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="en">English</option>
                      <option value="ko">한국어</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Form B: Reference */}
            {selectedMethod === "reference" && (
              <div className="space-y-4">
                <div className="flex rounded-xl bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setIsBlogMode(false)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-xs font-bold transition-all",
                      !isBlogMode ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Social Handle
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBlogMode(true)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-xs font-bold transition-all",
                      isBlogMode ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Blog or RSS Feed
                  </button>
                </div>

                {!isBlogMode ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Target Platform</label>
                      <div className="flex flex-wrap gap-2">
                        {["threads", "x", "linkedin", "instagram", "tiktok"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setRefPlatform(p)}
                            className={cn(
                              "rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all",
                              refPlatform === p
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "border border-border bg-background text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Handle or Profile URL</label>
                      <input
                        type="text"
                        value={refHandle}
                        onChange={(e) => setRefHandle(e.target.value)}
                        placeholder="@username or profile URL"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Blog or RSS URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={refBlogUrl}
                          onChange={(e) => setRefBlogUrl(e.target.value)}
                          placeholder="https://example.com/blog or RSS feed"
                          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={handleFetchBlogPosts}
                          disabled={isLoadingBlog || !refBlogUrl}
                          className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
                        >
                          {isLoadingBlog ? "Loading..." : "Load Posts"}
                        </button>
                      </div>
                    </div>

                    {blogPosts.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-foreground block">Select representative posts:</span>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-border p-2 bg-background">
                          {blogPosts.map((post) => (
                            <div key={post.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted text-xs">
                              <input type="checkbox" defaultChecked className="size-3.5 accent-primary" />
                              <span className="truncate flex-1 font-medium">{post.title}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {new Date(post.published_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Brand Voice Name</label>
                  <input
                    type="text"
                    value={refName}
                    onChange={(e) => setRefName(e.target.value)}
                    placeholder="e.g. @competitor Reference Voice"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Form C: Load / Clone */}
            {selectedMethod === "load" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Select Source Brand Voice</label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => {
                      setSelectedSourceId(e.target.value);
                      const found = existingPersonas.find((p) => p.id === e.target.value);
                      if (found) setCloneName(`${found.name} (Copy)`);
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {existingPersonas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.analysis_method})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">New Voice Name</label>
                  <input
                    type="text"
                    value={cloneName}
                    onChange={(e) => setCloneName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Form D: AI Generate */}
            {selectedMethod === "ai-generate" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Brand Name (Optional)</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Acme Studio"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Brand Mission & Core Description</label>
                  <textarea
                    rows={4}
                    value={brandDescription}
                    onChange={(e) => setBrandDescription(e.target.value)}
                    placeholder="Describe your brand values, target audience, and how you want readers to feel..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Writing Samples</label>
                    <button
                      type="button"
                      onClick={() => setSamples([...samples, { type: "text", content: "" }])}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="size-3" />
                      Add Sample
                    </button>
                  </div>

                  {samples.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <textarea
                        rows={2}
                        value={s.content}
                        onChange={(e) => {
                          const updated = [...samples];
                          updated[idx].content = e.target.value;
                          setSamples(updated);
                        }}
                        placeholder={`Writing sample #${idx + 1}...`}
                        className="flex-1 rounded-xl border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary resize-none"
                      />
                      {samples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSamples(samples.filter((_, i) => i !== idx))}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setStep("select-method")}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
              >
                Create Brand Voice
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Live Generation Progress */}
        {step === "generating" && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="size-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">{progressText}</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Our AI engine is compiling voice heuristics, tone signatures, and content pillars.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
