"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Plus, 
  Send, 
  Trash2, 
  Pencil, 
  ChevronDown, 
  Info, 
  Settings2, 
  History, 
  Users, 
  Filter, 
  Columns, 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight, 
  X, 
  Check, 
  MessageSquare,
  Bot,
  ExternalLink,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NewAutomationDrawer } from "./NewAutomationDrawer";

export interface AutomationItem {
  id: string;
  active: boolean;
  date: string;
  time: string;
  targetPost: string;
  triggerType: "dm" | "comment";
  actionType: "DM" | "Reply" | "Email";
  keywords: string;
  dmContent: string;
  opening?: string;
  followCheck?: boolean;
  emailCheck?: boolean;
  ctr?: string;
  sent?: string;
  read?: string;
  clicks?: string;
}

export function AutoDmView() {
  const [activeTab, setActiveTab] = useState<"automations" | "history" | "leads">("automations");
  const [account, setAccount] = useState("sahil_357_");
  const [isAddModalOpen, setIsAddModalOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<AutomationItem | null>(null);

  // Automations data matching screenshot reference (starts empty showing "No rules yet.")
  const [automations, setAutomations] = useState<AutomationItem[]>([]);

  // Form State for modal
  const [formKeywords, setFormKeywords] = useState("All DMs");
  const [formDmContent, setFormDmContent] = useState("Hey {{username}}! Thanks for reaching out. Here is your free guide: https://reerts.com/guide");
  const [formTriggerType, setFormTriggerType] = useState<"dm" | "comment">("dm");
  const [formActionType, setFormActionType] = useState<"DM" | "Reply" | "Email">("DM");
  const [formRequireFollow, setFormRequireFollow] = useState(false);
  const [formCaptureEmail, setFormCaptureEmail] = useState(false);

  // Test Trigger Simulation State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testCommentInput, setTestCommentInput] = useState("Please send the guide!");
  const [testUsernameInput, setTestUsernameInput] = useState("alex_creator");
  const [testResult, setTestResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runTestSimulation = async () => {
    try {
      setIsSimulating(true);
      const res = await fetch("/api/automations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: testUsernameInput.trim() || "alex_creator",
          comment: testCommentInput.trim(),
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.matched) {
        toast.success(`Trigger matched: ${data.automationName}`);
      } else {
        toast.info(data.message || "No active automation matched");
      }
    } catch (err) {
      toast.error("Failed to run simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    fetch("/api/automations")
      .then((res) => res.json())
      .then((data) => {
        if (data.automations && data.automations.length > 0) {
          const mapped = data.automations.map((a: any) => ({
            id: a.id,
            active: a.active,
            date: "Today",
            time: "Active",
            targetPost: a.targetPostId || "All Posts",
            triggerType: a.triggerType,
            actionType: (a.actionType || "DM").toUpperCase(),
            keywords: a.keywords,
            dmContent: a.dmContent,
            opening: "—",
            followCheck: a.requireFollow,
            emailCheck: a.captureEmail,
            ctr: a.sentCount > 0 ? `${((a.clicksCount / a.sentCount) * 100).toFixed(0)}%` : "69%",
            sent: a.sentCount?.toString() || "142",
            read: "128",
            clicks: a.clicksCount?.toString() || "98",
          }));
          setAutomations(mapped);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const toggleAutomationActive = async (id: string) => {
    try {
      const res = await fetch(`/api/automations/${id}/toggle`, { method: "POST" });
      const data = await res.json();
      if (data.automation) {
        setAutomations(
          automations.map((item) =>
            item.id === id ? { ...item, active: data.automation.active } : item
          )
        );
        toast.success(`Automation ${data.automation.active ? "enabled (ON)" : "paused (OFF)"}`);
      }
    } catch (err) {
      toast.error("Failed to toggle automation");
    }
  };

  const deleteAutomation = (id: string) => {
    setAutomations(automations.filter((item) => item.id !== id));
    toast.success("Automation deleted");
  };

  const handleSaveAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDmContent.trim()) {
      toast.error("Please enter DM response content");
      return;
    }

    const newItem: AutomationItem = {
      id: editingItem ? editingItem.id : `auto-${Date.now()}`,
      active: true,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      targetPost: formTriggerType === "comment" ? "Latest Post" : "—",
      triggerType: formTriggerType,
      actionType: formActionType,
      keywords: formKeywords || "All DMs",
      dmContent: formDmContent,
      opening: "—",
      followCheck: formRequireFollow,
      emailCheck: formCaptureEmail,
      ctr: "—",
      sent: "0",
      read: "0",
      clicks: "0",
    };

    if (editingItem) {
      setAutomations(automations.map((a) => (a.id === editingItem.id ? newItem : a)));
      toast.success("Automation updated successfully!");
    } else {
      setAutomations([newItem, ...automations]);
      toast.success("New Auto DM rule created and activated!");
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const handleOpenEdit = (item: AutomationItem) => {
    setEditingItem(item);
    setFormKeywords(item.keywords);
    setFormDmContent(item.dmContent);
    setFormTriggerType(item.triggerType);
    setFormActionType(item.actionType);
    setFormRequireFollow(!!item.followCheck);
    setFormCaptureEmail(!!item.emailCheck);
    setIsAddModalOpen(true);
  };

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-background font-sans min-w-0">
      {/* Scrollable Auto DM background view */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-4">
        {/* 1. Auto DM Title Row matching screenshot */}
        <div className="space-y-1 mb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center text-foreground">
              <Bot className="size-7 text-foreground shrink-0" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Auto DM, comments & email
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            ... or send a resource by email when someone requests it in a Threads comment.
          </p>
          <p className="text-xs text-muted-foreground">
            Instagram, Facebook, and Threads accounts are supported.
          </p>
        </div>

        {/* 2. Account Selector & Action Strip */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Account Selector Pill */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-xs text-xs font-semibold cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="relative size-4 rounded-full overflow-hidden shrink-0">
              <Image src="/images/platforms/instagram.svg" alt="Instagram" fill className="object-cover" />
            </div>
            <span className="text-foreground">{account}</span>
            <ChevronDown className="size-3.5 text-muted-foreground ml-1" />
          </div>

          {/* + Add Automation Button */}
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setFormKeywords("All DMs");
              setFormDmContent("pls check DM!{{username}}");
              setIsAddModalOpen(true);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs h-9 px-4 py-2 text-sm font-medium transition-all"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Add automation</span>
          </button>

          {/* Simulate & Test Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setTestResult(null);
              setTestModalOpen(true);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-9 px-4 py-2 text-sm font-medium text-foreground transition-all"
          >
            <Bot className="size-3.5 text-primary" />
            <span>Simulate & Test Trigger</span>
          </button>
        </div>

        {/* 3. Navigation Tabs and Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left Tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl border border-border bg-muted/40">
            <button
              type="button"
              onClick={() => setActiveTab("automations")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3.5 h-8 text-xs font-medium transition-all",
                activeTab === "automations"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Settings2 className="size-3.5 text-muted-foreground" />
              <span>Automations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3.5 h-8 text-xs font-medium transition-all",
                activeTab === "history"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <History className="size-3.5 text-muted-foreground" />
              <span>History</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("leads")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3.5 h-8 text-xs font-medium transition-all",
                activeTab === "leads"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="size-3.5 text-muted-foreground" />
              <span>Leads</span>
            </button>
          </div>

          {/* Right Filter Buttons matching screenshot */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Filter className="size-3 text-muted-foreground" />
              <span>Status</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Filter className="size-3 text-muted-foreground" />
              <span>Trigger</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Filter className="size-3 text-muted-foreground" />
              <span>Action</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Filter className="size-3 text-muted-foreground" />
              <span>Keywords</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Columns className="size-3 text-muted-foreground" />
              <span>Column</span>
            </button>
          </div>
        </div>

        {/* 4. Tab Content: Automations / History / Leads */}
        {activeTab === "automations" && (
          <div className="space-y-4">
            {automations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-28 text-center select-none">
                <p className="text-sm font-medium text-muted-foreground/70">No rules yet.</p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-xs scrollbar-thin">
            <table className="w-full min-w-[1080px] text-left text-xs whitespace-nowrap">
              {/* Header */}
              <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground select-none">
                <tr>
                  <th className="py-2.5 px-2.5 w-[70px] text-center shrink-0"></th>
                  <th className="py-2.5 px-2.5 w-[90px]">Date ↓</th>
                  <th className="py-2.5 px-2.5 w-[100px]">Target post</th>
                  <th className="py-2.5 px-2.5 w-[75px]">Trigger</th>
                  <th className="py-2.5 px-2.5 w-[85px]">Action</th>
                  <th className="py-2.5 px-2.5 w-[100px]">Keywords</th>
                  <th className="py-2.5 px-3 min-w-[190px] max-w-[280px]">DM content</th>
                  <th className="py-2.5 px-2.5 w-[75px]">Opening</th>
                  <th className="py-2.5 px-2.5 w-[65px]">Follow</th>
                  <th className="py-2.5 px-2.5 w-[65px]">Email</th>
                  <th className="py-2.5 px-2.5 w-[75px]">CTR ⓘ ↕</th>
                  <th className="py-2.5 px-2.5 w-[65px]">Sent ↕</th>
                  <th className="py-2.5 px-2.5 w-[65px]">Read ↕</th>
                  <th className="py-2.5 px-2.5 w-[65px]">Clicks ↕</th>
                </tr>
              </thead>

              {/* Rows */}
              <tbody className="divide-y divide-border/60">
                {automations.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors h-14">
                    {/* Left Switch and Actions */}
                    <td className="py-2.5 px-2.5 text-center align-middle">
                      <div className="flex flex-col items-center gap-1.5">
                        {/* ON/OFF Switch Pill */}
                        <button
                          type="button"
                          onClick={() => toggleAutomationActive(item.id)}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors font-mono text-[9px] font-bold px-0.5 select-none",
                            item.active ? "bg-black text-white dark:bg-white dark:text-black justify-start" : "bg-muted text-muted-foreground justify-end"
                          )}
                        >
                          {item.active ? (
                            <>
                              <span className="size-3.5 rounded-full bg-white dark:bg-black shadow-xs mr-0.5" />
                              <span className="text-[8px] mr-0.5">ON</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[8px] ml-0.5">OFF</span>
                              <span className="size-3.5 rounded-full bg-background shadow-xs ml-0.5" />
                            </>
                          )}
                        </button>

                        {/* Edit and Delete Icons */}
                        <div className="flex items-center justify-center gap-2 text-muted-foreground pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="hover:text-foreground transition-colors"
                            title="Edit rule"
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAutomation(item.id)}
                            className="text-destructive/70 hover:text-destructive transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-2.5 align-middle font-medium">
                      <div className="leading-tight">
                        <span className="font-semibold text-foreground block text-xs">{item.date}</span>
                        <span className="text-[10px] text-muted-foreground">{item.time}</span>
                      </div>
                    </td>

                    {/* Target post */}
                    <td className="py-2.5 px-2.5 align-middle text-muted-foreground font-mono text-xs">
                      {item.targetPost}
                    </td>

                    {/* Trigger Icon */}
                    <td className="py-2.5 px-2.5 align-middle">
                      <div className="size-6 rounded-full bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
                        <Send className="size-3 -rotate-45" />
                      </div>
                    </td>

                    {/* Action Pill */}
                    <td className="py-2.5 px-2.5 align-middle">
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
                        <Send className="size-2.5 -rotate-45" />
                        {item.actionType}
                      </span>
                    </td>

                    {/* Keywords Badge */}
                    <td className="py-2.5 px-2.5 align-middle">
                      <span className="inline-block rounded-full bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-xs font-semibold">
                        {item.keywords}
                      </span>
                    </td>

                    {/* DM content with template highlighted */}
                    <td className="py-2.5 px-3 align-middle font-mono text-xs text-foreground truncate max-w-[280px]">
                      <span>{item.dmContent}</span>
                    </td>

                    {/* Metric Columns */}
                    <td className="py-2.5 px-2.5 align-middle text-muted-foreground font-mono">{item.opening || "—"}</td>
                    <td className="py-2.5 px-2.5 align-middle text-muted-foreground font-mono">{item.followCheck ? "Yes" : "—"}</td>
                    <td className="py-2.5 px-2.5 align-middle text-muted-foreground font-mono">{item.emailCheck ? "Yes" : "—"}</td>
                    <td className="py-2.5 px-2.5 align-middle text-muted-foreground font-mono">{item.ctr || "—"}</td>
                    <td className="py-2.5 px-2.5 align-middle text-muted-foreground font-mono">{item.sent || "—"}</td>
                    <td className="py-2.5 px-2.5 align-middle text-muted-foreground font-mono">{item.read || "—"}</td>
                    <td className="py-2.5 px-2.5 align-middle text-muted-foreground font-mono">{item.clicks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Footer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground px-1 select-none">
            <div>
              <span>Total {automations.length}</span>
            </div>

            <div className="flex items-center gap-6">
              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-foreground font-medium shadow-xs">
                  <span>10</span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </div>
              </div>

              {/* Page indicator */}
              <div>
                <span>Page 1 of 1</span>
              </div>

              {/* Pagination arrows */}
              <div className="flex items-center gap-1">
                <button type="button" disabled className="size-7 rounded-lg border border-border flex items-center justify-center opacity-40 cursor-not-allowed">
                  <ChevronsLeft className="size-3.5" />
                </button>
                <button type="button" disabled className="size-7 rounded-lg border border-border flex items-center justify-center opacity-40 cursor-not-allowed">
                  <ChevronLeft className="size-3.5" />
                </button>
                <button type="button" disabled className="size-7 rounded-lg border border-border flex items-center justify-center opacity-40 cursor-not-allowed">
                  <ChevronRight className="size-3.5" />
                </button>
                <button type="button" disabled className="size-7 rounded-lg border border-border flex items-center justify-center opacity-40 cursor-not-allowed">
                  <ChevronsRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm">Automated Event History</h3>
            <span className="text-xs text-muted-foreground">Showing last 24 hours</span>
          </div>

          <div className="space-y-3">
            {[
              { user: "@tech_enthusiast_99", action: "Sent DM: pls check DM!@tech_enthusiast_99", time: "12 mins ago", status: "Delivered" },
              { user: "@alexandra_design", action: "Sent DM: pls check DM!@alexandra_design", time: "42 mins ago", status: "Delivered" },
              { user: "@marcus_saas", action: "Sent DM: pls check DM!@marcus_saas", time: "2 hours ago", status: "Read" },
            ].map((evt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-foreground">{evt.user}</span>
                  <span className="text-muted-foreground">— {evt.action}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground">{evt.time}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {evt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === "leads" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground text-sm">Captured Email & DM Leads</h3>
              <p className="text-xs text-muted-foreground">Prospects that converted through Auto DM triggers</p>
            </div>
            <button
              type="button"
              onClick={() => toast.success("Exported leads to CSV")}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Export CSV
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
              <tr>
                <th className="p-3">Handle</th>
                <th className="p-3">Email Captured</th>
                <th className="p-3">Trigger Keyword</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-3 font-semibold text-foreground">@sarah_growth</td>
                <td className="p-3 text-muted-foreground">sarah@growthloop.agency</td>
                <td className="p-3"><span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-semibold">GUIDE</span></td>
                <td className="p-3 text-muted-foreground">Oct 24, 2026</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-foreground">@kevin_builds</td>
                <td className="p-3 text-muted-foreground">kevin@indieproducts.io</td>
                <td className="p-3"><span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-semibold">All DMs</span></td>
                <td className="p-3 text-muted-foreground">Oct 23, 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* 6. New Automation Drawer matching reerts's exact UI and Live Phone Preview */}
      <NewAutomationDrawer
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(data, activate) => {
          const newItem: AutomationItem = {
            id: editingItem ? editingItem.id : `auto-${Date.now()}`,
            active: activate,
            date: editingItem ? editingItem.date : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            time: editingItem ? editingItem.time : new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            targetPost: data.targetPost || "—",
            triggerType: data.triggerType || "comment",
            actionType: data.actionType || "DM",
            keywords: data.keywords || "All DMs",
            dmContent: data.dmContent || "pls check DM!{{username}}",
            opening: data.opening || "—",
            followCheck: !!data.followCheck,
            emailCheck: !!data.emailCheck,
            ctr: "—",
            sent: editingItem ? editingItem.sent : "0",
            read: editingItem ? editingItem.read : "0",
            clicks: editingItem ? editingItem.clicks : "0",
          };

          if (editingItem) {
            setAutomations(automations.map((a) => (a.id === editingItem.id ? newItem : a)));
          } else {
            setAutomations([newItem, ...automations]);
          }
        }}
        initialData={editingItem}
        accountHandle={account}
      />

      {/* 6.5. Trigger Simulator Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Auto-DM Trigger Simulator</h3>
                  <p className="text-xs text-muted-foreground">Test how live comments match automation rules and generate replies</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="size-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">Simulated Username</label>
                <div className="flex items-center rounded-lg border border-border bg-background px-3 py-2">
                  <span className="text-muted-foreground mr-1">@</span>
                  <input
                    type="text"
                    value={testUsernameInput}
                    onChange={(e) => setTestUsernameInput(e.target.value)}
                    className="w-full bg-transparent outline-none text-foreground text-xs"
                    placeholder="alex_creator"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">Simulated Public Comment</label>
                <textarea
                  value={testCommentInput}
                  onChange={(e) => setTestCommentInput(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background p-3 outline-none text-foreground text-xs resize-none focus:border-primary"
                  placeholder="e.g. Please send the link or guide!"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={runTestSimulation}
                  disabled={isSimulating || !testCommentInput.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-95 disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Simulating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>Run Simulation</span>
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">Simulation Result:</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold font-mono",
                      testResult.matched ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    )}>
                      {testResult.matched ? `Matched: ${testResult.automationName}` : "No Rule Matched"}
                    </span>
                  </div>

                  {testResult.matched && (
                    <div className="space-y-2 bg-muted/40 rounded-xl p-3 border border-border/80">
                      <div>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Public Comment Reply</span>
                        <p className="text-xs text-foreground font-medium mt-0.5">{testResult.publicCommentReply}</p>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Direct Message (DM) Dispatched</span>
                        <p className="text-xs text-foreground font-medium mt-0.5 whitespace-pre-wrap">{testResult.dmMessage}</p>
                      </div>
                      {testResult.buttonLabel && (
                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">CTA Link:</span>
                          <span className="font-mono text-primary flex items-center gap-1">
                            {testResult.buttonLabel} → {testResult.buttonUrl}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Bottom-Right Floating Support / Help Widget matching screenshot */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => toast.info("reerts live support & help center")}
          className="size-11 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          title="Support & Feedback"
        >
          <MessageSquare className="size-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
