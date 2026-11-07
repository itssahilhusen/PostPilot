"use client";

import React, { useState } from "react";
import {
  Pencil,
  Trash2,
  RefreshCw,
  Share2,
  Download,
  Copy,
  Check,
  ChevronDown,
  UserCheck,
  Users,
  Flame,
  Link as LinkIcon,
  Tag,
  Sparkles,
  Send,
  AlertTriangle,
  X,
  Plus,
  Heading,
  AlignLeft,
  Route,
  HeartHandshake,
  Smile,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PersonaAvatar } from "./PersonaAvatar";
import { PersonaData } from "@/lib/persona-defaults";
import { toast } from "sonner";

interface PersonaCardProps {
  persona: PersonaData;
  platform?: string;
  profileImageUrl?: string;
  onDelete?: (id: string) => void;
  onReanalyze?: (persona: PersonaData) => void;
  onUpdateSection?: (section: string, data: any) => Promise<void>;
  isDeleting?: boolean;
  readOnly?: boolean;
}

export function PersonaCard({
  persona,
  platform,
  profileImageUrl,
  onDelete,
  onReanalyze,
  onUpdateSection,
  isDeleting = false,
  readOnly = false,
}: PersonaCardProps) {
  // Active accordion sections
  const [openSection, setOpenSection] = useState<string | null>("profile_identity");
  const [openStyleSection, setOpenStyleSection] = useState<string | null>("sentence_structure");

  // Inline name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(persona.name);
  const [isSavingName, setIsSavingName] = useState(false);

  // Active section editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Section draft states
  const [draftProfileIdentity, setDraftProfileIdentity] = useState(persona.profile_identity || "");
  const [draftAudience, setDraftAudience] = useState<any>(persona.target_audience || {});
  const [draftHook, setDraftHook] = useState<any>(persona.hook_setting || {});
  const [draftStyle, setDraftStyle] = useState<any>(persona.writing_style_analysis || {});
  const [draftCta, setDraftCta] = useState<any>(persona.cta_setting || { items: [] });
  const [draftRefLink, setDraftRefLink] = useState(persona.reference_link_setting || { enabled: false, format: "", placement_note: null });
  const [draftTopics, setDraftTopics] = useState<string[]>(persona.core_topics || []);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [draftTopPatterns, setDraftTopPatterns] = useState(persona.top_performing_patterns || "");
  const [draftInstructions, setDraftInstructions] = useState(persona.additional_instructions || "");
  const [draftLanguage, setDraftLanguage] = useState(persona.content_language || "en");

  // Share Dialog state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const toggleAccordion = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  const toggleStyleAccordion = (key: string) => {
    setOpenStyleSection(openStyleSection === key ? null : key);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    try {
      if (onUpdateSection) {
        await onUpdateSection("name", nameInput.trim());
      }
      setIsEditingName(false);
      toast.success("Brand voice name updated!");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveSection = async (sectionKey: string, data: any) => {
    setIsSavingSection(true);
    try {
      if (onUpdateSection) {
        await onUpdateSection(sectionKey, data);
      }
      setEditingSection(null);
      toast.success("Section updated successfully!");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleCopyCardSummary = () => {
    const text = `Brand Voice: ${persona.name}\n\nProfile & Identity:\n${persona.profile_identity}\n\nTarget Audience:\n${persona.target_audience?.demographic_profile}\n\nHook Style:\n${persona.hook_setting?.top_patterns}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Persona summary copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getMethodBadge = (method?: string) => {
    switch (method) {
      case "myAccount":
        return { label: "My Account", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
      case "reference":
        return { label: "Reference", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
      case "load":
        return { label: "Cloned", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
      case "aiGenerate":
        return { label: "AI Generate", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
      default:
        return { label: "Analyzed", color: "bg-primary/10 text-primary border-primary/20" };
    }
  };

  const badge = getMethodBadge(persona.analysis_method);

  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md space-y-4">
      {/* 1. Card Header */}
      <div className="flex flex-col gap-2 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <PersonaAvatar
            name={persona.name}
            platform={platform}
            profileImageUrl={profileImageUrl}
            size="md"
          />

          {isEditingName ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setNameInput(persona.name);
                    setIsEditingName(false);
                  }
                }}
                className="h-7 w-full max-w-[260px] rounded-md border border-primary bg-background px-2 text-xs font-semibold text-foreground outline-none"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={isSavingName}
                className="h-7 rounded-md bg-primary px-2.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
              >
                {isSavingName ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNameInput(persona.name);
                  setIsEditingName(false);
                }}
                className="h-7 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{persona.name}</h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Rename Brand Voice"
                >
                  <Pencil className="size-3.5" />
                </button>
              )}
            </div>
          )}

          <span
            className={cn(
              "ml-auto shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
              badge.color
            )}
          >
            {badge.label}
          </span>
        </div>

        {/* Metadata subline */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-1">
          {persona.analyzed_posts_count > 0 && (
            <span>Analyzed posts: {persona.analyzed_posts_count}</span>
          )}

          {persona.analyzed_posts_count > 0 && persona.analyzed_posts_count < 15 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[10px] text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3" />
              Low Sample
            </span>
          )}

          {persona.analyzed_at && (
            <span>Analyzed: {new Date(persona.analyzed_at).toLocaleDateString()}</span>
          )}

          <span className="ml-auto inline-flex items-center gap-1 text-[11px]">
            Slot {persona.persona_number === 0 ? "A" : "B"}
          </span>
        </div>
      </div>

      {/* 2. Accordion Sections */}
      <div className="space-y-2.5">
        {/* Section 1: Profile & Identity */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <div
            onClick={() => toggleAccordion("profile_identity")}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/40 transition-colors select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <UserCheck className="size-4 text-primary" />
              <span>Profile & Identity</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareModalOpen(true);
                }}
                className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Share as Image / Copy"
              >
                <Share2 className="size-3.5" />
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSection(editingSection === "profile_identity" ? null : "profile_identity");
                    setOpenSection("profile_identity");
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline px-1"
                >
                  {editingSection === "profile_identity" ? "Done" : "Edit"}
                </button>
              )}
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  openSection === "profile_identity" && "rotate-180"
                )}
              />
            </div>
          </div>

          {openSection === "profile_identity" && (
            <div className="px-3.5 pb-3.5 pt-1 text-xs text-muted-foreground border-t border-border/50">
              {editingSection === "profile_identity" ? (
                <div className="space-y-2 pt-2">
                  <textarea
                    rows={5}
                    value={draftProfileIdentity}
                    onChange={(e) => setDraftProfileIdentity(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary resize-none leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSection(null)}
                      className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveSection("profile_identity", draftProfileIdentity)}
                      disabled={isSavingSection}
                      className="rounded-md bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
                    >
                      {isSavingSection ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                  {persona.profile_identity || "No profile identity established yet."}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Target Audience */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <div
            onClick={() => toggleAccordion("target_audience")}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/40 transition-colors select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Users className="size-4 text-primary" />
              <span>Target Audience</span>
            </div>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSection(editingSection === "target_audience" ? null : "target_audience");
                    setOpenSection("target_audience");
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline px-1"
                >
                  {editingSection === "target_audience" ? "Done" : "Edit"}
                </button>
              )}
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  openSection === "target_audience" && "rotate-180"
                )}
              />
            </div>
          </div>

          {openSection === "target_audience" && (
            <div className="px-3.5 pb-3.5 pt-1 space-y-3 text-xs border-t border-border/50">
              {editingSection === "target_audience" ? (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Demographic Profile</label>
                    <input
                      type="text"
                      value={draftAudience.demographic_profile || ""}
                      onChange={(e) => setDraftAudience({ ...draftAudience, demographic_profile: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Follow Motivation</label>
                    <input
                      type="text"
                      value={draftAudience.follow_motivation || ""}
                      onChange={(e) => setDraftAudience({ ...draftAudience, follow_motivation: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Audience Needs</label>
                    <input
                      type="text"
                      value={draftAudience.audience_needs || ""}
                      onChange={(e) => setDraftAudience({ ...draftAudience, audience_needs: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Implicit Promise</label>
                    <input
                      type="text"
                      value={draftAudience.implicit_promise || ""}
                      onChange={(e) => setDraftAudience({ ...draftAudience, implicit_promise: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingSection(null)}
                      className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveSection("target_audience", draftAudience)}
                      disabled={isSavingSection}
                      className="rounded-md bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Demographics</span>
                    <p className="text-foreground/90">{persona.target_audience?.demographic_profile || "Not specified"}</p>
                  </div>
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Follow Motivation</span>
                    <p className="text-foreground/90">{persona.target_audience?.follow_motivation || "Not specified"}</p>
                  </div>
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Audience Needs</span>
                    <p className="text-foreground/90">{persona.target_audience?.audience_needs || "Not specified"}</p>
                  </div>
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Implicit Promise</span>
                    <p className="text-foreground/90">{persona.target_audience?.implicit_promise || "Not specified"}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Hook Setting */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <div
            onClick={() => toggleAccordion("hook_setting")}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/40 transition-colors select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Flame className="size-4 text-primary" />
              <span>Hook Setting</span>
            </div>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSection(editingSection === "hook_setting" ? null : "hook_setting");
                    setOpenSection("hook_setting");
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline px-1"
                >
                  {editingSection === "hook_setting" ? "Done" : "Edit"}
                </button>
              )}
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  openSection === "hook_setting" && "rotate-180"
                )}
              />
            </div>
          </div>

          {openSection === "hook_setting" && (
            <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 text-xs border-t border-border/50">
              {editingSection === "hook_setting" ? (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Top Patterns</label>
                    <input
                      type="text"
                      value={draftHook.top_patterns || ""}
                      onChange={(e) => setDraftHook({ ...draftHook, top_patterns: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Hook Tone</label>
                    <input
                      type="text"
                      value={draftHook.hook_tone || ""}
                      onChange={(e) => setDraftHook({ ...draftHook, hook_tone: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Notable Techniques</label>
                    <input
                      type="text"
                      value={draftHook.notable_techniques || ""}
                      onChange={(e) => setDraftHook({ ...draftHook, notable_techniques: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">Average Hook Length</label>
                    <input
                      type="text"
                      value={draftHook.avg_hook_length || ""}
                      onChange={(e) => setDraftHook({ ...draftHook, avg_hook_length: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingSection(null)}
                      className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveSection("hook_setting", draftHook)}
                      disabled={isSavingSection}
                      className="rounded-md bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Top Patterns</span>
                    <p className="text-foreground/90">{persona.hook_setting?.top_patterns || "Not specified"}</p>
                  </div>
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Hook Tone</span>
                    <p className="text-foreground/90">{persona.hook_setting?.hook_tone || "Not specified"}</p>
                  </div>
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Notable Techniques</span>
                    <p className="text-foreground/90">{persona.hook_setting?.notable_techniques || "Not specified"}</p>
                  </div>
                  <div className="rounded-lg bg-card p-2.5 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Avg Length</span>
                    <p className="text-foreground/90">{persona.hook_setting?.avg_hook_length || "12-18 words"}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 4: Writing Style Analysis (Nested Accordion) */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <div
            onClick={() => toggleAccordion("writing_style_analysis")}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/40 transition-colors select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Pencil className="size-4 text-primary" />
              <span>Writing Style Analysis</span>
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                openSection === "writing_style_analysis" && "rotate-180"
              )}
            />
          </div>

          {openSection === "writing_style_analysis" && (
            <div className="p-3.5 space-y-2 border-t border-border/50">
              {/* Keep Original Structure Switch */}
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card p-3 mb-3">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Keep Original Sentence Structure</span>
                  <span className="text-[10px] text-muted-foreground block">
                    Preserve exact line break pacing and sentence cadence in AI generations.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={persona.sentence_structure_keep_original}
                  onChange={(e) => {
                    if (onUpdateSection) {
                      onUpdateSection("sentence_structure_keep_original", e.target.checked);
                    }
                  }}
                  className="size-4 accent-primary rounded cursor-pointer"
                />
              </div>

              {/* Sub-aspect: Sentence Structure */}
              <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleStyleAccordion("sentence_structure")}
                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold hover:bg-muted/30"
                >
                  <span className="flex items-center gap-2">
                    <AlignLeft className="size-3.5 text-muted-foreground" />
                    Sentence Structure & Composition
                  </span>
                  <ChevronDown className={cn("size-3.5 text-muted-foreground", openStyleSection === "sentence_structure" && "rotate-180")} />
                </button>
                {openStyleSection === "sentence_structure" && (
                  <div className="p-3 pt-1 text-xs space-y-1.5 border-t border-border/40 text-muted-foreground">
                    <p><strong className="text-foreground">Avg Post Length:</strong> {persona.writing_style_analysis?.sentence_structure?.avg_post_length || "180 - 240 words"}</p>
                    <p><strong className="text-foreground">Sentence Length:</strong> {persona.writing_style_analysis?.sentence_structure?.avg_sentence_length || "11 - 16 words"}</p>
                    <p><strong className="text-foreground">Paragraphs:</strong> {persona.writing_style_analysis?.sentence_structure?.paragraph_composition || "1-2 sentences per block"}</p>
                    <p><strong className="text-foreground">Line Breaks:</strong> {persona.writing_style_analysis?.sentence_structure?.line_break_pattern || "Single line spacing"}</p>
                  </div>
                )}
              </div>

              {/* Sub-aspect: Thought Development */}
              <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleStyleAccordion("thought_development")}
                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold hover:bg-muted/30"
                >
                  <span className="flex items-center gap-2">
                    <Route className="size-3.5 text-muted-foreground" />
                    Thought Development & Narrative Flow
                  </span>
                  <ChevronDown className={cn("size-3.5 text-muted-foreground", openStyleSection === "thought_development" && "rotate-180")} />
                </button>
                {openStyleSection === "thought_development" && (
                  <div className="p-3 pt-1 text-xs space-y-1.5 border-t border-border/40 text-muted-foreground">
                    <p><strong className="text-foreground">Dominant Structure:</strong> {persona.writing_style_analysis?.thought_development?.dominant_structure || "Problem -> Discovery -> Blueprint"}</p>
                    <p><strong className="text-foreground">Contrast Usage:</strong> {persona.writing_style_analysis?.thought_development?.contrast_reversal_usage || "Standard myths vs production realities"}</p>
                    <p><strong className="text-foreground">Conclusion Style:</strong> {persona.writing_style_analysis?.thought_development?.conclusion_style || "Actionable takeaway question"}</p>
                  </div>
                )}
              </div>

              {/* Sub-aspect: Emotional Distance */}
              <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleStyleAccordion("emotional_distance")}
                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold hover:bg-muted/30"
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake className="size-3.5 text-muted-foreground" />
                    Emotional Distance & Confidence
                  </span>
                  <ChevronDown className={cn("size-3.5 text-muted-foreground", openStyleSection === "emotional_distance" && "rotate-180")} />
                </button>
                {openStyleSection === "emotional_distance" && (
                  <div className="p-3 pt-1 text-xs space-y-1.5 border-t border-border/40 text-muted-foreground">
                    <p><strong className="text-foreground">Relationship:</strong> {persona.writing_style_analysis?.emotional_distance?.audience_relationship || "Peer in the arena"}</p>
                    <p><strong className="text-foreground">Confidence:</strong> {persona.writing_style_analysis?.emotional_distance?.confidence_level || "Empirical & authoritative"}</p>
                    <p><strong className="text-foreground">Self-Disclosure:</strong> {persona.writing_style_analysis?.emotional_distance?.self_disclosure_level || "Candid regarding mistakes"}</p>
                  </div>
                )}
              </div>

              {/* Sub-aspect: Humor & Personality */}
              <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleStyleAccordion("humor_and_personality")}
                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold hover:bg-muted/30"
                >
                  <span className="flex items-center gap-2">
                    <Smile className="size-3.5 text-muted-foreground" />
                    Humor & Personality Traits
                  </span>
                  <ChevronDown className={cn("size-3.5 text-muted-foreground", openStyleSection === "humor_and_personality" && "rotate-180")} />
                </button>
                {openStyleSection === "humor_and_personality" && (
                  <div className="p-3 pt-1 text-xs space-y-1.5 border-t border-border/40 text-muted-foreground">
                    <p><strong className="text-foreground">Humor Frequency:</strong> {persona.writing_style_analysis?.humor_and_personality?.humor_frequency || "Subtle tech wit (1 in 4)"}</p>
                    <p><strong className="text-foreground">Humor Style:</strong> {persona.writing_style_analysis?.humor_and_personality?.humor_style || "Self-deprecating developer humor"}</p>
                    <p><strong className="text-foreground">Traits:</strong> {persona.writing_style_analysis?.humor_and_personality?.signature_traits || "Pragmatic, curious, relentless"}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 5: CTA Setting */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <div
            onClick={() => toggleAccordion("cta_setting")}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/40 transition-colors select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Send className="size-4 text-primary" />
              <span>CTA Setting</span>
            </div>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSection(editingSection === "cta_setting" ? null : "cta_setting");
                    setOpenSection("cta_setting");
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline px-1"
                >
                  {editingSection === "cta_setting" ? "Done" : "Edit"}
                </button>
              )}
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  openSection === "cta_setting" && "rotate-180"
                )}
              />
            </div>
          </div>

          {openSection === "cta_setting" && (
            <div className="p-3.5 text-xs space-y-3 border-t border-border/50">
              {persona.cta_setting?.items && persona.cta_setting.items.length > 0 ? (
                persona.cta_setting.items.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{item.type}</span>
                    </div>
                    <p className="text-muted-foreground">{item.instruction}</p>
                    {item.examples && item.examples.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Examples:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-foreground/80">
                          {item.examples.map((ex, exIdx) => (
                            <li key={exIdx}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No specific CTA presets configured.</p>
              )}
            </div>
          )}
        </div>

        {/* Section 6: Topics & Patterns */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <div
            onClick={() => toggleAccordion("topics_and_patterns")}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/40 transition-colors select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Tag className="size-4 text-primary" />
              <span>Core Topics & Top Patterns</span>
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                openSection === "topics_and_patterns" && "rotate-180"
              )}
            />
          </div>

          {openSection === "topics_and_patterns" && (
            <div className="p-3.5 text-xs space-y-3 border-t border-border/50">
              <div className="space-y-2">
                <span className="font-bold text-foreground block">Core Content Pillars:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(persona.core_topics || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground"
                    >
                      {t}
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = (persona.core_topics || []).filter((item) => item !== t);
                            if (onUpdateSection) onUpdateSection("core_topics", filtered);
                          }}
                          className="hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Add topic (press Enter)..."
                      value={newTopicInput}
                      onChange={(e) => setNewTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTopicInput.trim()) {
                          const updated = [...(persona.core_topics || []), newTopicInput.trim()];
                          if (onUpdateSection) onUpdateSection("core_topics", updated);
                          setNewTopicInput("");
                        }
                      }}
                      className="h-7 w-48 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {persona.top_performing_patterns && (
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <span className="font-bold text-foreground block">Viral Narrative Patterns:</span>
                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {persona.top_performing_patterns}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 7: Additional Instructions */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
          <div
            onClick={() => toggleAccordion("additional_instructions")}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted/40 transition-colors select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Sparkles className="size-4 text-primary" />
              <span>Additional Instructions & Guardrails</span>
            </div>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSection(editingSection === "additional_instructions" ? null : "additional_instructions");
                    setOpenSection("additional_instructions");
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline px-1"
                >
                  {editingSection === "additional_instructions" ? "Done" : "Edit"}
                </button>
              )}
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  openSection === "additional_instructions" && "rotate-180"
                )}
              />
            </div>
          </div>

          {openSection === "additional_instructions" && (
            <div className="p-3.5 text-xs text-muted-foreground border-t border-border/50">
              {editingSection === "additional_instructions" ? (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    maxLength={1000}
                    value={draftInstructions}
                    onChange={(e) => setDraftInstructions(e.target.value)}
                    placeholder="e.g. Always write with direct, active voice. Avoid buzzwords like delve or tapestry..."
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">{draftInstructions.length}/1000 characters</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveSection("additional_instructions", draftInstructions)}
                        disabled={isSavingSection}
                        className="rounded-md bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                  {persona.additional_instructions || "No custom instructions specified."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Card Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Post language:</span>
          <select
            value={draftLanguage}
            onChange={(e) => {
              const newLang = e.target.value;
              setDraftLanguage(newLang);
              if (onUpdateSection) onUpdateSection("content_language", newLang);
            }}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onReanalyze && (
            <button
              type="button"
              onClick={() => onReanalyze(persona)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="size-3.5" />
              <span>Reanalyze</span>
            </button>
          )}

          {onDelete && !readOnly && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${persona.name}?`)) {
                  onDelete(persona.id);
                }
              }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Delete Brand Voice"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Share / Export Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Share Brand Voice</h3>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <PersonaAvatar name={persona.name} platform={platform} size="sm" />
                <span className="font-bold text-sm text-foreground">{persona.name}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
                {persona.profile_identity}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCardSummary}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {isCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span>{isCopied ? "Copied" : "Copy Summary"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("Mockup downloaded!");
                  setIsShareModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                <Download className="size-3.5" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
