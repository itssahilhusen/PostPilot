"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/design-system/AppShell";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Heart,
  MessageCircle,
  Repeat2,
  Eye,
  MoreHorizontal,
  Play,
  Edit3,
  Share2,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
  Link2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const USER = {
  name: "Sahil Shaikh",
  plan: "Pro User",
  initials: "SS",
  email: "postpilot.contact@gmail.com",
  niche: "AI & SaaS",
  experienceLevel: "Advanced Creator",
  primaryPlatforms: "X, LinkedIn, Instagram",
  contentStyle: "Thread-first, Educational",
  aiModel: "Gemini 2.5 Flash",
  postingFrequency: "Daily",
  location: "Mumbai, India",
  website: "https://postpilot.app",
  badges: ["Early Adopter", "Top Creator"],
  tags: ["#AI", "#SaaS", "#Founders", "#BuildInPublic"],
  availableForCollabs: true,
};

const SOCIAL_PLATFORMS = [
  { id: "twitter", icon: Twitter, color: "#1D9BF0", connected: true, label: "X (Twitter)" },
  { id: "linkedin", icon: Linkedin, color: "#0A66C2", connected: true, label: "LinkedIn" },
  { id: "instagram", icon: Instagram, color: "#E1306C", connected: true, label: "Instagram" },
  { id: "youtube", icon: Youtube, color: "#FF0000", connected: false, label: "YouTube" },
];

const CAMPAIGNS = [
  {
    id: 1,
    thumb: "🤖",
    title: "AI Tools Deep Dive — Thread Series",
    subtitle: "X (Twitter) · Thread",
    scheduledAt: "Nov 12, 2026",
    impressions: "24.3K",
    status: "published",
  },
  {
    id: 2,
    thumb: "🚀",
    title: "PostPilot Product Hunt Launch Carousel",
    subtitle: "LinkedIn · Carousel",
    scheduledAt: "Nov 10, 2026",
    impressions: "18.7K",
    status: "published",
  },
  {
    id: 3,
    thumb: "📈",
    title: "Founder's Weekly — SaaS Growth Tips",
    subtitle: "Instagram · Reel Script",
    scheduledAt: "Nov 15, 2026",
    impressions: "—",
    status: "scheduled",
  },
  {
    id: 4,
    thumb: "⚡",
    title: "AI Workflow Automation — Behind the Scenes",
    subtitle: "X (Twitter) · Thread",
    scheduledAt: "Nov 16, 2026",
    impressions: "—",
    status: "draft",
  },
  {
    id: 5,
    thumb: "🎯",
    title: "5 AI Tools I Used to Build PostPilot",
    subtitle: "LinkedIn · Long-form",
    scheduledAt: "Nov 8, 2026",
    impressions: "31.2K",
    status: "published",
  },
];

const COLLECTION_ITEMS = [
  { id: 1, title: "AI Flywheel Thread", type: "Thread", platform: "twitter", color: "#1a1a2e", emoji: "🔄" },
  { id: 2, title: "SaaS Growth Hook", type: "Hook", platform: "linkedin", color: "#0d1b2a", emoji: "📊" },
  { id: 3, title: "Workflow Demo Video", type: "Video", platform: "youtube", color: "#1a0a0a", emoji: "🎥" },
  { id: 4, title: "Product Carousel", type: "Carousel", platform: "instagram", color: "#1a0d1a", emoji: "🎠" },
  { id: 5, title: "Founder Story Arc", type: "Thread", platform: "twitter", color: "#0a1a1a", emoji: "✍️" },
  { id: 6, title: "AI Tools Breakdown", type: "Long-form", platform: "linkedin", color: "#0d1a0d", emoji: "🤖" },
  { id: 7, title: "Build in Public Log", type: "Thread", platform: "twitter", color: "#1a1500", emoji: "🏗️" },
  { id: 8, title: "Cold Outreach Script", type: "DM Script", platform: "instagram", color: "#1a0a12", emoji: "💬" },
  { id: 9, title: "GTM Playbook Post", type: "Long-form", platform: "linkedin", color: "#0a0a1a", emoji: "📋" },
  { id: 10, title: "Viral Hook Library", type: "Hook Pack", platform: "twitter", color: "#1a1a0a", emoji: "🪝" },
];

function platformColor(p: string) {
  if (p === "twitter") return "#1D9BF0";
  if (p === "linkedin") return "#0A66C2";
  if (p === "instagram") return "#E1306C";
  if (p === "youtube") return "#FF0000";
  return "#737373";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Published
      </span>
    );
  if (status === "scheduled")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#C5F52A]/10 text-[#C5F52A] border border-[#C5F52A]/20">
        <Clock className="w-2.5 h-2.5" />
        Scheduled
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/[0.06] text-neutral-400 border border-white/10">
      <FileText className="w-2.5 h-2.5" />
      Draft
    </span>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [copyDone, setCopyDone] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText("https://postpilot.app/u/sahilshaikh");
    setCopyDone(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopyDone(false), 2000);
  };

  const panel: React.CSSProperties = {
    background: "rgba(14, 18, 19, 0.75)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
  };

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
  };

  return (
    <AppShell activeTab="feed">
      <main
        className="flex-1 flex flex-col h-full overflow-hidden text-neutral-200 select-none"
        style={panel}
      >
        {/* ── Page Header bar ─────────────────────────────────── */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-white/[0.07]">
          <h1 className="text-lg font-black text-white tracking-tight">Profile</h1>
          <p className="text-xs text-neutral-500 mt-0.5">View all your profile details here.</p>
        </div>

        {/* ── Scrollable body ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ══ SECTION 1: Profile Card + Bio & Other Details ══════ */}
          <div className="grid grid-cols-[260px_1fr] gap-4">

            {/* Left — Profile Card */}
            <div className="flex flex-col items-center pt-6 pb-5 px-5" style={card}>
              {/* Avatar ring */}
              <div
                className="relative w-28 h-28 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(197,245,42,0.15) 0%, rgba(197,245,42,0.05) 100%)",
                  border: "2px solid rgba(197,245,42,0.3)",
                  boxShadow: "0 0 32px rgba(197,245,42,0.1)",
                }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-black text-black"
                  style={{ background: "linear-gradient(135deg, #C5F52A 0%, #94e01a 100%)" }}
                >
                  {USER.initials}
                </div>
                {/* Online dot */}
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black" />
              </div>

              <h2 className="text-base font-bold text-white text-center leading-tight">{USER.name}</h2>

              {/* Plan badge */}
              <div className="mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#C5F52A]/10 border border-[#C5F52A]/25 text-[#C5F52A]">
                {USER.plan}
              </div>

              {/* Quick actions */}
              <div className="mt-5 w-full flex gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium bg-white/[0.06] border border-white/10 text-neutral-300 hover:bg-white/10 transition-colors"
                >
                  {copyDone ? <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F52A]" /> : <Link2 className="w-3.5 h-3.5" />}
                  Share
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold bg-[#C5F52A] text-black hover:bg-[#b1de22] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>

            {/* Right — Bio & other details */}
            <div className="p-5" style={card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Bio &amp; other details</h3>
                {/* Live dot */}
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px rgba(74,222,128,0.6)" }} />
              </div>

              {/* 2-column key-value grid */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                {[
                  { label: "My Niche", value: USER.niche },
                  { label: "My Experience Level", value: USER.experienceLevel },
                  { label: "Primary Platforms", value: USER.primaryPlatforms },
                  { label: "My Content Style", value: USER.contentStyle },
                  { label: "AI Model Preferred", value: USER.aiModel },
                  { label: "Posting Frequency", value: USER.postingFrequency },
                  { label: "My Location", value: USER.location },
                  {
                    label: "Available By",
                    value: null,
                    custom: (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" />
                        Open to Collaborations
                      </span>
                    ),
                  },
                  {
                    label: "Website",
                    value: null,
                    custom: (
                      <a
                        href={USER.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#C5F52A] text-[11px] font-medium hover:underline flex items-center gap-1"
                      >
                        {USER.website} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ),
                  },
                  {
                    label: "Tags",
                    value: null,
                    custom: (
                      <div className="flex flex-wrap gap-1.5">
                        {USER.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium text-neutral-300"
                            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ),
                  },
                  {
                    label: "Badges",
                    value: null,
                    custom: (
                      <div className="flex flex-wrap gap-1.5">
                        {USER.badges.map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              background: "rgba(197,245,42,0.1)",
                              border: "1px solid rgba(197,245,42,0.2)",
                              color: "#C5F52A",
                            }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    ),
                  },
                ].map(({ label, value, custom }, i) => (
                  <div key={i}>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-1">{label}</div>
                    {custom ?? <div className="text-[12px] font-semibold text-white">{value}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ SECTION 2: Social Media ════════════════════════════ */}
          <div className="p-5" style={card}>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-bold text-white">Social Media</h3>
            </div>

            <div className="flex items-center gap-3">
              {SOCIAL_PLATFORMS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    title={p.label}
                    className="relative group flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
                      style={{
                        background: p.connected ? `${p.color}20` : "rgba(255,255,255,0.04)",
                        border: `2px solid ${p.connected ? p.color + "50" : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: p.connected ? p.color : "#555" }} />
                    </div>
                    {/* Connected indicator */}
                    {p.connected && (
                      <div
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black"
                      />
                    )}
                    <span className="text-[10px] text-neutral-500">{p.connected ? "Connected" : "Connect"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ══ SECTION 3: My Productions (Campaigns) ══════════════ */}
          <div className="p-5" style={card}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">My Productions</h3>
              <button type="button" className="text-[11px] text-[#C5F52A] hover:underline">
                View all →
              </button>
            </div>

            {/* Table */}
            <div>
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_120px] gap-4 pb-2.5 border-b border-white/[0.07] mb-1">
                {["Title", "Timing", "No. of Views", "Actions"].map((h) => (
                  <div key={h} className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{h}</div>
                ))}
              </div>

              {/* Rows */}
              {CAMPAIGNS.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[2fr_1fr_1fr_120px] gap-4 items-center py-3 border-b border-white/[0.05] hover:bg-white/[0.02] rounded-xl px-2 -mx-2 transition-colors group"
                >
                  {/* Title cell */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {c.thumb}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{c.title}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{c.subtitle}</div>
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="text-xs text-neutral-400">{c.scheduledAt}</div>

                  {/* Views */}
                  <div className="text-xs font-semibold text-white">{c.impressions}</div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ SECTION 4: My Collection ════════════════════════════ */}
          <div className="p-5" style={card}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">My Collection</h3>
              <button type="button" className="text-[11px] text-[#C5F52A] hover:underline">
                View all →
              </button>
            </div>

            {/* Grid — 5 columns, 2 rows */}
            <div className="grid grid-cols-5 gap-3">
              {COLLECTION_ITEMS.map((item) => {
                const pColor = platformColor(item.platform);
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer"
                    style={{ aspectRatio: "4/3" }}
                  >
                    {/* Background */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(ellipse at 30% 30%, ${pColor}25 0%, ${item.color} 70%)`,
                      }}
                    />

                    {/* Emoji art */}
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
                      {item.emoji}
                    </div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-end justify-start p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "#C5F52A" }}
                      >
                        <Play className="w-3.5 h-3.5 text-black fill-black ml-0.5" />
                      </div>
                    </div>

                    {/* Platform color bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: pColor, opacity: 0.6 }}
                    />

                    {/* Type badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                        style={{ background: `${pColor}25`, color: pColor, border: `1px solid ${pColor}40` }}
                      >
                        {item.type}
                      </span>
                    </div>

                    {/* Info below (outside the aspect-ratio box) */}
                  </div>
                );
              })}
            </div>

            {/* Titles below cards */}
            <div className="grid grid-cols-5 gap-3 mt-2">
              {COLLECTION_ITEMS.map((item) => (
                <div key={item.id} className="px-0.5">
                  <div className="text-[11px] font-semibold text-white truncate">{item.title}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 capitalize">{item.platform}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </AppShell>
  );
}
