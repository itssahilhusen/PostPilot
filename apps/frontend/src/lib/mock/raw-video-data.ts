export interface VideoFontOption {
  id: string;
  name: string;
  badge?: string;
  category: string;
  description: string;
}

export interface VideoStylePreset {
  id: string;
  name: string;
  colorHex: string;
  size: string;
  type: string;
  description: string;
}

export interface VideoHighlightStyle {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

export const FONT_OPTIONS: VideoFontOption[] = [
  {
    id: "the-bold-font",
    name: "The Bold Font",
    badge: "Viral",
    category: "Impact Sans",
    description: "Impact Sans • All Caps • High CTR",
  },
  {
    id: "montserrat-black",
    name: "Montserrat Black",
    badge: "Modern",
    category: "Geometric",
    description: "Geometric Sans • High Weight • Clean",
  },
  {
    id: "anton-compressed",
    name: "Anton Compressed",
    badge: "Punchy",
    category: "Display",
    description: "Ultra Condensed • High Energy • Shorts",
  },
  {
    id: "proxima-nova-bold",
    name: "Proxima Nova Extrabold",
    badge: "Popular",
    category: "Editorial",
    description: "Editorial Standard • Neutral • Balanced",
  },
];

export const STYLE_PRESETS: VideoStylePreset[] = [
  {
    id: "lime-glow",
    name: "Preset: Lime Glow",
    colorHex: "#C5F52A",
    size: "24px",
    type: "Word Box",
    description: "24px • Word Box • Neon",
  },
  {
    id: "clean-white",
    name: "Preset: Clean White",
    colorHex: "#FFFFFF",
    size: "22px",
    type: "Shadow",
    description: "22px • Shadow Outline • Minimal",
  },
  {
    id: "electric-cyan",
    name: "Preset: Electric Cyan",
    colorHex: "#38BDF8",
    size: "24px",
    type: "Word Box",
    description: "24px • Word Box • High Contrast",
  },
  {
    id: "sunset-amber",
    name: "Preset: Sunset Amber",
    colorHex: "#F59E0B",
    size: "26px",
    type: "Outline",
    description: "26px • Warm Outline • Engaging",
  },
];

export const HIGHLIGHT_STYLES: VideoHighlightStyle[] = [
  {
    id: "word-box",
    name: "The Bold Font",
    badge: "Viral",
    description: "Word Box Highlight Style",
  },
  {
    id: "karaoke-bounce",
    name: "Karaoke Bounce",
    badge: "Trending",
    description: "Word by Word Scale & Pulse",
  },
  {
    id: "reveal-swipe",
    name: "Kinetic Reveal",
    description: "Line by Line Motion Slide",
  },
];

export const INITIAL_VIDEO_STATE = {
  fileName: "footage_raw_v01.mp4",
  specs: "1080p • 00:30 • Ready",
  thumbnailUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCXTZktnQ5EPlGGrvv_TRMXuPIjJWmk4Nat1gJCJJ_-HqMoYYOMUvgmUeeqRXKBigOqMpJjF76A-OAxabQwNvMTiZeYvLioFCO5oP2_RQDzNmNf1FRTMcaY3CmNxaROoMW_ubQYifiJtfZi8W-3cxiI7TlltM-0yuNmd2aP5UXwO4s0MMv9M_zegzBnklsIFlge1FCA_6bzV53a08wvpvavnRkwbiUlcTMny5OJ53nzNENkGxCgAU_HDA",
  captionText: "AI FOUND 2,308 FLAWS IN LINUX KERNEL",
  headlineText:
    "OpenAI's AI found 2,308 flaws in the Linux kernel, built 948 working root exploits from them and wrote a patch for every exploit, all for a total cost of $1.2 million",
};

