import { RathEditPlan, AuteurEditPlan, PlannedScene } from "./gemini-video-pipeline";
import { VIDEO_TEMPLATES } from "@/data/videoTemplates";

export type StyleLayoutFamily =
  | "split_explainer"
  | "whiteboard_marker"
  | "chalkboard"
  | "receipt_roll"
  | "paper_studio"
  | "lime_slides"
  | "editorial_magazine"
  | "neon_cyber"
  | "hype_verdict"
  | "blueprint_dashboard"
  | "sketchbook"
  | "dossier_investigative"
  | "swiss_grid"
  | "collage_paper"
  | "glass_prism"
  | "bento_grid"
  | "card_deck"
  | "phone_mockup"
  | "sticker_talk"
  | "documentary"
  | "saas_dashboard"
  | "faceless_globe"
  | "retro_vhs"
  | "kinetic_type";

export interface StyleVisualConfig {
  styleId: string;
  styleName: string;
  layoutFamily: StyleLayoutFamily;
  canvasBgHex: string; // FFmpeg 0xRRGGBB
  cardBorderHex: string; // FFmpeg 0xRRGGBB
  gridLineHex: string; // FFmpeg 0xRRGGBB
  highlightHex: string; // #RRGGBB for top header box & callouts
  highlightTextHex: string; // #RRGGBB text inside highlight box
  metaTextAssColor: string; // ASS &H00BBGGRR
  headlinePrimaryAssColor: string; // ASS &H00BBGGRR
  headlineSecondaryAssColor: string; // ASS &H00BBGGRR
  captionActiveAssColor: string; // ASS &H00BBGGRR
  captionDimAssColor: string; // ASS &H00BBGGRR
  badgeBgAssColor: string; // ASS &H00BBGGRR
  badgeTextAssColor: string; // ASS &H00BBGGRR
  isDarkCanvas: boolean;
}

/**
 * Convert standard #RRGGBB hex into ASS &H00BBGGRR color string
 */
export function hexToAssColor(hex: string, alphaHex = "00"): string {
  const clean = hex.replace("#", "").replace(/^0x/i, "").trim();
  if (clean.length !== 6) return `&H${alphaHex}FFFFFF`;
  const r = clean.slice(0, 2).toUpperCase();
  const g = clean.slice(2, 4).toUpperCase();
  const b = clean.slice(4, 6).toUpperCase();
  return `&H${alphaHex}${b}${g}${r}`;
}

/**
 * Format seconds into ASS timestamp H:MM:SS.cc
 */
export function formatAssTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = Math.floor(safe % 60);
  const cs = Math.min(99, Math.round((safe - Math.floor(safe)) * 100));
  return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

/**
 * Format seconds into SMPTE timecode 00:00:SS:FF (30 fps)
 */
export function formatSmpteTimecode(seconds: number, fps = 30): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const frames = Math.floor((safe - Math.floor(safe)) * fps);
  return `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

/**
 * Exact lookup table for all 56 Reerts studio styles so every single style ID
 * resolves to its authentic name, palette, and layout family.
 */
const EXACT_STYLE_CATALOG: Record<
  string,
  {
    name: string;
    family: StyleLayoutFamily;
    bg: string;
    border: string;
    grid: string;
    highlight: string;
    highlightText: string;
    isDark: boolean;
  }
> = {
  // 1. Glitch
  "classified-yt": {
    name: "Glitch",
    family: "split_explainer",
    bg: "0x0B0B0E",
    border: "0xFACC15",
    grid: "0x27272A",
    highlight: "#FACC15",
    highlightText: "#0B0B0E",
    isDark: true,
  },
  // 2. Lime Slides
  limeslides: {
    name: "Lime Slides",
    family: "lime_slides",
    bg: "0xC6FF3D",
    border: "0x111111",
    grid: "0x111111",
    highlight: "#111111",
    highlightText: "#C6FF3D",
    isDark: false,
  },
  // 3. Forest Edit
  "cap-forest": {
    name: "Forest Edit",
    family: "editorial_magazine",
    bg: "0x0F291E",
    border: "0xD4AF37",
    grid: "0x1E4635",
    highlight: "#D4AF37",
    highlightText: "#0F291E",
    isDark: true,
  },
  // 4. Paper Studio
  "cap-paper": {
    name: "Paper Studio",
    family: "paper_studio",
    bg: "0xF4F1EA",
    border: "0x18181B",
    grid: "0xD6D1C4",
    highlight: "#FACC15",
    highlightText: "#111111",
    isDark: false,
  },
  // 5. Rank Rush
  "fmt-countdown": {
    name: "Rank Rush",
    family: "hype_verdict",
    bg: "0x0B0B0E",
    border: "0xFACC15",
    grid: "0x27272A",
    highlight: "#FACC15",
    highlightText: "#0B0B0E",
    isDark: true,
  },
  // 6. Three Act
  "split-act": {
    name: "Three Act",
    family: "split_explainer",
    bg: "0x0B0B0E",
    border: "0xEF4444",
    grid: "0x27272A",
    highlight: "#EF4444",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 7. Kinetic Type
  kinetic: {
    name: "Kinetic Type",
    family: "kinetic_type",
    bg: "0x000000",
    border: "0xFFFFFF",
    grid: "0x333333",
    highlight: "#FF3B4E",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 8. Sketchbook
  "frame-sketch": {
    name: "Sketchbook",
    family: "sketchbook",
    bg: "0xF5EFEB",
    border: "0x2563EB",
    grid: "0xE2D9D0",
    highlight: "#DC2626",
    highlightText: "#FFFFFF",
    isDark: false,
  },
  // 9. Case File
  "frame-dossier": {
    name: "Case File",
    family: "dossier_investigative",
    bg: "0xE8E3D9",
    border: "0x854D0E",
    grid: "0xD1C9BC",
    highlight: "#EAB308",
    highlightText: "#422006",
    isDark: false,
  },
  // 10. Swiss Grid
  swiss: {
    name: "Swiss Grid",
    family: "swiss_grid",
    bg: "0xFFFFFF",
    border: "0xDC2626",
    grid: "0xE5E7EB",
    highlight: "#DC2626",
    highlightText: "#FFFFFF",
    isDark: false,
  },
  // 11. Paper Collage
  collage: {
    name: "Paper Collage",
    family: "collage_paper",
    bg: "0xF7F4EC",
    border: "0x1E293B",
    grid: "0xE2DDD2",
    highlight: "#F59E0B",
    highlightText: "#1E293B",
    isDark: false,
  },
  // 12. Graphics First
  "kallaway-broll": {
    name: "Graphics First",
    family: "split_explainer",
    bg: "0x09090B",
    border: "0x3B82F6",
    grid: "0x27272A",
    highlight: "#3B82F6",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 13. Split Stack
  splitstack: {
    name: "Split Stack",
    family: "split_explainer",
    bg: "0x0F291E",
    border: "0x34D399",
    grid: "0x164E38",
    highlight: "#34D399",
    highlightText: "#064E3B",
    isDark: true,
  },
  // 14. Side by Side
  "split-duo": {
    name: "Side by Side",
    family: "editorial_magazine",
    bg: "0xFBF7F0",
    border: "0x0F291E",
    grid: "0xE5E1D8",
    highlight: "#0F291E",
    highlightText: "#FFFFFF",
    isDark: false,
  },
  // 15. Blueprint
  "frame-blueprint": {
    name: "Blueprint",
    family: "blueprint_dashboard",
    bg: "0x0B2545",
    border: "0xFACC15",
    grid: "0x134074",
    highlight: "#FACC15",
    highlightText: "#0B2545",
    isDark: true,
  },
  // 16. Prism Glass
  "frame-prism": {
    name: "Prism Glass",
    family: "glass_prism",
    bg: "0x0A0A0F",
    border: "0x60A5FA",
    grid: "0x1E1E2E",
    highlight: "#C084FC",
    highlightText: "#0A0A0F",
    isDark: true,
  },
  // 17. Bento Box
  "frame-bento": {
    name: "Bento Box",
    family: "bento_grid",
    bg: "0x0F172A",
    border: "0x38BDF8",
    grid: "0x1E293B",
    highlight: "#38BDF8",
    highlightText: "#0F172A",
    isDark: true,
  },
  // 18. Card Deck
  "split-deck": {
    name: "Card Deck",
    family: "card_deck",
    bg: "0x2E1065",
    border: "0xF43F5E",
    grid: "0x4C1D95",
    highlight: "#F43F5E",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 19. Phone in Frame
  "split-phone": {
    name: "Phone in Frame",
    family: "phone_mockup",
    bg: "0xFDF2F8",
    border: "0xEC4899",
    grid: "0xFCE7F3",
    highlight: "#EC4899",
    highlightText: "#FFFFFF",
    isDark: false,
  },
  // 20. Launch Demo
  "fmt-demo": {
    name: "Launch Demo",
    family: "bento_grid",
    bg: "0x18181B",
    border: "0xA855F7",
    grid: "0x27272A",
    highlight: "#34D399",
    highlightText: "#064E3B",
    isDark: true,
  },
  // 21. Chalk Talk
  "fmt-chalk": {
    name: "Chalk Talk",
    family: "chalkboard",
    bg: "0x1B2A1E",
    border: "0xEAB308",
    grid: "0x243828",
    highlight: "#FACC15",
    highlightText: "#1B2A1E",
    isDark: true,
  },
  // 22. Dry Erase
  "cap-marker": {
    name: "Dry Erase",
    family: "whiteboard_marker",
    bg: "0xF8FAFC",
    border: "0x1D4ED8",
    grid: "0xE2E8F0",
    highlight: "#DC2626",
    highlightText: "#FFFFFF",
    isDark: false,
  },
  // 23. Sticker Talk
  sticker: {
    name: "Sticker Talk",
    family: "sticker_talk",
    bg: "0x111827",
    border: "0xEF4444",
    grid: "0x1F2937",
    highlight: "#FACC15",
    highlightText: "#111827",
    isDark: true,
  },
  // 24. Editorial Cards
  editorial: {
    name: "Editorial Cards",
    family: "editorial_magazine",
    bg: "0xFAF8F5",
    border: "0x475569",
    grid: "0xE2E8F0",
    highlight: "#E2E8F0",
    highlightText: "#0F172A",
    isDark: false,
  },
  // 25. Documentary
  documentary: {
    name: "Documentary",
    family: "documentary",
    bg: "0x141414",
    border: "0xD4AF37",
    grid: "0x262626",
    highlight: "#D4AF37",
    highlightText: "#141414",
    isDark: true,
  },
  // 26. SaaS Dashboard
  dashboard: {
    name: "SaaS Dashboard",
    family: "saas_dashboard",
    bg: "0x0B0F19",
    border: "0x3B82F6",
    grid: "0x1E293B",
    highlight: "#3B82F6",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 27. Faceless Explainer
  "faceless-explainer": {
    name: "Faceless Explainer",
    family: "split_explainer",
    bg: "0x0F172A",
    border: "0x38BDF8",
    grid: "0x1E293B",
    highlight: "#38BDF8",
    highlightText: "#0F172A",
    isDark: true,
  },
  // 28. Doodle Story
  "doodle-story": {
    name: "Doodle Story",
    family: "sketchbook",
    bg: "0xFFFBEB",
    border: "0x000000",
    grid: "0xFEF3C7",
    highlight: "#F59E0B",
    highlightText: "#000000",
    isDark: false,
  },
  // 29. Geoglobe
  geoglobe: {
    name: "Geoglobe",
    family: "faceless_globe",
    bg: "0x0A0E1A",
    border: "0x10B981",
    grid: "0x132238",
    highlight: "#10B981",
    highlightText: "#0A0E1A",
    isDark: true,
  },
  // 30. Countryballs
  countryballs: {
    name: "Countryballs",
    family: "sticker_talk",
    bg: "0x1E3A8A",
    border: "0xEF4444",
    grid: "0x1E40AF",
    highlight: "#FACC15",
    highlightText: "#1E3A8A",
    isDark: true,
  },
  // 31. Field Guide 3D
  catcharium: {
    name: "Field Guide 3D",
    family: "documentary",
    bg: "0x064E3B",
    border: "0x6EE7B7",
    grid: "0x047857",
    highlight: "#6EE7B7",
    highlightText: "#064E3B",
    isDark: true,
  },
  // 32. Story from clips
  story: {
    name: "Story from clips",
    family: "editorial_magazine",
    bg: "0x1C1917",
    border: "0xF97316",
    grid: "0x292524",
    highlight: "#F97316",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 33. Desk Collage
  deskcollage: {
    name: "Desk Collage",
    family: "collage_paper",
    bg: "0xEFECE6",
    border: "0x334155",
    grid: "0xCBD5E1",
    highlight: "#F43F5E",
    highlightText: "#FFFFFF",
    isDark: false,
  },
  // 34. Neon Glitch
  neon: {
    name: "Neon Glitch",
    family: "neon_cyber",
    bg: "0x05050A",
    border: "0x06B6D4",
    grid: "0x1E1B4B",
    highlight: "#F43F5E",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 35. Breaking News
  newsroom: {
    name: "Breaking News",
    family: "split_explainer",
    bg: "0x7F1D1D",
    border: "0xFACC15",
    grid: "0x991B1B",
    highlight: "#FACC15",
    highlightText: "#7F1D1D",
    isDark: true,
  },
  // 36. Tutorial
  tutorial: {
    name: "Tutorial",
    family: "bento_grid",
    bg: "0x0F172A",
    border: "0x22C55E",
    grid: "0x1E293B",
    highlight: "#22C55E",
    highlightText: "#0F172A",
    isDark: true,
  },
  // 37. Retro VHS
  vhs: {
    name: "Retro VHS",
    family: "retro_vhs",
    bg: "0x18181B",
    border: "0x06B6D4",
    grid: "0x27272A",
    highlight: "#F43F5E",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 38. Hot Seat
  "fmt-hottake": {
    name: "Hot Seat",
    family: "hype_verdict",
    bg: "0x450A0A",
    border: "0xF97316",
    grid: "0x7F1D1D",
    highlight: "#EF4444",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 39. Chapter Book
  "fmt-storytime": {
    name: "Chapter Book",
    family: "editorial_magazine",
    bg: "0xFBF8F1",
    border: "0x854D0E",
    grid: "0xE7E0CE",
    highlight: "#B45309",
    highlightText: "#FFFFFF",
    isDark: false,
  },
  // 40. Myth Buster
  "fmt-mythfact": {
    name: "Myth Buster",
    family: "split_explainer",
    bg: "0x0B0B0E",
    border: "0x10B981",
    grid: "0x27272A",
    highlight: "#EF4444",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 41. Just Landed
  "fmt-deal": {
    name: "Just Landed",
    family: "hype_verdict",
    bg: "0x064E3B",
    border: "0xFACC15",
    grid: "0x047857",
    highlight: "#FACC15",
    highlightText: "#064E3B",
    isDark: true,
  },
  // 42. Glowline
  "cap-glowline": {
    name: "Glowline",
    family: "neon_cyber",
    bg: "0x09090B",
    border: "0xA855F7",
    grid: "0x18181B",
    highlight: "#C084FC",
    highlightText: "#09090B",
    isDark: true,
  },
  // 43. Slapword
  "cap-slap": {
    name: "Slapword",
    family: "kinetic_type",
    bg: "0x000000",
    border: "0xFACC15",
    grid: "0x18181B",
    highlight: "#FACC15",
    highlightText: "#000000",
    isDark: true,
  },
  // 44. Velvet
  "cap-velvet": {
    name: "Velvet",
    family: "editorial_magazine",
    bg: "0x2E1065",
    border: "0xF472B6",
    grid: "0x3B0764",
    highlight: "#F472B6",
    highlightText: "#2E1065",
    isDark: true,
  },
  // 45. Receipt Roll
  "cap-receipt": {
    name: "Receipt Roll",
    family: "receipt_roll",
    bg: "0xFAF8F5",
    border: "0x18181B",
    grid: "0xE5E1D8",
    highlight: "#18181B",
    highlightText: "#FAF8F5",
    isDark: false,
  },
  // 46. Nightline
  "cap-nightline": {
    name: "Nightline",
    family: "split_explainer",
    bg: "0x020617",
    border: "0x38BDF8",
    grid: "0x0F172A",
    highlight: "#38BDF8",
    highlightText: "#020617",
    isDark: true,
  },
  // 47. Price Drop
  "cap-dealtag": {
    name: "Price Drop",
    family: "hype_verdict",
    bg: "0x7F1D1D",
    border: "0xFACC15",
    grid: "0x991B1B",
    highlight: "#FACC15",
    highlightText: "#7F1D1D",
    isDark: true,
  },
  // 48. Chrome Candy
  "cap-chrome": {
    name: "Chrome Candy",
    family: "glass_prism",
    bg: "0x18181B",
    border: "0xE879F9",
    grid: "0x27272A",
    highlight: "#38BDF8",
    highlightText: "#18181B",
    isDark: true,
  },
  // 49. Orbit
  "frame-orbit": {
    name: "Orbit",
    family: "lime_slides",
    bg: "0x09090B",
    border: "0x22C55E",
    grid: "0x18181B",
    highlight: "#22C55E",
    highlightText: "#09090B",
    isDark: true,
  },
  // 50. Cover Story
  "frame-elevate": {
    name: "Cover Story",
    family: "editorial_magazine",
    bg: "0xF8FAFC",
    border: "0x0F172A",
    grid: "0xE2E8F0",
    highlight: "#0F172A",
    highlightText: "#FFFFFF",
    isDark: false,
  },
  // 51. Sliding Seam
  "split-seam": {
    name: "Sliding Seam",
    family: "split_explainer",
    bg: "0x0F172A",
    border: "0xF59E0B",
    grid: "0x1E293B",
    highlight: "#F59E0B",
    highlightText: "#0F172A",
    isDark: true,
  },
  // 52. Diagonal Cut
  "split-slash": {
    name: "Diagonal Cut",
    family: "split_explainer",
    bg: "0x111827",
    border: "0xEC4899",
    grid: "0x1F2937",
    highlight: "#EC4899",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 53. Corner Cam
  "split-pip": {
    name: "Corner Cam",
    family: "bento_grid",
    bg: "0x09090B",
    border: "0x6366F1",
    grid: "0x18181B",
    highlight: "#6366F1",
    highlightText: "#FFFFFF",
    isDark: true,
  },
  // 54. Magazine Spread
  "split-mag": {
    name: "Magazine Spread",
    family: "editorial_magazine",
    bg: "0xFAF5EF",
    border: "0x1C1917",
    grid: "0xE7E0D3",
    highlight: "#1C1917",
    highlightText: "#FAF5EF",
    isDark: false,
  },
  // 55. AI-UGC in Sticker Talk
  ugc: {
    name: "AI-UGC in Sticker Talk",
    family: "sticker_talk",
    bg: "0x0F172A",
    border: "0xFACC15",
    grid: "0x1E293B",
    highlight: "#FACC15",
    highlightText: "#0F172A",
    isDark: true,
  },
  // 56. AI-UGC in Editorial Cards
  "ugc-2": {
    name: "AI-UGC in Editorial Cards",
    family: "editorial_magazine",
    bg: "0xF1F5F9",
    border: "0x3B82F6",
    grid: "0xCBD5E1",
    highlight: "#3B82F6",
    highlightText: "#FFFFFF",
    isDark: false,
  },
};

/**
 * Resolves the visual configuration for any of the 56 Reerts Studio styles
 */
export function getStyleVisualConfig(rawStyleId?: string): StyleVisualConfig {
  const rawId = (rawStyleId || "cap-paper").trim();
  const id = rawId.toLowerCase();

  const exact =
    EXACT_STYLE_CATALOG[rawId] ||
    EXACT_STYLE_CATALOG[id] ||
    Object.entries(EXACT_STYLE_CATALOG).find(([k]) => k.toLowerCase() === id)?.[1];

  const tpl = VIDEO_TEMPLATES.find(
    (t) => t.id === rawId || t.id.toLowerCase() === id
  );

  if (exact) {
    const borderClean = "#" + exact.border.replace(/^0x/i, "");
    return {
      styleId: rawId,
      styleName: tpl?.name || exact.name,
      layoutFamily: exact.family,
      canvasBgHex: exact.bg,
      cardBorderHex: exact.border,
      gridLineHex: exact.grid,
      highlightHex: exact.highlight,
      highlightTextHex: exact.highlightText,
      metaTextAssColor: exact.isDark
        ? hexToAssColor("#A1A1AA")
        : hexToAssColor("#334155"),
      headlinePrimaryAssColor: hexToAssColor("#FFFFFF"),
      headlineSecondaryAssColor: hexToAssColor(exact.highlight),
      captionActiveAssColor: exact.isDark
        ? hexToAssColor(exact.highlight)
        : hexToAssColor("#FFFFFF"),
      captionDimAssColor: exact.isDark
        ? hexToAssColor("#94A3B8")
        : hexToAssColor("#CBD5E1"),
      badgeBgAssColor: hexToAssColor(borderClean),
      badgeTextAssColor: exact.isDark
        ? hexToAssColor("#09090B")
        : hexToAssColor("#FFFFFF"),
      isDarkCanvas: exact.isDark,
    };
  }

  // Fallback defaults to Paper Studio
  const fallback = EXACT_STYLE_CATALOG["cap-paper"];
  return {
    styleId: rawId,
    styleName: tpl?.name || fallback.name,
    layoutFamily: fallback.family,
    canvasBgHex: fallback.bg,
    cardBorderHex: fallback.border,
    gridLineHex: fallback.grid,
    highlightHex: fallback.highlight,
    highlightTextHex: fallback.highlightText,
    metaTextAssColor: hexToAssColor("#4B4843"),
    headlinePrimaryAssColor: hexToAssColor("#FFFFFF"),
    headlineSecondaryAssColor: hexToAssColor("#FFFFFF"),
    captionActiveAssColor: hexToAssColor("#FFFFFF"),
    captionDimAssColor: hexToAssColor("#9CA3AF"),
    badgeBgAssColor: hexToAssColor("#18181B"),
    badgeTextAssColor: hexToAssColor("#F4F1EA"),
    isDarkCanvas: false,
  };
}

function sanitizeAssText(input: string): string {
  return (input || "")
    .replace(/[{}]/g, "")
    .replace(/\r?\n/g, " ")
    .trim();
}

/**
 * Splits a headline/subAccent or spoken hook into two punchy stacked uppercase lines
 */
export function resolveSceneHeadlinePair(
  scene: PlannedScene,
  sceneIndex: number,
  transcriptWords?: Array<{ word: string; start: number; end: number }>
): [string, string] {
  const rawH1 = sanitizeAssText(scene.headline || "").toUpperCase();
  const rawH2 = sanitizeAssText(scene.subAccent || "").toUpperCase();

  if (sceneIndex === 0 && transcriptWords && transcriptWords.length >= 5) {
    const firstWords = transcriptWords
      .slice(0, 6)
      .map((w) => sanitizeAssText(w.word).toUpperCase());
    if (!rawH1 || rawH1 === "VIRAL EDIT") {
      return [
        firstWords.slice(0, 3).join(" "),
        firstWords.slice(3, 6).join(" "),
      ];
    }
  }

  if (rawH1 && rawH2) {
    return [rawH1.slice(0, 24), rawH2.slice(0, 26)];
  }

  const words = rawH1.split(/\s+/).filter(Boolean);
  if (words.length >= 4) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }
  return [rawH1 || "KEY INSIGHT", rawH2 || "THE BREAKDOWN"];
}

export interface BuildAssOptions {
  styleId: string;
  durationSec: number;
  plan?: RathEditPlan;
  transcriptWords?: Array<{ word: string; start: number; end: number }>;
  headlineFallback?: string;
  subAccentFallback?: string;
  includeSceneHeaders?: boolean;
}

/**
 * Generates an Advanced SubStation Alpha (.ass) file content for FFmpeg libass.
 */
export function buildRathAssScript(options: BuildAssOptions): string {
  const {
    styleId,
    durationSec = 37.3,
    plan,
    transcriptWords = [],
    headlineFallback = "VIRAL EDIT",
    subAccentFallback = "KEY TAKEAWAYS",
    includeSceneHeaders = true,
  } = options;

  const theme = getStyleVisualConfig(styleId);
  const totalDur = Math.max(5, durationSec);
  const endAss = formatAssTime(totalDur);

  const blackAss = hexToAssColor("#09090B");
  const whiteAss = hexToAssColor("#FFFFFF");
  const yellowAss = hexToAssColor("#FACC15");

  // Caption placement depends on layout family
  const isChinBoard =
    theme.layoutFamily === "whiteboard_marker" ||
    theme.layoutFamily === "receipt_roll";

  const captionX = includeSceneHeaders ? 92 : 540;
  const captionY = includeSceneHeaders
    ? 1535
    : isChinBoard
    ? 1110
    : 1235;
  const captionAlign = includeSceneHeaders ? 1 : 5;

  // Font choices customized per layout family
  let displayFont = "Liberation Sans";
  let bodyFont = "Liberation Sans";
  if (theme.layoutFamily === "editorial_magazine" || theme.layoutFamily === "documentary") {
    displayFont = "Liberation Serif";
  } else if (theme.layoutFamily === "chalkboard" || theme.layoutFamily === "sketchbook") {
    displayFont = "Liberation Sans";
  } else if (theme.layoutFamily === "blueprint_dashboard" || theme.layoutFamily === "saas_dashboard") {
    displayFont = "Liberation Sans";
  }

  const header = `[Script Info]
Title: Reerts Rath Studio Composite (${theme.styleName})
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: MetaLeft,JetBrains Mono,20,${theme.metaTextAssColor},${theme.metaTextAssColor},&H00000000,&H00000000,-1,0,0,0,100,100,1.5,0,1,0,0,7,0,0,0,1
Style: MetaRight,JetBrains Mono,20,${theme.metaTextAssColor},${theme.metaTextAssColor},&H00000000,&H00000000,-1,0,0,0,100,100,1.5,0,1,0,0,9,0,0,0,1
Style: Crosshair,JetBrains Mono,24,${theme.metaTextAssColor},${theme.metaTextAssColor},&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1
Style: Headline1,${displayFont},78,${theme.headlinePrimaryAssColor},${theme.headlinePrimaryAssColor},${blackAss},${blackAss},-1,0,0,0,100,100,1,0,1,4.5,3.5,8,40,40,0,1
Style: Headline2,${displayFont},78,${theme.headlineSecondaryAssColor},${theme.headlineSecondaryAssColor},${blackAss},${blackAss},-1,0,0,0,100,100,1,0,1,4.5,3.5,8,40,40,0,1
Style: ProofPill,JetBrains Mono,22,${theme.badgeTextAssColor},${theme.badgeTextAssColor},${theme.badgeBgAssColor},${theme.badgeBgAssColor},-1,0,0,0,100,100,1,0,3,10,0,8,40,40,0,1
Style: KaraokeCap,${bodyFont},46,${whiteAss},${theme.captionDimAssColor},${blackAss},&H99000000,-1,0,0,0,100,100,1.2,0,1,4.5,2.5,${captionAlign},30,30,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events: string[] = [];

  if (includeSceneHeaders) {
    // 1. Static Studio Crosshairs at 4 corners
    events.push(`Dialogue: 2,0:00:00.00,${endAss},Crosshair,,0,0,0,,{\\pos(42,96)}+`);
    events.push(`Dialogue: 2,0:00:00.00,${endAss},Crosshair,,0,0,0,,{\\pos(1038,96)}+`);
    events.push(`Dialogue: 2,0:00:00.00,${endAss},Crosshair,,0,0,0,,{\\pos(42,1668)}+`);
    events.push(`Dialogue: 2,0:00:00.00,${endAss},Crosshair,,0,0,0,,{\\pos(1038,1668)}+`);

    // 2. Studio Signature & Resolution Spec
    events.push(
      `Dialogue: 2,0:00:00.00,${endAss},MetaRight,,0,0,0,,{\\pos(1020,118)}EDITED BY REERTS RATH · ${theme.styleName.toUpperCase()}`
    );
    events.push(`Dialogue: 2,0:00:00.00,${endAss},MetaRight,,0,0,0,,{\\pos(1020,1614)}1080 × 1920 · 30 FPS`);

    // 3. Running SMPTE Timecode
    const stepSec = 0.5;
    for (let t = 0; t < totalDur; t += stepSec) {
      const tEnd = Math.min(totalDur, t + stepSec);
      const tc = formatSmpteTimecode(t + 0.36, 30);
      events.push(
        `Dialogue: 2,${formatAssTime(t)},${formatAssTime(tEnd)},MetaLeft,,0,0,0,,{\\pos(60,1614)}${tc}`
      );
    }

    // 4. Multi-Scene Stacked Headlines & Category Tag
    const scenes: PlannedScene[] =
      plan?.scenes && plan.scenes.length > 0
        ? plan.scenes
        : [
            {
              sceneId: "s1",
              start: 0,
              end: totalDur,
              headline: plan?.headline || headlineFallback,
              subAccent: plan?.subAccent || subAccentFallback,
              objective: "Hook",
              visualType: "split-hook",
              badgeText: "KEY TAKEAWAY",
              onScreenText: [headlineFallback, subAccentFallback],
            },
          ];

    scenes.forEach((scene, idx) => {
      const sStart = formatAssTime(scene.start);
      const sEnd = formatAssTime(Math.min(totalDur, Math.max(scene.start + 0.8, scene.end)));
      const topLeftLabel = sanitizeAssText(scene.badgeText || `SCENE 0${idx + 1}`).toUpperCase();

      events.push(
        `Dialogue: 3,${sStart},${sEnd},MetaLeft,,0,0,0,,{\\pos(60,118)}${topLeftLabel}`
      );

      const [line1, line2] = resolveSceneHeadlinePair(scene, idx, transcriptWords);
      events.push(
        `Dialogue: 4,${sStart},${sEnd},Headline1,,0,0,0,,{\\pos(540,195)\\fad(120,120)}${line1}`
      );
      if (line2) {
        events.push(
          `Dialogue: 4,${sStart},${sEnd},Headline2,,0,0,0,,{\\pos(540,285)\\fad(120,120)}${line2}`
        );
      }

      if (idx > 0 && scene.onScreenText && scene.onScreenText.length > 0) {
        const proofLabel = sanitizeAssText(scene.onScreenText[0]).toUpperCase();
        if (proofLabel && proofLabel !== line1 && proofLabel !== line2) {
          events.push(
            `Dialogue: 4,${sStart},${sEnd},ProofPill,,0,0,0,,{\\pos(540,392)\\fad(150,150)}  ${proofLabel}  `
          );
        }
      }
    });
  }

  // 5. Word-by-Word Highlighted Karaoke Captions
  const words =
    transcriptWords.length > 0
      ? transcriptWords
      : (plan?.headline || headlineFallback)
          .split(/\s+/)
          .map((w, i) => ({
            word: w,
            start: Number((0.2 + i * 0.4).toFixed(2)),
            end: Number((0.55 + i * 0.4).toFixed(2)),
          }));

  const chunkSize = includeSceneHeaders ? 5 : 4;
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    const nextChunkFirstWord = words[i + chunkSize];
    for (let wIdx = 0; wIdx < chunk.length; wIdx++) {
      const currentWord = chunk[wIdx];
      const nextWord = chunk[wIdx + 1];
      const wStart = currentWord.start;
      const rawEnd = nextWord
        ? nextWord.start
        : nextChunkFirstWord
        ? Math.min(
            nextChunkFirstWord.start,
            Math.max(currentWord.end, currentWord.start + 0.3)
          )
        : Math.max(currentWord.end, currentWord.start + 0.35);
      const wEnd = Math.max(wStart + 0.05, rawEnd);
      if (wStart >= totalDur) break;

      const styledTokens = chunk.map((token, idx) => {
        const rawWord = sanitizeAssText(token.word);
        const displayWord = includeSceneHeaders ? rawWord : rawWord.toUpperCase();
        if (idx === wIdx) {
          // Highlight currently spoken word
          return `{\\c${includeSceneHeaders ? theme.captionActiveAssColor : yellowAss}\\b1}${displayWord}`;
        } else if (idx < wIdx) {
          // Spoken words in white
          return `{\\c${whiteAss}\\b1}${displayWord}`;
        } else {
          // Upcoming words dimmed
          return `{\\c${theme.captionDimAssColor}\\b0}${displayWord}`;
        }
      });

      events.push(
        `Dialogue: 5,${formatAssTime(wStart)},${formatAssTime(Math.min(totalDur, wEnd))},KaraokeCap,,0,0,0,,{\\pos(${captionX},${captionY})}${styledTokens.join(" ")}`
      );
    }
  }

  return header + events.join("\n") + "\n";
}

/** Backward compatibility alias */
export const buildAuteurAssScript = buildRathAssScript;
