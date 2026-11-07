"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Info,
  Trash2,
  Plus,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AutomationItem } from "./AutoDmView";

// Tone background classes
const tones = {
  green: "bg-[#edf7f1] dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-foreground",
  yellow: "bg-[#fef9ee] dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-foreground",
  blue: "bg-[#eef5fc] dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-foreground",
  red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50",
  neutral: "bg-muted/80 border-border",
};

interface ChoiceBoxProps {
  value: string;
  currentValue: string;
  onSelect: (val: string) => void;
  tone?: "green" | "yellow" | "blue" | "red" | "neutral";
  label: string;
  icon?: React.ReactNode;
  connected?: boolean;
  disabled?: boolean;
  className?: string;
}

function ChoiceBox({
  value,
  currentValue,
  onSelect,
  tone = "green",
  label,
  icon,
  connected = false,
  disabled = false,
  className,
}: ChoiceBoxProps) {
  const isSelected = currentValue === value;
  const toneBg = tones[tone] || "bg-muted";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={label}
      disabled={disabled}
      onClick={() => onSelect(value)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl border p-3 text-left text-xs sm:text-[13px] font-semibold transition-all outline-none select-none",
        !isSelected && "bg-white dark:bg-card text-foreground/80 border-border/80 hover:bg-muted/50",
        isSelected && cn(toneBg, "border-foreground/30 text-foreground shadow-2xs"),
        connected && isSelected && "relative z-10 -mb-[9px] rounded-b-none border-b-0 pb-[19px]",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {/* Checkbox indicator */}
      <span
        aria-hidden={true}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors shadow-2xs",
          isSelected
            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
            : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800"
        )}
      >
        {isSelected && <Check className="size-3 stroke-[3]" />}
      </span>

      {icon}
      <span className="leading-snug break-words flex-1">{label}</span>
    </button>
  );
}

interface ChoicePanelProps {
  tone?: "green" | "yellow" | "blue" | "red";
  side?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

function ChoicePanel({
  tone = "yellow",
  side = "right",
  children,
  className,
}: ChoicePanelProps) {
  const toneBg = tones[tone] || "bg-muted";

  return (
    <div
      data-testid="choice-panel"
      className={cn(
        "col-span-2 space-y-3 rounded-xl border border-foreground/30 p-3.5 transition-all",
        side === "right" ? "rounded-tr-none" : "rounded-tl-none",
        toneBg,
        className
      )}
    >
      {children}
    </div>
  );
}

// Sample Instagram posts for "Specific post" selector
const SAMPLE_POSTS = [
  {
    id: "post-1",
    caption: "🚀 Our new AI Automation system is live! Comment 'LINK' below to get free access.",
    thumbnail: "/images/platforms/instagram.svg",
    date: "2 days ago",
  },
  {
    id: "post-2",
    caption: "5 growth tactics every creator needs to scale in 2026. Drop 'GROWTH' for the guide 📈",
    thumbnail: "/images/platforms/threads.svg",
    date: "5 days ago",
  },
  {
    id: "post-3",
    caption: "Behind the scenes building Reerts SaaS. Comment 'CODE' for the full repository stack.",
    thumbnail: "/images/platforms/tiktok-light.svg",
    date: "1 week ago",
  },
  {
    id: "post-4",
    caption: "Stop sending manual DMs. Here is how we automated 12,000 leads in 48 hours. Comment 'AUTODM'",
    thumbnail: "/images/platforms/x-light.svg",
    date: "2 weeks ago",
  },
];

interface NewAutomationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<AutomationItem>, activate: boolean) => void;
  initialData?: AutomationItem | null;
  accountHandle?: string;
}

export function NewAutomationDrawer({
  isOpen,
  onClose,
  onSave,
  initialData,
  accountHandle = "sahil_357_",
}: NewAutomationDrawerProps) {
  // Trigger state (defaults to "comment" matching screenshot 1)
  const [triggerType, setTriggerType] = useState<"comment" | "dm">("comment");

  // Progressive Disclosure step
  const [unlockedStep, setUnlockedStep] = useState<number>(1);

  // Step 1: Target post state (defaults to "any" matching screenshot 1)
  const [targetPost, setTargetPost] = useState<"any" | "specific">("any");
  const [selectedPostId, setSelectedPostId] = useState<string>("post-1");
  const [isPostPickerOpen, setIsPostPickerOpen] = useState(false);

  // Step 2: Keywords state
  const [keywordsType, setKeywordsType] = useState<"any" | "specific">("any");
  const [keywords, setKeywords] = useState("Price, Link, Shop");
  const [matchType, setMatchType] = useState<"contains" | "exact">("contains");

  // Step 3: Action state
  const [actionType, setActionType] = useState<"dm" | "reply" | "hide" | "delete">("dm");

  // Comment public reply variants
  const [replyToggle, setReplyToggle] = useState(false);
  const [replyVariants, setReplyVariants] = useState<string[]>([
    "pls check DM!{{username}}",
    "Sent you the details! Check your DMs 📩",
  ]);

  // Advanced priority
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [priority, setPriority] = useState<number>(0);

  // Step 4: "They will get"
  const [openingDm, setOpeningDm] = useState(true);
  const [openingText, setOpeningText] = useState("Hey! Tap below to get your free link 👇");
  const [openingButtonLabel, setOpeningButtonLabel] = useState("Get the link");
  const [showOpeningWhy, setShowOpeningWhy] = useState(false);

  // Follow request gate
  const [followGate, setFollowGate] = useState(false);
  const [followGateText, setFollowGateText] = useState(
    "Please follow me first to get the link! Tap the button below once you do 😊"
  );
  const [followGateButtonLabel, setFollowGateButtonLabel] = useState("Following");

  // Collect emails gate
  const [emailGate, setEmailGate] = useState(false);
  const [emailGateText, setEmailGateText] = useState(
    "Drop your email before I send the link! I save the best bits for my email family 💌"
  );
  const [emailDelivery, setEmailDelivery] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);

  // Step 5: Final DM ("And then, they will get")
  const [finalDm, setFinalDm] = useState("Here is your requested guide and instant link!");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([
    { label: "Get the link", url: "https://reerts.in" },
  ]);

  // DM-only trigger state
  const [dmReplyText, setDmReplyText] = useState("Hello {{username}}! Thanks for messaging us. How can we help?");

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [previewTab, setPreviewTab] = useState<"post" | "comments" | "dm">("post");
  const [liveTime, setLiveTime] = useState("11:11");

  const formScrollRef = useRef<HTMLDivElement>(null);

  // Live clock for iPhone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setLiveTime(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Initialize data if editing
  useEffect(() => {
    if (initialData) {
      setTriggerType(initialData.triggerType || "comment");
      setActionType(initialData.actionType === "Reply" ? "reply" : "dm");
      setTargetPost(initialData.targetPost === "—" || !initialData.targetPost ? "any" : "specific");
      if (initialData.keywords === "All DMs" || initialData.keywords === "Any word" || !initialData.keywords) {
        setKeywordsType("any");
      } else {
        setKeywordsType("specific");
        setKeywords(initialData.keywords);
      }
      setFinalDm(initialData.dmContent || "");
      setDmReplyText(initialData.dmContent || "");
      setFollowGate(!!initialData.followCheck);
      setEmailGate(!!initialData.emailCheck);
      setUnlockedStep(5);
    } else {
      setTriggerType("comment");
      setTargetPost("any");
      setUnlockedStep(1);
      setPreviewTab("post");
    }
  }, [initialData, isOpen]);

  const insertToken = (setter: React.Dispatch<React.SetStateAction<string>>, current: string) => {
    setter(current + "{{username}}");
  };

  const insertTokenToReply = (index: number) => {
    setReplyVariants((prev) => {
      const copy = [...prev];
      copy[index] = (copy[index] || "") + "{{username}}";
      return copy;
    });
  };

  const addReply = () => {
    if (replyVariants.length >= 3) {
      toast.error("You can add up to 3 replies.");
      return;
    }
    setReplyVariants((prev) => [...prev, `Reply ${prev.length + 1}`]);
  };

  const removeReply = (index: number) => {
    setReplyVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addKeywordExample = (kw: string) => {
    if (keywords.includes(kw)) return;
    setKeywords((prev) => (prev ? `${prev}, ${kw}` : kw));
  };

  const handleNextStep = () => {
    setErrorMsg(null);

    if (triggerType === "dm") {
      if (unlockedStep === 1) {
        setUnlockedStep(2);
      }
      return;
    }

    if (unlockedStep === 1) {
      setUnlockedStep(2);
      setPreviewTab("comments");
      setTimeout(() => {
        formScrollRef.current?.scrollTo({ top: 300, behavior: "smooth" });
      }, 50);
    } else if (unlockedStep === 2) {
      if (keywordsType === "specific" && !keywords.trim()) {
        setErrorMsg("Enter valid keywords.");
        return;
      }
      setUnlockedStep(3);
      setTimeout(() => {
        formScrollRef.current?.scrollTo({ top: 600, behavior: "smooth" });
      }, 50);
    } else if (unlockedStep === 3) {
      setUnlockedStep(4);
      setPreviewTab("dm");
      setTimeout(() => {
        formScrollRef.current?.scrollTo({ top: 900, behavior: "smooth" });
      }, 50);
    } else if (unlockedStep === 4) {
      if (openingDm && (!openingText || openingText.trim() === "")) {
        setErrorMsg("Enter the opening DM message.");
        return;
      }
      if (openingDm && (!openingButtonLabel || openingButtonLabel.trim() === "")) {
        setErrorMsg("Enter a button label for the opening DM.");
        return;
      }
      if (followGate && !followGateText.trim()) {
        setErrorMsg("Enter the follow request message.");
        return;
      }
      if (emailGate && !emailGateText.trim()) {
        setErrorMsg("Enter the email request message.");
        return;
      }
      setUnlockedStep(5);
      setTimeout(() => {
        formScrollRef.current?.scrollTo({ top: 1200, behavior: "smooth" });
      }, 50);
    }
  };

  const handleBackStep = () => {
    setErrorMsg(null);
    setUnlockedStep((prev) => Math.max(1, prev - 1));
  };

  const handleGoLive = () => {
    if (triggerType === "dm") {
      if (!dmReplyText.trim()) {
        setErrorMsg("Please enter the reply message.");
        return;
      }
    } else {
      if (!finalDm.trim()) {
        setErrorMsg("Please enter the DM message.");
        return;
      }
      if (emailDelivery && !emailConsent) {
        setErrorMsg("Confirm the email usage notice before activating.");
        return;
      }
    }

    onSave(
      {
        triggerType: triggerType || "comment",
        actionType: actionType === "dm" ? "DM" : "Reply",
        keywords: keywordsType === "any" ? (triggerType === "dm" ? "All DMs" : "Any word") : keywords,
        dmContent: triggerType === "dm" ? dmReplyText : finalDm,
        targetPost: targetPost === "any" ? "—" : "Specific post",
        opening: openingDm ? (openingText || "Active") : "—",
        followCheck: followGate,
        emailCheck: emailGate,
      },
      true
    );
    toast.success("Automation is now live!");
    onClose();
  };

  const handleSaveDraft = () => {
    onSave(
      {
        triggerType: triggerType || "comment",
        actionType: actionType === "dm" ? "DM" : "Reply",
        keywords: keywordsType === "any" ? (triggerType === "dm" ? "All DMs" : "Any word") : keywords,
        dmContent: (triggerType === "dm" ? dmReplyText : finalDm) || "Draft automation",
        targetPost: targetPost === "any" ? "—" : "Specific post",
        opening: openingDm ? (openingText || "Draft") : "—",
        followCheck: followGate,
        emailCheck: emailGate,
      },
      false
    );
    toast.info("Draft saved successfully.");
    onClose();
  };

  const handleCloseAttempt = () => {
    if (unlockedStep > 1) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const selectedPost = SAMPLE_POSTS.find((p) => p.id === selectedPostId) || SAMPLE_POSTS[0];

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 overflow-hidden select-none",
        !isOpen && "pointer-events-none"
      )}
    >
      {/* 1. Dark Backdrop: covers ONLY the Auto DM view area (Requirement 3: does NOT hide top header or sidebar!) */}
      <div
        onClick={handleCloseAttempt}
        className={cn(
          "absolute inset-0 bg-neutral-900/50 dark:bg-black/60 backdrop-blur-2xs transition-opacity duration-300 ease-out z-10",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* 2. Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h4 className="font-bold text-foreground text-base tracking-tight">
              Discard unsaved changes?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your unsaved changes will be lost.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Specific Post Selector Modal */}
      {isPostPickerOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="font-bold text-foreground text-base">Select a Post</h4>
              <button
                type="button"
                onClick={() => setIsPostPickerOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto py-2">
              {SAMPLE_POSTS.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    setSelectedPostId(post.id);
                    setIsPostPickerOpen(false);
                  }}
                  className={cn(
                    "flex flex-col gap-2 p-3 rounded-xl border text-left cursor-pointer transition-all hover:brightness-95",
                    selectedPostId === post.id
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-background"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative size-6 rounded-full overflow-hidden shrink-0">
                      <Image src={post.thumbnail} alt="thumb" fill className="object-cover" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">{post.date}</span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-3 leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Drawer & Preview Container: below Top Header, right of Sidebar */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex items-stretch transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* LEFT COLUMN: White form configuration panel - wider to prevent truncation */}
        <div className="w-full max-w-[560px] sm:w-[540px] shrink-0 bg-white dark:bg-card border-r border-border flex flex-col h-full shadow-2xl relative z-20">
          {/* Panel Header matching Snapshot (border line removed) */}
          <div className="flex h-14 shrink-0 items-center justify-between px-6 bg-white dark:bg-card">
            <div className="flex items-center gap-2">
              <span className="text-base text-foreground font-bold select-none">✳</span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                {initialData ? "Edit automation" : "New automation"}
              </h2>
            </div>

            {/* Black rounded square Close button matching Snapshot 1 */}
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="flex size-7 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity shadow-xs"
              title="Close"
            >
              <X className="size-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Form Scroll Area */}
          <div
            ref={formScrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-foreground hide-scrollbar"
          >
            {/* Step 0: What should start this automation? */}
            <section data-testid="flow-step-0" className="space-y-3">
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                What should start this automation?
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <ChoiceBox
                  value="comment"
                  currentValue={triggerType}
                  onSelect={(val) => {
                    setTriggerType(val as any);
                    setUnlockedStep(1);
                  }}
                  tone="green"
                  label="When a comment is posted"
                  icon={<MessageSquare className="size-4 shrink-0 text-foreground/80" />}
                />
                <ChoiceBox
                  value="dm"
                  currentValue={triggerType}
                  onSelect={(val) => {
                    setTriggerType(val as any);
                    setUnlockedStep(1);
                  }}
                  tone="blue"
                  label="When a DM arrives"
                  icon={<Send className="size-4 shrink-0 text-foreground/80" />}
                />
              </div>
            </section>

            {/* IF TRIGGER IS "COMMENT" */}
            {triggerType === "comment" && (
              <>
                {/* Step 1: Target post selection */}
                <section data-testid="flow-step-1" className="space-y-3 pt-1">
                  <h4 className="font-semibold text-foreground text-xs">
                    {targetPost === "any"
                      ? "When someone comments on any post"
                      : "When someone comments on a specific post"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ChoiceBox
                      value="any"
                      currentValue={targetPost}
                      onSelect={(val) => setTargetPost(val as any)}
                      tone="green"
                      label="Any posts"
                    />
                    <ChoiceBox
                      value="specific"
                      currentValue={targetPost}
                      onSelect={(val) => setTargetPost(val as any)}
                      tone="yellow"
                      label="Specific post"
                      connected={targetPost === "specific"}
                    />

                    {/* Connected Panel for Specific Post */}
                    {targetPost === "specific" && (
                      <ChoicePanel tone="yellow">
                        <div className="flex items-center gap-3 rounded-lg border border-foreground/20 bg-background/80 p-2.5">
                          <div className="relative size-10 rounded-md overflow-hidden shrink-0 border border-border">
                            <Image src={selectedPost.thumbnail} alt="post" fill className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-foreground">
                              {selectedPost.caption}
                            </p>
                            <span className="text-[10px] text-muted-foreground">{selectedPost.date}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsPostPickerOpen(true)}
                            className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            Change post
                          </button>
                        </div>
                      </ChoicePanel>
                    )}
                  </div>
                </section>

                {/* Step 2: Comment keywords selection */}
                {unlockedStep >= 2 && (
                  <section data-testid="flow-step-2" className="space-y-3 pt-2 border-t border-border/70 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h4 className="font-semibold text-foreground text-xs">
                      And this comment has
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <ChoiceBox
                        value="any"
                        currentValue={keywordsType}
                        onSelect={(val) => setKeywordsType(val as any)}
                        tone="green"
                        label="any word"
                      />
                      <ChoiceBox
                        value="specific"
                        currentValue={keywordsType}
                        onSelect={(val) => setKeywordsType(val as any)}
                        tone="yellow"
                        label="a specific word or words"
                        connected={keywordsType === "specific"}
                      />

                      {/* Connected Panel for Specific Keywords */}
                      {keywordsType === "specific" && (
                        <ChoicePanel tone="yellow" className="space-y-2.5">
                          <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="Price, Link, Shop"
                            className="w-full rounded-xl border border-foreground/30 bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary font-mono shadow-2xs"
                          />
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground/70">For example:</span>
                            {["Price", "Link", "Shop", "Guide"].map((kw) => (
                              <button
                                key={kw}
                                type="button"
                                onClick={() => addKeywordExample(kw)}
                                className="rounded-md border border-foreground/20 bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-foreground hover:bg-background transition-colors"
                              >
                                {kw}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-muted-foreground">Match type:</span>
                            <select
                              value={matchType}
                              onChange={(e) => setMatchType(e.target.value as any)}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none"
                            >
                              <option value="contains">Contains keyword</option>
                              <option value="exact">Exact match</option>
                            </select>
                          </div>
                        </ChoicePanel>
                      )}
                    </div>
                  </section>
                )}

                {/* Step 3: Action "Then" */}
                {unlockedStep >= 3 && (
                  <section data-testid="flow-step-3" className="space-y-3 pt-2 border-t border-border/70 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h4 className="font-semibold text-foreground text-xs">Then</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <ChoiceBox
                        value="dm"
                        currentValue={actionType}
                        onSelect={(val) => setActionType(val as any)}
                        tone="blue"
                        label="Send a DM"
                        icon={<Send className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                      />
                      <ChoiceBox
                        value="reply"
                        currentValue={actionType}
                        onSelect={(val) => setActionType(val as any)}
                        tone="blue"
                        label="Reply only"
                        icon={<MessageSquare className="size-3.5 shrink-0" />}
                      />
                      <ChoiceBox
                        value="hide"
                        currentValue={actionType}
                        onSelect={(val) => setActionType(val as any)}
                        tone="neutral"
                        label="Hide the comment"
                        icon={<EyeOff className="size-3.5 shrink-0" />}
                      />
                      <ChoiceBox
                        value="delete"
                        currentValue={actionType}
                        onSelect={(val) => setActionType(val as any)}
                        tone="red"
                        label="Delete the comment"
                        icon={<Trash2 className="size-3.5 shrink-0" />}
                      />
                    </div>

                    {/* Reply toggle switch */}
                    {actionType !== "hide" && actionType !== "delete" && (
                      <div className="pt-2 space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <div
                            onClick={() => setReplyToggle(!replyToggle)}
                            className={cn(
                              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                              replyToggle ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block size-4 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out",
                                replyToggle ? "translate-x-4" : "translate-x-0"
                              )}
                            />
                          </div>
                          <span className="font-semibold text-foreground text-xs">
                            Reply to their comment under the post
                          </span>
                        </label>

                        {/* Reply variants */}
                        {replyToggle && (
                          <div className="space-y-3 pl-12">
                            {replyVariants.map((rep, idx) => (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => insertTokenToReply(idx)}
                                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                  >
                                    <span>+ Insert their name</span>
                                  </button>
                                  {replyVariants.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeReply(idx)}
                                      className="text-muted-foreground hover:text-foreground"
                                      title="Remove reply"
                                    >
                                      <X className="size-3.5" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  {"{{username}} is replaced with the commenter's name."}
                                </p>
                                <textarea
                                  rows={2}
                                  value={rep}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setReplyVariants((prev) => {
                                      const copy = [...prev];
                                      copy[idx] = val;
                                      return copy;
                                    });
                                  }}
                                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground font-mono resize-none outline-none focus:border-primary"
                                />
                              </div>
                            ))}

                            <div className="flex items-center justify-between pt-1">
                              <button
                                type="button"
                                onClick={addReply}
                                className="inline-flex items-center gap-1 font-bold text-foreground hover:opacity-80"
                              >
                                <Plus className="size-3.5" />
                                <span>Add a reply</span>
                              </button>
                              <span className="text-[10px] text-muted-foreground">
                                If you add several, one is picked at random.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* Step 4: "They will get" */}
                {unlockedStep >= 4 && (
                  <section data-testid="flow-step-4" className="space-y-4 pt-3 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground tracking-tight">
                        They will get
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Configure what the commenter receives when they trigger your rule.
                      </p>
                    </div>

                    {/* Opening DM Toggle & Inputs */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div
                          onClick={() => setOpeningDm(!openingDm)}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                            openingDm ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-4 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out",
                              openingDm ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </div>
                        <span className="font-semibold text-foreground text-xs">
                          Opening DM (recommended)
                        </span>
                      </label>

                      {openingDm && (
                        <div className="space-y-3 pl-12">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-muted-foreground">Message</span>
                              <button
                                type="button"
                                onClick={() => insertToken(setOpeningText, openingText)}
                                className="font-semibold text-primary hover:underline text-[11px]"
                              >
                                + Insert name
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={openingText}
                              onChange={(e) => setOpeningText(e.target.value)}
                              placeholder="Opening message"
                              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground font-mono resize-none outline-none focus:border-primary shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-muted-foreground">Button label</span>
                            <input
                              type="text"
                              value={openingButtonLabel}
                              onChange={(e) => setOpeningButtonLabel(e.target.value)}
                              placeholder="e.g. Get the link"
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary shadow-2xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Follow Gate Toggle */}
                    <div className="space-y-3 pt-2 border-t border-border/50">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div
                          onClick={() => setFollowGate(!followGate)}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                            followGate ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-4 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out",
                              followGate ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </div>
                        <span className="font-semibold text-foreground text-xs">
                          Ask non-followers to follow you first
                        </span>
                      </label>

                      {followGate && (
                        <div className="space-y-3 pl-12">
                          <textarea
                            rows={2}
                            value={followGateText}
                            onChange={(e) => setFollowGateText(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground font-mono resize-none outline-none focus:border-primary shadow-2xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Email Gate Toggle */}
                    <div className="space-y-3 pt-2 border-t border-border/50">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div
                          onClick={() => setEmailGate(!emailGate)}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                            emailGate ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block size-4 transform rounded-full bg-white dark:bg-black shadow-sm ring-0 transition duration-200 ease-in-out",
                              emailGate ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </div>
                        <span className="font-semibold text-foreground text-xs">
                          Collect their email address
                        </span>
                      </label>

                      {emailGate && (
                        <div className="space-y-3 pl-12">
                          <textarea
                            rows={2}
                            value={emailGateText}
                            onChange={(e) => setEmailGateText(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground font-mono resize-none outline-none focus:border-primary shadow-2xs"
                          />
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Step 5: Final DM Section */}
                {unlockedStep >= 5 && (
                  <section data-testid="flow-step-5" className="space-y-5 pt-3 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground tracking-tight">
                        And then, they will get
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        This is the final delivered DM with your resource or link.
                      </p>
                    </div>

                    {/* Final DM Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => insertToken(setFinalDm, finalDm)}
                          className="font-semibold text-primary hover:underline text-[11px]"
                        >
                          + Insert their name
                        </button>
                        <span className="text-muted-foreground font-mono text-[11px]">
                          {finalDm.length}/640 chars
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={finalDm}
                        onChange={(e) => setFinalDm(e.target.value)}
                        placeholder="Write a message"
                        className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground font-mono resize-none outline-none focus:border-primary leading-relaxed shadow-2xs"
                      />
                    </div>

                    {/* Link Buttons */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground text-xs">Action Link Buttons</h4>
                        {links.length < 3 && (
                          <button
                            type="button"
                            onClick={() =>
                              setLinks([...links, { label: "Get the link", url: "https://reerts.in" }])
                            }
                            className="font-bold text-primary hover:underline text-[11px] inline-flex items-center gap-1"
                          >
                            <Plus className="size-3" />
                            <span>Add a link</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {links.map((link, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => {
                                const copy = [...links];
                                copy[idx].label = e.target.value;
                                setLinks(copy);
                              }}
                              placeholder="Button label"
                              className="w-1/3 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                            />
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => {
                                const copy = [...links];
                                copy[idx].url = e.target.value;
                                setLinks(copy);
                              }}
                              placeholder="https://"
                              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                              className="text-muted-foreground hover:text-foreground p-1"
                              title="Remove link"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {/* IF TRIGGER IS "DM" */}
            {triggerType === "dm" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <section className="space-y-3">
                  <h4 className="font-semibold text-foreground text-xs">And this DM has</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ChoiceBox
                      value="any"
                      currentValue={keywordsType}
                      onSelect={(val) => setKeywordsType(val as any)}
                      tone="green"
                      label="any word"
                    />
                    <ChoiceBox
                      value="specific"
                      currentValue={keywordsType}
                      onSelect={(val) => setKeywordsType(val as any)}
                      tone="yellow"
                      label="a specific word or words"
                      connected={keywordsType === "specific"}
                    />
                  </div>
                </section>

                <section className="space-y-3 pt-2 border-t border-border/70">
                  <h4 className="font-semibold text-foreground text-xs">Reply with DM</h4>
                  <textarea
                    rows={4}
                    value={dmReplyText}
                    onChange={(e) => setDmReplyText(e.target.value)}
                    placeholder="Hello {{username}}! Thanks for messaging us..."
                    className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground font-mono resize-none outline-none focus:border-primary leading-relaxed shadow-2xs"
                  />
                </section>
              </div>
            )}

            {/* Error Message Callout */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Intermediate Next Button matching Snapshot 1 */}
            {unlockedStep < (triggerType === "dm" ? 2 : 5) && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-md bg-primary px-4 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-xs transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Drawer Bottom Actions: Shown on final step */}
          {unlockedStep >= (triggerType === "dm" ? 2 : 5) && (
            <div className="flex h-16 shrink-0 items-center justify-between border-t border-border px-6 bg-card/60">
              <button
                type="button"
                onClick={handleBackStep}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted text-foreground transition-colors"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted text-foreground transition-colors"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={handleGoLive}
                  className="rounded-xl bg-black px-6 py-2 text-xs font-bold text-white dark:bg-white dark:text-black hover:opacity-90 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="size-3.5 fill-current" />
                  <span>Go live</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider Collapse Button < matching Snapshot 1 */}
        <div className="relative shrink-0 flex items-center pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 flex size-6 items-center justify-center rounded-full bg-black text-white hover:scale-105 transition-all shadow-md"
            title={isPreviewExpanded ? "Collapse preview" : "Expand preview"}
          >
            {isPreviewExpanded ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        </div>

        {/* CENTER COLUMN: Mobile Phone Mockup Section with visible right scrollbar */}
        {isPreviewExpanded && (
          <div className="flex h-full flex-col overflow-y-scroll mobile-preview-scrollbar py-4 px-2 select-none pointer-events-auto shrink-0 border-r border-border/40">
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-1 justify-center px-5">
                <div className="my-auto min-w-0">
                  <div className="flex justify-center">
                    {/* Phone Container: w-[390px] max-w-full */}
                    <div className="relative min-w-0 px-1 w-[390px] max-w-full">
                      {/* Left Side Hardware Buttons (Mute + Volume) */}
                      <span
                        aria-hidden="true"
                        className="absolute left-[-2px] top-[80px] h-6 w-[3px] rounded-l-md bg-neutral-600/70"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-[-2px] top-[122px] h-10 w-[3px] rounded-l-md bg-neutral-600/70"
                      />
                      {/* Right Side Hardware Button (Power) */}
                      <span
                        aria-hidden="true"
                        className="absolute right-[-2px] top-[105px] h-12 w-[3px] rounded-r-md bg-neutral-600/70"
                      />

                      {/* Outer Gradient Chassis: rounded-[48px] */}
                      <div className="rounded-[48px] bg-gradient-to-b from-neutral-500 via-neutral-900 to-neutral-500 p-[2px] shadow-xl">
                        {/* Black Inner Bezel: rounded-[46px] bg-black p-[4px] */}
                        <div className="rounded-[46px] bg-black p-[4px]">
                          {/* Inner Screen: aspect-[390/844] rounded-[42px] */}
                          <div className="relative select-none overflow-hidden rounded-[42px] bg-background text-foreground flex flex-col aspect-[390/844]">
                            {/* Dynamic Island pill */}
                            <div
                              aria-hidden="true"
                              className="absolute left-1/2 top-2 z-30 flex h-[24px] w-[84px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2"
                            >
                              <span className="relative size-2.5 rounded-full bg-neutral-800">
                                <span className="absolute left-[3px] top-[3px] size-1 rounded-full bg-neutral-600/80" />
                              </span>
                            </div>

                            {/* Status Bar */}
                            <div className="flex shrink-0 items-center justify-between px-6 pb-1 pt-2.5 text-[11px] font-semibold text-foreground z-20">
                              <span className="tracking-tight">{liveTime}</span>
                              <div className="flex items-center gap-1.5 text-xs font-normal">
                                <span className="font-semibold text-[10px]">5G</span>
                                <div className="flex h-[10px] w-[18px] items-center rounded-[3px] border border-current px-[1.5px]">
                                  <div className="h-[6px] w-full rounded-[1px] bg-current" />
                                </div>
                              </div>
                            </div>

                            {/* Content Scroll Area */}
                            <div className="flex-1 min-h-0 overflow-y-auto">
                              <div className="flex flex-col">
                                {/* Header: User profile */}
                                <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 shrink-0">
                                  <div className="size-6 rounded-full overflow-hidden bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                    <span>📸</span>
                                  </div>
                                  <span className="font-bold text-xs text-foreground">{accountHandle}</span>
                                </div>

                                {/* Views */}
                                {previewTab === "post" && (
                                  <div className="flex aspect-square w-full items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
                                    Applies to every post
                                  </div>
                                )}

                                {previewTab === "comments" && (
                                  <div className="p-4 space-y-4">
                                    <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-xs text-foreground">
                                      <span className="font-bold mr-1">@{accountHandle}:</span>
                                      <span>{selectedPost.caption}</span>
                                    </div>

                                    <div className="flex items-start gap-2.5 pt-1">
                                      <div className="size-7 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
                                      <div className="space-y-0.5 text-xs">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-[11px]">alex_creator</span>
                                          <span className="text-muted-foreground text-[10px]">· Now</span>
                                        </div>
                                        <p className="text-foreground text-xs">
                                          {keywordsType === "specific" && keywords
                                            ? keywords.split(",")[0].trim()
                                            : "Link please!"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="ml-8 flex items-start gap-2.5 border-l-2 border-border pl-3">
                                      <div className="size-6 rounded-full bg-black text-white dark:bg-white dark:text-black shrink-0 flex items-center justify-center text-[9px] font-bold">
                                        {accountHandle[0]?.toUpperCase() || "S"}
                                      </div>
                                      <div className="space-y-0.5 text-xs">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-[11px]">@{accountHandle}</span>
                                          <span className="text-muted-foreground text-[10px]">· Now</span>
                                        </div>
                                        <p className="text-foreground text-xs whitespace-pre-wrap">
                                          {replyVariants[0]?.replace("{{username}}", "@alex_creator") || "@alex_creator pls check DM! 📩"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {previewTab === "dm" && (
                                  <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/80">
                                      <div className="size-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[9px] font-bold shrink-0">
                                        {accountHandle[0]?.toUpperCase() || "S"}
                                      </div>
                                      <div className="leading-tight">
                                        <span className="font-bold text-xs text-foreground block">{accountHandle}</span>
                                        <span className="text-[10px] text-emerald-600 block">Active now</span>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex items-end gap-2">
                                        <div className="size-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[9px] font-bold shrink-0">
                                          {accountHandle[0]?.toUpperCase() || "S"}
                                        </div>
                                        <div className="max-w-[80%] rounded-2xl bg-muted px-3.5 py-2.5 text-xs text-foreground leading-relaxed shadow-2xs">
                                          {openingText || "Hey! Tap below to get the link 👇"}
                                        </div>
                                      </div>

                                      {openingButtonLabel && (
                                        <div className="ml-8 max-w-[80%]">
                                          <div className="rounded-xl border border-border bg-card py-2 text-center text-xs font-semibold text-foreground shadow-2xs">
                                            {openingButtonLabel}
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex justify-end pt-1">
                                        <div className="max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-3.5 py-2 text-xs font-medium shadow-2xs">
                                          {openingButtonLabel || "Get the link"}
                                        </div>
                                      </div>
                                    </div>

                                    {followGate && (
                                      <div className="space-y-2 pt-1">
                                        <div className="flex items-end gap-2">
                                          <div className="size-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[9px] font-bold shrink-0">
                                            {accountHandle[0]?.toUpperCase() || "S"}
                                          </div>
                                          <div className="max-w-[80%] rounded-2xl bg-muted px-3.5 py-2.5 text-xs text-foreground leading-relaxed shadow-2xs">
                                            {followGateText}
                                          </div>
                                        </div>
                                        <div className="ml-8 max-w-[80%]">
                                          <div className="rounded-xl border border-border bg-card py-2 text-center text-xs font-semibold text-foreground shadow-2xs">
                                            {followGateButtonLabel}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="space-y-2 pt-1">
                                      <div className="flex items-end gap-2">
                                        <div className="size-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[9px] font-bold shrink-0">
                                          {accountHandle[0]?.toUpperCase() || "S"}
                                        </div>
                                        <div className="max-w-[80%] rounded-2xl bg-muted px-3.5 py-2.5 text-xs text-foreground leading-relaxed shadow-2xs whitespace-pre-wrap">
                                          {finalDm || "Here is your requested link!"}
                                        </div>
                                      </div>

                                      {links.map((link, i) => (
                                        <div key={i} className="ml-8 max-w-[80%]">
                                          <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block w-full rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black py-2 text-center text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                                          >
                                            {link.label || "Get the link"}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Home Indicator */}
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex h-5 items-center justify-center"
                            >
                              <div className="h-1 w-24 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Segmented Switcher Pill BELOW the Phone matching DevTools screenshot */}
                  <div className="mt-4 flex justify-center">
                    <div className="inline-flex items-center gap-1 rounded-xl bg-neutral-200/90 dark:bg-neutral-800 p-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewTab("post")}
                        className={cn(
                          "px-5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                          previewTab === "post"
                            ? "bg-white dark:bg-neutral-900 text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Post
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab("comments")}
                        className={cn(
                          "px-5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                          previewTab === "comments"
                            ? "bg-white dark:bg-neutral-900 text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Comments
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab("dm")}
                        className={cn(
                          "px-5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                          previewTab === "dm"
                            ? "bg-white dark:bg-neutral-900 text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        DM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transparent area to the right: reveals the dimmed Auto DM background & chat button */}
        <div className="flex-1 pointer-events-none" />
      </div>
    </div>
  );
}
