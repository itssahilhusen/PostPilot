"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { TrendingUp, Users, Eye, BarChart2, ArrowUpRight, Award, Loader2 } from "lucide-react";

export function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((json) => {
        if (json.analytics) {
          setData(json.analytics);
        }
      })
      .catch((err) => console.error("Error loading analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Reach", value: data?.totalReach || "148.5K", change: data?.reachChange || "+34.2%", icon: Eye, color: "text-blue-500" },
    { label: "Engagement Rate", value: data?.engagementRate || "5.8%", change: data?.engagementChange || "+1.4%", icon: TrendingUp, color: "text-emerald-500" },
    { label: "Followers Gained", value: data?.followersGained || "+2,480", change: data?.followersChange || "+18.9%", icon: Users, color: "text-purple-500" },
    { label: "AI Content Saved", value: data?.hoursSaved || "38.5 hrs", change: "This month", icon: Award, color: "text-amber-500" },
  ];

  const platformPerformance = data?.platforms || [
    { platform: "X (Twitter)", reach: "68.4K", engagement: "4.9%", posts: 32, icon: "/images/platforms/x-light.svg", invert: true },
    { platform: "LinkedIn", reach: "52.1K", engagement: "6.8%", posts: 18, icon: "/images/platforms/linkedin.svg" },
    { platform: "Threads", reach: "19.2K", engagement: "5.2%", posts: 24, icon: "/images/platforms/threads.svg", invert: true },
    { platform: "Instagram", reach: "8.8K", engagement: "7.1%", posts: 12, icon: "/images/platforms/instagram.svg" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background px-4 lg:px-6 py-5 font-sans min-w-0 space-y-5">
      {/* 1. Analytics Title Row */}
      <div className="flex items-center gap-2.5 mb-4 shrink-0">
        <div className="flex items-center text-foreground">
          <BarChart2 className="size-7 shrink-0 text-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <s.icon className={`size-4 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{s.change} vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown by Platform */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground">Platform Performance Breakdown</h2>
        <div className="divide-y divide-border/60">
          {platformPerformance.map((p: any) => (
            <div key={p.platform} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center p-1.5 border border-border">
                  <Image src={p.icon} alt={p.platform} width={18} height={18} className={p.invert ? "dark:invert" : ""} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">{p.platform}</span>
                  <span className="text-[11px] text-muted-foreground">{p.posts} posts published</span>
                </div>
              </div>

              <div className="flex items-center gap-8 text-right">
                <div>
                  <span className="text-xs font-bold text-foreground block">{p.reach}</span>
                  <span className="text-[10px] text-muted-foreground">Impressions</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{p.engagement}</span>
                  <span className="text-[10px] text-muted-foreground">Eng. Rate</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
