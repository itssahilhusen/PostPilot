"use client";

import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface OpmlEntry {
  url: string;
  title: string | null;
}

export interface OpmlImportResult {
  total: number;
  completed: number;
  buckets: {
    success: number;
    duplicate: number;
    unsupported: number;
    temporary: number;
    error: number;
  };
}

interface OpmlUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  entries: OpmlEntry[];
  onStartImport: (selected: OpmlEntry[]) => Promise<void>;
  progress: OpmlImportResult | null;
  isImporting: boolean;
  onCancel: () => void;
  maxLimit?: number | null;
}

export function parseOpmlXml(text: string): OpmlEntry[] {
  const results: OpmlEntry[] = [];
  const seen = new Set<string>();

  const getAttr = (tag: string, attr: string): string | null => {
    const doubleMatch = tag.match(new RegExp(`\\b${attr}\\s*=\\s*"([^"]*)"`, "i"));
    const singleMatch = doubleMatch ? null : tag.match(new RegExp(`\\b${attr}\\s*=\\s*'([^']*)'`, "i"));
    const raw = doubleMatch?.[1] ?? singleMatch?.[1];
    if (!raw) return null;
    return raw
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
      .replace(/&amp;/g, "&");
  };

  const regex = /<outline\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const tag = m[0];
    const xmlUrl = (getAttr(tag, "xmlUrl") || getAttr(tag, "url"))?.trim();
    if (!xmlUrl || seen.has(xmlUrl)) continue;
    seen.add(xmlUrl);
    const title = (getAttr(tag, "title") || getAttr(tag, "text") || "")?.trim() || null;
    results.push({ url: xmlUrl, title });
  }

  return results;
}

export function OpmlUploader({
  isOpen,
  onClose,
  entries,
  onStartImport,
  progress,
  isImporting,
  onCancel,
  maxLimit = 200,
}: OpmlUploaderProps) {
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set(entries.map((e) => e.url)));

  React.useEffect(() => {
    setSelectedUrls(new Set(entries.map((e) => e.url)));
  }, [entries]);

  if (!isOpen) return null;

  const step: "preview" | "progress" | "result" = isImporting
    ? "progress"
    : progress
    ? "result"
    : "preview";

  const allSelected = entries.length > 0 && selectedUrls.size === entries.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(entries.map((e) => e.url)));
    }
  };

  const toggleUrl = (url: string) => {
    const next = new Set(selectedUrls);
    if (next.has(url)) {
      next.delete(url);
    } else {
      next.add(url);
    }
    setSelectedUrls(next);
  };

  const handleImport = () => {
    const selected = entries.filter((e) => selectedUrls.has(e.url));
    if (selected.length === 0) return;
    onStartImport(selected);
  };

  const percent = progress && progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--bg)]/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-[#c6f432] to-[#d6ff52] text-[#141414] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="size-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-[var(--fg)]">
                Import from OPML
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {step === "preview" && `${entries.length} feeds found in this OPML file.`}
                {step === "progress" && `Registering feeds (${progress?.completed || 0} / ${progress?.total || entries.length})...`}
                {step === "result" && "Import finished!"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {step === "preview" && (
            <>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="font-bold text-[var(--fg)] hover:underline cursor-pointer"
                >
                  {allSelected ? "Deselect All" : "Select All Feeds"}
                </button>
                <span className="text-[var(--muted)] font-mono">
                  {selectedUrls.size} of {entries.length} selected
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 border border-[var(--line)] rounded-xl p-2 bg-[var(--bg)]">
                {entries.map((entry) => {
                  const isChecked = selectedUrls.has(entry.url);
                  return (
                    <div
                      key={entry.url}
                      onClick={() => toggleUrl(entry.url)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--hover)] cursor-pointer text-xs transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-[var(--line)] text-[#c6f432] focus:ring-0 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[var(--fg)] truncate block">
                          {entry.title || entry.url}
                        </span>
                        <span className="text-[10px] text-[var(--muted)] font-mono truncate block">
                          {entry.url}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === "progress" && (
            <div className="py-8 space-y-4 text-center">
              <Loader2 className="size-10 text-[#4f7a00] dark:text-[#c6f432] animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-[var(--fg)]">
                  Importing your feed subscriptions...
                </p>
                <p className="text-xs text-[var(--muted)] font-mono">
                  {progress?.completed || 0} of {progress?.total || entries.length} processed ({percent}%)
                </p>
              </div>

              <div className="w-full bg-[var(--hover)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#c6f432] h-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {step === "result" && progress && (
            <div className="py-6 space-y-4 text-center">
              <div className="size-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-[var(--fg)]">
                  Import Complete
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Successfully connected new sources to your workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-2">
                <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                  <div className="text-[var(--muted)] text-[10px]">Success</div>
                  <div className="font-bold text-base text-emerald-500">{progress.buckets.success}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                  <div className="text-[var(--muted)] text-[10px]">Duplicates</div>
                  <div className="font-bold text-base text-amber-500">{progress.buckets.duplicate}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                  <div className="text-[var(--muted)] text-[10px]">Errors</div>
                  <div className="font-bold text-base text-[var(--muted)]">{progress.buckets.error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[var(--line)] bg-[var(--bg)]/50 flex items-center justify-between">
          {step === "preview" && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--fg)] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={selectedUrls.size === 0}
                className="px-4 py-1.5 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black text-xs inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-40"
              >
                <span>Import {selectedUrls.size} Sources</span>
              </button>
            </>
          )}

          {step === "progress" && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-red-500 text-xs font-semibold ml-auto transition-colors cursor-pointer"
            >
              Cancel Import
            </button>
          )}

          {step === "result" && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] font-black text-xs ml-auto shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
