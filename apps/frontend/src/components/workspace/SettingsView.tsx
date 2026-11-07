"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Sliders,
  Sparkles,
  Bell,
  Key,
  Shield,
  Save,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Clock,
  Cpu,
  Mail,
  AlertTriangle
} from "lucide-react";

type SettingsTab = "general" | "ai" | "notifications" | "api";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [workspaceName, setWorkspaceName] = useState("Alex Martis Studio");
  const [workspaceSlug, setWorkspaceSlug] = useState("alex-martis");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en-US");

  // AI settings
  const [defaultModel, setDefaultModel] = useState("gemini-1.5-pro");
  const [creativity, setCreativity] = useState("0.7");
  const [autoDrafts, setAutoDrafts] = useState(true);
  const [brandVoiceStrictness, setBrandVoiceStrictness] = useState(true);

  // Notification settings
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [notifyLowCredits, setNotifyLowCredits] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // API settings
  const [apiKey] = useState("reerts_sk_demo_8f3a9e1d2c4b5a6078e91f24d35");
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.studio.io/webhooks/reerts");

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully!");
    }, 400);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto select-text">
      <div className="max-w-4xl w-full mx-auto px-6 py-8 md:py-10 space-y-6">
        {/* Header */}
        <div className="border-b border-surface-border pb-5">
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <Sliders className="w-4.5 h-4.5" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase">Workspace Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-mono">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-mono mt-1">
            Manage your workspace preferences, AI model parameters, and API integrations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-surface-border pb-px overflow-x-auto">
          {[
            { id: "general", label: "General", icon: Globe },
            { id: "ai", label: "AI & Models", icon: Sparkles },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "api", label: "API & Webhooks", icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs sm:text-[13px] font-mono font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-px ${
                  isActive
                    ? "border-brand-500 text-brand-600 bg-brand-50/50 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-500" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold font-mono text-slate-900 border-b border-slate-100 pb-2">
                  Workspace Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-700">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs sm:text-[13px] font-mono bg-white border border-surface-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-700">
                      Workspace Identifier
                    </label>
                    <div className="flex rounded-md border border-surface-border overflow-hidden focus-within:ring-1 focus-within:ring-brand-500 focus-within:border-brand-500">
                      <span className="inline-flex items-center px-2.5 bg-slate-50 text-slate-400 font-mono text-xs border-r border-surface-border">
                        reerts.io/
                      </span>
                      <input
                        type="text"
                        value={workspaceSlug}
                        onChange={(e) => setWorkspaceSlug(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-[13px] font-mono bg-white border-0 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold font-mono text-slate-900 border-b border-slate-100 pb-2">
                  Localization & Scheduling
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-700 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Primary Timezone</span>
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs sm:text-[13px] font-mono bg-white border border-surface-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800"
                    >
                      <option value="America/New_York">Eastern Time (US & Canada) UTC-5</option>
                      <option value="America/Chicago">Central Time (US & Canada) UTC-6</option>
                      <option value="America/Los_Angeles">Pacific Time (US & Canada) UTC-8</option>
                      <option value="Europe/London">London UTC+0</option>
                      <option value="Europe/Paris">Paris, Berlin UTC+1</option>
                      <option value="Asia/Tokyo">Tokyo UTC+9</option>
                      <option value="Asia/Kolkata">India Standard Time UTC+5:30</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-700 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Content Language</span>
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs sm:text-[13px] font-mono bg-white border border-surface-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === "ai" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold font-mono text-slate-900 border-b border-slate-100 pb-2">
                  Model Engine Configuration
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-slate-700 flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      <span>Default Intelligence Model</span>
                    </label>
                    <select
                      value={defaultModel}
                      onChange={(e) => setDefaultModel(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs sm:text-[13px] font-mono bg-white border border-surface-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800"
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (High Reasoning & Multi-modal)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-fast & Efficient)</option>
                      <option value="gpt-4o">GPT-4o (Balanced General Purpose)</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Nuanced Creative Writing)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <label className="font-medium text-slate-700">Creativity Temperature: {creativity}</label>
                      <span className="text-slate-400">0.0 (Precise) to 1.0 (Creative)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={creativity}
                      onChange={(e) => setCreativity(e.target.value)}
                      className="w-full accent-brand-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-semibold font-mono text-slate-900 border-b border-slate-100 pb-2">
                  Guardrails & Synthesis
                </h3>
                <label className="flex items-center space-x-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={brandVoiceStrictness}
                    onChange={(e) => setBrandVoiceStrictness(e.target.checked)}
                    className="w-4 h-4 accent-brand-500 rounded border-surface-border cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-xs sm:text-[13px] font-mono font-medium text-slate-800 block">Strict Brand Voice Enforcement</span>
                    <span className="text-[11px] font-mono text-slate-400 block">Reject responses that deviate from established tone & persona boundaries.</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={autoDrafts}
                    onChange={(e) => setAutoDrafts(e.target.checked)}
                    className="w-4 h-4 accent-brand-500 rounded border-surface-border cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-xs sm:text-[13px] font-mono font-medium text-slate-800 block">Auto-Save Generated Studio Prompts</span>
                    <span className="text-[11px] font-mono text-slate-400 block">Automatically sync prompt ideas directly into Ideas backlog.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-semibold font-mono text-slate-900 border-b border-slate-100 pb-2">
                  Alert Preferences
                </h3>
                <label className="flex items-center space-x-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={notifyOnFailure}
                    onChange={(e) => setNotifyOnFailure(e.target.checked)}
                    className="w-4 h-4 accent-brand-500 rounded border-surface-border cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-xs sm:text-[13px] font-mono font-medium text-slate-800 block">Failed Post Publishing Alerts</span>
                    <span className="text-[11px] font-mono text-slate-400 block">Receive instant push & email alerts when an automated dispatch fails.</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={notifyLowCredits}
                    onChange={(e) => setNotifyLowCredits(e.target.checked)}
                    className="w-4 h-4 accent-brand-500 rounded border-surface-border cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-xs sm:text-[13px] font-mono font-medium text-slate-800 block">Low Credits Warning (under 15%)</span>
                    <span className="text-[11px] font-mono text-slate-400 block">Receive notification when balance requires replenishment.</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="w-4 h-4 accent-brand-500 rounded border-surface-border cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-xs sm:text-[13px] font-mono font-medium text-slate-800 block">Weekly Performance Summary</span>
                    <span className="text-[11px] font-mono text-slate-400 block">Receive a Monday morning digest of conversions, impressions, and engagement.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === "api" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              <div className="bg-white border border-surface-border rounded-xl p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold font-mono text-slate-900 border-b border-slate-100 pb-2">
                  Workspace API Credentials
                </h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-700 flex items-center justify-between">
                    <span>Live Secret Key</span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Do not share in client apps
                    </span>
                  </label>
                  <div className="flex items-center rounded-md border border-surface-border overflow-hidden bg-slate-50">
                    <input
                      type={isKeyVisible ? "text" : "password"}
                      readOnly
                      value={apiKey}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-[13px] font-mono bg-transparent border-0 focus:outline-none text-slate-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => setIsKeyVisible(!isKeyVisible)}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 transition-colors"
                      title={isKeyVisible ? "Hide key" : "Show key"}
                    >
                      {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={copyApiKey}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border-l border-surface-border text-xs font-mono font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-mono font-medium text-slate-700">
                    Webhook Destination URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-[13px] font-mono bg-white border border-surface-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800"
                    placeholder="https://your-domain.com/webhooks"
                  />
                  <p className="text-[11px] font-mono text-slate-400">
                    Dispatched on post generation, publishing success, and automated DM triggers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs sm:text-[13px] font-mono font-semibold rounded-md shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default SettingsView;

