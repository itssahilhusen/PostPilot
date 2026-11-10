"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/design-system/AppShell";
import { cn } from "@/lib/utils";
import { 
  Settings as SettingsIcon, 
  User, 
  Key, 
  Share2, 
  Bell, 
  Shield, 
  Check, 
  Copy, 
  Sparkles,
  ExternalLink,
  Save
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "integrations" | "ai" | "notifications">("general");
  const [workspaceName, setWorkspaceName] = useState("Halcyon & Co");
  const [brandWebsite, setBrandWebsite] = useState("https://halcyon.design");
  const [geminiApiKey, setGeminiApiKey] = useState("AIzaSy••••••••••••••••••••••••••••••");
  const [isCopied, setIsCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 600);
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText("https://api.postpilot.app/v1/webhook/halcyon-co");
    setIsCopied(true);
    toast.success("Webhook URL copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AppShell activeTab="feed">
      <main
        className="flex-1 flex flex-col h-full overflow-hidden text-neutral-200 select-none relative"
        style={{
          background: "rgba(14, 18, 19, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          boxShadow: "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
        }}
      >
        {/* Header */}
        <div className="h-16 border-b border-white/10 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-lime/10 border border-brand-lime/25 flex items-center justify-center text-brand-lime">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Workspace Settings</h1>
              <p className="text-xs text-neutral-400">Configure your PostPilot automation workspace and AI pipelines</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-lime text-black font-semibold text-xs hover:bg-brand-limeHover transition-colors cursor-pointer shadow-sm active:scale-98"
          >
            {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Inner Sidebar Tabs */}
          <div className="w-56 border-r border-white/10 p-4 flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left",
                activeTab === "general"
                  ? "bg-brand-lime text-black font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <User className="w-4 h-4" />
              <span>General & Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("integrations")}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left",
                activeTab === "integrations"
                  ? "bg-brand-lime text-black font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Share2 className="w-4 h-4" />
              <span>Connected Channels</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left",
                activeTab === "ai"
                  ? "bg-brand-lime text-black font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Engine & Keys</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left",
                activeTab === "notifications"
                  ? "bg-brand-lime text-black font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {activeTab === "general" && (
              <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">General Information</h2>
                  <p className="text-xs text-neutral-400">Workspace name, domain and public branding credentials</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">Workspace Name</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">Brand Website / Canonical URL</label>
                    <input
                      type="text"
                      value={brandWebsite}
                      onChange={(e) => setBrandWebsite(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">Automation Webhook URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://api.postpilot.app/v1/webhook/halcyon-co"
                        className="flex-1 h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-400 font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={copyWebhook}
                        className="h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-brand-lime" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Connected Social Channels</h2>
                  <p className="text-xs text-neutral-400">Direct multi-platform auto-publishing and engagement sync</p>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "Instagram Business", handle: "@halcyon.design", status: "Connected", icon: "📷", connected: true },
                    { name: "LinkedIn Page", handle: "Halcyon & Co. Agency", status: "Connected", icon: "💼", connected: true },
                    { name: "X (Twitter)", handle: "@halcyonco", status: "Connected", icon: "𝕏", connected: true },
                    { name: "TikTok Creator", handle: "Not connected", status: "Connect", icon: "🎵", connected: false },
                    { name: "YouTube Shorts", handle: "Not connected", status: "Connect", icon: "▶️", connected: false },
                  ].map((ch) => (
                    <div
                      key={ch.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ch.icon}</span>
                        <div>
                          <div className="text-xs font-semibold text-white">{ch.name}</div>
                          <div className="text-[11px] text-neutral-400">{ch.handle}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast.info(`${ch.name} settings toggled.`)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                          ch.connected
                            ? "bg-white/10 text-neutral-300 hover:bg-white/15"
                            : "bg-brand-lime text-black font-semibold hover:bg-brand-limeHover"
                        )}
                      >
                        {ch.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Generation & Models</h2>
                  <p className="text-xs text-neutral-400">Configure Gemini 2.5 Flash / Pro and synthesis prompts</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">Primary Vision Model</label>
                    <select className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime">
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-low latency, optimal for carousels)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep multimodal reasoning)</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">Google Gemini API Key</label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-brand-lime"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">Keys are encrypted with AES-256 in PostgreSQL storage.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Notification Preferences</h2>
                  <p className="text-xs text-neutral-400">Manage real-time alerts for feed generation and scheduled posts</p>
                </div>

                <div className="space-y-3">
                  {[
                    { title: "Daily AI Flywheel digest", desc: "Receive summary of top research papers & viral tweets every morning", defaultChecked: true },
                    { title: "Post scheduled alert", desc: "Notification when a carousel post goes live across platforms", defaultChecked: true },
                    { title: "Auto-DM & lead replies", desc: "Real-time alerts when prospective customers trigger keyword DMs", defaultChecked: false },
                  ].map((notif, idx) => (
                    <label
                      key={idx}
                      className="flex items-start justify-between p-4 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="text-xs font-semibold text-white">{notif.title}</div>
                        <div className="text-[11px] text-neutral-400">{notif.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={notif.defaultChecked}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-brand-lime focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#C5F52A]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
