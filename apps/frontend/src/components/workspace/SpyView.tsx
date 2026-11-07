"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Flame, 
  Plus, 
  Search, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2, 
  ArrowRight, 
  Sparkles, 
  Wand2, 
  Loader2,
  ExternalLink,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CompetitorRecord } from "@/types";

interface SpyViewProps {
  onOpenComposer: (post?: any) => void;
}

export function SpyView({ onOpenComposer }: SpyViewProps) {
  const [competitors, setCompetitors] = useState<CompetitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlatformFilter, setActivePlatformFilter] = useState<"all" | "threads" | "tiktok">("all");
  const [newHandleInput, setNewHandleInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [remixingId, setRemixingId] = useState<string | null>(null);

  const fetchCompetitors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/spy");
      const data = await res.json();
      if (data.competitors) {
        setCompetitors(data.competitors);
      }
    } catch (err) {
      toast.error("Failed to load competitor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleAddCompetitor = async () => {
    if (!newHandleInput.trim()) {
      toast.error("Please enter a competitor handle");
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch("/api/spy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: newHandleInput,
          platform: newHandleInput.includes("tiktok") ? "tiktok" : "threads",
        }),
      });
      const data = await res.json();
      if (data.competitor) {
        setCompetitors([data.competitor, ...competitors]);
        setNewHandleInput("");
        toast.success(`Tracking ${data.competitor.handle} successfully!`);
      }
    } catch (err) {
      toast.error("Failed to add competitor");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemix = async (postContent: string, postId: string) => {
    setRemixingId(postId);
    try {
      const res = await fetch("/api/spy/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalContent: postContent }),
      });
      const data = await res.json();
      if (data.remixed) {
        toast.success("Hook remixed in your Brand Voice!");
        onOpenComposer({
          title: "Remixed Viral Hook",
          content: data.remixed,
          platforms: ["threads", "x", "linkedin"],
        });
      }
    } catch (err) {
      toast.error("Failed to remix post");
    } finally {
      setRemixingId(null);
    }
  };

  const filtered = competitors.filter(
    (c) => activePlatformFilter === "all" || c.platform === activePlatformFilter
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background px-4 lg:px-6 py-5 font-sans min-w-0 space-y-5">
      {/* 1. Competitor Spy Title Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-foreground">
            <Flame className="size-7 shrink-0 text-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Competitor Spy & Benchmarking
          </h1>
        </div>

        {/* Add Competitor Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newHandleInput}
            onChange={(e) => setNewHandleInput(e.target.value)}
            placeholder="Add handle (e.g. @alexrivers or @growth)"
            className="rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary shadow-2xs"
            onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
          />
          <button
            type="button"
            disabled={isAdding}
            onClick={handleAddCompetitor}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 shrink-0"
          >
            {isAdding ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            <span>Track</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {(["all", "threads", "tiktok"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActivePlatformFilter(tab)}
            className={cn(
              "capitalize px-3 py-1 text-xs font-semibold rounded-lg transition-all",
              activePlatformFilter === tab
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "all" ? "All Platforms" : tab}
          </button>
        ))}
      </div>

      {/* Competitor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2"></div>
              <div className="h-16 bg-muted/60 rounded"></div>
              <div className="h-8 bg-muted/40 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((comp) => (
            <div
              key={comp.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-muted flex items-center justify-center p-2 border border-border">
                    <Image
                      src={comp.platform === "tiktok" ? "/images/platforms/tiktok-light.svg" : "/images/platforms/threads.svg"}
                      alt={comp.platform}
                      width={20}
                      height={20}
                      className="dark:invert"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{comp.name}</h3>
                    <span className="text-xs font-mono text-muted-foreground">{comp.handle}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-foreground block">
                    {comp.followers ? `${(comp.followers / 1000).toFixed(1)}K` : "42.8K"}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {comp.growthRate || "+12.4%"}
                  </span>
                </div>
              </div>

              {/* Top Viral Posts */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Top Performing Posts
                </span>
                {comp.posts && comp.posts.length > 0 ? (
                  comp.posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-xl border border-border/80 bg-background/50 p-3 space-y-2 text-xs hover:border-primary/50 transition-colors"
                    >
                      <p className="font-medium text-foreground leading-relaxed line-clamp-3">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="size-3 text-rose-500" /> {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="size-3 text-blue-500" /> {post.replies}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={remixingId === post.id}
                          onClick={() => handleRemix(post.content, post.id)}
                          className="inline-flex items-center gap-1 font-bold text-primary hover:underline disabled:opacity-50"
                        >
                          {remixingId === post.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Wand2 className="size-3" />
                          )}
                          <span>Remix Hook</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No tracked posts yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
