"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  Play,
  Pause,
  Upload,
  Video,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Plus,
  Check,
  CheckCircle2,
  Sliders,
  Palette,
  Type,
  Gauge,
  Subtitles,
  Share2,
  Download,
  Trash2,
  RefreshCw,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  FileVideo,
  Info,
  Send,
  X,
  Search,
  Shuffle,
  Eye,
  Film,
  SlidersHorizontal,
  Wand2,
  FileText,
  SlidersVertical,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  VIDEO_TEMPLATES,
  COLOR_PRESETS,
  FONT_PRESETS,
  SPOKEN_LANGUAGES,
  OUTPUT_FORMATS,
  PLATFORMS_LIST,
  DEFAULT_BRAND_KIT,
  VideoTemplate,
  BrandKitSettings,
} from "@/data/videoTemplates";
import { getStyleVisualConfig } from "@/lib/auteur-ass-composer";
import { VideoCanvasPreview } from "./VideoCanvasPreview";
import { MakerzzProjectReviewView } from "./MakerzzProjectReviewView";

interface VideosViewProps {
  onOpenComposer?: (data?: any) => void;
}

export function VideosView({ onOpenComposer }: VideosViewProps) {
  // Main Studio Tab: "studio" (Create / Edit) vs "projects" (Rendered Video Library)
  const [viewTab, setViewTab] = useState<"studio" | "projects">("studio");

  // Flow mode: "edit" (Edit my video) vs "post" (Direct post)
  const [flowMode, setFlowMode] = useState<"edit" | "post">("edit");

  // Left Styles Panel Filters & Search
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Input Source: "take" (Video Take / Clips Upload) vs "faceless" (Topic & Script AI)
  const [sourceType, setSourceType] = useState<"take" | "faceless">("take");
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; size: string; path: string; duration: number }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [facelessTopic, setFacelessTopic] = useState("");

  // Selected Style IDs (up to 6 parallel variations, with primary as first)
  const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>([
    "cap-paper",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Aspect Ratio Switcher (matching Carousel: 9:16 portrait, 1:1 square, 16:9 landscape)
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");

  // Preview Mode: "composite" (Styled canvas overlay) vs "raw" (Original video)
  const [previewDisplayMode, setPreviewDisplayMode] = useState<"composite" | "raw">("composite");

  // Options & Settings Accordion
  const [isAudioOptionsOpen, setIsAudioOptionsOpen] = useState(true);
  const [lookPreset, setLookPreset] = useState("clean");
  const [lookStrength, setLookStrength] = useState(0.8);
  const [avatarCutout, setAvatarCutout] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.35);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [spokenLanguage, setSpokenLanguage] = useState("auto");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "tiktok",
    "youtube",
  ]);
  const [commentToDmEnabled, setCommentToDmEnabled] = useState(false);
  const [commentKeyword, setCommentKeyword] = useState("GUIDE");
  const [dmOffer, setDmOffer] = useState("my free prompt pack");

  // Brand Kit & Palette state
  const [brandKit, setBrandKit] = useState<BrandKitSettings>(DEFAULT_BRAND_KIT);
  const [selectedColorPreset, setSelectedColorPreset] = useState<string>("house");
  const [selectedFontPreset, setSelectedFontPreset] = useState<string>("house");

  // Projects queue
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [activePreviewProject, setActivePreviewProject] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrandKit();
    fetchProjects();
  }, []);

  // Poll in-progress video rendering jobs
  useEffect(() => {
    const hasActive = projects.some(
      (p) => p.status !== "READY" && p.status !== "FAILED"
    );
    if (!hasActive) return;

    const interval = setInterval(() => {
      fetchProjects(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [projects]);

  const fetchBrandKit = async () => {
    try {
      const res = await fetch("/api/studio/me/brandkit");
      const data = await res.json();
      if (data.brandKit) {
        setBrandKit(data.brandKit);
      }
    } catch (e) {
      console.warn("Could not load brand kit", e);
    }
  };

  const fetchProjects = async (showLoading = true) => {
    if (showLoading) setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/studio/projects");
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
        setActivePreviewProject((prev: any) => {
          if (!prev) return null;
          const updated = data.projects.find((p: any) => p.id === prev.id);
          return updated || prev;
        });
      }
    } catch (e) {
      console.warn("Could not load projects", e);
    } finally {
      if (showLoading) setIsLoadingProjects(false);
    }
  };

  const handleDeleteProject = async (project: any) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/studio/projects/${encodeURIComponent(project.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete video");
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setActivePreviewProject((current: any) => (current?.id === project.id ? null : current));
      toast.success("Video deleted");
    } catch (error: any) {
      toast.error(error.message || "Could not delete video");
    }
  };

  // Synchronize brand kit colors with selected style visual identity
  const syncStyleTheme = (styleId: string) => {
    try {
      const cfg = getStyleVisualConfig(styleId);
      setBrandKit((prev) => ({
        ...prev,
        bg: "#" + cfg.canvasBgHex.replace(/^0x/i, ""),
        ink: cfg.isDarkCanvas ? "#FFFFFF" : "#111111",
        accent: cfg.highlightHex,
        accentHi: cfg.highlightHex,
        panel: cfg.isDarkCanvas ? "#18181B" : "#FFFFFF",
        panel2: cfg.isDarkCanvas ? "#27272A" : "#F4F1EA",
        line: cfg.isDarkCanvas ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
      }));
    } catch {
      // Fallback manual sync
      if (styleId === "cap-paper" || styleId.includes("paper")) {
        setBrandKit((prev) => ({
          ...prev,
          bg: "#F4F1EA",
          ink: "#111111",
          accent: "#F59E0B",
          accentHi: "#FBBF24",
          panel: "#FFFFFF",
          panel2: "#E5E1D8",
          line: "rgba(0,0,0,0.08)",
        }));
      } else if (styleId === "limeslides" || styleId === "cap-slides" || styleId.includes("lime")) {
        setBrandKit((prev) => ({
          ...prev,
          bg: "#C6FF3D",
          ink: "#000000",
          accent: "#000000",
          accentHi: "#1A1A1A",
          panel: "#121214",
        }));
      } else if (styleId === "classified-yt" || styleId.includes("classified")) {
        setBrandKit((prev) => ({
          ...prev,
          bg: "#0B0B0C",
          ink: "#FFFFFF",
          accent: "#AE0006",
          accentHi: "#FF3B4E",
          panel: "#19191B",
        }));
      }
    }
  };

  const toggleStyleSelection = (styleId: string, multiSelect = false) => {
    syncStyleTheme(styleId);

    const template = VIDEO_TEMPLATES.find((t) => t.id === styleId);
    toast.success(`Applied style: ${template?.name || styleId}`);

    if (!multiSelect) {
      setSelectedStyleIds([styleId]);
      return;
    }

    setSelectedStyleIds((prev) => {
      if (prev.includes(styleId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== styleId);
      }
      if (prev.length >= 6) {
        toast.warning("Maximum 6 styles can be selected at once for parallel rendering");
        return prev;
      }
      return [...prev, styleId];
    });
  };

  // Randomize / Shuffle Video Style
  const handleShuffleStyle = () => {
    const randomIndex = Math.floor(Math.random() * VIDEO_TEMPLATES.length);
    const randomTemplate = VIDEO_TEMPLATES[randomIndex];
    if (randomTemplate) {
      setSelectedStyleIds([randomTemplate.id]);
      syncStyleTheme(randomTemplate.id);
      toast.success(`Randomized style: ${randomTemplate.name}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    // In-browser probe to detect video metadata
    let duration = 38.0;
    try {
      const probeVideo = document.createElement("video");
      probeVideo.preload = "metadata";
      probeVideo.src = objectUrl;
      await new Promise<void>((resolve) => {
        probeVideo.onloadedmetadata = () => {
          duration = Math.round((probeVideo.duration || 38.0) * 10) / 10;
          resolve();
        };
        probeVideo.onerror = () => resolve();
        setTimeout(resolve, 2000);
      });
    } catch {
      // fallback
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/studio/uploads", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const serverPath = data.upload?.path || `/uploads/videos/${file.name}`;

      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: sizeMb,
          path: serverPath,
          duration,
        },
      ]);
      toast.success(`Uploaded "${file.name}" (${duration}s)`);
    } catch {
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: sizeMb,
          path: objectUrl,
          duration,
        },
      ]);
      toast.success(`Loaded "${file.name}" (${duration}s)`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateVideo = async () => {
    if (sourceType === "take" && uploadedFiles.length === 0) {
      toast.error("Please upload your video take first");
      return;
    }
    if (sourceType === "faceless" && !facelessTopic.trim()) {
      toast.error("Please write a topic or script for your faceless video");
      return;
    }
    if (selectedStyleIds.length === 0) {
      toast.error("Please select at least one video style");
      return;
    }

    setIsSubmitting(true);
    try {
      const requests = selectedStyleIds.map((styleId) => {
        const payload = {
          mode: sourceType === "faceless" ? "faceless" : "edit",
          styleIds: [styleId],
          platforms: selectedPlatforms,
          automation: commentToDmEnabled
            ? {
                keyword: commentKeyword.trim().toUpperCase(),
                offer: dmOffer.trim(),
              }
            : undefined,
          options: {
            avatarCutout,
            look: lookPreset,
            lookStrength,
          },
          settings: {
            ...brandKit,
            music: { on: musicEnabled, volume: musicVolume },
            sfx: { on: sfxEnabled, volume: sfxVolume },
          },
          brief: {
            outputFormat: aspectRatio,
            topic: sourceType === "faceless" ? facelessTopic : undefined,
          },
          source: {
            kind: sourceType === "faceless" ? "faceless" : "upload",
            uploadPaths: uploadedFiles.map((f) => f.path),
            durationSec: uploadedFiles[0]?.duration || 45,
            topic: facelessTopic,
            language: spokenLanguage,
          },
        };

        return fetch("/api/studio/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => r.json());
      });

      const results = await Promise.all(requests);
      const firstCreated = results.find((r) => r?.project)?.project;

      toast.success("Videos are editing in parallel!", {
        description: `${selectedStyleIds.length} variation(s) are rendering now.`,
      });

      await fetchProjects();
      if (firstCreated) {
        setActivePreviewProject(firstCreated);
      }
      setViewTab("projects");
    } catch (err: any) {
      toast.error("Could not start video edit", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter video styles across all 56 templates matching Image Section categories
  const filteredTemplates = useMemo(() => {
    return VIDEO_TEMPLATES.filter((tpl) => {
      if (selectedTag !== "all") {
        const t = selectedTag.toLowerCase();
        if (t === "photo" && (tpl.group === "face" || tpl.input === "face" || tpl.input === "talking-head")) return true;
        if (t === "bold" && (tpl.pickerTags?.includes("bold") || tpl.tags.some((tag) => tag.includes("bold") || tag.includes("impact")))) return true;
        if (t === "editorial" && (tpl.tags.some((tag) => tag.includes("editorial") || tag.includes("serif") || tag.includes("magazine")))) return true;
        if (t === "flat" && (tpl.tags.some((tag) => tag.includes("flat") || tag.includes("clean") || tag.includes("minimal") || tag.includes("simple")) || tpl.pickerTags?.includes("minimal"))) return true;
        if (t === "clean" && (tpl.pickerTags?.includes("minimal") || tpl.pickerTags?.includes("polished") || tpl.tags.some((tag) => tag.includes("clean")))) return true;
        if (tpl.pickerTags?.some((pt) => pt.toLowerCase() === t)) return true;
        if (tpl.tags.some((tag) => tag.toLowerCase().includes(t))) return true;
        return false;
      }
      return true;
    });
  }, [selectedTag]);

  // Primary active style object and visual theme
  const primaryStyleId = selectedStyleIds[0] || "cap-paper";
  const primaryTemplate = useMemo(() => {
    return VIDEO_TEMPLATES.find((t) => t.id === primaryStyleId) || VIDEO_TEMPLATES[0];
  }, [primaryStyleId]);

  const activeVisualConfig = useMemo(() => {
    try {
      return getStyleVisualConfig(primaryStyleId);
    } catch {
      return null;
    }
  }, [primaryStyleId]);

  const estimatedCredits = Math.max(100, selectedStyleIds.length * 60);

  return (
    <div className="flex-1 flex min-w-0 h-full overflow-hidden bg-[var(--bg)] text-[var(--fg)] relative select-none font-sans">
      {/* =========================================================================
          LEFT PANEL: VIDEO STYLES (ALL 56 STYLES - EXACT CAROUSEL STYLE PANE DESIGN)
         ========================================================================= */}
      <div
        id="video-styles-panel"
        className="w-[340px] sm:w-[360px] lg:w-[380px] shrink-0 bg-[var(--panel)] border-r border-[var(--line)] flex flex-col h-full z-10 select-none overflow-hidden"
      >
        {/* Panel Header - Exact Match to Image Section */}
        <div className="p-4 border-b border-[var(--line)] space-y-4 shrink-0">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold tracking-tight text-[var(--fg)]">
                Video
              </h2>
              <span className="text-[10px] font-mono font-bold text-[var(--muted)]">
                56 styles
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              56 styles plus your own. One tap applies to every video.
            </p>
          </div>

          {/* Lime Promo Banner: Make a template from a video */}
          <div
            id="btn-ref-video-template"
            onClick={() => {
              setSourceType("take");
              fileInputRef.current?.click();
            }}
            className="p-3 rounded-xl bg-gradient-to-r from-[#c6f432] to-[#d6ff52] text-[#141414] shadow-xs cursor-pointer hover:brightness-95 transition-all"
          >
            <div className="text-xs font-black flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Make a template from a video</span>
            </div>
            <p className="text-[11px] opacity-80 mt-1 leading-tight">
              Upload a video you like — get a template in the same style
            </p>
          </div>

          {/* Actions row: New template, Remix current, Import */}
          <div id="video-tpl-designer-bar" className="grid grid-cols-3 gap-1.5">
            <button
              id="btn-new-video-template"
              type="button"
              onClick={() => {
                setSourceType("take");
                fileInputRef.current?.click();
              }}
              className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate text-center cursor-pointer"
            >
              + New
            </button>
            <button
              id="btn-remix-video-template"
              type="button"
              onClick={handleShuffleStyle}
              className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate text-center cursor-pointer"
            >
              Remix
            </button>
            <button
              id="btn-import-video-template"
              type="button"
              onClick={() => {
                setSourceType("take");
                fileInputRef.current?.click();
              }}
              className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate text-center cursor-pointer"
            >
              Import
            </button>
          </div>

          {/* Filter Chips - Exact Match to Image Section */}
          <div id="video-tpl-filters" className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {["all", "photo", "bold", "editorial", "flat", "clean"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedTag(filter)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                  selectedTag === filter
                    ? "bg-[var(--fg)] text-[var(--bg)]"
                    : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable 2-Column Styles Grid (#template-gallery match) */}
        <div className="flex-1 overflow-y-auto p-3 sidebar-scrollbar">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--muted)] space-y-2">
              <Film className="w-8 h-8 opacity-40 mx-auto" />
              <p>No video styles found for &ldquo;{selectedTag}&rdquo;</p>
              <button
                type="button"
                onClick={() => setSelectedTag("all")}
                className="text-[#c6f432] font-semibold hover:underline cursor-pointer"
              >
                Show all styles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 pb-6">
              {filteredTemplates.map((template) => {
                const isSelected = selectedStyleIds.includes(template.id);
                const isPrimary = selectedStyleIds[0] === template.id;
                const isHovered = playingVideoId === template.id;

                return (
                  <div
                    key={template.id}
                    onClick={() => toggleStyleSelection(template.id)}
                    onMouseEnter={() => setPlayingVideoId(template.id)}
                    onMouseLeave={() => setPlayingVideoId(null)}
                    className={cn(
                      "group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-150 flex flex-col justify-between bg-[var(--panel)] select-none",
                      isSelected
                        ? "border-[#c6f432] ring-2 ring-[#c6f432]/40 shadow-md bg-[var(--hover)]/40"
                        : "border-[var(--line)] hover:border-[var(--muted)] hover:shadow-xs"
                    )}
                  >
                    {/* Aspect 9:16 Thumbnail / Video Preview */}
                    <div className="relative aspect-[9/16] bg-black overflow-hidden pointer-events-none">
                      {isHovered && template.preview ? (
                        <video
                          src={template.preview}
                          autoPlay
                          loop
                          muted={isMuted}
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={template.poster}
                          alt={template.name}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}

                      {/* Top-Left Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 z-10 pointer-events-none">
                        <span className="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-mono font-bold text-white leading-none">
                          {template.aspect}
                        </span>
                        {template.pickerTags?.[0] && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#c6f432] text-black text-[9px] font-mono font-black uppercase leading-none shadow-xs">
                            {template.pickerTags[0]}
                          </span>
                        )}
                      </div>

                      {/* Top-Right Selection Indicator Checkmark */}
                      <div className="absolute top-2 right-2 z-10 pointer-events-none">
                        <div
                          className={cn(
                            "size-5.5 rounded-full flex items-center justify-center transition-all shadow-xs",
                            isSelected
                              ? "bg-[#c6f432] text-black ring-2 ring-black/40 scale-105 font-black"
                              : "bg-black/50 border border-white/50 text-transparent backdrop-blur-xs"
                          )}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      {/* Bottom-Right Audio Sound Toggle when hovering */}
                      {isHovered && (
                        <div className="absolute bottom-2 right-2 z-20 pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsMuted(!isMuted);
                            }}
                            className="p-1 rounded-md bg-black/80 text-white hover:bg-black transition-colors"
                            title={isMuted ? "Unmute preview audio" : "Mute audio"}
                          >
                            {isMuted ? (
                              <VolumeX className="w-3 h-3" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata Bar below card - Only video style name */}
                    <div className="px-2.5 py-2 bg-[var(--panel)] border-t border-[var(--line)]">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-[var(--fg)] truncate">
                          {template.name}
                        </h4>
                        {isPrimary && (
                          <span className="text-[8px] font-mono font-black uppercase text-[#c6f432] bg-[#c6f432]/10 px-1 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MAIN MIDDLE SECTION: VIDEO CANVAS & UPLOAD STUDIO (CAROUSEL MIDDLE DESIGN)
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-[var(--bg)]">
        {/* Top Navigation Toolbar */}
        <div className="h-12 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--line)] bg-[var(--panel)]/70 backdrop-blur z-20 select-none">
          {/* Left: Studio vs My Videos + Source Switcher */}
          <div className="flex items-center gap-3">
            {/* View Tab Buttons */}
            <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--bg)] p-0.5 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setViewTab("studio")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                  viewTab === "studio"
                    ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c6f432]" />
                <span>Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab("projects")}
                className={cn(
                  "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                  viewTab === "projects"
                    ? "bg-[var(--fg)] text-[var(--bg)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                <FileVideo className="w-3.5 h-3.5" />
                <span>My Videos</span>
                {projects.length > 0 && (
                  <span className="size-4.5 rounded-full bg-[#c6f432] text-black text-[10px] font-mono font-black flex items-center justify-center">
                    {projects.length}
                  </span>
                )}
              </button>
            </div>

            <div className="h-4 w-px bg-[var(--line)] hidden sm:block" />

            {/* Input Mode: Take vs Faceless (Only in Studio view) */}
            {viewTab === "studio" && (
              <div className="hidden sm:flex items-center rounded-lg border border-[var(--line)] bg-[var(--bg)] p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSourceType("take")}
                  className={cn(
                    "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                    sourceType === "take"
                      ? "bg-[var(--hover)] text-[var(--fg)] font-bold shadow-2xs"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  )}
                >
                  <Video className="w-3.5 h-3.5 text-[#c6f432]" />
                  <span>Take or clips</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType("faceless")}
                  className={cn(
                    "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
                    sourceType === "faceless"
                      ? "bg-[var(--hover)] text-[var(--fg)] font-bold shadow-2xs"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  )}
                >
                  <FileText className="w-3.5 h-3.5 text-[#c6f432]" />
                  <span>Faceless AI</span>
                </button>
              </div>
            )}

            {/* Selected Style Indicator Pill */}
            {viewTab === "studio" && primaryTemplate && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--line)] bg-[var(--panel)] text-[11px] font-semibold text-[var(--fg)]">
                <span className="size-2 rounded-full bg-[#c6f432] animate-pulse" />
                <span>Style: {primaryTemplate.name}</span>
              </div>
            )}
          </div>

          {/* Right: Aspect Ratio Switcher & Render CTA */}
          <div className="flex items-center gap-2.5">
            {viewTab === "studio" && (
              <>
                {/* Aspect Ratio Switcher (matching carousel) */}
                <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--bg)] p-0.5 text-[11px] font-semibold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all",
                      aspectRatio === "9:16"
                        ? "bg-[var(--hover)] text-[var(--fg)] shadow-2xs font-bold"
                        : "text-[var(--muted)]"
                    )}
                  >
                    9:16 (Reel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("1:1")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all",
                      aspectRatio === "1:1"
                        ? "bg-[var(--hover)] text-[var(--fg)] shadow-2xs font-bold"
                        : "text-[var(--muted)]"
                    )}
                  >
                    1:1 (Square)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9")}
                    className={cn(
                      "px-2.5 py-1 rounded-md transition-all",
                      aspectRatio === "16:9"
                        ? "bg-[var(--hover)] text-[var(--fg)] shadow-2xs font-bold"
                        : "text-[var(--muted)]"
                    )}
                  >
                    16:9 (Landscape)
                  </button>
                </div>

                {/* Direct Create / Render Action Button in Header */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateVideo}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Rendering...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-[#c6f432]" />
                      <span>Create Video</span>
                      <span className="font-mono opacity-70 text-[10px]">
                        · {estimatedCredits} cr
                      </span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* =====================================================================
            VIEW 1: STUDIO CANVAS & VIDEO UPLOADER
           ===================================================================== */}
        {viewTab === "studio" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start pb-28 scrollbar-thin">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-6xl mx-auto">
              {/* -----------------------------------------------------------------
                  COLUMN 1: THE VIDEO UPLOAD & INPUTS SECTION (xl:col-span-7)
                 ----------------------------------------------------------------- */}
              <div className="xl:col-span-7 space-y-5">
                {/* CARD 1: VIDEO SOURCE UPLOAD SECTION (The Middle Upload Section) */}
                <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-[var(--fg)] flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#c6f432]" />
                        <span>1. Video Source</span>
                      </h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        Drop your raw video take or script to automatically edit with kinetic graphics.
                      </p>
                    </div>

                    {/* Mobile Input Toggle */}
                    <div className="flex sm:hidden items-center rounded-lg border border-[var(--line)] bg-[var(--bg)] p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setSourceType("take")}
                        className={cn(
                          "px-2 py-1 rounded",
                          sourceType === "take" ? "bg-[var(--hover)] font-bold" : "text-[var(--muted)]"
                        )}
                      >
                        Take
                      </button>
                      <button
                        type="button"
                        onClick={() => setSourceType("faceless")}
                        className={cn(
                          "px-2 py-1 rounded",
                          sourceType === "faceless" ? "bg-[var(--hover)] font-bold" : "text-[var(--muted)]"
                        )}
                      >
                        AI
                      </button>
                    </div>
                  </div>

                  {sourceType === "take" ? (
                    <div className="space-y-3">
                      {/* Video Dropzone Container */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[var(--line)] hover:border-[#c6f432] bg-[var(--hover)]/30 hover:bg-[var(--hover)]/70 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group select-none shadow-2xs"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="size-12 rounded-xl bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--fg)] group-hover:scale-105 transition-all shadow-xs mb-3">
                          {isUploading ? (
                            <RefreshCw className="w-5 h-5 animate-spin text-[#c6f432]" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </div>
                        <p className="text-sm font-bold text-[var(--fg)]">
                          {isUploading
                            ? "Inspecting duration & video metadata..."
                            : "Drop your raw video take here, or click to browse"}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-1 font-mono">
                          MP4, MOV, WebM · Auto-probed for duration & resolution
                        </p>
                      </div>

                      {/* Uploaded Video File Chips */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            Uploaded Clips ({uploadedFiles.length})
                          </span>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)] text-xs shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="size-8 rounded-lg bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-[#c6f432] shrink-0">
                                    <FileVideo className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-[var(--fg)] truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-[11px] text-[var(--muted)] font-mono">
                                      {file.size} · {file.duration}s duration
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="px-2 py-0.5 rounded-full bg-[#c6f432]/20 text-[#c6f432] text-[10px] font-mono font-bold">
                                    {file.duration}s
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))
                                    }
                                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    title="Remove clip"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Faceless Explainer Script Input */
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[var(--fg)]">
                          Topic or Script for Faceless Video
                        </label>
                        <textarea
                          rows={4}
                          value={facelessTopic}
                          onChange={(e) => setFacelessTopic(e.target.value)}
                          placeholder="e.g. 5 growth tactics that generated $1M ARR for micro-SaaS startups in 2026 without running paid ads..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] text-xs text-[var(--fg)] bg-[var(--bg)] focus:outline-hidden focus:border-[#c6f432] transition-colors leading-relaxed placeholder:text-[var(--muted)]"
                        />
                      </div>

                      {/* Quick Prompt Ideas */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-[var(--muted)]">
                          Quick prompt ideas:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "5 SaaS conversion bottlenecks",
                            "Why 90% of solo founders quit too early",
                            "AI Agents breakdown in 45 seconds",
                          ].map((idea, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setFacelessTopic(idea)}
                              className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] transition-all cursor-pointer truncate max-w-xs"
                            >
                              &ldquo;{idea}&rdquo;
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD 2: AUDIO, LOOK & PLATFORM SETTINGS */}
                <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-[var(--fg)] flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#c6f432]" />
                        <span>2. Look & Audio Configuration</span>
                      </h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        Control color grading, background music volume, sound effects, and platforms.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAudioOptionsOpen(!isAudioOptionsOpen)}
                      className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--fg)]"
                    >
                      {isAudioOptionsOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isAudioOptionsOpen && (
                    <div className="space-y-5 pt-2">
                      {/* Look Preset & Strength */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[var(--fg)]">
                            Color Grading Look
                          </label>
                          <select
                            value={lookPreset}
                            onChange={(e) => setLookPreset(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[var(--line)] text-xs bg-[var(--bg)] text-[var(--fg)] focus:outline-hidden focus:border-[#c6f432]"
                          >
                            <option value="clean">Clean (Natural Rec.709 studio look)</option>
                            <option value="podcast">Podcast (Warm high-contrast look)</option>
                            <option value="cinematic">Cinematic (Teal and orange film grade)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-[var(--fg)]">
                            <span>Look Intensity</span>
                            <span className="font-mono">{Math.round(lookStrength * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={lookStrength}
                            onChange={(e) => setLookStrength(parseFloat(e.target.value))}
                            className="w-full accent-[#c6f432]"
                          />
                        </div>
                      </div>

                      {/* Avatar Cutout Background Removal Toggle */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                        <input
                          id="avatar-cutout-check"
                          type="checkbox"
                          checked={avatarCutout}
                          onChange={(e) => setAvatarCutout(e.target.checked)}
                          className="mt-0.5 rounded text-[#c6f432] accent-[#c6f432]"
                        />
                        <div className="space-y-0.5">
                          <label
                            htmlFor="avatar-cutout-check"
                            className="text-xs font-bold text-[var(--fg)] cursor-pointer"
                          >
                            Remove speaker background (AI Cutout)
                          </label>
                          <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                            Sends source clip for AI matting so you appear over the style graphics.
                          </p>
                        </div>
                      </div>

                      {/* Music & Sound Effects Sliders */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]">
                        {/* Music Volume */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[var(--fg)]">
                            <label className="flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-[#c6f432]" />
                              <span>Background Music</span>
                            </label>
                            <input
                              type="checkbox"
                              checked={musicEnabled}
                              onChange={(e) => setMusicEnabled(e.target.checked)}
                              className="rounded text-[#c6f432] accent-[#c6f432]"
                            />
                          </div>
                          {musicEnabled && (
                            <div className="flex items-center gap-2.5">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={musicVolume}
                                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                className="w-full accent-[#c6f432]"
                              />
                              <span className="text-[11px] font-mono text-[var(--muted)] w-8 text-right">
                                {Math.round(musicVolume * 100)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* SFX Volume */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[var(--fg)]">
                            <label className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#c6f432]" />
                              <span>Sound Effects</span>
                            </label>
                            <input
                              type="checkbox"
                              checked={sfxEnabled}
                              onChange={(e) => setSfxEnabled(e.target.checked)}
                              className="rounded text-[#c6f432] accent-[#c6f432]"
                            />
                          </div>
                          {sfxEnabled && (
                            <div className="flex items-center gap-2.5">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={sfxVolume}
                                onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                                className="w-full accent-[#c6f432]"
                              />
                              <span className="text-[11px] font-mono text-[var(--muted)] w-8 text-right">
                                {Math.round(sfxVolume * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Language & Target Platforms */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[var(--fg)]">
                            Spoken Language
                          </label>
                          <select
                            value={spokenLanguage}
                            onChange={(e) => setSpokenLanguage(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[var(--line)] text-xs bg-[var(--bg)] text-[var(--fg)] focus:outline-hidden focus:border-[#c6f432]"
                          >
                            {SPOKEN_LANGUAGES.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[var(--fg)]">
                            Export Platforms
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {PLATFORMS_LIST.map((plat) => {
                              const isPlatSelected = selectedPlatforms.includes(plat.id);
                              return (
                                <button
                                  key={plat.id}
                                  type="button"
                                  onClick={() => {
                                    if (isPlatSelected) {
                                      if (selectedPlatforms.length > 1) {
                                        setSelectedPlatforms(
                                          selectedPlatforms.filter((p) => p !== plat.id)
                                        );
                                      }
                                    } else {
                                      setSelectedPlatforms([...selectedPlatforms, plat.id]);
                                    }
                                  }}
                                  className={cn(
                                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                                    isPlatSelected
                                      ? "bg-[var(--fg)] text-[var(--bg)] shadow-2xs"
                                      : "border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)]"
                                  )}
                                >
                                  {plat.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Comment-to-DM Automation */}
                      <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[var(--fg)] flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-[#c6f432]" />
                            <span>Auto-DM commenters with keyword</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={commentToDmEnabled}
                            onChange={(e) => setCommentToDmEnabled(e.target.checked)}
                            className="rounded text-[#c6f432] accent-[#c6f432]"
                          />
                        </div>

                        {commentToDmEnabled && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="text-[10px] font-mono font-bold text-[var(--muted)] uppercase block mb-1">
                                Keyword trigger
                              </label>
                              <input
                                type="text"
                                value={commentKeyword}
                                onChange={(e) =>
                                  setCommentKeyword(
                                    e.target.value.replace(/\s+/g, "").toUpperCase()
                                  )
                                }
                                placeholder="GUIDE"
                                className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs uppercase font-mono font-bold bg-[var(--panel)] text-[var(--fg)]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-mono font-bold text-[var(--muted)] uppercase block mb-1">
                                Resource offered
                              </label>
                              <input
                                type="text"
                                value={dmOffer}
                                onChange={(e) => setDmOffer(e.target.value)}
                                placeholder="my free prompt pack"
                                className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs bg-[var(--panel)] text-[var(--fg)]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* -----------------------------------------------------------------
                  COLUMN 2: LIVE STYLE CANVAS PREVIEW (xl:col-span-5)
                 ----------------------------------------------------------------- */}
              <div className="xl:col-span-5 flex flex-col items-center space-y-4">
                {/* Live Canvas Mockup Header */}
                <div className="w-full flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#c6f432] animate-pulse" />
                    <h3 className="font-extrabold text-xs text-[var(--fg)]">
                      Live Style Canvas
                    </h3>
                  </div>

                  {/* Toggle Preview: Composite vs Raw */}
                  <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--panel)] p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewDisplayMode("composite")}
                      className={cn(
                        "px-2 py-0.5 rounded transition-all",
                        previewDisplayMode === "composite"
                          ? "bg-[var(--fg)] text-[var(--bg)] shadow-2xs"
                          : "text-[var(--muted)]"
                      )}
                    >
                      Styled
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDisplayMode("raw")}
                      className={cn(
                        "px-2 py-0.5 rounded transition-all",
                        previewDisplayMode === "raw"
                          ? "bg-[var(--fg)] text-[var(--bg)] shadow-2xs"
                          : "text-[var(--muted)]"
                      )}
                    >
                      Raw
                    </button>
                  </div>
                </div>

                {/* Phone / Canvas Mockup Stage */}
                <div
                  className={cn(
                    "relative rounded-2xl border-2 border-[var(--line)] bg-black shadow-2xl overflow-hidden flex items-center justify-center select-none transition-all duration-300",
                    aspectRatio === "9:16" && "w-[280px] sm:w-[320px] aspect-[9/16]",
                    aspectRatio === "1:1" && "w-[280px] sm:w-[320px] aspect-square",
                    aspectRatio === "16:9" && "w-full max-w-[420px] aspect-[16/9]"
                  )}
                >
                  {previewDisplayMode === "raw" && uploadedFiles[0]?.path ? (
                    <video
                      src={uploadedFiles[0].path}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <VideoCanvasPreview
                      settings={brandKit}
                      videoSrc={uploadedFiles[0]?.path}
                      styleId={primaryStyleId}
                      className="w-full h-full"
                    />
                  )}

                  {/* Audio Mute/Unmute Indicator Button on Canvas */}
                  <div className="absolute bottom-3 right-3 z-30">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="size-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-95 cursor-pointer shadow-md"
                      title={isMuted ? "Unmute sound" : "Mute sound"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-[#c6f432]" />
                      )}
                    </button>
                  </div>

                  {/* Active Style Watermark / Badge */}
                  <div className="absolute top-3 left-3 z-30 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                      {primaryTemplate?.name || "Style Preview"}
                    </span>
                  </div>
                </div>

                {/* Active Style Spec Card */}
                {primaryTemplate && (
                  <div className="w-full max-w-[320px] bg-[var(--panel)] border border-[var(--line)] rounded-xl p-3.5 space-y-2 text-xs shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[var(--fg)]">
                        {primaryTemplate.name}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--muted)]">
                        {primaryTemplate.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                      {primaryTemplate.pitch}
                    </p>

                    {/* Palette swatches for the selected style */}
                    {activeVisualConfig && (
                      <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
                        <span>Palette:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="size-3 rounded-full border border-black/20"
                            style={{
                              backgroundColor:
                                "#" + activeVisualConfig.canvasBgHex.replace(/^0x/i, ""),
                            }}
                            title="Canvas BG"
                          />
                          <span
                            className="size-3 rounded-full border border-black/20"
                            style={{ backgroundColor: activeVisualConfig.highlightHex }}
                            title="Highlight"
                          />
                          <span
                            className="size-3 rounded-full border border-black/20"
                            style={{
                              backgroundColor: activeVisualConfig.isDarkCanvas
                                ? "#FFFFFF"
                                : "#111111",
                            }}
                            title="Typography"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: RENDERED PROJECTS LIBRARY ("MY VIDEOS")
           ===================================================================== */}
        {viewTab === "projects" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
            {activePreviewProject ? (
              <MakerzzProjectReviewView
                project={activePreviewProject}
                onBack={() => setActivePreviewProject(null)}
                onProjectUpdated={(updated) => {
                  setActivePreviewProject(updated);
                  setProjects((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p))
                  );
                }}
                onOpenComposer={onOpenComposer}
              />
            ) : (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">
                      My Rendered Videos
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Review completed video variations, inspect word captions, or open the detailed editor.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchProjects(true)}
                    className="p-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] text-[var(--fg)] transition-colors cursor-pointer"
                    title="Refresh video list"
                  >
                    <RefreshCw
                      className={cn("w-4 h-4", isLoadingProjects && "animate-spin")}
                    />
                  </button>
                </div>

                {projects.length === 0 ? (
                  /* Empty state matching Carousel style */
                  <div className="p-12 text-center bg-[var(--panel)] rounded-2xl border border-dashed border-[var(--line)] space-y-3 max-w-md mx-auto my-12">
                    <FileVideo className="w-12 h-12 text-[var(--muted)] opacity-50 mx-auto" />
                    <h4 className="font-bold text-sm text-[var(--fg)]">
                      No videos rendered yet
                    </h4>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      Select any of the 56 styles on the left and upload your video take to generate your first AI reel.
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewTab("studio")}
                      className="px-4 py-2 rounded-xl bg-[var(--fg)] text-[var(--bg)] text-xs font-bold inline-flex items-center gap-1.5 transition-all hover:opacity-90 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4 text-[#c6f432]" />
                      <span>Create a Video</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {projects.map((proj) => {
                      const isReady = proj.status === "READY";
                      return (
                        <div
                          key={proj.id}
                          onClick={() => setActivePreviewProject(proj)}
                          className="bg-[var(--panel)] rounded-2xl border border-[var(--line)] hover:border-[var(--muted)] shadow-2xs hover:shadow-md overflow-hidden flex flex-col justify-between cursor-pointer transition-all"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm text-[var(--fg)] line-clamp-1">
                                {proj.title}
                              </h4>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0",
                                  isReady
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 animate-pulse border border-amber-500/20"
                                )}
                              >
                                {isReady ? "• READY" : proj.status}
                              </span>
                            </div>

                            {!isReady && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                                  <span>Rendering scenes...</span>
                                  <span>{proj.progress}%</span>
                                </div>
                                <div className="w-full bg-[var(--hover)] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#c6f432] h-full transition-all duration-500"
                                    style={{ width: `${proj.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Thumbnail / Video Preview */}
                            <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden group">
                              {proj.thumbnailUrl &&
                              !proj.thumbnailUrl.includes("makerzz.space/showcase") ? (
                                <img
                                  src={proj.thumbnailUrl.replace(
                                    "/uploads/videos/",
                                    "/api/studio/video/"
                                  )}
                                  alt={proj.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : proj.outputVideoUrl ? (
                                <video
                                  src={proj.outputVideoUrl.replace(
                                    "/uploads/videos/",
                                    "/api/studio/video/"
                                  )}
                                  preload="metadata"
                                  className="w-full h-full object-cover pointer-events-none"
                                />
                              ) : (
                                <img
                                  src={
                                    proj.thumbnailUrl ||
                                    "https://makerzz.space/showcase/face/classified-yt/poster.jpg"
                                  }
                                  alt={proj.title}
                                  className="w-full h-full object-cover opacity-85"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 flex items-center justify-center transition-colors">
                                <div className="size-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                              </div>
                            </div>

                            {/* Card Meta */}
                            <div className="flex flex-wrap gap-1 text-[10px] font-mono text-[var(--muted)]">
                              <span className="px-2 py-0.5 rounded bg-[var(--hover)] text-[var(--fg)] font-semibold">
                                {proj.primaryStyleId || "Paper Studio"}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[var(--hover)]">
                                {proj.scenes?.length || 6} scenes
                              </span>
                            </div>
                          </div>

                          {/* Footer Action */}
                          <div className="p-3 border-t border-[var(--line)] bg-[var(--hover)]/30 flex items-center justify-between text-xs">
                            <span className="text-[var(--muted)] font-mono text-[11px]">
                              {new Date(proj.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleDeleteProject(proj);
                                }}
                                className="p-1.5 rounded-lg border border-[var(--line)] hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 py-1 rounded-lg bg-[var(--fg)] text-[var(--bg)] font-bold text-[11px] shadow-2xs">
                                Review Edit →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            STICKY BOTTOM FLOATING DOCK (ONLY IN STUDIO CREATOR VIEW)
           ===================================================================== */}
        {viewTab === "studio" && (
          <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 p-3 sm:p-3.5 pl-5 rounded-2xl bg-[var(--panel)]/95 backdrop-blur-md border border-[var(--line)] shadow-xl pointer-events-auto">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs sm:text-sm font-bold text-[var(--fg)] flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#c6f432]" />
                  <span>
                    {selectedStyleIds.length}{" "}
                    {selectedStyleIds.length === 1 ? "style" : "styles"} selected
                  </span>
                  <span className="text-[var(--muted)] font-normal hidden sm:inline">
                    · {primaryTemplate?.name}
                  </span>
                </p>
                <p className="text-[11px] text-[var(--muted)] font-mono truncate">
                  Multi-styles render in parallel · Unrendered variations refund credits
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateVideo}
                className="shrink-0 py-2.5 px-5 rounded-xl bg-[var(--fg)] hover:opacity-90 disabled:opacity-50 text-[var(--bg)] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#c6f432]" />
                    <span>Rendering...</span>
                  </>
                ) : (
                  <>
                    <span>Create Video</span>
                    <span className="font-mono opacity-80 text-xs">
                      · {estimatedCredits} cr
                    </span>
                    <ArrowRight className="w-4 h-4 ml-0.5 text-[#c6f432]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
