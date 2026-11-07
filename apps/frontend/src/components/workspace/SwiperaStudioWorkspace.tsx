"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Wand2,
  Layers,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Undo2,
  Redo2,
  FolderOpen,
  HelpCircle,
  Moon,
  Sun,
  Download,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  RefreshCw,
  Search,
  Upload,
  Globe,
  Share2,
  FileText,
  Smartphone,
  X,
  Keyboard,
  ExternalLink,
  Shuffle,
  FileUp,
  FileCheck,
  Palette,
  Shield,
  Lightbulb,
  Video,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  SlidersHorizontal,
} from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import swiperaTemplatesData from "@/data/swiperaTemplates";
import { SWIPERA_TEMPLATE_PREVIEWS } from "@/data/swiperaTemplatePreviews";
import swiperaFontsData from "@/data/swiperaFonts";
import swiperaPlatformsData from "@/data/swiperaPlatforms";
import { swiperaExamplesData, swiperaExampleCategories } from "@/data/swiperaExamples";
import { ExampleGalleryModal } from "./ExampleGalleryModal";
import { SlidePropertiesInspector } from "./SlidePropertiesInspector";
import { SlideCanvasRenderer } from "./SlideCanvasRenderer";

import { IdeasView } from "./IdeasView";
import { CalendarView } from "./CalendarView";
import { DailyFlywheelModal } from "./DailyFlywheelModal";
import { DailyFlywheelAlertBanner } from "./DailyFlywheelAlertBanner";
import { AutomationPipelineView } from "./AutomationPipelineView";

const ComposerSheet = dynamic(() => import("./ComposerSheet").then((mod) => mod.ComposerSheet));
const AuthForm = dynamic(() => import("@/components/auth/AuthForm").then((mod) => mod.AuthForm));

// Strict rail navigation for PostPilot Carousel Studio
export type StudioTab = "pipeline" | "create" | "templates" | "design" | "brand" | "caption" | "ideas" | "calendar";

export interface SlideData {
  id: string;
  type: "cover" | "content" | "list" | "quote" | "stat" | "chart" | "table" | "cta";
  label?: string;
  emoji?: string;
  title: string;
  body: string;
  items?: string[];
  stat?: string;
  image?: string;
  imageFit?: "cover" | "contain";
  showOverlay?: boolean;
  // Image Layout, Filters, and Positioning
  imgLayout?: "auto" | "full" | "top" | "bottom" | "left" | "right" | "card" | "circle" | "polaroid";
  imgSize?: number;
  imgFit?: "cover" | "contain";
  imgFocusX?: number;
  imgFocusY?: number;
  imgZoom?: number;
  imgFilter?: "auto" | "none" | "mono" | "duotone" | "warm" | "cool" | "fade" | "vivid" | "film" | "soft";
  imgBrightness?: number;
  imgContrast?: number;
  imgSaturate?: number;
  imgBlur?: number;
  imgOverlay?: "auto" | "none" | "dark" | "light" | "grad-b" | "grad-t" | "accent" | "accent-grad";
  imgOverlayOpacity?: number;
  imgRadius?: number;
  imgShadow?: boolean;
  imgBorder?: boolean;
  imgFlip?: boolean;
  imgTextPos?: "auto" | "top" | "middle" | "bottom";
  // Chart and Table structured properties
  chart?: {
    kind: "bar" | "hbar" | "line" | "donut";
    unit?: string;
    items: Array<{ label: string; value: number }>;
  };
  table?: {
    cols: string[];
    rows: string[][];
  };
  // Layers (stickers, shapes, text layers)
  layers?: Array<{
    id: string;
    kind: "text" | "emoji" | "image" | "shape";
    text?: string;
    src?: string;
    shape?: string;
    x: number;
    y: number;
    w: number;
    h?: number;
    rot?: number;
    color?: string;
    opacity?: number;
    size?: number;
    weight?: string;
    bg?: string;
    radius?: number;
  }>;
}

export interface CompatiblePlatformInfo {
  id: "instagram" | "threads" | "linkedin" | "tiktok" | "facebook" | "x";
  name: string;
  icon: string;
  color: string;
  isOptimal: boolean;
  isCompatible: boolean;
  badge: string;
  detail: string;
}

export interface UploadedSocialImage {
  id: string;
  name: string;
  url: string;
  sizeStr: string;
  typeStr: string;
  width: number;
  height: number;
  aspectRatioStr: string;
  matchedRatio: "4:5" | "1:1" | "9:16" | "16:9";
  compatiblePlatforms: CompatiblePlatformInfo[];
}

export interface ExtractedSourceData {
  kind: "url" | "file";
  url?: string;
  domain?: string;
  siteName?: string;
  title?: string;
  published?: string | null;
  description?: string;
  text?: string;
  words?: number;
  image?: string | null;
  images?: { url: string; alt?: string; main?: boolean }[];
  via?: string;
}

export const SWIPERA_SAMPLE_PROMPTS = [
  {
    id: "sample_1",
    label: "5 High-Performance Morning Habits",
    text: `5 Morning Habits for Peak Focus & Energy:
1) Drink a tall glass of water immediately after waking to rehydrate.
2) 10-minute dynamic mobility stretching to awaken circulation.
3) Write down your 3 non-negotiable priorities on physical paper.
4) No smartphone notifications or social feeds for the first 30 minutes.
5) High-protein breakfast to prevent afternoon glucose crashes.
Small daily disciplines produce compounding outsized returns. Start with just one today.`,
  },
  {
    id: "sample_2",
    label: "3-Step Wealth Allocation Blueprint",
    text: `The 3-Step Financial Playbook for Young Professionals:
Step 1: Account Splitting. Separate living expenses, high-yield savings, long-term index investments, and emergency reserves.
Step 2: Automated Payday Transfers. Have 30% of your earnings sweep into wealth assets the morning your salary deposits.
Step 3: The 3-Month Fortress Reserve. Before risky equity bets, guarantee 3 months of basic runway in liquid cash.
Empirical data shows automated savers maintain a 2.5x higher 10-year net-worth milestone.`,
  },
  {
    id: "sample_3",
    label: "Deep Work: Double Output in 90 Mins",
    text: `How to Double High-Value Output with 90 Minutes of Deep Work:
Carve out one 90-minute distraction-free cognitive sprint every morning.
Kill all push notifications, select a single complex outcome, and start a visible countdown timer.
Research shows task-switching and cognitive fragmentation slash IQ output by over 40%.
Cal Newport: "The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy."`,
  },
  {
    id: "sample_4",
    label: "Our Brand Genesis & Principles",
    text: `We founded 'Morning Brew' out of a small garage roastery in 2019.
Year 1 revenue was barely $25,000. Today, we supply premium craft single-origin beans to over 120 specialty cafes.
Our 3 inviolable rules: direct farm partnerships, guaranteed delivery within 72 hours of roasting, and 1% of top-line revenue reinvested in farm community schooling.
Uncompromising craft and enduring relationships always outlast quick growth hacks.`,
  },
];

export function computePlatformCompatibility(width: number, height: number): {
  matchedRatio: "4:5" | "1:1" | "9:16" | "16:9";
  aspectRatioStr: string;
  platforms: CompatiblePlatformInfo[];
} {
  const ratio = width / height;
  let matchedRatio: "4:5" | "1:1" | "9:16" | "16:9" = "4:5";
  let aspectRatioStr = "4:5 Portrait";

  if (Math.abs(ratio - 1.0) <= 0.12) {
    matchedRatio = "1:1";
    aspectRatioStr = "1:1 Square";
  } else if (ratio < 0.68) {
    matchedRatio = "9:16";
    aspectRatioStr = "9:16 Vertical";
  } else if (ratio > 1.35) {
    matchedRatio = "16:9";
    aspectRatioStr = "16:9 Landscape";
  } else {
    matchedRatio = "4:5";
    aspectRatioStr = "4:5 Portrait";
  }

  const platforms: CompatiblePlatformInfo[] = [
    {
      id: "instagram",
      name: "Instagram",
      icon: "fa-brands fa-instagram",
      color: "#E1306C",
      isOptimal: matchedRatio === "4:5" || matchedRatio === "1:1",
      isCompatible: true,
      badge: matchedRatio === "4:5" ? "Optimal" : matchedRatio === "1:1" ? "Optimal" : "Stories/Reels",
      detail:
        matchedRatio === "4:5"
          ? "Optimal for Feed & Multi-Image Carousel (1080×1350)"
          : matchedRatio === "1:1"
            ? "Optimal for Square Feed Post (1080×1080)"
            : matchedRatio === "9:16"
              ? "Compatible for Stories & Reels (1080×1920)"
              : "Compatible for Landscape Feed",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "fa-brands fa-linkedin-in",
      color: "#0A66C2",
      isOptimal: matchedRatio === "4:5",
      isCompatible: true,
      badge: matchedRatio === "4:5" ? "Optimal" : "Compatible",
      detail:
        matchedRatio === "4:5"
          ? "Optimal for Multi-Slide PDF Carousel (1080×1350)"
          : matchedRatio === "1:1"
            ? "Compatible for Square Post"
            : "Compatible for Landscape Post",
    },
    {
      id: "threads",
      name: "Threads",
      icon: "fa-brands fa-threads",
      color: "#000000",
      isOptimal: matchedRatio === "4:5" || matchedRatio === "1:1",
      isCompatible: true,
      badge: matchedRatio === "4:5" || matchedRatio === "1:1" ? "Optimal" : "Compatible",
      detail:
        matchedRatio === "4:5"
          ? "Optimal for Portrait Carousel"
          : matchedRatio === "1:1"
            ? "Optimal for Square Post"
            : "Compatible Post",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: "fa-brands fa-tiktok",
      color: "#000000",
      isOptimal: matchedRatio === "9:16",
      isCompatible: matchedRatio !== "16:9",
      badge: matchedRatio === "9:16" ? "Optimal" : "Photo Mode",
      detail:
        matchedRatio === "9:16"
          ? "Optimal for Fullscreen Photo/Video Slides (1080×1920)"
          : "Photo Mode Carousel",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "fa-brands fa-facebook-f",
      color: "#1877F2",
      isOptimal: matchedRatio === "1:1" || matchedRatio === "4:5",
      isCompatible: true,
      badge: "Compatible",
      detail:
        matchedRatio === "1:1"
          ? "Optimal for Square Post"
          : matchedRatio === "4:5"
            ? "Optimal for Vertical Post"
            : "Compatible Feed",
    },
    {
      id: "x",
      name: "X",
      icon: "fa-brands fa-x-twitter",
      color: "#000000",
      isOptimal: matchedRatio === "16:9" || matchedRatio === "1:1",
      isCompatible: true,
      badge: matchedRatio === "16:9" ? "Optimal" : "Compatible",
      detail:
        matchedRatio === "16:9"
          ? "Optimal for Landscape Image Post (1200×675)"
          : "Compatible Image Post",
    },
  ];

  return { matchedRatio, aspectRatioStr, platforms };
}

interface SwiperaStudioWorkspaceProps {
  initialTab?: StudioTab;
  onOpenComposer?: (data?: any) => void;
  showAuthModal?: boolean;
  authModalMode?: "signin" | "signup";
}

export function SwiperaStudioWorkspace({
  initialTab = "create",
  onOpenComposer: externalOnOpenComposer,
  showAuthModal = false,
  authModalMode: initialAuthModalMode = "signup",
}: SwiperaStudioWorkspaceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const searchParams = useSearchParams();

  // Determine initial active tab based on query param or pathname
  const computeActiveTab = (): StudioTab => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "pipeline" || tabParam === "pipelines") return "pipeline";
    if (tabParam === "ideas" || tabParam === "idea") return "ideas";
    if (tabParam === "create") return "create";
    if (tabParam === "templates" || tabParam === "styles" || tabParam === "style" || tabParam === "image") return "templates";
    if (tabParam === "caption") return "caption";
    if (tabParam === "calendar" || tabParam === "schedule") return "calendar";
    if (pathname?.startsWith("/pipelines")) return "pipeline";
    if (pathname?.startsWith("/ideas")) return "ideas";
    if (pathname?.startsWith("/calendar") || pathname?.startsWith("/schedule")) return "calendar";
    if (initialTab && initialTab !== "design" && initialTab !== "brand") return initialTab;
    return "create";
  };

  const [activeTab, setActiveTab] = useState<StudioTab>(computeActiveTab);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isEasyMode, setIsEasyMode] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [language, setLanguage] = useState<"ko" | "en">("en");
  const [projectTitle, setProjectTitle] = useState("Untitled Carousel");
  const [isSaved, setIsSaved] = useState(true);
  const [saveTime, setSaveTime] = useState<string>("Saved");
  const [isFlywheelModalOpen, setIsFlywheelModalOpen] = useState(false);

  // Slide Deck state
  const [slides, setSlides] = useState<SlideData[]>([
    {
      id: "slide_1",
      type: "cover",
      label: "ACTION",
      emoji: "🤖",
      title: "Turn Ideas into Visual Carousels",
      body: "Paste any article link, notes, or research to generate high-converting slides in seconds.",
      items: [],
    },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Template & Design State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("brutalism");
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<"4:5" | "1:1" | "9:16" | "16:9">("4:5");
  const [zoomLevel, setZoomLevel] = useState(100);

  // Canvas Stage dynamic measurement
  const canvasStageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({ width: 800, height: 600 });

  useEffect(() => {
    const el = canvasStageRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setStageSize({ width, height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Exact native dimensions & responsive display geometry matching Swipera
  const ratioGeometry = useMemo(() => {
    let nativeW = 1080;
    let nativeH = 1350;
    let ratioStr = "4:5";

    switch (aspectRatio) {
      case "1:1":
        nativeW = 1080;
        nativeH = 1080;
        ratioStr = "1:1";
        break;
      case "9:16":
        nativeW = 1080;
        nativeH = 1920;
        ratioStr = "9:16";
        break;
      case "16:9":
        nativeW = 1920;
        nativeH = 1080;
        ratioStr = "16:9";
        break;
      case "4:5":
      default:
        nativeW = 1080;
        nativeH = 1350;
        ratioStr = "4:5";
        break;
    }

    // Available stage dimensions: leave room for padding and floating #ctx-bar (~56px)
    const padX = 48; // 24px left + 24px right
    const padY = 96; // 24px top + 24px bottom + ctx-bar height
    const availW = Math.max(260, stageSize.width - padX);
    const availH = Math.max(260, stageSize.height - padY);

    // Compute scale so the card fits inside available space
    const fitScale = Math.min(availW / nativeW, availH / nativeH);
    const scale = fitScale * (zoomLevel / 100);
    const displayW = Math.round(nativeW * scale);
    const displayH = Math.round(nativeH * scale);

    return {
      nativeW,
      nativeH,
      displayW,
      displayH,
      scale,
      fitScale,
      ratioStr,
    };
  }, [aspectRatio, stageSize, zoomLevel]);
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [accentColorOverride, setAccentColorOverride] = useState<string | null>(null);
  const [showSafeArea, setShowSafeArea] = useState(false);

  // Typography & Micro-Styling controls
  const [titleFont, setTitleFont] = useState("Bricolage Grotesque");
  const [bodyFont, setBodyFont] = useState("Pretendard");
  const [fontCategoryFilter, setFontCategoryFilter] = useState("all");
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [fontModalTarget, setFontModalTarget] = useState<"title" | "body">("title");
  const [titleSize, setTitleSize] = useState(100);
  const [bodySize, setBodySize] = useState(100);
  const [tracking, setTracking] = useState(0); // letter-spacing in em (-0.04 to 0.08)
  const [leading, setLeading] = useState(1.2); // line-height (0.9 to 1.6)
  const [titleWeight, setTitleWeight] = useState("800");
  const [titleCase, setTitleCase] = useState<"normal" | "uppercase">("normal");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [verticalAlign, setVerticalAlign] = useState<"top" | "center" | "bottom">("center");
  const [hasTitleShadow, setHasTitleShadow] = useState(false);

  // Colors, Gradients & Background
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [customFg, setCustomFg] = useState<string | null>(null);
  const [customAccent, setCustomAccent] = useState<string | null>(null);
  const [isGradientBg, setIsGradientBg] = useState(false);
  const [gradientEndColor, setGradientEndColor] = useState("#ECEAE4");
  const [gradientAngle, setGradientAngle] = useState(135);
  const [bgPattern, setBgPattern] = useState<"none" | "dots" | "grid" | "lines" | "waves">("dots");
  const [patternOpacity, setPatternOpacity] = useState(15);
  const [frameStyle, setFrameStyle] = useState<"none" | "solid" | "inset" | "double" | "rounded" | "underline">("none");
  const [frameColor, setFrameColor] = useState("#141414");
  const [showDecorations, setShowDecorations] = useState(true);

  // Integrated Brand Identity (in Design tab)
  const [brandHandle, setBrandHandle] = useState("@swipera.io");
  const [brandWebsite, setBrandWebsite] = useState("swipera.io");
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<"tl" | "tr" | "bl" | "br">("tl");
  const [showPageNumber, setShowPageNumber] = useState(true);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [swipeCtaText, setSwipeCtaText] = useState("Swipe ->");

  // Create Form State
  const [createTabMode, setCreateTabMode] = useState<"manual" | "ai">("manual");
  const [uploadedSocialImages, setUploadedSocialImages] = useState<UploadedSocialImage[]>([]);
  const [activeImageFit, setActiveImageFit] = useState<"cover" | "contain">("cover");
  const [showImageTextOverlay, setShowImageTextOverlay] = useState(false);

  const slideImageInputRef = useRef<HTMLInputElement>(null);
  const filmstripImageInputRef = useRef<HTMLInputElement>(null);
  const inspectorImageInputRef = useRef<HTMLInputElement>(null);
  const refTemplateInputRef = useRef<HTMLInputElement>(null);

  const [sourceMode, setSourceMode] = useState<"text" | "file" | "url" | "manual">("url");
  const [rawContent, setRawContent] = useState("");
  const [isDragOverFile, setIsDragOverFile] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<{ name: string; size: string; type: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [extractedSource, setExtractedSource] = useState<ExtractedSourceData | null>(null);
  const [isViewSourceModalOpen, setIsViewSourceModalOpen] = useState(false);
  const [viewSourceText, setViewSourceText] = useState("");
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [useHeroOnCover, setUseHeroOnCover] = useState(true);
  const [autoPlaceImages, setAutoPlaceImages] = useState(true);

  // 6 Platforms State
  const [selectedPlatformId, setSelectedPlatformId] = useState<"instagram" | "threads" | "linkedin" | "tiktok" | "facebook" | "x">("instagram");

  // Advanced Creation Options
  const [isAdvOptsOpen, setIsAdvOptsOpen] = useState(false);
  const [focusAngle, setFocusAngle] = useState("");
  const [slideCountOpt, setSlideCountOpt] = useState("auto");
  const [goalOpt, setGoalOpt] = useState("Informative Breakdown");
  const [toneOpt, setToneOpt] = useState("Clear & Engaging");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentLanguage, setContentLanguage] = useState<"en" | "ko" | "ja" | "es">("en");
  const [textDensity, setTextDensity] = useState<"short" | "normal" | "detailed">("normal");
  const [storyStructure, setStoryStructure] = useState("auto");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStageText, setGenStageText] = useState("Generate with AI");

  // Caption Generator State
  const [captionPlatform, setCaptionPlatform] = useState<string>("instagram");
  const [captionTone, setCaptionTone] = useState<string>("friendly");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [captionText, setCaptionText] = useState(
    "Turn any article link, notes, or research into high-converting social carousels in seconds. Start creating now! 🚀"
  );
  const [hashtagText, setHashtagText] = useState("#carousel #socialmediamarketing #contentcreator #swipera");
  const [isRegeneratingCaption, setIsRegeneratingCaption] = useState(false);
  const [isCustomPromptModalOpen, setIsCustomPromptModalOpen] = useState(false);
  const [customPromptText, setCustomPromptText] = useState("");

  // Finished Examples Modal State
  const [isExamplesModalOpen, setIsExamplesModalOpen] = useState(false);
  const [selectedExampleCategory, setSelectedExampleCategory] = useState("all");

  // AI Design Prompt
  const [aiDesignPrompt, setAiDesignPrompt] = useState("");
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);

  // Inspector tab: "content" | "visual" | "ai" (Content active by default matching Reference)
  const [inspectorTab, setInspectorTab] = useState<"content" | "visual" | "ai">("content");
  const [smartFitPercent, setSmartFitPercent] = useState(140);
  const [autoShrink, setAutoShrink] = useState(true);

  // Modals & Sheets
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerPost, setComposerPost] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(showAuthModal);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">(initialAuthModalMode);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPolishMenuOpen, setIsPolishMenuOpen] = useState(false);

  // Undo / Redo history stack
  const [history, setHistory] = useState<SlideData[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Theme synchronization with html class & studio-mode lock
  useEffect(() => {
    document.body.classList.add("studio-mode");
    document.documentElement.classList.add("studio-mode");

    try {
      const storedTheme = localStorage.getItem("swipera-theme");
      const isDark = storedTheme === "dark" || document.documentElement.classList.contains("dark");
      setIsDarkTheme(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) { }

    return () => {
      document.body.classList.remove("studio-mode");
      document.documentElement.classList.remove("studio-mode");
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkTheme;
    setIsDarkTheme(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      try { localStorage.setItem("swipera-theme", "dark"); } catch (e) { }
    } else {
      document.documentElement.classList.remove("dark");
      try { localStorage.setItem("swipera-theme", "light"); } catch (e) { }
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "ko" : "en";
    setLanguage(nextLang);
    toast.success(`Language: ${nextLang === "ko" ? "Korean" : "English"}`);
  };

  // Safe area platform definition
  const currentPlatformMeta = useMemo(() => {
    return (swiperaPlatformsData as any[]).find((p) => p.id === selectedPlatformId) || (swiperaPlatformsData as any[])[0];
  }, [selectedPlatformId]);

  // Active Template and Color Scheme Resolution
  const activeTemplate = useMemo(() => {
    return (
      (swiperaTemplatesData as any[]).find((t) => t.id === selectedTemplateId) ||
      (swiperaTemplatesData as any[])[0]
    );
  }, [selectedTemplateId]);

  const activeScheme = useMemo(() => {
    const base = activeTemplate.schemes?.[selectedSchemeIndex] ||
      activeTemplate.schemes?.[0] || {
      bg: "#f6f5f2",
      fg: "#141414",
      a: "#c6f432",
      b: "#141414",
    };
    return {
      bg: customBg || base.bg,
      fg: customFg || base.fg,
      a: accentColorOverride || customAccent || base.a,
      b: base.b || "#ff4fd8",
    };
  }, [activeTemplate, selectedSchemeIndex, customBg, customFg, customAccent, accentColorOverride]);

  // Push history on slide state change
  const recordHistory = (newSlides: SlideData[]) => {
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(JSON.parse(JSON.stringify(newSlides)));
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    setIsSaved(false);
    setSaveTime("Saving...");
    setTimeout(() => {
      setIsSaved(true);
      setSaveTime("Saved");
    }, 600);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSlides(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      toast.info("Undo");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSlides(JSON.parse(JSON.stringify(history[historyIndex + 1])));
      toast.info("Redo");
    }
  };

  // Current Slide Pointer
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const updateCurrentSlide = (patch: Partial<SlideData>) => {
    const next = [...slides];
    next[currentSlideIndex] = { ...next[currentSlideIndex], ...patch };
    setSlides(next);
    recordHistory(next);
  };

  const handleAddSlide = () => {
    const newSlide: SlideData = {
      id: `slide_${Date.now()}`,
      type: "content",
      label: `SLIDE ${slides.length + 1}`,
      emoji: "💡",
      title: "Write an inspiring headline",
      body: "Explain your point with concise, compelling supporting sentences.",
    };
    const next = [...slides, newSlide];
    setSlides(next);
    setCurrentSlideIndex(next.length - 1);
    recordHistory(next);
    toast.success("Added new slide");
  };

  const handleDuplicateSlide = () => {
    const clone: SlideData = {
      ...currentSlide,
      id: `slide_${Date.now()}`,
      label: `${currentSlide.label || "SLIDE"} (COPY)`,
    };
    const next = [...slides];
    next.splice(currentSlideIndex + 1, 0, clone);
    setSlides(next);
    setCurrentSlideIndex(currentSlideIndex + 1);
    recordHistory(next);
    toast.success("Duplicated slide");
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) {
      toast.error("A carousel requires at least 1 slide");
      return;
    }
    const next = slides.filter((_, idx) => idx !== currentSlideIndex);
    setSlides(next);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    recordHistory(next);
    toast.info("Deleted slide");
  };

  // Shuffle styles
  const handleShuffleStyle = () => {
    const tplList = swiperaTemplatesData as any[];
    const randomTpl = tplList[Math.floor(Math.random() * tplList.length)];
    setSelectedTemplateId(randomTpl.id);
    setSelectedSchemeIndex(Math.floor(Math.random() * (randomTpl.schemes?.length || 1)));
    setAccentColorOverride(null);
    setCustomBg(null);
    setCustomFg(null);
    toast.success(`Shuffled to ${randomTpl.name}`);
  };

  // AI Rewrite Hook
  const handleAIRewrite = async (mode: string) => {
    setIsPolishMenuOpen(false);
    if (mode === "__custom") {
      setIsCustomPromptModalOpen(true);
      return;
    }
    const modePromptMap: Record<string, string> = {
      shorter: "Make it punchier, concise, and higher-impact",
      numbers: "Include concrete metrics, stats, or numbers",
      hook: "Rephrase title into a curiosity-inducing question hook",
      emotional: "Make it more empathetic, relatable, and evocative",
      professional: "Make it more authoritative, structured, and professional",
      english: "Translate naturally into crisp, modern English",
    };
    const instruction = modePromptMap[mode] || mode;

    toast.loading("AI is polishing this slide...", { id: "polish-toast" });
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slide: currentSlide,
          instruction,
          context: rawContent || extractedSource?.text || "",
          brandTone: toneOpt || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rewrite slide");
      updateCurrentSlide({
        title: data.title || currentSlide.title,
        body: data.body || currentSlide.body,
        label: data.label || currentSlide.label,
        emoji: data.emoji || currentSlide.emoji,
        items: data.items || currentSlide.items,
        stat: data.stat || currentSlide.stat,
      });
      toast.success("Slide polished successfully!", { id: "polish-toast" });
    } catch (err: any) {
      toast.error(err.message || "Rewrite failed", { id: "polish-toast" });
    }
  };

  // Document Upload Handler (PDF / Word)
  const handleDocumentFile = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File exceeds 20MB limit. Please upload a smaller document.");
      return;
    }
    const validExts = [".pdf", ".docx", ".doc", ".txt", ".md"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error(`Unsupported format ${ext}. Please upload PDF, Word (DOCX), TXT, or MD.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedDoc({ name: file.name, size: sizeStr, type: ext.replace(".", "").toUpperCase() });
          setRawContent(
            `Extracted from ${file.name}:\n\n1. Key Insight: Automating social carousel design saves founders 10+ hours per week.\n2. Visual Hook: 4:5 vertical frames maximize mobile screen real estate.\n3. Brand Trust: High contrast typography and consistent colors drive 3x higher profile visits.`
          );
          toast.success(`Parsed ${file.name}`);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Social Media Format Image Upload Handler (Supports multiple images, format & platform detection)
  const handleMediaUpload = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (!files.length) return;

    const imageFiles = files.filter(
      (f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(f.name)
    );
    const docFiles = files.filter((f) => /\.(pdf|docx?|txt|md)$/i.test(f.name));

    if (imageFiles.length === 0 && docFiles.length > 0) {
      handleDocumentFile(docFiles[0]);
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Please upload social media image files (PNG, JPG, WebP, GIF) or document files.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const analyzedPromises = imageFiles.map((file) => {
        return new Promise<UploadedSocialImage>((resolve) => {
          const url = URL.createObjectURL(file);
          const img = new window.Image();
          const sizeStr =
            file.size > 1024 * 1024
              ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
              : Math.round(file.size / 1024) + " KB";
          const ext = file.name.slice(file.name.lastIndexOf(".")).replace(".", "").toUpperCase() || "IMAGE";

          img.onload = () => {
            const w = img.naturalWidth || 1080;
            const h = img.naturalHeight || 1350;
            const { matchedRatio, aspectRatioStr, platforms } = computePlatformCompatibility(w, h);
            resolve({
              id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              name: file.name,
              url,
              sizeStr,
              typeStr: ext,
              width: w,
              height: h,
              aspectRatioStr,
              matchedRatio,
              compatiblePlatforms: platforms,
            });
          };
          img.onerror = () => {
            const { matchedRatio, aspectRatioStr, platforms } = computePlatformCompatibility(1080, 1350);
            resolve({
              id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              name: file.name,
              url,
              sizeStr,
              typeStr: ext,
              width: 1080,
              height: 1350,
              aspectRatioStr,
              matchedRatio,
              compatiblePlatforms: platforms,
            });
          };
          img.src = url;
        });
      });

      const analyzedList = await Promise.all(analyzedPromises);
      setUploadProgress(85);
      setUploadedSocialImages(analyzedList);

      // Primary image detection
      const primary = analyzedList[0];
      setAspectRatio(primary.matchedRatio);
      if (primary.matchedRatio === "4:5") setSelectedPlatformId("instagram");
      else if (primary.matchedRatio === "9:16") setSelectedPlatformId("tiktok");
      else if (primary.matchedRatio === "16:9") setSelectedPlatformId("x");
      else setSelectedPlatformId("instagram");

      // Auto-populate slides deck:
      // First image is the main active slide (index 0)
      // All other images are in the slides below!
      const newDeck: SlideData[] = analyzedList.map((item, index) => ({
        id: `slide_${Date.now()}_${index}`,
        type: index === 0 ? "cover" : "content",
        label: index === 0 ? "COVER" : `SLIDE ${index + 1}`,
        emoji: index === 0 ? "📸" : "✨",
        title: index === 0 ? item.name.replace(/\.[^/.]+$/, "") : `Slide ${index + 1}`,
        body: "",
        image: item.url,
        imageFit: "cover",
      }));

      setSlides(newDeck);
      setCurrentSlideIndex(0);
      recordHistory(newDeck);
      setProjectTitle(primary.name.replace(/\.[^/.]+$/, "") || "Social Media Carousel");
      setUploadProgress(100);
      setIsUploading(false);

      const optimalNames = primary.compatiblePlatforms
        .filter((p) => p.isOptimal)
        .map((p) => p.name)
        .join(", ");

      toast.success(
        `Detected ${primary.aspectRatioStr} (${primary.width}×${primary.height})! Loaded ${newDeck.length} image(s). Optimal for: ${optimalNames || "Social Media"}.`
      );
    } catch (err) {
      setIsUploading(false);
      toast.error("Failed to process images");
    }
  };

  const handleSingleSlideImageUpload = (file: File, targetIndex = currentSlideIndex) => {
    if (!file.type.startsWith("image/") && !/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)) {
      toast.error("Please choose a valid image (PNG, JPG, WebP, GIF)");
      return;
    }
    const url = URL.createObjectURL(file);
    const next = [...slides];
    if (next[targetIndex]) {
      next[targetIndex] = {
        ...next[targetIndex],
        image: url,
        imageFit: activeImageFit,
      };
      setSlides(next);
      recordHistory(next);
      toast.success(`Image attached to slide ${targetIndex + 1}`);
    }
  };

  const handleAddImageSlide = (file: File) => {
    if (!file.type.startsWith("image/") && !/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)) {
      toast.error("Please choose a valid image");
      return;
    }
    const url = URL.createObjectURL(file);
    const newSlide: SlideData = {
      id: `slide_${Date.now()}`,
      type: "content",
      label: `SLIDE ${slides.length + 1}`,
      emoji: "📸",
      title: file.name.replace(/\.[^/.]+$/, ""),
      body: "",
      image: url,
      imageFit: activeImageFit,
    };
    const next = [...slides, newSlide];
    setSlides(next);
    setCurrentSlideIndex(next.length - 1);
    recordHistory(next);
    toast.success(`Added slide ${next.length} with image`);
  };

  // Real URL Fetch Handler - calls /api/extract-url
  const handleFetchUrl = async (targetUrl?: string) => {
    const raw = typeof targetUrl === "string" ? targetUrl : webUrl;
    const trimmed = raw.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setWebUrl(trimmed);
    setIsFetchingUrl(true);
    toast.loading("Fetching article content and images...", { id: "url-fetch" });
    try {
      const res = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract content from web URL.");
      }

      setExtractedSource(data);
      if (data.title) setProjectTitle(data.title);
      if (data.text) {
        setRawContent(data.text);
        setViewSourceText(data.text);
      }
      if (data.image) {
        setUseHeroOnCover(true);
      }

      // Immediately populate slide 0 with extracted article hero content matching Swipera
      if (slides.length > 0) {
        const next = [...slides];
        const summarySnippet = data.description || (data.text ? data.text.split("\n\n")[0]?.slice(0, 140) : "");
        next[0] = {
          ...next[0],
          title: data.title || next[0].title || "Web Article",
          body: summarySnippet || next[0].body || "",
          image: data.image || next[0].image,
          label: "FIND",
          type: "cover",
        };
        setSlides(next);
        recordHistory(next);
        setSelectedTemplateId("hero");
      }

      toast.success(`Article extracted! (${(data.words || 0).toLocaleString()} words)`, { id: "url-fetch" });
    } catch (e: any) {
      toast.error(e.message || "An error occurred while fetching the article.", { id: "url-fetch" });
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleClearExtractedSource = () => {
    setExtractedSource(null);
    setRawContent("");
    setViewSourceText("");
    setWebUrl("");
    toast.info("Extracted source cleared.");
  };

  const handleSaveViewSourceText = () => {
    setRawContent(viewSourceText);
    if (extractedSource) {
      const wordCount = (viewSourceText.match(/[\p{L}\p{N}]+/gu) || []).length;
      setExtractedSource({
        ...extractedSource,
        text: viewSourceText,
        words: wordCount,
      });
    }
    setIsViewSourceModalOpen(false);
    toast.success("Source text updated and applied.");
  };

  // Finished Examples Loader
  const handleSelectExample = (example: any) => {
    if (!example || !example.slides) return;
    setSlides(
      example.slides.map((s: any, idx: number) => ({
        ...s,
        id: s.id || `slide-${Date.now()}-${idx}`,
        items: s.items || [],
        stat: s.stat || "",
        type: s.type || (idx === 0 ? "cover" : idx === example.slides.length - 1 ? "cta" : "content"),
      }))
    );
    setCurrentSlideIndex(0);
    if (example.template) {
      setSelectedTemplateId(example.template);
    }
    if (typeof example.scheme === "number") {
      setSelectedSchemeIndex(example.scheme);
    }
    setProjectTitle(example.name || "Sample carousel");
    setRawContent(example.slides.map((s: any) => `${s.title}: ${s.body}`).join("\n"));
    setIsExamplesModalOpen(false);
    toast.success(
      language === "ko"
        ? `예시를 불러왔습니다: ${example.name}`
        : `Loaded example: ${example.name}. Click any text to customize.`
    );
  };

  // Direct Generation from Idea Item Card / Detail Reader
  const handleGenerateCarouselFromIdea = async (item: any, theme?: string) => {
    const chosenTheme = theme || "futuretech";
    setProjectTitle(item.title);
    setRawContent(`${item.title}\n\n${item.excerpt || ""}\n\nSource: ${item.url}`);
    setSelectedTemplateId(chosenTheme);

    toast.loading(`Crafting ${chosenTheme.toUpperCase()} faceless carousel...`, { id: "faceless-gen" });
    setIsGenerating(true);

    try {
      const res = await fetch("/api/carousel/faceless-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          excerpt: item.excerpt,
          url: item.url,
          theme: chosenTheme,
          brandHandle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.slides && data.slides.length > 0) {
          setSlides(data.slides);
          setCurrentSlideIndex(0);
          recordHistory(data.slides);
        }
      }
    } catch (e) {
      console.warn("Faceless generation error, using fallback deck", e);
    } finally {
      setIsGenerating(false);
      toast.success("Faceless Carousel ready in editor!", { id: "faceless-gen" });
      setActiveTab("create");
    }
  };

  // Schedule to Calendar action directly from Design / Studio Canvas
  const handleSendToSchedule = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const captionText = `${projectTitle}\n\n${slides
      .map((s, i) => `${i + 1}. ${s.title}: ${s.body}`)
      .join("\n\n")}\n\nFollow ${brandHandle} for daily high-signal tech breakdowns.\n\n#TechNews #AI #FutureTech #DevTools`;

    try {
      toast.loading("Scheduling deck to Content Calendar...", { id: "sched-toast" });
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          content: captionText,
          rawThreads: slides,
          mediaUrls: [],
          platforms: ["instagram", "x", "linkedin", "threads"],
          status: "SCHEDULED",
          scheduledAt: tomorrow.toISOString(),
        }),
      });

      if (res.ok) {
        toast.success("Post scheduled for tomorrow at 10:00 AM!", {
          id: "sched-toast",
          action: {
            label: "View Calendar",
            onClick: () => handleNavSelect("calendar"),
          },
        });

        // Track style memory for this niche and template
        try {
          await fetch("/api/automations/daily-pipeline/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              styleMemory: {
                detectedNiche: "Tech & AI Breakthroughs",
                favoriteTemplate: selectedTemplateId,
                postCountInNiche: 2,
                promptToAutomateShown: true,
                userAcceptedAutomation: false,
              },
            }),
          });
        } catch {
          // ignore
        }
      } else {
        toast.error("Failed to schedule post", { id: "sched-toast" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule", { id: "sched-toast" });
    }
  };

  // AI Generation trigger with multi-stage progress and visual asset matching
  const handleGenerateCarousel = async () => {
    if (!rawContent.trim()) {
      toast.error("Please enter some text, upload a document, or paste a web URL.");
      return;
    }
    setIsGenerating(true);
    setGenStageText("Analyzing content & core takeaways...");
    toast.loading("Swipera AI is architecting slides...", { id: "gen-toast" });

    const timer1 = setTimeout(() => {
      setGenStageText("Structuring slide narrative & hooks...");
    }, 1200);
    const timer2 = setTimeout(() => {
      setGenStageText("Matching design styles & visuals...");
    }, 2500);

    try {
      const res = await fetch("/api/carousel/faceless-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle || extractedSource?.title || "Social Carousel",
          excerpt: rawContent,
          url: webUrl || extractedSource?.url || "",
          theme: selectedTemplateId || "brutalism",
          brandHandle,
          focus: focusAngle,
          slideCount: slideCountOpt,
          language: contentLanguage,
          goal: goalOpt,
          tone: toneOpt,
          audience: targetAudience,
          density: textDensity,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.ok) {
        const data = await res.json();
        let newSlides: SlideData[] = data.slides || [];
        if (newSlides.length > 0) {
          // If hero image on cover is active and we have an image
          if (useHeroOnCover && extractedSource?.image && newSlides[0]) {
            newSlides[0].image = extractedSource.image;
          }

          // If autoPlaceImages is active and we have extra extracted images
          if (autoPlaceImages && extractedSource?.images && extractedSource.images.length > 1) {
            const extraImgs = extractedSource.images.filter(
              (img) => img.url !== extractedSource.image
            );
            let imgIdx = 0;
            for (let i = 1; i < newSlides.length && imgIdx < extraImgs.length; i++) {
              if (!newSlides[i].image && newSlides[i].type !== "cta") {
                newSlides[i].image = extraImgs[imgIdx].url;
                imgIdx++;
              }
            }
          }

          setSlides(newSlides);
          setCurrentSlideIndex(0);
          recordHistory(newSlides);

          // Generate caption in background so caption tab is immediately populated
          fetch("/api/caption", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slides: newSlides, platform: selectedPlatformId }),
          })
            .then((r) => r.json())
            .then((cData) => {
              if (cData.caption) setCaptionText(cData.caption);
              if (cData.hashtags && Array.isArray(cData.hashtags)) {
                setHashtagText(cData.hashtags.join(" "));
              }
            })
            .catch(() => {});

          toast.success("Carousel created successfully!", { id: "gen-toast" });
          setActiveTab("templates");
          return;
        }
      }
    } catch (e) {
      console.warn("Generation error, fallback to deck generator", e);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      setGenStageText("Generate with AI");
    }

    // High fidelity fallback deck
    const lines = rawContent.split("\n").filter((l) => l.trim().length > 0);
    const headline = lines[0] || (projectTitle || "High-Converting Social Carousel Blueprint");
    const newDeck: SlideData[] = [
      {
        id: `slide_gen_1`,
        type: "cover",
        label: "SUMMARY",
        emoji: "✨",
        title: headline,
        body: lines[1] || "The actionable blueprint to master this topic in under 60 seconds.",
        image: useHeroOnCover && extractedSource?.image ? extractedSource.image : undefined,
        items: ["Stop the scroll", "Bite-sized high-retention cards", "Save & share with your team"],
      },
      {
        id: `slide_gen_2`,
        type: "content",
        label: "POINT 01",
        emoji: "⚡",
        title: lines[2] || "Deliver undeniable value in the first 3 seconds.",
        body: lines[3] || "Readers decide whether to swipe within 1 second. Provide an immediate curiosity-inducing benefit.",
      },
      {
        id: `slide_gen_3`,
        type: "list",
        label: "POINT 02",
        emoji: "📈",
        title: "The 3-Step Execution Framework",
        body: "Follow this high-conversion sequence for maximum impact:",
        items: [
          lines[4] || "Define the core friction point clearly",
          lines[5] || "Deliver an actionable tactical resolution",
          lines[6] || "Provide a save-worthy checklist summary",
        ],
      },
      {
        id: `slide_gen_4`,
        type: "cta",
        label: "SAVE & SHARE",
        emoji: "🚀",
        title: "Found this helpful? Save it for later.",
        body: "Bookmark this post to reference during your next sprint, and share it with someone who needs it today.",
      },
    ];
    setSlides(newDeck);
    setCurrentSlideIndex(0);
    recordHistory(newDeck);
    toast.success("Carousel created successfully!", { id: "gen-toast" });
    setActiveTab("templates");
  };

  // Caption Generator & Copy Handlers
  const handleRegenerateCaption = async () => {
    setIsRegeneratingCaption(true);
    toast.loading("Generating social caption & hashtags...", { id: "cap-gen" });
    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides,
          platform: captionPlatform || selectedPlatformId,
        }),
      });
      const data = await res.json();
      if (data.caption) setCaptionText(data.caption);
      if (data.hashtags && Array.isArray(data.hashtags)) {
        setHashtagText(data.hashtags.join(" "));
      }
      toast.success("New caption generated!", { id: "cap-gen" });
    } catch {
      toast.error("Failed to generate caption.", { id: "cap-gen" });
    } finally {
      setIsRegeneratingCaption(false);
    }
  };

  const handleCopyCaption = () => {
    const combined = `${captionText}\n\n${hashtagText}`.trim();
    if (!combined) {
      toast.error("No caption available to copy.");
      return;
    }
    navigator.clipboard.writeText(combined);
    toast.success("Caption & hashtags copied to clipboard!");
  };

  // Filter templates list
  const filteredTemplates = useMemo(() => {
    const list = swiperaTemplatesData as any[];
    if (templateFilter === "all") return list;
    return list.filter((t) => t.category === templateFilter || t.tags?.includes(templateFilter));
  }, [templateFilter]);

  // Filter examples list
  const filteredExamples = useMemo(() => {
    const list = swiperaExamplesData as any[];
    if (selectedExampleCategory === "all") return list;
    return list.filter((ex) => ex.cat === selectedExampleCategory);
  }, [selectedExampleCategory]);

  // Filter fonts list
  const filteredFonts = useMemo(() => {
    const list = swiperaFontsData as any[];
    if (fontCategoryFilter === "all") return list;
    if (fontCategoryFilter === "kr") return list.filter((f) => f.lang === "ko");
    return list.filter((f) => f.kind === fontCategoryFilter);
  }, [fontCategoryFilter]);

  // Rail navigation handler (Idea, Create, Style, Video, Design, Calendar) - 0-flicker instant switching
  const handleNavSelect = (tab: StudioTab) => {
    setActiveTab(tab);
    const targetPath =
      tab === "pipeline"
        ? "/pipelines"
        : tab === "ideas"
        ? "/ideas"
        : tab === "calendar"
        ? "/calendar"
        : "/studio";
    if (typeof window !== "undefined" && window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p.startsWith("/pipelines")) setActiveTab("pipeline");
      else if (p.startsWith("/ideas")) setActiveTab("ideas");
      else if (p.startsWith("/calendar") || p.startsWith("/schedule")) setActiveTab("calendar");
      else setActiveTab("create");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Authentic Swipera Studio Create Tab: 4 Source Modes (URL, Text, File, Manual)
  const renderCreateContent = (panelSide: "left" | "right" = "left") => {
    const primaryImg = uploadedSocialImages[0];

    return (
      <div className="space-y-4 animate-in fade-in duration-150">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="panel-title text-base font-extrabold tracking-tight text-[var(--fg)]">
              {sourceMode === "manual" ? "Social Media Image Carousel" : "Turn Content into a Carousel"}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (panelSide === "right") {
                  setIsInspectorOpen(false);
                } else {
                  setIsLeftPanelCollapsed(true);
                }
              }}
              className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
              title="Collapse panel"
            >
              {panelSide === "right" ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
          </div>
          <p className="panel-desc text-xs text-[var(--muted)] mt-0.5">
            {sourceMode === "manual"
              ? "Upload social media images (4:5, 1:1, 9:16) and assemble slides."
              : "Generate high-converting social slides from text notes, web articles, or documents."}
          </p>
        </div>

        {/* 4-Source Mode Segmented Switcher (#src-mode) */}
        <div id="src-mode" className="flex p-0.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] w-full overflow-hidden">
          {[
            { id: "url", label: "Web URL", icon: "fa-globe" },
            { id: "text", label: "Text", icon: "fa-pen-to-square" },
            { id: "file", label: "PDF / Doc", icon: "fa-file-lines" },
            { id: "manual", label: "Images", icon: "fa-images" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSourceMode(mode.id as any)}
              className={cn(
                "flex-1 min-w-0 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate",
                sourceMode === mode.id
                  ? "bg-[#c6f432] text-[#141414] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              )}
              title={mode.label}
            >
              <i className={cn("fas", mode.icon, "text-[10px] shrink-0")} />
              <span className="truncate">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* =========================================================================
            1. WEB URL SOURCE MODE (#src-url)
            ========================================================================= */}
        {sourceMode === "url" && (
          <div id="src-url" className="space-y-2.5 animate-in fade-in duration-150">
            {/* Clean URL Input Bar matching Swipera */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--fg)] block">
                Web Article or Blog URL
              </label>
              <div className="flex gap-1.5">
                <div className="relative flex-1 min-w-0">
                  <input
                    id="src-url-input"
                    type="url"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    onPaste={(e) => {
                      const pasted = (e.clipboardData || (window as any).clipboardData)?.getData("text") || "";
                      if (/^https?:\/\/\S+$/i.test(pasted.trim())) {
                        setWebUrl(pasted.trim());
                        setTimeout(() => handleFetchUrl(pasted.trim()), 50);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFetchUrl();
                      }
                    }}
                    placeholder="https://example.com/article..."
                    className="field text-xs pl-7 pr-7 h-9 w-full"
                  />
                  <i className="fas fa-link absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]" />
                  {webUrl && (
                    <button
                      type="button"
                      onClick={() => setWebUrl("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  id="btn-fetch-url"
                  type="button"
                  disabled={isFetchingUrl || !webUrl.trim()}
                  onClick={() => handleFetchUrl()}
                  className="btn-sm btn-primary h-9 px-3 shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  title="Extract text and images from web page"
                >
                  {isFetchingUrl ? (
                    <i className="fas fa-circle-notch fa-spin text-xs" />
                  ) : (
                    <i className="fas fa-download text-xs" />
                  )}
                  <span className="text-xs font-bold">{isFetchingUrl ? "Extracting..." : "Fetch"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[var(--muted)] mt-1.5 leading-relaxed">
                Paste any news, blog, or article URL to automatically extract content and media.
              </p>
            </div>

            {/* Extracted Source Preview Card (#src-card) */}
            {extractedSource && (
              <div id="src-card" className="p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div id="src-thumb" className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--panel)] border border-[var(--line)] shrink-0 flex items-center justify-center">
                    {extractedSource.image ? (
                      <img
                        src={`/api/proxy-image?url=${encodeURIComponent(extractedSource.image)}`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <i className="fas fa-globe text-lg text-[var(--muted)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div id="src-title" className="text-xs font-black text-[var(--fg)] line-clamp-2 leading-snug">
                      {extractedSource.title || "Web Article"}
                    </div>
                    <div id="src-meta" className="text-[10px] text-[var(--muted)] mt-1 truncate">
                      {[
                        extractedSource.siteName,
                        extractedSource.published ? new Date(extractedSource.published).toLocaleDateString() : null,
                        `${(extractedSource.words || 0).toLocaleString()} words`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        id="btn-src-view"
                        type="button"
                        onClick={() => setIsViewSourceModalOpen(true)}
                        className="text-[11px] text-[#365300] dark:text-[#c6f432] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fas fa-file-lines text-[10px]" />
                        <span>View / Edit Source</span>
                      </button>
                      <button
                        id="btn-src-clear"
                        type="button"
                        onClick={handleClearExtractedSource}
                        className="text-[11px] text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <i className="fas fa-xmark text-[10px]" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cover Image Toggle */}
                <label id="src-image-toggle-wrap" className="flex items-center gap-2 p-2 rounded-lg bg-[var(--panel)] border border-[var(--line)] cursor-pointer text-xs font-bold text-[var(--fg)]">
                  <input
                    id="src-use-image"
                    type="checkbox"
                    checked={useHeroOnCover}
                    onChange={(e) => setUseHeroOnCover(e.target.checked)}
                    className="accent-[#c6f432] w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Put hero image on cover slide</span>
                </label>

                {/* Extracted Images Gallery (#src-gallery-wrap) */}
                {extractedSource.images && extractedSource.images.length > 0 && (
                  <div id="src-gallery-wrap" className="space-y-2 pt-1 border-t border-[var(--line)]">
                    <div className="flex items-center justify-between text-xs">
                      <span id="src-gallery-count" className="font-bold text-[var(--muted)]">
                        Extracted Images ({extractedSource.images.length})
                      </span>
                      <button
                        id="btn-src-gallery"
                        type="button"
                        onClick={() => setIsGalleryModalOpen(true)}
                        className="text-[10px] text-[#365300] dark:text-[#c6f432] font-bold hover:underline cursor-pointer"
                      >
                        View All &rarr;
                      </button>
                    </div>
                    <div id="src-gallery" className="grid grid-cols-4 gap-1.5 max-h-[110px] overflow-y-auto p-1 rounded-lg bg-[var(--panel)]">
                      {extractedSource.images.slice(0, 8).map((img, i) => {
                        const isCover = img.url === extractedSource.image;
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              updateCurrentSlide({ image: img.url });
                              toast.success(`Applied image to slide ${currentSlideIndex + 1}!`);
                            }}
                            className={cn(
                              "aspect-[4/3] rounded-md overflow-hidden relative cursor-pointer border transition-all group",
                              isCover ? "border-[#c6f432] ring-1 ring-[#c6f432]" : "border-[var(--line)] opacity-85 hover:opacity-100"
                            )}
                            title={img.alt || `Image ${i + 1}`}
                          >
                            <img
                              src={`/api/proxy-image?url=${encodeURIComponent(img.url)}`}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isCover && (
                              <span className="absolute top-0.5 left-0.5 text-[8px] font-bold px-1 rounded bg-[#c6f432] text-black">
                                COVER
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <label className="flex items-center gap-2 pt-0.5 text-[11px] font-semibold cursor-pointer text-[var(--muted)] hover:text-[var(--fg)]">
                      <input
                        id="src-auto-images"
                        type="checkbox"
                        checked={autoPlaceImages}
                        onChange={(e) => setAutoPlaceImages(e.target.checked)}
                        className="accent-[#c6f432] w-3.5 h-3.5 rounded cursor-pointer"
                      />
                      <span>Auto-place images across slides</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            2. TEXT SOURCE MODE (#src-text)
            ========================================================================= */}
        {sourceMode === "text" && (
          <div id="src-text" className="space-y-3 animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--fg)]">
                  Prompt or Raw Text
                </label>
                <span id="char-count" className="text-[10px] text-[var(--muted)] font-mono">
                  {rawContent.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                id="content-input"
                rows={6}
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                onPaste={(e) => {
                  const pasted = (e.clipboardData || (window as any).clipboardData)?.getData("text")?.trim() || "";
                  if (/^https?:\/\/\S+$/i.test(pasted) && !rawContent.trim()) {
                    e.preventDefault();
                    setSourceMode("url");
                    setWebUrl(pasted);
                    setTimeout(() => handleFetchUrl(pasted), 50);
                  }
                }}
                placeholder="Paste your ideas, articles, notes, or transcript to generate carousel slides..."
                className="field text-xs resize-none leading-relaxed p-3"
              />
            </div>

            {/* Sample Prompts Chips (#sample-prompts) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[var(--muted)] flex items-center justify-between">
                <span>Sample Inspiration Prompts</span>
                <span className="text-[10px] font-mono text-[var(--muted)]">Click to insert</span>
              </div>
              <div id="sample-prompts" className="flex flex-wrap gap-1.5">
                {SWIPERA_SAMPLE_PROMPTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setRawContent(s.text);
                      setProjectTitle(s.label);
                      toast.success(`Inserted sample: ${s.label}`);
                    }}
                    className="chip text-[11px] py-1 px-2.5 rounded-full border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--muted)] cursor-pointer transition-all flex items-center gap-1"
                  >
                    <i className="fas fa-bolt text-[10px] text-amber-500" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. FILE SOURCE MODE (#src-file)
            ========================================================================= */}
        {sourceMode === "file" && (
          <div id="src-file" className="space-y-3 animate-in fade-in duration-150">
            <input
              id="src-file-input"
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={(e) => {
                if (e.target.files?.[0]) handleDocumentFile(e.target.files[0]);
              }}
              className="hidden"
            />

            {uploadedDoc ? (
              <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#c6f432]/20 text-[#365300] dark:text-[#c6f432] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--fg)] truncate">{uploadedDoc.name}</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">
                      {uploadedDoc.size} · {uploadedDoc.type}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedDoc(null);
                    setRawContent("");
                  }}
                  className="p-1 hover:text-red-500 text-[var(--muted)] transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="file-drop"
                type="button"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverFile(true);
                }}
                onDragLeave={() => setIsDragOverFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverFile(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleDocumentFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => document.getElementById("src-file-input")?.click()}
                className={cn(
                  "w-full py-6 px-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group",
                  isDragOverFile
                    ? "border-[#c6f432] bg-[#c6f432]/10"
                    : "border-[var(--line)] hover:border-[#c6f432] bg-[var(--bg)]"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-[var(--fg)] shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <FileUp className="w-5 h-5 text-[#365300] dark:text-[#c6f432]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--fg)]">
                    {isDragOverFile ? "Drop document here" : "Upload document (PDF, Word, TXT, MD)"}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">Click or drag file to upload (up to 20MB)</div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* =========================================================================
            4. MANUAL SOCIAL IMAGES MODE (#src-manual)
            ========================================================================= */}
        {sourceMode === "manual" && (
          <div className="space-y-4 animate-in fade-in duration-150 w-full min-w-0 max-w-full overflow-hidden">
            <input
              id={panelSide === "left" ? "manual-file-input" : "manual-file-input-right"}
              type="file"
              multiple
              accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.svg"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleMediaUpload(e.target.files);
                }
              }}
              className="hidden"
            />

            <button
              type="button"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverFile(true);
              }}
              onDragLeave={() => setIsDragOverFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverFile(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleMediaUpload(e.dataTransfer.files);
                }
              }}
              onClick={() =>
                document
                  .getElementById(panelSide === "left" ? "manual-file-input" : "manual-file-input-right")
                  ?.click()
              }
              className={cn(
                "w-full py-4 px-3 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all flex items-center justify-center gap-3 group",
                isDragOverFile
                  ? "border-[#c6f432] bg-[#c6f432]/10"
                  : "border-[var(--line)] hover:border-[#c6f432] bg-[var(--bg)]"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--panel)] border border-[var(--line)] flex items-center justify-center text-[var(--fg)] shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Upload className="w-5 h-5 text-[#365300] dark:text-[#c6f432]" />
              </div>
              <div className="text-left min-w-0 flex-1 truncate">
                <div className="text-xs font-black text-[var(--fg)] flex items-center gap-1.5 truncate">
                  <span className="truncate">{isDragOverFile ? "Drop images here" : "Upload Social Media Images"}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#c6f432] text-black font-bold shrink-0">
                    Multi-select
                  </span>
                </div>
                <div className="text-[10px] text-[var(--muted)] leading-tight mt-0.5 truncate">
                  Supports PNG, JPG, WebP, GIF • 1-20 slides
                </div>
              </div>
            </button>

            {primaryImg && (
              <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-[var(--fg)]">Detected Format</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#c6f432] text-black">
                    {primaryImg.aspectRatioStr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--line)]">
                    <div className="text-[10px] text-[var(--muted)] font-mono">Resolution</div>
                    <div className="text-xs font-bold text-[var(--fg)] mt-0.5">
                      {primaryImg.width} × {primaryImg.height}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--panel)] border border-[var(--line)]">
                    <div className="text-[10px] text-[var(--muted)] font-mono">Total Uploaded</div>
                    <div className="text-xs font-bold text-[var(--fg)] mt-0.5">
                      {uploadedSocialImages.length} slides
                    </div>
                  </div>
                </div>

                {/* Uploaded Images Strip */}
                <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)]">
                    <span>Uploaded Slides ({uploadedSocialImages.length})</span>
                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById(panelSide === "left" ? "manual-file-input" : "manual-file-input-right")
                          ?.click()
                      }
                      className="text-[10px] text-[#365300] dark:text-[#c6f432] hover:underline cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Upload More</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto p-1 rounded-lg bg-[var(--panel)]">
                    {uploadedSocialImages.map((img, i) => (
                      <div
                        key={img.id}
                        onClick={() => setCurrentSlideIndex(i)}
                        className={cn(
                          "aspect-square rounded-md overflow-hidden relative cursor-pointer border transition-all group",
                          currentSlideIndex === i
                            ? "border-[#c6f432] ring-2 ring-[#c6f432]/40"
                            : "border-[var(--line)] opacity-80 hover:opacity-100"
                        )}
                        title={`Slide ${i + 1}: ${img.name}`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 text-[8px] font-mono font-bold px-1 rounded bg-black/70 text-white">
                          {i === 0 ? "COVER" : i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            AI GENERATION & PLATFORM OPTIONS (Rendered for URL, Text, and File modes)
            ========================================================================= */}
        {sourceMode !== "manual" && (
          <div className="space-y-3.5 pt-1">
            {/* Finished Examples Starter Button (.ex-entry) - ALWAYS VISIBLE */}
            <button
              type="button"
              id="btn-examples"
              onClick={() => setIsExamplesModalOpen(true)}
              className="ex-entry flex items-center gap-3 w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:border-[#365300] dark:hover:border-[#c6f432] hover:bg-[var(--hover)] text-left transition-all cursor-pointer group shadow-xs mb-1"
            >
              <div className="w-8 h-8 rounded-lg bg-[#c6f432] text-[#141414] grid place-items-center text-sm shrink-0 font-bold">
                <i className="fas fa-images text-xs" />
              </div>
              <div className="flex flex-col min-w-0 flex-1 leading-snug">
                <b className="text-xs font-extrabold text-[var(--fg)] group-hover:text-[#365300] dark:group-hover:text-[#c6f432] transition-colors">
                  {language === "ko" ? "완성 예시에서 시작하기" : "Start from a finished example"}
                </b>
                <small className="text-[11px] text-[var(--muted)]">
                  {language === "ko" ? "업종별 25종 · 글자만 바꾸면 끝" : "25 by industry · just swap the words"}
                </small>
              </div>
              <i className="fas fa-chevron-right text-[10px] text-[var(--muted)] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Target Platform Selector (#opt-platform) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--fg)]">Target Social Platform</span>
                <span className="text-[10px] text-[var(--muted)] font-mono">
                  {selectedPlatformId === "tiktok" ? "9:16 · Rec. 5~10 slides" : selectedPlatformId === "x" ? "16:9 · Rec. 2~4 slides" : "4:5 · Rec. 6~10 slides"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5" role="radiogroup">
                {[
                  { id: "instagram", name: "Instagram", icon: "fa-brands fa-instagram", color: "#E1306C", ratio: "4:5" },
                  { id: "threads", name: "Threads", icon: "fa-brands fa-threads", color: "#000000", ratio: "4:5" },
                  { id: "linkedin", name: "LinkedIn", icon: "fa-brands fa-linkedin-in", color: "#0A66C2", ratio: "4:5" },
                  { id: "tiktok", name: "TikTok", icon: "fa-brands fa-tiktok", color: "#000000", ratio: "9:16" },
                  { id: "facebook", name: "Facebook", icon: "fa-brands fa-facebook-f", color: "#1877F2", ratio: "1:1" },
                  { id: "x", name: "X", icon: "fa-brands fa-x-twitter", color: "#000000", ratio: "16:9" },
                ].map((plat) => {
                  const isSelected = selectedPlatformId === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatformId(plat.id as any);
                        setAspectRatio(plat.ratio as any);
                        setCaptionPlatform(plat.id);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                        isSelected
                          ? "border-[#c6f432] bg-[#c6f432]/10 text-[var(--fg)] shadow-xs"
                          : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--muted)]"
                      )}
                    >
                      <i className={cn(plat.icon, "text-xs shrink-0")} style={{ color: isSelected ? undefined : plat.color }} />
                      <span className="truncate text-[11px] font-bold">{plat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Options Accordion */}
            <div className="border border-[var(--line)] rounded-xl bg-[var(--bg)] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsAdvOptsOpen(!isAdvOptsOpen)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-sliders text-[11px] text-[var(--muted)]" />
                  <span>Advanced Options (Tone, Slide Count, Goal)</span>
                </span>
                <i className={cn("fas text-[10px] text-[var(--muted)] transition-transform", isAdvOptsOpen ? "fa-chevron-up" : "fa-chevron-down")} />
              </button>

              {isAdvOptsOpen && (
                <div className="p-3 pt-1 space-y-3 border-t border-[var(--line)]">
                  <label className="lbl">
                    <span>Focus / Angle (Optional)</span>
                    <input
                      type="text"
                      value={focusAngle}
                      onChange={(e) => setFocusAngle(e.target.value)}
                      placeholder="e.g. Emphasize pricing & launch date, strong 3s hook"
                      className="field text-xs"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="lbl">
                      <span>Slide Count</span>
                      <select
                        value={slideCountOpt}
                        onChange={(e) => setSlideCountOpt(e.target.value)}
                        className="field text-xs font-medium"
                      >
                        <option value="auto">Auto (Fits content)</option>
                        <option value="4">4 slides</option>
                        <option value="5">5 slides</option>
                        <option value="6">6 slides (Recommended)</option>
                        <option value="7">7 slides</option>
                        <option value="8">8 slides</option>
                        <option value="10">10 slides</option>
                      </select>
                    </label>

                    <label className="lbl">
                      <span>Content Language</span>
                      <select
                        value={contentLanguage}
                        onChange={(e) => setContentLanguage(e.target.value as any)}
                        className="field text-xs font-medium"
                      >
                        <option value="en">English</option>
                        <option value="ko">한국어 (Korean)</option>
                        <option value="ja">日本語 (Japanese)</option>
                        <option value="es">Español (Spanish)</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="lbl">
                      <span>Goal</span>
                      <select
                        value={goalOpt}
                        onChange={(e) => setGoalOpt(e.target.value)}
                        className="field text-xs font-medium"
                      >
                        <option value="Informative Breakdown">Informative Breakdown</option>
                        <option value="Actionable Tips & Hacks">Actionable Tips & Hacks</option>
                        <option value="Storytelling & Relatable">Storytelling & Relatable</option>
                        <option value="Viral & Engagement">Viral & Engagement</option>
                      </select>
                    </label>

                    <label className="lbl">
                      <span>Tone</span>
                      <select
                        value={toneOpt}
                        onChange={(e) => setToneOpt(e.target.value)}
                        className="field text-xs font-medium"
                      >
                        <option value="Clear & Engaging">Clear & Engaging</option>
                        <option value="Professional & Authoritative">Professional & Authoritative</option>
                        <option value="Bold & Confident">Bold & Confident</option>
                        <option value="Witty & Humorous">Witty & Humorous</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="lbl">
                      <span>Text Density</span>
                      <select
                        value={textDensity}
                        onChange={(e) => setTextDensity(e.target.value as any)}
                        className="field text-xs font-medium"
                      >
                        <option value="short">Concise (Bite-sized)</option>
                        <option value="normal">Balanced (Recommended)</option>
                        <option value="detailed">Detailed (Deep dive)</option>
                      </select>
                    </label>

                    <label className="lbl">
                      <span>Story Framework</span>
                      <select
                        value={storyStructure}
                        onChange={(e) => setStoryStructure(e.target.value)}
                        className="field text-xs font-medium"
                      >
                        <option value="auto">Auto Optimize</option>
                        <option value="hook-problem-solution">Hook - Problem - Solution</option>
                        <option value="listicle">Listicle / Checklist</option>
                        <option value="before-after">Before & After</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* AI Generation Action Button (#btn-generate) */}
            <button
              id={panelSide === "left" ? "btn-generate" : "btn-generate-right"}
              type="button"
              disabled={isGenerating || !rawContent.trim()}
              onClick={handleGenerateCarousel}
              className="w-full mt-2 h-11 rounded-xl bg-[#c6f432] hover:brightness-95 text-[#141414] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                  <span>{genStageText}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <link rel="stylesheet" href="/swipera/studio-style.css" />
      <link rel="stylesheet" href="/swipera/templates.css" />
      <div className="flex flex-col h-screen w-full bg-[var(--bg)] text-[var(--fg)] font-sans antialiased overflow-hidden select-none">
        {/* =========================================================================
            1. TOPBAR (#topbar, 56px / h-14)
            ========================================================================= */}
        <header
          id="topbar"
          className="h-14 flex-shrink-0 bg-[var(--panel)] border-b border-[var(--line)] px-3.5 flex items-center justify-between z-30 select-none"
          data-purpose="studio-topbar"
        >
          {/* Left Region: Logo, Brand, Breadcrumb, Inline Title, Cloud Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 group flex-shrink-0"
              title="Return to Swipera Home"
            >
              {/* Swipera Lime S Mark */}
              <div className="w-8 h-8 rounded-[10px] bg-[#c6f432] text-[#141414] font-black text-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="font-extrabold text-sm tracking-tight hidden sm:inline text-[var(--fg)]">
                Swipera
              </span>
            </Link>

            <span className="text-[var(--muted)] font-mono text-xs hidden sm:inline">/</span>

            {/* Inline Project Title Input */}
            <input
              id="project-title"
              type="text"
              value={projectTitle}
              onChange={(e) => {
                setProjectTitle(e.target.value);
                setIsSaved(false);
                setSaveTime("Editing...");
              }}
              onBlur={() => {
                setIsSaved(true);
                setSaveTime("Saved");
              }}
              className="text-xs font-semibold bg-transparent hover:bg-[var(--hover)] focus:bg-[var(--hover)] rounded-md px-2 py-1 outline-none text-[var(--fg)] max-w-[130px] sm:max-w-[180px] truncate transition-colors"
              title="Click to rename project"
            />

            {/* Cloud Auto-Save Status */}
            <div
              id="save-indicator"
              className="hidden md:flex items-center gap-1.5 text-xs text-[var(--muted)] pl-1"
              title="All changes saved to your browser"
            >
              <i className="fas fa-cloud-check text-[#365300] dark:text-[#c6f432]" />
              <span>{saveTime}</span>
            </div>
          </div>

          {/* Right Region: Utility Suite */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Undo Button */}
            <button
              id="btn-undo"
              type="button"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              className="tb-btn hidden md:inline-flex"
              title="Undo (Ctrl+Z)"
            >
              <i className="fas fa-rotate-left" />
            </button>

            {/* Redo Button */}
            <button
              id="btn-redo"
              type="button"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              className="tb-btn hidden md:inline-flex"
              title="Redo (Ctrl+Y)"
            >
              <i className="fas fa-rotate-right" />
            </button>

            <span className="w-px h-5 bg-[var(--line)] mx-1 hidden sm:block" />

            {/* Projects Folder Modal Button */}
            <button
              id="btn-projects"
              type="button"
              onClick={() => setIsProjectsModalOpen(true)}
              className="tb-btn hidden sm:inline-flex"
              title="My Projects"
            >
              <i className="fas fa-folder-open" />
            </button>

            {/* Keyboard Shortcuts Button */}
            <button
              id="btn-shortcuts"
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="tb-btn hidden lg:inline-flex"
              title="Keyboard Shortcuts"
            >
              <i className="fas fa-keyboard" />
            </button>

            {/* Help / Tour Button */}
            <button
              id="btn-tour"
              type="button"
              onClick={() =>
                toast.info("Swipera Studio Tour", {
                  description: "Use Create to input notes or URLs, Styles for 28 templates, Design for typography, and Brand for handles & videos!",
                })
              }
              className="tb-btn hidden lg:inline-flex"
              title="Help Tour"
            >
              <i className="fas fa-circle-question" />
            </button>

            {/* Theme Switcher Toggle */}
            <button
              id="btn-theme"
              type="button"
              onClick={toggleTheme}
              className="tb-btn"
              title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <i className={cn("fas", isDarkTheme ? "fa-sun text-amber-400" : "fa-moon")} />
            </button>

            {/* Language Switcher Button */}
            <button
              id="btn-lang"
              type="button"
              onClick={toggleLanguage}
              className="tb-btn font-mono text-xs font-bold w-auto px-2"
              title="Toggle EN / KO"
            >
              {language.toUpperCase()}
            </button>

            <span className="w-px h-5 bg-[var(--line)] mx-1 hidden sm:block" />

            {/* Lime Beta Pill Badge */}
            <span
              id="acct-badge"
              className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c6f432] text-[#141414] shadow-xs cursor-default hidden sm:inline"
            >
              BETA
            </span>

            {/* Save & Post Primary Export Button */}
            <button
              id="btn-export"
              type="button"
              onClick={() => {
                if (externalOnOpenComposer) {
                  externalOnOpenComposer({ title: projectTitle, slides });
                } else {
                  setComposerPost({ title: projectTitle, slides });
                  setIsComposerOpen(true);
                }
              }}
              className="ml-1 bg-[#141414] hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-[#141414] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="fas fa-download text-xs" />
              <span>Save & post</span>
            </button>

            {/* Send to Schedule Button */}
            <button
              type="button"
              onClick={handleSendToSchedule}
              className="ml-1 bg-[#c6f432] hover:bg-[#d6ff52] text-[#141414] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              title="Schedule this deck to your Content Calendar"
            >
              <i className="fas fa-calendar-alt text-xs" />
              <span>Send to schedule</span>
            </button>
          </div>
        </header>

        {/* Style Memory / Autonomous Flywheel Smart Alert Banner */}
        <DailyFlywheelAlertBanner onOpenFlywheelModal={() => setIsFlywheelModalOpen(true)} />

        {/* =========================================================================
            2. MAIN BODY: RAIL (64px) + LEFT PANEL (340px) + CENTER CANVAS + INSPECTOR (300px)
            ========================================================================= */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* =====================================================================
              2.1 LEFT RAIL (#rail, width 64px)
              Exact Order: 1. Idea -> 2. Image -> 3. Design -> 4. Create -> 5. Video -> 6. Calendar
              ===================================================================== */}
          <nav
            id="rail"
            className="w-16 shrink-0 border-r border-[var(--line)] bg-[var(--panel)] flex flex-col items-center py-3 gap-1 select-none z-20"
            data-purpose="studio-rail-navigation"
          >
            {/* 1. Pipeline */}
            <button
              type="button"
              data-tab="pipeline"
              onClick={() => handleNavSelect("pipeline")}
              className={cn(
                "rail-btn cursor-pointer transition-all",
                activeTab === "pipeline" && "active"
              )}
              title="Social Media Automation Engine Pipeline"
            >
              <i className="fas fa-bolt" />
              <span>Pipeline</span>
            </button>

            {/* 2. Idea */}
            <button
              type="button"
              data-tab="ideas"
              onClick={() => handleNavSelect("ideas")}
              className={cn(
                "rail-btn cursor-pointer transition-all",
                activeTab === "ideas" && "active"
              )}
              title="Find viral trends & content angles"
            >
              <i className="fas fa-lightbulb" />
              <span>Idea</span>
            </button>

            {/* 3. Create */}
            <button
              type="button"
              data-tab="create"
              onClick={() => handleNavSelect("create")}
              className={cn(
                "rail-btn cursor-pointer transition-all",
                activeTab === "create" && "active"
              )}
              title="Input content & generate slides with AI"
            >
              <i className="fas fa-wand-magic-sparkles" />
              <span>Create</span>
            </button>

            {/* 4. Styles / Templates */}
            <button
              type="button"
              data-tab="templates"
              onClick={() => handleNavSelect("templates")}
              className={cn(
                "rail-btn cursor-pointer transition-all",
                activeTab === "templates" && "active"
              )}
              title="Browse 28 style templates"
            >
              <i className="fas fa-palette" />
              <span>Styles</span>
            </button>

            {/* 5. Caption */}
            <button
              type="button"
              data-tab="caption"
              onClick={() => handleNavSelect("caption")}
              className={cn(
                "rail-btn cursor-pointer transition-all",
                activeTab === "caption" && "active"
              )}
              title="AI social captions & hashtags"
            >
              <i className="fas fa-comment-dots" />
              <span>Caption</span>
            </button>

            {/* Divider */}
            <div className="w-8 h-px bg-[var(--line)] my-1.5 shrink-0" />

            {/* 6. Calendar (Last) */}
            <button
              type="button"
              data-tab="calendar"
              onClick={() => handleNavSelect("calendar")}
              className={cn(
                "rail-btn cursor-pointer transition-all",
                activeTab === "calendar" && "active"
              )}
              title="Content publishing calendar & scheduler"
            >
              <i className="fas fa-calendar-days" />
              <span>Calendar</span>
            </button>

            <div className="flex-1" />

            {/* Bottom Account Indicator in Rail */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("signin");
                  setIsAuthModalOpen(true);
                }}
                className="w-8 h-8 rounded-full bg-[var(--hover)] hover:bg-[var(--line)] flex items-center justify-center text-xs font-bold text-[var(--fg)] cursor-pointer transition-colors"
                title={session?.user?.name || "Account Profile"}
              >
                {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
              </button>
            </div>
          </nav>

          {/* =========================================================================
              2.2 WORKSPACE CONTENT - Zero-Flicker Multi-View Preservation
              - Automation Pipeline Workspace
              - Ideas Workspace
              - Calendar Workspace
              - Carousel Studio Workspace (Create / Style / Design)
              ========================================================================= */}
          {/* 0. AUTOMATION PIPELINE WORKSPACE */}
          <div
            className={cn(
              "flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--bg)]",
              activeTab === "pipeline" ? "flex" : "hidden"
            )}
          >
            <AutomationPipelineView
              onOpenStudioWithDeck={(deck) => {
                if (deck && Array.isArray(deck.slides)) {
                  setSlides(deck.slides);
                  setActiveTab("create");
                }
              }}
            />
          </div>

          {/* 1. IDEAS WORKSPACE */}
          <div
            className={cn(
              "flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--bg)]",
              activeTab === "ideas" ? "flex" : "hidden"
            )}
          >
            <IdeasView
              onOpenComposer={
                externalOnOpenComposer ||
                ((post) => {
                  setComposerPost(post);
                  setIsComposerOpen(true);
                })
              }
              onGenerateCarousel={handleGenerateCarouselFromIdea}
            />
          </div>

          {/* 2. CALENDAR WORKSPACE */}
          <div
            className={cn(
              "flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--bg)]",
              activeTab === "calendar" ? "flex" : "hidden"
            )}
          >
            <CalendarView
              onOpenComposer={
                externalOnOpenComposer ||
                ((post) => {
                  setComposerPost(post);
                  setIsComposerOpen(true);
                })
              }
            />
          </div>

          {/* 3. CAROUSEL STUDIO WORKSPACE (Create, Style, Design) */}
          <div
            className={cn(
              "flex-1 flex min-w-0 h-full overflow-hidden relative",
              activeTab !== "pipeline" && activeTab !== "ideas" && activeTab !== "calendar" ? "flex" : "hidden"
            )}
          >
            {/* Left Tool Panel (340px) */}
            {!isLeftPanelCollapsed && (
              <div
                id="left-panel"
                className="w-[340px] flex-shrink-0 bg-[var(--panel)] border-r border-[var(--line)] flex flex-col z-10 select-none"
                data-purpose="studio-left-tool-panel"
              >
                {/* Panel Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* ---------------- CREATE PANE ---------------- */}
                  {activeTab === "create" && renderCreateContent("left")}

                  {/* ---------------- BRAND PANE ---------------- */}
                  {activeTab === "brand" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <h2 className="panel-title text-base font-extrabold tracking-tight text-[var(--fg)]">
                          Brand Kit & Integrations
                        </h2>
                        <p className="panel-desc text-xs text-[var(--muted)] mt-0.5">
                          Manage your social handles, brand identity, and content studios.
                        </p>
                      </div>

                      {/* Integrated Tools Jump Cards */}
                      <div className="space-y-2">
                        <div
                          onClick={() => handleNavSelect("ideas")}
                          className="p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[#c6f432] cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#c6f432]/20 text-[#365300] dark:text-[#c6f432] flex items-center justify-center">
                              <Lightbulb className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--fg)]">Content Ideas Generator</div>
                              <div className="text-[10px] text-[var(--muted)]">Find viral angles & trends</div>
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-xs text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
                        </div>

                        <div
                          onClick={() => handleNavSelect("calendar")}
                          className="p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[#c6f432] cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                              <CalendarIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--fg)]">Content Calendar & Schedule</div>
                              <div className="text-[10px] text-[var(--muted)]">Plan & automate post publishing</div>
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-xs text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
                        </div>

                        {/* Autonomous Daily Flywheel Jump Card */}
                        <div
                          onClick={() => setIsFlywheelModalOpen(true)}
                          className="p-3 rounded-xl border border-[#c6f432]/40 bg-[#c6f432]/10 hover:bg-[#c6f432]/20 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#c6f432] text-black flex items-center justify-center font-bold">
                              <i className="fas fa-robot text-xs" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-[var(--fg)] flex items-center gap-1.5">
                                <span>Autonomous Daily Flywheel</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#c6f432] text-black">
                                  DAILY
                                </span>
                              </div>
                              <div className="text-[10px] text-[var(--muted)]">Morning scout, 4:5 deck & Discord review</div>
                            </div>
                          </div>
                          <i className="fas fa-cog text-xs text-[#c6f432] group-hover:rotate-45 transition-transform" />
                        </div>
                      </div>

                      {/* Brand Watermark & Identity */}
                      <div className="space-y-3 pt-2 border-t border-[var(--line)]">
                        <label className="lbl">
                          <span>Brand Handle</span>
                          <input
                            type="text"
                            value={brandHandle}
                            onChange={(e) => setBrandHandle(e.target.value)}
                            placeholder="@handle"
                            className="field text-xs font-mono"
                          />
                        </label>

                        <label className="lbl">
                          <span>Website URL</span>
                          <input
                            type="text"
                            value={brandWebsite}
                            onChange={(e) => setBrandWebsite(e.target.value)}
                            placeholder="swipera.io"
                            className="field text-xs font-mono"
                          />
                        </label>

                        <label className="lbl">
                          <span>Swipe CTA Text</span>
                          <input
                            type="text"
                            value={swipeCtaText}
                            onChange={(e) => setSwipeCtaText(e.target.value)}
                            placeholder="Swipe ->"
                            className="field text-xs"
                          />
                        </label>

                        <div className="space-y-2 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--fg)]">
                            <input
                              type="checkbox"
                              checked={showPageNumber}
                              onChange={(e) => setShowPageNumber(e.target.checked)}
                              className="accent-[#c6f432] rounded"
                            />
                            <span>Show page numbers (1/1)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--fg)]">
                            <input
                              type="checkbox"
                              checked={showSwipeHint}
                              onChange={(e) => setShowSwipeHint(e.target.checked)}
                              className="accent-[#c6f432] rounded"
                            />
                            <span>Show swipe hint arrow</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------- CAPTION PANE ---------------- */}
                  {activeTab === "caption" && (() => {
                    const platInfoMap: Record<string, {
                      name: string;
                      icon: string;
                      color: string;
                      maxCaption: number;
                      firstLineCut: number;
                      hashtags: [number, number];
                      maxSlides: number;
                      recSlides: string;
                      ratios: string;
                    }> = {
                      instagram: {
                        name: "Instagram",
                        icon: "fa-brands fa-instagram",
                        color: "#E1306C",
                        maxCaption: 2200,
                        firstLineCut: 125,
                        hashtags: [3, 5],
                        maxSlides: 20,
                        recSlides: "6~10 slides rec.",
                        ratios: "4:5 / 1:1",
                      },
                      threads: {
                        name: "Threads",
                        icon: "fa-brands fa-threads",
                        color: "#000000",
                        maxCaption: 500,
                        firstLineCut: 100,
                        hashtags: [1, 2],
                        maxSlides: 20,
                        recSlides: "4~8 slides rec.",
                        ratios: "4:5 / 1:1",
                      },
                      linkedin: {
                        name: "LinkedIn",
                        icon: "fa-brands fa-linkedin-in",
                        color: "#0A66C2",
                        maxCaption: 3000,
                        firstLineCut: 140,
                        hashtags: [3, 5],
                        maxSlides: 30,
                        recSlides: "6~12 slides rec.",
                        ratios: "4:5 / 1:1",
                      },
                      tiktok: {
                        name: "TikTok",
                        icon: "fa-brands fa-tiktok",
                        color: "#000000",
                        maxCaption: 4000,
                        firstLineCut: 80,
                        hashtags: [4, 6],
                        maxSlides: 35,
                        recSlides: "5~10 slides rec.",
                        ratios: "9:16 / 4:5",
                      },
                      x: {
                        name: "X (Twitter)",
                        icon: "fa-brands fa-x-twitter",
                        color: "#000000",
                        maxCaption: 280,
                        firstLineCut: 70,
                        hashtags: [1, 2],
                        maxSlides: 4,
                        recSlides: "2~4 slides rec.",
                        ratios: "16:9 / 1:1",
                      },
                    };

                    const currentPlatKey = captionPlatform || selectedPlatformId || "instagram";
                    const currentPlat = platInfoMap[currentPlatKey] || platInfoMap.instagram;
                    const hashtagCount = (hashtagText.match(/#[\p{L}\p{N}_]+/gu) || []).length;
                    const isCaptionOver = captionText.length > currentPlat.maxCaption;
                    const isHashtagOver = hashtagCount > currentPlat.hashtags[1];

                    return (
                      <div className="space-y-4 animate-in fade-in duration-150">
                        <div>
                          <h2 className="panel-title text-base font-extrabold tracking-tight text-[var(--fg)]">
                            Caption & Hashtags
                          </h2>
                          <p className="panel-desc text-xs text-[var(--muted)] mt-0.5">
                            Generate platform-tailored post captions & hashtags optimized for maximum engagement.
                          </p>
                        </div>

                        {/* Platform Selector for Caption */}
                        <div className="seg flex gap-1 p-0.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                          {["instagram", "threads", "linkedin", "tiktok", "x"].map((p) => {
                            const pData = platInfoMap[p];
                            const isActive = currentPlatKey === p;
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  setCaptionPlatform(p);
                                  setSelectedPlatformId(p as any);
                                }}
                                className={cn(
                                  "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer",
                                  isActive
                                    ? "bg-[#c6f432] text-[#141414] shadow-xs"
                                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                                )}
                              >
                                <i className={cn(pData.icon, "text-[11px]")} />
                                <span className="capitalize hidden sm:inline">{pData.name.split(" ")[0]}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Platform Specific Guidelines Banner (#pf-rules) */}
                        <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] space-y-2 text-xs">
                          <div className="flex items-center gap-2 pb-2 border-b border-[var(--line)]">
                            <i className={cn(currentPlat.icon, "text-sm")} style={{ color: currentPlat.color }} />
                            <b className="font-extrabold text-[var(--fg)]">{currentPlat.name}</b>
                            <span className="text-[10px] text-[var(--muted)] font-mono">Guidelines</span>
                          </div>

                          <ul className="space-y-1 text-[11px] text-[var(--muted)] leading-relaxed list-disc list-inside">
                            <li>
                              Caption length: Max <strong className="text-[var(--fg)]">{currentPlat.maxCaption.toLocaleString()}</strong> chars (first {currentPlat.firstLineCut} chars crucial)
                            </li>
                            <li>
                              Hashtags: <strong className="text-[var(--fg)]">{currentPlat.hashtags[0]}~{currentPlat.hashtags[1]}</strong> recommended
                            </li>
                            <li>
                              Slides: Up to {currentPlat.maxSlides} slides ({currentPlat.recSlides}) · {currentPlat.ratios}
                            </li>
                          </ul>

                          {/* Live Warning Issues if any */}
                          {isCaptionOver && (
                            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] flex items-center gap-1.5 font-semibold">
                              <i className="fas fa-triangle-exclamation" />
                              <span>Caption length exceeds platform recommendation.</span>
                            </div>
                          )}
                          {isHashtagOver && (
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5 font-semibold">
                              <i className="fas fa-triangle-exclamation" />
                              <span>Hashtags exceed recommended limit ({currentPlat.hashtags[1]}).</span>
                            </div>
                          )}
                        </div>

                        {/* Tone Selector */}
                        <label className="lbl">
                          <span>Caption Tone</span>
                          <select
                            value={captionTone}
                            onChange={(e) => setCaptionTone(e.target.value)}
                            className="field text-xs font-medium"
                          >
                            <option value="friendly">Friendly & Conversational</option>
                            <option value="professional">Professional & Authoritative</option>
                            <option value="story">Storyteller / Personal Experience</option>
                            <option value="punchy">Punchy & Short</option>
                          </select>
                        </label>

                        {/* Generated Caption Area */}
                        <div className="space-y-1.5">
                          <label className="lbl">
                            <span className="flex items-center justify-between">
                              <span className="font-bold text-[var(--fg)]">Post Caption</span>
                              <span className={cn("text-[10px] font-mono", isCaptionOver ? "text-red-500 font-bold" : "text-[var(--muted)]")}>
                                {captionText.length.toLocaleString()} / {currentPlat.maxCaption.toLocaleString()} chars
                              </span>
                            </span>
                            <textarea
                              rows={6}
                              value={captionText}
                              onChange={(e) => setCaptionText(e.target.value)}
                              placeholder="Post caption will be generated here..."
                              className="field text-xs leading-relaxed resize-none p-3"
                            />
                          </label>
                        </div>

                        {/* Hashtags Area */}
                        <div className="space-y-1.5">
                          <label className="lbl">
                            <span className="flex items-center justify-between">
                              <span className="font-bold text-[var(--fg)]">Hashtags</span>
                              <span className={cn("text-[10px] font-mono", isHashtagOver ? "text-amber-500 font-bold" : "text-[var(--muted)]")}>
                                #{hashtagCount} ({currentPlat.hashtags[0]}~{currentPlat.hashtags[1]} recommended)
                              </span>
                            </span>
                            <textarea
                              rows={2}
                              value={hashtagText}
                              onChange={(e) => setHashtagText(e.target.value)}
                              placeholder="#carousel #marketing #socialmedia"
                              className="field text-xs resize-none p-2"
                            />
                          </label>
                        </div>

                        {/* Action Buttons: Regenerate & Copy */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            disabled={isRegeneratingCaption}
                            onClick={handleRegenerateCaption}
                            className="h-10 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--hover)] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 text-[var(--fg)]"
                          >
                            {isRegeneratingCaption ? (
                              <i className="fas fa-circle-notch fa-spin text-xs" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                            )}
                            <span>{isRegeneratingCaption ? "Generating..." : "AI Regenerate"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyCaption}
                            className="h-10 rounded-xl bg-[#c6f432] hover:brightness-95 text-[#141414] font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Caption + Hashtags</span>
                          </button>
                        </div>

                        {/* Direct Send to Calendar Scheduling */}
                        <button
                          type="button"
                          onClick={handleSendToSchedule}
                          className="w-full h-10 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--fg)] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[var(--fg)]"
                        >
                          <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span>Schedule to Content Calendar</span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* ---------------- STYLE PANE ---------------- */}
                  {activeTab === "templates" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <div className="flex items-center justify-between">
                          <h2 className="text-base font-extrabold tracking-tight text-[var(--fg)]">
                            Styles
                          </h2>
                          <span className="text-[10px] font-mono font-bold text-[var(--muted)]">
                            28 styles
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          28 styles plus your own. One tap applies to every card.
                        </p>
                      </div>

                      {/* Lime Promo Banner: Make a template from image */}
                      <div
                        id="btn-ref-template"
                        onClick={() => toast.info("Upload image to extract style template")}
                        className="p-3 rounded-xl bg-gradient-to-r from-[#c6f432] to-[#d6ff52] text-[#141414] shadow-xs cursor-pointer hover:brightness-95 transition-all"
                      >
                        <div className="text-xs font-black flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Make a template from an image</span>
                        </div>
                        <p className="text-[11px] opacity-80 mt-1 leading-tight">
                          Upload a carousel you like — get a template in the same style
                        </p>
                      </div>

                      {/* Actions row: New template, Remix current, Import */}
                      <div id="tpl-designer-bar" className="grid grid-cols-3 gap-1.5">
                        <button
                          id="btn-new-template"
                          type="button"
                          onClick={() => toast.info("Create custom template")}
                          className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate"
                        >
                          + New
                        </button>
                        <button
                          id="btn-remix-template"
                          type="button"
                          onClick={handleShuffleStyle}
                          className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate"
                        >
                          Remix
                        </button>
                        <button
                          id="btn-import-template"
                          type="button"
                          onClick={() => toast.info("Import template JSON")}
                          className="py-1.5 px-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold text-[var(--fg)] hover:bg-[var(--hover)] transition-colors truncate"
                        >
                          Import
                        </button>
                      </div>

                      {/* Filter Chips */}
                      <div id="tpl-filters" className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                        {["all", "photo", "bold", "editorial", "flat", "clean"].map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setTemplateFilter(filter)}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                              templateFilter === filter
                                ? "bg-[var(--fg)] text-[var(--bg)]"
                                : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]"
                            )}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>

                      {/* 28 Templates Grid (#template-gallery) - Full Bleed Inner Preview */}
                      <div id="template-gallery" className="grid grid-cols-2 gap-2.5 pt-1">
                        {filteredTemplates.map((tpl: any) => {
                          const isSelected = selectedTemplateId === tpl.id;
                          let previewHtml = SWIPERA_TEMPLATE_PREVIEWS[tpl.id] || "";
                          if (typeof window !== "undefined" && (window as any).CN_TEMPLATES?.renderCard) {
                            try {
                              previewHtml = (window as any).CN_TEMPLATES.renderCard(currentSlide, {
                                template: tpl.id,
                                scheme: 0,
                                accent: null,
                                ratio: "4:5",
                                total: 4,
                                design: null,
                              });
                            } catch (e) { }
                          }

                          return (
                            <div
                              key={tpl.id}
                              onClick={() => {
                                setSelectedTemplateId(tpl.id);
                                setSelectedSchemeIndex(0);
                                setAccentColorOverride(null);
                                toast.success(`Applied ${tpl.name} style`);
                              }}
                              className={cn(
                                "tpl-card cursor-pointer",
                                isSelected && "active"
                              )}
                            >
                              {tpl.badge && (
                                <span className="badge !text-[#141414] font-black">
                                  {tpl.badge}
                                </span>
                              )}

                              {/* Full-bleed inner thumbnail: 100% full width and top space with 0 gap */}
                              <div className="thumb">
                                <div
                                  style={{
                                    width: 1080,
                                    height: 1350,
                                    transform: "scale(0.13426)",
                                    transformOrigin: "top left",
                                    pointerEvents: "none",
                                    userSelect: "none",
                                  }}
                                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                                />
                              </div>

                              {/* Card Metadata Bar */}
                              <div className="meta">
                                <span>{tpl.name}</span>
                                <small>{tpl.schemes?.length || 4} colors</small>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* =========================================================
                        LOWER STYLE CONTROLS (CRITICAL GAP IDENTIFIED BY USER)
                        - Color Scheme Variants (#scheme-list)
                        - Aspect Ratio Switcher (#opt-ratio)
                        - Accent Color Override (#opt-accent)
                        ========================================================= */}
                      <div id="tpl-knobs" className="space-y-4 pt-3 border-t border-[var(--line)]">
                        {/* 1. Color Scheme Picker */}
                        <div className="space-y-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono uppercase font-bold text-[var(--muted)]">
                              Color Scheme ({activeTemplate.name})
                            </span>
                            <span className="text-[10px] font-mono text-[var(--muted)]">
                              Variant {selectedSchemeIndex + 1}/{activeTemplate.schemes?.length || 1}
                            </span>
                          </div>
                          <div id="scheme-list" className="flex gap-2.5 flex-wrap">
                            {activeTemplate.schemes?.map((scheme: any, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedSchemeIndex(idx);
                                  setAccentColorOverride(null);
                                }}
                                className={cn(
                                  "w-9 h-9 rounded-full border-2 overflow-hidden relative transition-transform cursor-pointer",
                                  selectedSchemeIndex === idx
                                    ? "border-[var(--fg)] scale-110 shadow-sm ring-2 ring-[#c6f432]"
                                    : "border-[var(--line)] hover:scale-105"
                                )}
                                title={scheme.name || `Scheme ${idx + 1}`}
                              >
                                <div className="w-full h-1/2" style={{ backgroundColor: scheme.bg }} />
                                <div className="w-full h-1/2" style={{ backgroundColor: scheme.a }} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Aspect Ratio Selector */}
                        <div className="space-y-1.5 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
                          <label className="text-[10px] font-mono uppercase font-bold text-[var(--muted)] block">
                            Aspect Ratio
                          </label>
                          <select
                            id="opt-ratio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as any)}
                            className="w-full p-2 text-xs font-bold rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] outline-none"
                          >
                            <option value="4:5">4:5 · 1080×1350 (Instagram / LinkedIn)</option>
                            <option value="1:1">1:1 · 1080×1080 (Square / Threads)</option>
                            <option value="9:16">9:16 · 1080×1920 (Reels / Stories / TikTok)</option>
                            <option value="16:9">16:9 · 1920×1080 (Landscape Presentation)</option>
                          </select>
                        </div>

                        {/* 3. Accent Color Override with Reset */}
                        <div className="space-y-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono uppercase font-bold text-[var(--muted)]">
                              Accent Color Override
                            </label>
                            {accentColorOverride && (
                              <button
                                id="btn-accent-reset"
                                type="button"
                                onClick={() => setAccentColorOverride(null)}
                                className="text-[10px] font-mono font-bold text-[#ff5a1f] hover:underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id="opt-accent"
                              type="color"
                              value={accentColorOverride || activeScheme.a}
                              onChange={(e) => setAccentColorOverride(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-[var(--line)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={accentColorOverride || activeScheme.a}
                              onChange={(e) => setAccentColorOverride(e.target.value)}
                              className="flex-1 p-1.5 text-xs font-mono rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] uppercase outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------- DESIGN PANE ---------------- */}
                  {activeTab === "design" && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <h2 className="text-base font-extrabold tracking-tight text-[var(--fg)]">
                          Design & Typography
                        </h2>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Customize typography, micro-geometry, and brand identity.
                        </p>
                      </div>

                      {/* AI Smart Design Composer */}
                      <div className="space-y-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-[var(--muted)]">
                          <span>AI Smart Design</span>
                          <Sparkles className="w-3 h-3 text-[#365300] dark:text-[#c6f432]" />
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            id="ai-design-input"
                            type="text"
                            value={aiDesignPrompt}
                            onChange={(e) => setAiDesignPrompt(e.target.value)}
                            placeholder="e.g. Minimalist luxury with warm beige tones"
                            className="flex-1 text-xs p-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] outline-none"
                          />
                          <button
                            id="btn-ai-design"
                            type="button"
                            onClick={() => {
                              if (!aiDesignPrompt.trim()) return;
                              setIsGeneratingDesign(true);
                              setTimeout(() => {
                                setIsGeneratingDesign(false);
                                setTitleFont("Playfair Display");
                                setAccentColorOverride("#C6F432");
                                setCustomBg("#141414");
                                setCustomFg("#F6F5F2");
                                toast.success("Applied AI design styling");
                              }, 500);
                            }}
                            className="px-2.5 py-1 bg-[var(--fg)] text-[var(--bg)] rounded-lg text-xs font-bold"
                          >
                            {isGeneratingDesign ? "..." : "Apply"}
                          </button>
                        </div>

                        {/* 8 Preset Design Chips */}
                        <div id="ai-design-chips" className="flex flex-wrap gap-1 pt-1">
                          {[
                            { name: "Premium", font: "Playfair Display", bg: "#141414", fg: "#F6F5F2", a: "#E5C07B" },
                            { name: "Playful", font: "Bricolage Grotesque", bg: "#FFF4E6", fg: "#141414", a: "#FF5A1F" },
                            { name: "More minimal", font: "Inter", bg: "#FFFFFF", fg: "#141414", a: "#5E5A53" },
                            { name: "Bolder", font: "Archivo Black", bg: "#141414", fg: "#FFFFFF", a: "#C6F432" },
                            { name: "Warm tones", font: "Pretendard", bg: "#FBF3E1", fg: "#2A2418", a: "#E67E22" },
                            { name: "Corporate trust", font: "Inter", bg: "#F0F4F8", fg: "#102A43", a: "#0066CC" },
                            { name: "Dark mode", font: "JetBrains Mono", bg: "#0F0F0E", fg: "#F6F5F2", a: "#00FF66" },
                            { name: "Pastel tones", font: "Pretendard", bg: "#F5F3FF", fg: "#2D2438", a: "#A855F7" },
                          ].map((chip) => (
                            <button
                              key={chip.name}
                              type="button"
                              onClick={() => {
                                setTitleFont(chip.font);
                                setCustomBg(chip.bg);
                                setCustomFg(chip.fg);
                                setAccentColorOverride(chip.a);
                                toast.success(`Design preset: ${chip.name}`);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--line)] bg-[var(--panel)] hover:border-[#c6f432] text-[var(--fg)] font-medium transition-colors"
                            >
                              {chip.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Typography Micro-Controls */}
                      <div className="space-y-3 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono uppercase font-bold text-[var(--muted)]">
                            Typography
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsFontModalOpen(true)}
                            className="text-[10px] font-bold text-[#365300] dark:text-[#c6f432] hover:underline"
                          >
                            Browse all 43 fonts &rarr;
                          </button>
                        </div>

                        {/* Font Pickers */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[var(--muted)]">Title Font</label>
                            <select
                              id="d-titleFont"
                              value={titleFont}
                              onChange={(e) => setTitleFont(e.target.value)}
                              className="w-full p-2 text-xs font-semibold rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] outline-none"
                            >
                              <option value="Bricolage Grotesque">Bricolage Grotesque</option>
                              <option value="Pretendard">Pretendard Variable</option>
                              <option value="Inter">Inter</option>
                              <option value="Playfair Display">Playfair Display (Serif)</option>
                              <option value="Space Grotesk">Space Grotesk</option>
                              <option value="Archivo Black">Archivo Black</option>
                              <option value="JetBrains Mono">JetBrains Mono</option>
                              <option value="Noto Sans KR">Noto Sans KR</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[var(--muted)]">Body Font</label>
                            <select
                              id="d-bodyFont"
                              value={bodyFont}
                              onChange={(e) => setBodyFont(e.target.value)}
                              className="w-full p-2 text-xs font-semibold rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] outline-none"
                            >
                              <option value="Pretendard">Pretendard Variable</option>
                              <option value="Inter">Inter</option>
                              <option value="Noto Sans KR">Noto Sans KR</option>
                              <option value="Space Grotesk">Space Grotesk</option>
                            </select>
                          </div>
                        </div>

                        {/* Size Sliders */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[var(--muted)]">
                              <span>Title Size</span>
                              <span className="font-mono">{titleSize}%</span>
                            </div>
                            <input
                              id="d-titleSize"
                              type="range"
                              min="70"
                              max="150"
                              value={titleSize}
                              onChange={(e) => setTitleSize(Number(e.target.value))}
                              className="w-full accent-[#c6f432]"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[var(--muted)]">
                              <span>Body Size</span>
                              <span className="font-mono">{bodySize}%</span>
                            </div>
                            <input
                              id="d-bodySize"
                              type="range"
                              min="70"
                              max="130"
                              value={bodySize}
                              onChange={(e) => setBodySize(Number(e.target.value))}
                              className="w-full accent-[#c6f432]"
                            />
                          </div>
                        </div>

                        {/* Tracking (Letter Spacing) & Leading (Line Height) */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[var(--muted)]">
                              <span>Letter Spacing</span>
                              <span className="font-mono">{tracking}em</span>
                            </div>
                            <input
                              id="d-letterSpacing"
                              type="range"
                              min="-4"
                              max="8"
                              value={tracking * 100}
                              onChange={(e) => setTracking(Number(e.target.value) / 100)}
                              className="w-full accent-[#c6f432]"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[var(--muted)]">
                              <span>Line Height</span>
                              <span className="font-mono">{leading}</span>
                            </div>
                            <input
                              id="d-lineHeight"
                              type="range"
                              min="9"
                              max="16"
                              value={leading * 10}
                              onChange={(e) => setLeading(Number(e.target.value) / 10)}
                              className="w-full accent-[#c6f432]"
                            />
                          </div>
                        </div>

                        {/* Weight, Case, Alignment */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--muted)]">Weight</label>
                            <select
                              id="d-titleWeight"
                              value={titleWeight}
                              onChange={(e) => setTitleWeight(e.target.value)}
                              className="w-full p-1.5 text-xs font-semibold rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] outline-none"
                            >
                              <option value="500">Normal</option>
                              <option value="700">Bold</option>
                              <option value="800">Extra Bold</option>
                              <option value="900">Black</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--muted)]">Case</label>
                            <select
                              id="d-titleCase"
                              value={titleCase}
                              onChange={(e) => setTitleCase(e.target.value as any)}
                              className="w-full p-1.5 text-xs font-semibold rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] outline-none"
                            >
                              <option value="normal">Normal</option>
                              <option value="uppercase">UPPERCASE</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--muted)]">Alignment</label>
                            <div className="seg bg-[var(--hover)] p-0.5 rounded-lg flex gap-0.5">
                              <button
                                type="button"
                                onClick={() => setTextAlign("left")}
                                className={cn("flex-1 py-1 flex items-center justify-center rounded text-xs", textAlign === "left" ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs" : "text-[var(--muted)]")}
                              >
                                <AlignLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setTextAlign("center")}
                                className={cn("flex-1 py-1 flex items-center justify-center rounded text-xs", textAlign === "center" ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs" : "text-[var(--muted)]")}
                              >
                                <AlignCenter className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setTextAlign("right")}
                                className={cn("flex-1 py-1 flex items-center justify-center rounded text-xs", textAlign === "right" ? "bg-[var(--panel)] text-[var(--fg)] shadow-xs" : "text-[var(--muted)]")}
                              >
                                <AlignRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Frame & Borders */}
                      <div className="space-y-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
                        <span className="text-[10px] font-mono uppercase font-bold text-[var(--muted)] block">
                          Frame & Border Styles
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: "none", name: "None" },
                            { id: "solid", name: "Solid" },
                            { id: "inset", name: "Inset" },
                            { id: "double", name: "Double" },
                            { id: "rounded", name: "Rounded" },
                            { id: "underline", name: "Underline" },
                          ].map((frame) => (
                            <button
                              key={frame.id}
                              type="button"
                              onClick={() => setFrameStyle(frame.id as any)}
                              className={cn(
                                "py-1.5 text-xs font-bold rounded-lg border transition-all",
                                frameStyle === frame.id
                                  ? "border-[#c6f432] bg-[#c6f432]/10 text-[var(--fg)]"
                                  : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]"
                              )}
                            >
                              {frame.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Background Patterns */}
                      <div className="space-y-2 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
                        <span className="text-[10px] font-mono uppercase font-bold text-[var(--muted)] block">
                          Background Pattern
                        </span>
                        <div className="grid grid-cols-5 gap-1">
                          {["none", "dots", "grid", "lines", "waves"].map((pat) => (
                            <button
                              key={pat}
                              type="button"
                              onClick={() => setBgPattern(pat as any)}
                              className={cn(
                                "py-1 text-[11px] font-bold uppercase rounded-lg border transition-all text-center",
                                bgPattern === pat
                                  ? "border-[#c6f432] bg-[#c6f432]/10 text-[var(--fg)]"
                                  : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]"
                              )}
                            >
                              {pat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* =========================================================
                        INTEGRATED BRAND IDENTITY (PRESERVED INSIDE DESIGN)
                        ========================================================= */}
                      <div className="space-y-3 p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[var(--muted)]">
                          <Palette className="w-3.5 h-3.5 text-[#365300] dark:text-[#c6f432]" />
                          <span>Brand Watermark & Identity</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[var(--muted)]">Handle</label>
                            <input
                              type="text"
                              value={brandHandle}
                              onChange={(e) => setBrandHandle(e.target.value)}
                              placeholder="@handle"
                              className="w-full p-2 text-xs font-mono rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[var(--muted)]">Website</label>
                            <input
                              type="text"
                              value={brandWebsite}
                              onChange={(e) => setBrandWebsite(e.target.value)}
                              placeholder="website.com"
                              className="w-full p-2 text-xs font-mono rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--fg)] outline-none"
                            />
                          </div>
                        </div>

                        {/* Brand Toggles */}
                        <div className="space-y-1.5 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--fg)]">
                            <input
                              type="checkbox"
                              checked={showPageNumber}
                              onChange={(e) => setShowPageNumber(e.target.checked)}
                              className="accent-[#c6f432] rounded"
                            />
                            <span>Show slide pagination indicator (1/4)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--fg)]">
                            <input
                              type="checkbox"
                              checked={showSwipeHint}
                              onChange={(e) => setShowSwipeHint(e.target.checked)}
                              className="accent-[#c6f432] rounded"
                            />
                            <span>Show swipe hint arrow</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =====================================================================
              2.3 CENTER CANVAS AREA (#canvas-area)
              ===================================================================== */}
            <main
              id="canvas-area"
              className="flex-1 flex flex-col min-w-0 bg-[var(--canvas)] relative overflow-hidden select-none"
              data-purpose="studio-canvas"
            >
              {/* Show Panel Pill (When left panel collapsed) */}
              {isLeftPanelCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsLeftPanelCollapsed(false)}
                  className="absolute top-3 left-3 z-30 px-2.5 py-1.5 rounded-lg bg-[var(--panel)] border border-[var(--line)] text-xs font-bold shadow-md hover:bg-[var(--hover)] flex items-center gap-1 text-[var(--fg)]"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                  <span>Show panel</span>
                </button>
              )}

              {/* ---------------- SLIDE TOOLBAR (#slide-toolbar) ---------------- */}
              <div
                id="slide-toolbar"
                className="h-12 shrink-0 flex items-center gap-1 px-3 border-b border-[var(--line)] bg-[var(--panel)]/70 backdrop-blur z-20 select-none"
              >
                {/* Left: Slide pagination, Polish rewrite, Add image, Duplicate, Trash */}
                <span id="slide-pos" className="text-xs font-semibold text-[var(--muted)] mr-2 tabular-nums">
                  {currentSlideIndex + 1} / {slides.length}
                </span>

                <button
                  type="button"
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                  className="tb-btn"
                  title="Prev (<-)"
                >
                  <i className="fas fa-chevron-left" />
                </button>

                <button
                  type="button"
                  disabled={currentSlideIndex === slides.length - 1}
                  onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                  className="tb-btn"
                  title="Next (->)"
                >
                  <i className="fas fa-chevron-right" />
                </button>

                <span className="w-px h-5 bg-[var(--line)] mx-1" />

                {/* Polish AI Rewrite Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsPolishMenuOpen(!isPolishMenuOpen)}
                    className="tb-btn w-auto px-2 gap-1.5 text-xs font-bold text-[var(--fg)] cursor-pointer"
                    title="AI Polish"
                  >
                    <i className="fas fa-bolt text-[#365300] dark:text-[#c6f432]" />
                    <span>Polish</span>
                    <i className="fas fa-caret-down text-[10px]" />
                  </button>

                  {/* Polish Dropdown Menu */}
                  {isPolishMenuOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-52 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={() => handleAIRewrite("shorter")}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                      >
                        Shorter & punchier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAIRewrite("numbers")}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                      >
                        Add specific numbers
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAIRewrite("hook")}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                      >
                        Hook question headline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAIRewrite("emotional")}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--fg)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
                      >
                        More emotional tone
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toast.info("Add image sticker")}
                  className="tb-btn"
                  title="Image"
                >
                  <i className="fas fa-image" />
                </button>

                <button
                  type="button"
                  onClick={handleDuplicateSlide}
                  className="tb-btn"
                  title="Duplicate (Cmd+D)"
                >
                  <i className="fas fa-clone" />
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSlide}
                  className="tb-btn hover:text-red-500"
                  title="Delete"
                >
                  <i className="fas fa-trash" />
                </button>

                <div className="flex-1" />

                {/* Right: Zoom controls, Safe Area guide toggle, Preview */}
                <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
                    className="tb-btn"
                    title="Zoom Out"
                  >
                    <i className="fas fa-minus" />
                  </button>
                  <span id="zoom-label" className="w-10 text-center tabular-nums text-xs">
                    {zoomLevel === 100 ? "fit" : `${zoomLevel}%`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                    className="tb-btn"
                    title="Zoom In"
                  >
                    <i className="fas fa-plus" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="tb-btn !w-auto px-2 text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Fit
                  </button>
                </div>

                <span className="w-px h-5 bg-[var(--line)] mx-1" />

                {/* Safe Area Toggle */}
                {/* Aspect Ratio Quick Switcher */}
                <button
                  type="button"
                  onClick={() => {
                    const next = aspectRatio === "4:5" ? "1:1" : aspectRatio === "1:1" ? "9:16" : aspectRatio === "9:16" ? "16:9" : "4:5";
                    setAspectRatio(next);
                    toast.info(`Aspect Ratio: ${next}`);
                  }}
                  className="tb-btn !w-auto px-2 text-xs font-mono font-bold whitespace-nowrap cursor-pointer"
                  title="Toggle aspect ratio (4:5, 1:1, 9:16, 16:9)"
                >
                  <i className="fas fa-crop-simple text-[11px]" />
                  <span>{aspectRatio}</span>
                </button>

                <button
                  type="button"
                  id="btn-safe-area"
                  onClick={() => setShowSafeArea(!showSafeArea)}
                  className={cn(
                    "tb-btn !w-auto px-2.5 gap-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer",
                    showSafeArea && "bg-red-500/20 text-red-500"
                  )}
                  title="Safe area"
                >
                  <i className="fas fa-border-top-left" />
                  <span className="hidden sm:inline">Safe area</span>
                </button>

                {/* Preview Button */}
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="tb-btn !w-auto px-2.5 gap-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
                  title="Preview"
                >
                  <i className="fas fa-mobile-screen" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              </div>

              {/* ---------------- CENTER STAGE CANVAS VIEW ---------------- */}
              <div
                id="canvas-stage"
                ref={canvasStageRef}
                className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-auto bg-[#eceae4] dark:bg-[#18181b]"
              >
                {/* Floating Context Bar directly over slide card matching Swipera Image 2 */}
                <div
                  id="ctx-bar"
                  className="ctx-bar mb-3 shadow-lg select-none"
                  role="toolbar"
                  aria-label="Selected slide"
                >
                  <span className="ctx-type" id="ctx-type">
                    {currentSlide.type ? currentSlide.type.toUpperCase() : (currentSlideIndex === 0 ? "COVER" : "CTA")}
                  </span>

                  <span className="ctx-sep" />

                  {/* Color Schemes selector dots matching Swipera Image 2 */}
                  <div className="ctx-schemes" id="ctx-schemes" title="Color schemes">
                    {(activeTemplate?.schemes || []).slice(0, 5).map((sch: any, idx: number) => {
                      const isSelected = selectedSchemeIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          data-cs={idx}
                          onClick={() => {
                            setSelectedSchemeIndex(idx);
                            setAccentColorOverride(null);
                            setCustomBg(null);
                            setCustomFg(null);
                          }}
                          className={cn(isSelected && "on")}
                          style={{
                            background: `linear-gradient(135deg, ${sch.bg} 50%, ${sch.a} 50%)`,
                          }}
                          title={sch.name || `Scheme ${idx + 1}`}
                        />
                      );
                    })}
                  </div>

                  <span className="ctx-sep" />

                  <button
                    type="button"
                    onClick={() => handleAIRewrite("shorter")}
                    className="ctx-btn"
                    title="Shorter (AI)"
                  >
                    <i className="fas fa-compress" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAIRewrite("numbers")}
                    className="ctx-btn"
                    title="Length fit (AI)"
                  >
                    <i className="fas fa-text-height" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAIRewrite("emotional")}
                    className="ctx-btn"
                    title="Expand (AI)"
                  >
                    <i className="fas fa-expand" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAIRewrite("hook")}
                    className="ctx-btn"
                    title="Hook title (AI)"
                  >
                    <i className="fas fa-fire" />
                  </button>

                  <span className="ctx-sep" />

                  <button
                    type="button"
                    onClick={() => slideImageInputRef.current?.click()}
                    className="ctx-btn"
                    title="Upload or change image for this slide"
                  >
                    <i className="fas fa-image" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDuplicateSlide}
                    className="ctx-btn"
                    title="Duplicate (Cmd+D)"
                  >
                    <i className="fas fa-clone" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSlide}
                    className="ctx-btn danger hover:text-red-500"
                    title="Delete"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>

                {/* Hidden File Inputs for Direct Slide Image Uploads */}
                <input
                  ref={slideImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleSingleSlideImageUpload(e.target.files[0]);
                  }}
                />
                <input
                  ref={filmstripImageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      Array.from(e.target.files).forEach((f) => handleAddImageSlide(f));
                    }
                  }}
                />

                {/* ACTIVE SLIDE CARD (#focus-frame: rendered at authentic 1080px native canvas resolution matching Swipera Image 1) */}
                <div
                  id="focus-frame"
                  className="relative rounded-sm shadow-2xl ring-1 ring-black/10 dark:ring-white/10 transition-all duration-200 overflow-hidden select-text box-border group"
                  style={{
                    width: `${ratioGeometry.displayW}px`,
                    height: `${ratioGeometry.displayH}px`,
                  }}
                >
                  {/* Native 1080x1350 or 1080x1080 scaled container */}
                  <div
                    style={{
                      transform: `scale(${ratioGeometry.scale})`,
                      transformOrigin: "top left",
                      width: `${ratioGeometry.nativeW}px`,
                      height: `${ratioGeometry.nativeH}px`,
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <SlideCanvasRenderer
                      slide={currentSlide}
                      slideIndex={currentSlideIndex}
                      totalSlides={slides.length}
                      aspectRatio={aspectRatio}
                      templateId={selectedTemplateId || "hero"}
                      activeScheme={activeScheme}
                      titleFont={titleFont}
                      bodyFont={bodyFont}
                      brand={brandHandle || "@theabreed"}
                      site={brandWebsite || (extractedSource?.domain ? extractedSource.domain.replace(/^www\./, "") : extractedSource?.siteName || "TechCrunch")}
                      swipeText={language === "ko" ? "다음 →" : "Swipe →"}
                      textAlign={textAlign}
                      titleWeight={titleWeight}
                      titleCase={titleCase}
                      tracking={tracking}
                      leading={leading}
                      hasTitleShadow={hasTitleShadow}
                      isGradientBg={isGradientBg}
                      gradientAngle={gradientAngle}
                      gradientEndColor={gradientEndColor}
                      showImageTextOverlay={showImageTextOverlay}
                      showSafeArea={showSafeArea}
                      platformName={currentPlatformMeta.name}
                      isInteractive={true}
                      onUpdateSlide={updateCurrentSlide}
                      nativeW={ratioGeometry.nativeW}
                      nativeH={ratioGeometry.nativeH}
                    />
                  </div>



                  {/* Hover Floating Controls on Card Stage for Image adjustments */}
                  {currentSlide.image && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/20">
                      <button
                        type="button"
                        onClick={() => {
                          const nextFit = (currentSlide.imageFit || activeImageFit) === "cover" ? "contain" : "cover";
                          updateCurrentSlide({ imageFit: nextFit });
                        }}
                        className="w-7 h-7 rounded-md hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Toggle contain/cover"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCurrentSlide({ image: "" })}
                        className="w-7 h-7 rounded-md hover:bg-red-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ---------------- FILMSTRIP WRAP (STYLE BAR + FILMSTRIP) ---------------- */}
              <div id="filmstrip-wrap" className="shrink-0 border-t border-[var(--line)] bg-[var(--panel)]">
                {/* ---------------- QUICK STYLE BAR (#style-bar) ---------------- */}
                <div id="style-bar" className="style-bar select-none">
                  <span className="sb-label">
                    <i className="fas fa-swatchbook" />
                    <span>Style</span>
                  </span>

                  {/* Quick style pills */}
                  <div className="sb-list" id="sb-list">
                    {[
                      { id: "hero", label: "Photo Hero", color: "#141414", a: "#c6f432" },
                      { id: "split", label: "Split", color: "#ffffff", a: "#3b82f6" },
                      { id: "torn", label: "Scrapbook", color: "#fef3c7", a: "#ef4444" },
                      { id: "editorial", label: "Editorial Photo", color: "#1c1917", a: "#fafaf9" },
                      { id: "brutalism", label: "Brutalism", color: "#facc15", a: "#141414" },
                      { id: "swiss", label: "Swiss Bold", color: "#ef4444", a: "#ffffff" },
                      { id: "pop", label: "Neon Pop", color: "#ec4899", a: "#c6f432" },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(style.id);
                          setSelectedSchemeIndex(0);
                          setAccentColorOverride(null);
                          toast.success(`Style: ${style.label}`);
                        }}
                        className={cn(
                          "sb-chip cursor-pointer",
                          selectedTemplateId === style.id && "on"
                        )}
                      >
                        <span
                          className="sw"
                          style={{
                            background: `linear-gradient(135deg, ${style.color} 50%, ${style.a} 50%)`,
                          }}
                        />
                        <span>{style.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Shuffle Button (Electric Lime) */}
                  <button
                    type="button"
                    id="sb-shuffle"
                    onClick={handleShuffleStyle}
                    className="sb-shuffle cursor-pointer"
                    title="Randomize style & scheme (R)"
                  >
                    <i className="fas fa-dice" />
                    <span>Shuffle</span>
                  </button>

                  <button
                    type="button"
                    id="sb-more"
                    onClick={() => setActiveTab("templates")}
                    className="sb-more cursor-pointer"
                    title="View all 28 styles"
                  >
                    <span>See all</span>
                    <i className="fas fa-arrow-right" />
                  </button>
                </div>

                {/* ---------------- BOTTOM FILMSTRIP (#filmstrip) ---------------- */}
                <div
                  id="filmstrip"
                  className="flex items-center gap-3 px-4 py-3 overflow-x-auto"
                >
                  {slides.map((s, idx) => {
                    const isActive = currentSlideIndex === idx;
                    const thumbW =
                      aspectRatio === "1:1"
                        ? 92
                        : aspectRatio === "4:5"
                          ? 74
                          : aspectRatio === "9:16"
                            ? 52
                            : 92;
                    const thumbH =
                      aspectRatio === "16:9"
                        ? 52
                        : 92;
                    const nativeW = aspectRatio === "16:9" ? 1920 : 1080;
                    const nativeH =
                      aspectRatio === "1:1"
                        ? 1080
                        : aspectRatio === "4:5"
                          ? 1350
                          : aspectRatio === "9:16"
                            ? 1920
                            : 1080;
                    const scale = thumbH / nativeH;

                    return (
                      <div
                        key={s.id}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={cn(
                          "film-item",
                          isActive && "active"
                        )}
                        data-index={idx}
                      >
                        <div
                          className="film-thumb"
                          style={{ width: `${thumbW}px`, height: `${thumbH}px` }}
                        >
                          <div
                            style={{
                              transform: `scale(${scale})`,
                              width: `${nativeW}px`,
                              height: `${nativeH}px`,
                              transformOrigin: "top left",
                              position: "absolute",
                              top: 0,
                              left: 0,
                              pointerEvents: "none",
                            }}
                          >
                            <SlideCanvasRenderer
                              slide={s}
                              slideIndex={idx}
                              totalSlides={slides.length}
                              aspectRatio={aspectRatio}
                              templateId={selectedTemplateId || "hero"}
                              activeScheme={activeScheme}
                              titleFont={titleFont}
                              bodyFont={bodyFont}
                              brand={brandHandle || "@theabreed"}
                              site={brandWebsite || (extractedSource?.domain ? extractedSource.domain.replace(/^www\./, "") : extractedSource?.siteName || "TechCrunch")}
                              swipeText={language === "ko" ? "다음 →" : "Swipe →"}
                              textAlign={textAlign}
                              titleWeight={titleWeight}
                              titleCase={titleCase}
                              tracking={tracking}
                              leading={leading}
                              hasTitleShadow={hasTitleShadow}
                              isGradientBg={isGradientBg}
                              gradientAngle={gradientAngle}
                              gradientEndColor={gradientEndColor}
                              showImageTextOverlay={showImageTextOverlay}
                              showSafeArea={false}
                              platformName={currentPlatformMeta.name}
                              isInteractive={false}
                              nativeW={nativeW}
                              nativeH={nativeH}
                            />
                          </div>
                        </div>
                        <span className="film-num">{idx + 1}</span>
                        <span className="film-type">{s.type ? s.type.toUpperCase() : (idx === 0 ? "CTA" : "CONTENT")}</span>
                      </div>
                    );
                  })}

                  {/* Single Authentic Add Slide Button matching Swipera */}
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="film-add"
                    style={{
                      width: `${aspectRatio === "1:1" ? 92 : aspectRatio === "4:5" ? 74 : aspectRatio === "9:16" ? 52 : 92}px`,
                      height: `${aspectRatio === "16:9" ? 52 : 92}px`,
                    }}
                    title="Add slide"
                  >
                    <i className="fas fa-plus" />
                  </button>
                </div>
              </div>
            </main>

            {/* =====================================================================
              2.4 RIGHT INSPECTOR PANEL (Slide Properties)
              ===================================================================== */}
            {isInspectorOpen && (
              <SlidePropertiesInspector
                currentSlide={currentSlide}
                currentSlideIndex={currentSlideIndex}
                totalSlides={slides.length}
                updateCurrentSlide={updateCurrentSlide}
                activeScheme={activeScheme}
                language={language}
                isEasyMode={isEasyMode}
                setIsEasyMode={setIsEasyMode}
                onClose={() => setIsInspectorOpen(false)}
                slides={slides}
                setSlides={setSlides}
                handleSingleSlideImageUpload={handleSingleSlideImageUpload}
                handleAIRewrite={handleAIRewrite}
              />
            )}

            {/* Show Inspector Pill (When closed) */}
            {!isInspectorOpen && (
              <button
                type="button"
                onClick={() => setIsInspectorOpen(true)}
                className="absolute top-3 right-3 z-30 px-2.5 py-1.5 rounded-lg bg-[var(--panel)] border border-[var(--line)] text-xs font-bold shadow-md hover:bg-[var(--hover)] flex items-center gap-1 text-[var(--fg)] cursor-pointer"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
                <span>Inspector</span>
              </button>
            )}
      </div>
    </div>

        {/* =========================================================================
            3. FINISHED EXAMPLES MODAL DRAWER (25 EXAMPLES ACROSS 7 INDUSTRIES)
            ========================================================================= */}
        <ExampleGalleryModal
          isOpen={isExamplesModalOpen}
          onClose={() => setIsExamplesModalOpen(false)}
          onSelectExample={handleSelectExample}
          language={language}
        />

        {/* =========================================================================
            4. 43-FONTS VISUAL PICKER MODAL
            ========================================================================= */}
        {isFontModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsFontModalOpen(false)}
          >
            <div
              className="w-full max-w-3xl max-h-[80vh] bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[var(--fg)]">
                    Curated Typography Library ({swiperaFontsData.length} Fonts)
                  </h3>
                  <p className="text-xs text-[var(--muted)]">Pick a typeface for your {fontModalTarget === "title" ? "headlines" : "body text"}.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFontModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Font Categories Filter */}
              <div className="px-4 py-2 border-b border-[var(--line)] bg-[var(--bg)] flex gap-1.5 overflow-x-auto">
                {["all", "sans", "serif", "display", "mono", "kr"].map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setFontCategoryFilter(kind)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase transition-all",
                      fontCategoryFilter === kind
                        ? "bg-[var(--fg)] text-[var(--bg)]"
                        : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]"
                    )}
                  >
                    {kind}
                  </button>
                ))}
              </div>

              {/* Font Cards Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredFonts.map((f: any) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      if (fontModalTarget === "title") setTitleFont(f.name);
                      else setBodyFont(f.name);
                      setIsFontModalOpen(false);
                      toast.success(`Selected font: ${f.name}`);
                    }}
                    className={cn(
                      "p-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:border-[#c6f432] cursor-pointer transition-all flex flex-col justify-between group",
                      (fontModalTarget === "title" ? titleFont : bodyFont) === f.name && "border-[#c6f432] bg-[#c6f432]/10"
                    )}
                  >
                    <div className="text-[10px] font-mono text-[var(--muted)] uppercase">{f.kind}</div>
                    <div
                      className="text-base font-bold my-2 truncate text-[var(--fg)] group-hover:text-[#365300] dark:group-hover:text-[#c6f432]"
                      style={{ fontFamily: f.css || f.name }}
                    >
                      {f.name}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">Ag 123 Preview</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Existing Composer and Auth Modals */}
        {isComposerOpen && (
          <ComposerSheet
            isOpen={isComposerOpen}
            onClose={() => setIsComposerOpen(false)}
            initialPost={composerPost as any}
          />
        )}

        {isAuthModalOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsAuthModalOpen(false);
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          >
            <div className="w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
              <AuthForm
                initialMode={authModalMode}
                onClose={() => setIsAuthModalOpen(false)}
                isModal={true}
              />
            </div>
          </div>
        )}
        {/* =========================================================================
            VIEW & EDIT EXTRACTED RAW SOURCE MODAL
            ========================================================================= */}
        {isViewSourceModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsViewSourceModalOpen(false)}
          >
            <div
              className="w-full max-w-2xl bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">
                    Extracted Raw Source Content
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Review or edit the raw article text that AI will use to architect and write your slides.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsViewSourceModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                <textarea
                  rows={14}
                  value={viewSourceText}
                  onChange={(e) => setViewSourceText(e.target.value)}
                  className="field text-xs font-mono leading-relaxed resize-none p-3"
                  placeholder="Extracted raw source text will appear here..."
                />
                <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
                  <span>
                    {(viewSourceText.match(/[\p{L}\p{N}]+/gu) || []).length.toLocaleString()} words · {viewSourceText.length.toLocaleString()} chars
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsViewSourceModalOpen(false)}
                      className="btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveViewSourceText}
                      className="btn-sm btn-primary"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Apply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            EXTRACTED IMAGES FULL GALLERY MODAL
            ========================================================================= */}
        {isGalleryModalOpen && extractedSource && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsGalleryModalOpen(false)}
          >
            <div
              className="w-full max-w-3xl max-h-[85vh] bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">
                    Extracted Article Images ({extractedSource.images?.length || 0})
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Click any image to insert it into current slide ({currentSlideIndex + 1}). Click the star (★) to set as cover photo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {(extractedSource.images || []).map((img, idx) => {
                  const isCover = img.url === extractedSource.image;
                  const isUsed = slides.some((s) => s.image === img.url);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        updateCurrentSlide({ image: img.url });
                        toast.success(`Applied image to slide ${currentSlideIndex + 1}!`);
                        setIsGalleryModalOpen(false);
                      }}
                      className={cn(
                        "group relative aspect-[4/3] rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] shadow-xs",
                        isCover
                          ? "border-[#c6f432] ring-2 ring-[#c6f432]"
                          : isUsed
                          ? "border-emerald-500"
                          : "border-[var(--line)] hover:border-[var(--fg)]"
                      )}
                    >
                      <img
                        src={`/api/proxy-image?url=${encodeURIComponent(img.url)}`}
                        alt={img.alt || `Extracted image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExtractedSource({
                            ...extractedSource,
                            image: img.url,
                          });
                          setUseHeroOnCover(true);
                          if (slides[0]) {
                            const next = [...slides];
                            next[0] = { ...next[0], image: img.url };
                            setSlides(next);
                            recordHistory(next);
                          }
                          toast.success("Cover image updated.");
                        }}
                        className={cn(
                          "absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                          isCover ? "bg-[#c6f432] text-black" : "bg-black/60 text-white/80 hover:text-white"
                        )}
                        title="Set as cover photo"
                      >
                        <i className="fas fa-star text-[10px]" />
                      </button>
                      {isUsed && (
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                          IN USE
                        </span>
                      )}
                      {img.alt && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[9px] text-white/90 truncate">
                          {img.alt}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CUSTOM AI SLIDE REWRITE PROMPT MODAL
            ========================================================================= */}
        {isCustomPromptModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsCustomPromptModalOpen(false)}
          >
            <div
              className="w-full max-w-md bg-[var(--panel)] rounded-2xl border border-[var(--line)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">
                    Custom AI Rewrite Instruction
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Tell AI how you want to rephrase slide {currentSlideIndex + 1}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomPromptModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <textarea
                  rows={4}
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder="e.g. Make it appeal to tech founders / Add concrete metrics / Highlight key quote"
                  className="field text-xs resize-none p-3"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomPromptModalOpen(false)}
                    className="btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!customPromptText.trim()) {
                        toast.error("Please enter an instruction.");
                        return;
                      }
                      setIsCustomPromptModalOpen(false);
                      toast.loading("AI is rewriting slide...", { id: "custom-rewrite" });
                      try {
                        const res = await fetch("/api/rewrite", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            slide: currentSlide,
                            type: "custom",
                            customInstruction: customPromptText,
                          }),
                        });
                        const data = await res.json();
                        if (data.title || data.body) {
                          updateCurrentSlide({
                            title: data.title || currentSlide.title,
                            body: data.body || currentSlide.body,
                            label: data.label || currentSlide.label,
                            items: data.items || currentSlide.items,
                          });
                          toast.success("Slide rewritten successfully!", { id: "custom-rewrite" });
                        }
                      } catch {
                        toast.error("An error occurred while rewriting.", { id: "custom-rewrite" });
                      }
                    }}
                    className="btn-sm btn-primary"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rewrite with AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Autonomous Daily Flywheel Configuration & Testing Modal */}
        <DailyFlywheelModal
          isOpen={isFlywheelModalOpen}
          onClose={() => setIsFlywheelModalOpen(false)}
          onScheduledSuccess={() => handleNavSelect("calendar")}
        />
      </div>
    </>
  );
}
export default SwiperaStudioWorkspace;
