"use client";

import React, { useState } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Sparkles,
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { IdeaItem } from "./IdeaItemCard";
import {
  FeedSourceIcon,
  getFeedSourceLabel,
  getFeedSourceKind,
  PlatformBadge,
} from "./PlatformIconMap";

interface IdeaItemsTableProps {
  items: IdeaItem[];
  isLoading?: boolean;
  onCreateContent: (item: IdeaItem) => void;
  onViewDetail?: (item: IdeaItem) => void;
  onToggleBookmark?: (item: IdeaItem) => void;
}

export function IdeaItemsTable({
  items,
  isLoading = false,
  onCreateContent,
  onViewDetail,
  onToggleBookmark,
}: IdeaItemsTableProps) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [pageSize, setPageSize] = useState(15);
  const [pageIndex, setPageIndex] = useState(0);

  // Sorting
  const sortedItems = [...items].sort((a, b) => {
    const timeA = new Date(a.published_at).getTime();
    const timeB = new Date(b.published_at).getTime();
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
  });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const paginatedItems = sortedItems.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="space-y-4 select-none font-sans">
      {/* Table Card Container */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed text-left text-xs">
            <thead className="bg-[var(--hover)]/60 border-b border-[var(--line)] text-[var(--muted)] font-mono text-[10.5px] uppercase tracking-wider sticky top-0">
              <tr>
                <th className="w-10 text-center py-3 px-2"></th>
                <th className="w-28 py-3 px-3">
                  <button
                    type="button"
                    onClick={toggleSort}
                    className="flex items-center gap-1.5 hover:text-[var(--fg)] transition-colors cursor-pointer"
                  >
                    <span>Date</span>
                    {sortOrder === "asc" ? (
                      <ArrowUp className="size-3 text-[#4f7a00] dark:text-[#c6f432]" />
                    ) : (
                      <ArrowDown className="size-3 text-[#4f7a00] dark:text-[#c6f432]" />
                    )}
                  </button>
                </th>
                <th className="w-48 py-3 px-3">Channel / Source</th>
                <th className="py-3 px-4">Article Headline</th>
                <th className="w-1/3 hidden md:table-cell py-3 px-4">Summary</th>
                <th className="w-36 text-right py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--line)]/60">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-4 bg-[var(--hover)] rounded-md w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[var(--muted)] space-y-2">
                    <div className="text-sm font-bold text-[var(--fg)]">No stories match your filter</div>
                    <div className="text-xs">Try selecting a different channel or search keyword.</div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const channelLabel = getFeedSourceLabel({ url: item.url, title: item.source_title });
                  const platformKind = getFeedSourceKind({ url: item.url });
                  let formattedDate = "";
                  try {
                    formattedDate = format(new Date(item.published_at), "MMM d, yyyy");
                  } catch {
                    formattedDate = item.published_at;
                  }

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onViewDetail && onViewDetail(item)}
                      className="hover:bg-[var(--hover)]/50 cursor-pointer transition-colors group"
                    >
                      {/* Bookmark / Star */}
                      <td
                        className="text-center py-3 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleBookmark) onToggleBookmark(item);
                        }}
                      >
                        <button
                          type="button"
                          className="size-7 rounded-lg inline-flex items-center justify-center hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[#c6f432] transition-colors"
                          title={item.isBookmarked ? "Saved" : "Save idea"}
                        >
                          <Bookmark className={cn("size-3.5", item.isBookmarked && "fill-[#c6f432] text-[#c6f432]")} />
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 font-mono text-[11px] text-[var(--muted)]">
                        {formattedDate}
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {item.source_favicon_url ? (
                            <img
                              src={item.source_favicon_url}
                              alt=""
                              className="size-4 shrink-0 rounded-xs object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <FeedSourceIcon source={{ url: item.url }} className="size-4 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-[var(--fg)] truncate block">
                              {channelLabel}
                            </span>
                            <span className="text-[10px] text-[var(--muted)] capitalize">
                              {platformKind}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Title with small thumbnail if available */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.thumbnail_url && (
                            <div className="size-9 rounded-lg overflow-hidden shrink-0 bg-[var(--hover)] border border-[var(--line)] hidden sm:block">
                              <img
                                src={item.thumbnail_url}
                                alt=""
                                className="size-full object-cover group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-[var(--fg)] group-hover:text-[#4f7a00] dark:group-hover:text-[#c6f432] transition-colors line-clamp-1 block">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Content summary */}
                      <td className="py-3 px-4 hidden md:table-cell text-[var(--muted)] text-xs line-clamp-1">
                        {item.excerpt || item.content || "—"}
                      </td>

                      {/* Actions */}
                      <td
                        className="text-right py-3 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewDetail && onViewDetail(item)}
                            className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--fg)] transition-colors"
                            title="Read story"
                          >
                            <BookOpen className="size-3.5" />
                          </button>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                            title="Open original website"
                          >
                            <ArrowUpRight className="size-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => onCreateContent(item)}
                            className="px-2.5 py-1 rounded-lg bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black text-xs inline-flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                            title="Turn into post draft"
                          >
                            <Sparkles className="size-3 fill-[#141414]" />
                            <span>Draft</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="p-3 border-t border-[var(--line)] bg-[var(--bg)]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <span>Showing</span>
            <span className="font-mono font-bold text-[var(--fg)]">
              {paginatedItems.length > 0 ? pageIndex * pageSize + 1 : 0}–
              {Math.min((pageIndex + 1) * pageSize, sortedItems.length)}
            </span>
            <span>of</span>
            <span className="font-mono font-bold text-[var(--fg)]">{sortedItems.length}</span>
            <span>stories</span>

            <span className="mx-2 w-px h-3.5 bg-[var(--line)] hidden sm:inline" />

            <div className="hidden sm:flex items-center gap-1.5">
              <span>Rows:</span>
              {[10, 15, 25, 50].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setPageIndex(0);
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-all",
                    pageSize === size
                      ? "bg-[var(--fg)] text-[var(--bg)]"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-[var(--muted)] mr-2">
              Page {pageIndex + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={pageIndex <= 0}
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] disabled:opacity-40 text-[var(--fg)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              disabled={pageIndex >= totalPages - 1}
              onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
              className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] disabled:opacity-40 text-[var(--fg)] transition-colors cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
