"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Search, Filter, MoreHorizontal, CheckCircle2, Clock, FileText, ArrowUpRight, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostsViewProps {
  onOpenComposer: (post?: any) => void;
}

export function PostsView({ onOpenComposer }: PostsViewProps) {
  const [filterTab, setFilterTab] = useState<"all" | "published" | "scheduled" | "drafts">("all");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = posts.filter((p) => {
    const s = (p.status || "").toLowerCase();
    if (filterTab === "all") return true;
    if (filterTab === "drafts") return s === "draft" || s === "drafts";
    return s === filterTab;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background px-4 lg:px-6 py-5 font-sans min-w-0 space-y-5">
      {/* 1. Posts Title Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-foreground">
            <CheckSquare className="size-7 shrink-0 text-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Posts
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onOpenComposer()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>New Post</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {(["all", "published", "scheduled", "drafts"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterTab(tab)}
            className={cn(
              "capitalize px-3 py-1 text-xs font-semibold rounded-lg transition-all",
              filterTab === tab ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="p-3.5">Post Title</th>
              <th className="p-3.5">Platforms</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Impressions</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((post) => (
              <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-3.5">
                  <span className="font-semibold text-foreground block">{post.title}</span>
                  <span className="text-[11px] text-muted-foreground line-clamp-1">{post.snippet}</span>
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-1">
                    {(post.platforms || ["x", "linkedin"]).map((p: string) => (
                      <Image key={p} src={`/images/platforms/${p === "x" ? "x-light.svg" : p + ".svg"}`} alt={p} width={14} height={14} className={p === "x" ? "dark:invert" : ""} />
                    ))}
                  </div>
                </td>
                <td className="p-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      post.status === "PUBLISHED" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                      post.status === "SCHEDULED" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      post.status === "DRAFT" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="p-3.5 text-muted-foreground">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : (post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : "Drafted")}
                </td>
                <td className="p-3.5 font-semibold text-foreground">
                  {post.impressions ? `${(post.impressions / 1000).toFixed(1)}K` : "-"}
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenComposer({ id: post.id, title: post.title, content: post.content, platforms: post.platforms })}
                      className="font-semibold text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors text-[11px]"
                      title="Delete post"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
