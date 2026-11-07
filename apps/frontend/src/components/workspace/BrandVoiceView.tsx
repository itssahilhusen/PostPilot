"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sliders,
  List as ListIcon,
  Plus,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PersonaCard } from "@/components/personas/PersonaCard";
import { EmptyPersonaSlot } from "@/components/personas/EmptyPersonaSlot";
import { SetupPersonaModal } from "@/components/personas/SetupPersonaModal";
import { AccountSelectorCombobox, SocialAccountOption } from "@/components/personas/AccountSelectorCombobox";
import { PersonaData } from "@/lib/persona-defaults";

export function BrandVoiceView() {
  const [activeTab, setActiveTab] = useState<"setup" | "list">("setup");
  const [personas, setPersonas] = useState<PersonaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync tab with URL search params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "list" || tabParam === "setup") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tab: "setup" | "list") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Accounts state
  const [accounts, setAccounts] = useState<SocialAccountOption[]>([
    { id: "acc_threads_main", name: "Alex Rivers", handle: "alexrivers.ai", provider: "threads", avatar: "/images/platforms/threads.svg" },
    { id: "acc_x_main", name: "Alex Rivers", handle: "alexrivers_ai", provider: "x", avatar: "/images/platforms/x-light.svg" },
    { id: "acc_linkedin_main", name: "Alex Rivers", handle: "alex-rivers", provider: "linkedin", avatar: "/images/platforms/linkedin.svg" },
  ]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>("acc_threads_main");

  // Mobile setup tab state: 0 (Brand Voice A) or 1 (Brand Voice B)
  const [mobileSlotIndex, setMobileSlotIndex] = useState<0 | 1>(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState<number>(0);

  const fetchPersonas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/persona");
      const data = await res.json();
      if (data.personas) {
        setPersonas(data.personas);
      }
    } catch (err) {
      console.error("Failed to load personas:", err);
      toast.error("Could not load brand voices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  // Filter personas for setup tab
  const setupPersonas = useMemo(() => {
    if (!selectedAccountId) return personas;
    return personas.filter(
      (p) => !p.social_account_id || p.social_account_id === selectedAccountId
    );
  }, [personas, selectedAccountId]);

  const personaA = setupPersonas.find((p) => p.persona_number === 0);
  const personaB = setupPersonas.find((p) => p.persona_number === 1);

  // Open creation modal
  const handleOpenAddModal = (slot: number) => {
    setModalSlot(slot);
    setIsModalOpen(true);
  };

  // Section patch handler
  const handleUpdateSection = async (personaId: string, section: string, data: any) => {
    try {
      const res = await fetch(`/api/ai/persona/${personaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });

      if (!res.ok) throw new Error("Failed to update section");

      // Optimistic update
      setPersonas((prev) =>
        prev.map((p) => {
          if (p.id !== personaId) return p;
          const updated = { ...p };
          if (section === "name") updated.name = data;
          else if (section === "content_language") updated.content_language = data;
          else if (section === "sentence_structure_keep_original") updated.sentence_structure_keep_original = data;
          else if (section === "profile_identity") updated.profile_identity = data;
          else if (section === "target_audience") updated.target_audience = data;
          else if (section === "hook_setting") updated.hook_setting = data;
          else if (section === "writing_style_analysis") updated.writing_style_analysis = data;
          else if (section === "cta_setting") updated.cta_setting = data;
          else if (section === "reference_link_setting") updated.reference_link_setting = data;
          else if (section === "core_topics") updated.core_topics = data;
          else if (section === "top_performing_patterns") updated.top_performing_patterns = data;
          else if (section === "additional_instructions") updated.additional_instructions = data;
          return updated;
        })
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to save section");
      throw err;
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/persona/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPersonas((prev) => prev.filter((p) => p.id !== id));
        toast.success("Brand voice deleted successfully");
      }
    } catch {
      toast.error("Failed to delete brand voice");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background px-4 lg:px-6 py-5 font-sans min-w-0">
      {/* 1. Brand Voice Title Row */}
      <div className="flex items-center gap-2.5 mb-4 shrink-0">
        <div className="flex items-center text-foreground">
          <Sliders className="size-7 shrink-0 text-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Brand Voice
        </h1>
      </div>

      {/* 2. Tabs Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
        <div className="inline-flex rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => handleTabChange("setup")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all select-none cursor-pointer",
              activeTab === "setup"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sliders className="size-3.5" />
            <span>Brand Voice Setup</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("list")}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all select-none cursor-pointer",
              activeTab === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListIcon className="size-3.5" />
            <span>Brand Voice List</span>
          </button>
        </div>
      </div>

      {/* 3. TAB 1: SETUP VIEW (A/B SPLIT) */}
      {activeTab === "setup" && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AccountSelectorCombobox
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onSelect={setSelectedAccountId}
              />
            </div>

            <button
              type="button"
              data-testid="add-persona-button"
              onClick={() => handleOpenAddModal(!personaA ? 0 : 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Add Brand Voice</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary mr-2" />
              <span className="text-sm font-medium">Loading brand voices...</span>
            </div>
          ) : (
            <>
              {/* Mobile View: Slot A / Slot B Tabs */}
              <div className="xl:hidden space-y-4">
                <div className="flex rounded-xl bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setMobileSlotIndex(0)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                      mobileSlotIndex === 0 ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Brand Voice A
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSlotIndex(1)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                      mobileSlotIndex === 1 ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Brand Voice B
                  </button>
                </div>

                {mobileSlotIndex === 0 ? (
                  personaA ? (
                    <PersonaCard
                      persona={personaA}
                      platform={accounts.find((a) => a.id === personaA.social_account_id)?.provider}
                      profileImageUrl={accounts.find((a) => a.id === personaA.social_account_id)?.avatar || undefined}
                      onDelete={handleDelete}
                      onReanalyze={() => handleOpenAddModal(0)}
                      onUpdateSection={(sec, data) => handleUpdateSection(personaA.id, sec, data)}
                    />
                  ) : (
                    <EmptyPersonaSlot personaNumber={0} onAdd={() => handleOpenAddModal(0)} />
                  )
                ) : (
                  personaB ? (
                    <PersonaCard
                      persona={personaB}
                      platform={accounts.find((a) => a.id === personaB.social_account_id)?.provider}
                      profileImageUrl={accounts.find((a) => a.id === personaB.social_account_id)?.avatar || undefined}
                      onDelete={handleDelete}
                      onReanalyze={() => handleOpenAddModal(1)}
                      onUpdateSection={(sec, data) => handleUpdateSection(personaB.id, sec, data)}
                    />
                  ) : (
                    <EmptyPersonaSlot personaNumber={1} onAdd={() => handleOpenAddModal(1)} />
                  )
                )}
              </div>

              {/* Desktop View: Side-by-Side Dual Comparison (XL Grid) */}
              <div className="hidden xl:grid xl:grid-cols-2 gap-6 items-start">
                {/* Column 1: Slot A */}
                <div className="min-w-0">
                  {personaA ? (
                    <PersonaCard
                      persona={personaA}
                      platform={accounts.find((a) => a.id === personaA.social_account_id)?.provider}
                      profileImageUrl={accounts.find((a) => a.id === personaA.social_account_id)?.avatar || undefined}
                      onDelete={handleDelete}
                      onReanalyze={() => handleOpenAddModal(0)}
                      onUpdateSection={(sec, data) => handleUpdateSection(personaA.id, sec, data)}
                    />
                  ) : (
                    <EmptyPersonaSlot personaNumber={0} onAdd={() => handleOpenAddModal(0)} />
                  )}
                </div>

                {/* Column 2: Slot B */}
                <div className="min-w-0">
                  {personaB ? (
                    <PersonaCard
                      persona={personaB}
                      platform={accounts.find((a) => a.id === personaB.social_account_id)?.provider}
                      profileImageUrl={accounts.find((a) => a.id === personaB.social_account_id)?.avatar || undefined}
                      onDelete={handleDelete}
                      onReanalyze={() => handleOpenAddModal(1)}
                      onUpdateSection={(sec, data) => handleUpdateSection(personaB.id, sec, data)}
                    />
                  ) : (
                    <EmptyPersonaSlot personaNumber={1} onAdd={() => handleOpenAddModal(1)} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. TAB 2: LIST VIEW (ALL PERSONAS GRID) */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary mr-2" />
              <span className="text-sm font-medium">Loading catalog...</span>
            </div>
          ) : personas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              {personas.map((p) => {
                const acc = accounts.find((a) => a.id === p.social_account_id);
                return (
                  <PersonaCard
                    key={p.id}
                    persona={p}
                    platform={acc?.provider}
                    profileImageUrl={acc?.avatar || undefined}
                    onDelete={handleDelete}
                    onReanalyze={() => handleOpenAddModal(p.persona_number)}
                    onUpdateSection={(sec, data) => handleUpdateSection(p.id, sec, data)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 rounded-2xl border border-dashed border-border p-8">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Sliders className="size-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">No brand voices analyzed yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Select an account and start analysis to generate your customized AI personas.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddModal(0)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Create Brand Voice</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Creation / Reanalyze Modal */}
      <SetupPersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetSlot={modalSlot}
        selectedAccountId={selectedAccountId}
        existingPersonas={personas}
        onSuccess={(newP) => {
          setPersonas((prev) => {
            const filtered = prev.filter(
              (p) => !(p.persona_number === newP.persona_number && p.social_account_id === newP.social_account_id)
            );
            return [...filtered, newP];
          });
        }}
      />
    </div>
  );
}
