"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  FolderOpen, 
  Upload, 
  Search, 
  Trash2, 
  Plus, 
  FileImage, 
  ExternalLink, 
  Check, 
  Copy,
  Layers,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MediaAssetRecord } from "@/types";

interface MediaLibraryViewProps {
  onOpenComposer: (post?: any) => void;
}

export function MediaLibraryView({ onOpenComposer }: MediaLibraryViewProps) {
  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.assets) {
        setAssets(data.assets);
      }
    } catch (err) {
      toast.error("Failed to load media assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async () => {
    if (!uploadName.trim() || !uploadUrl.trim()) {
      toast.error("Name and URL are required");
      return;
    }
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadName,
          url: uploadUrl,
          sizeBytes: 1024 * 45,
          mimeType: uploadUrl.endsWith(".mp4") ? "video/mp4" : "image/png",
        }),
      });
      const data = await res.json();
      if (data.asset) {
        setAssets([data.asset, ...assets]);
        setUploadName("");
        setUploadUrl("");
        setIsModalOpen(false);
        toast.success("Media asset saved successfully!");
      }
    } catch (err) {
      toast.error("Failed to add media asset");
    }
  };

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background px-4 lg:px-6 py-5 font-sans min-w-0 space-y-5">
      {/* 1. Media Library Title Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-foreground">
            <FolderOpen className="size-7 shrink-0 text-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Media Library
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
        >
          <Upload className="size-3.5" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by filename..."
            className="w-full rounded-xl border border-border bg-card pl-9 pr-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary shadow-2xs"
          />
        </div>

        <div className="text-xs text-muted-foreground font-semibold">
          <span>{assets.length} assets · 2.4 MB of 5 GB used</span>
        </div>
      </div>

      {/* Assets Grid */}
      {filtered.length === 0 ? (
        <div className="flex-1 rounded-2xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            <FolderOpen className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No media assets found</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Upload images, banners, or video files to attach directly to your social drafts.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/50 transition-all flex flex-col"
            >
              <div className="relative aspect-video bg-muted/40 flex items-center justify-center overflow-hidden border-b border-border/50">
                <Image
                  src={asset.url}
                  alt={asset.name}
                  width={200}
                  height={120}
                  className="object-contain w-full h-full p-2 group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <h4 className="text-xs font-semibold text-foreground truncate" title={asset.name}>
                    {asset.name}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {(asset.sizeBytes / 1024).toFixed(1)} KB · {asset.mimeType.split("/")[1]?.toUpperCase()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenComposer({
                      title: `Post with ${asset.name}`,
                      content: `Sharing visual breakdown from our latest sprint!\n\n#media #buildinpublic`,
                      mediaUrls: [asset.url],
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11px] font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                >
                  <span>Attach to Post</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-foreground">Upload Media Asset</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Asset Name</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. twitter-banner-q4.png"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Asset URL or File Path</label>
                <input
                  type="text"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="/apple-icon.png or https://..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAsset}
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
              >
                Save Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
