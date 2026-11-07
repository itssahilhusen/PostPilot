/**
 * Shared props interface for all Remotion reel compositions.
 * Each composition receives these props from the renderer or Remotion Studio.
 */
export interface ReelProps {
  /** URL or static path to the user's uploaded video */
  videoSrc: string;
  /** Total duration in seconds (clamped 10–60 by renderer) */
  durationInSeconds: number;
  /** Style template identifier: "paper", "lime", "classified-yt", "glitch", etc. */
  styleId: string;
  /** Primary headline text, e.g. "THE NEW WAY TO" */
  headline: string;
  /** Accent sub-headline, e.g. "BUILD SITES" */
  subAccent: string;
  /** Label beneath the metric counter, e.g. "views this week" */
  metricLabel: string;
  /** Numeric value the counter animates to, e.g. 84200 */
  metricCount: number;
  /** Three short action labels for the pill tags */
  steps: [string, string, string];
  /** Optional word-level captions for karaoke subtitle overlay */
  captionWords?: Array<{ word: string; start: number; end: number }>;
}

/** Shared spring config used across all compositions */
export const SPRING_CONFIG = {
  damping: 12,
  stiffness: 120,
} as const;

/** Palette tokens for each style */
export const PALETTES = {
  paper: {
    bg: "#F4F1EA",
    card: "#18181B",
    accent: "#AE0006",
    text: "#18181B",
    textMuted: "#71717A",
    textOnCard: "#FFFFFF",
    accentMuted: "#A1A1AA",
  },
  lime: {
    bg: "#C6FF3D",
    card: "#000000",
    accent: "#C6FF3D",
    text: "#000000",
    textMuted: "#374151",
    textOnCard: "#FFFFFF",
    accentMuted: "#65A30D",
  },
  glitch: {
    bg: "#0B0B0C",
    card: "#141416",
    accent: "#AE0006",
    text: "#FFFFFF",
    textMuted: "#71717A",
    textOnCard: "#FFFFFF",
    accentMuted: "#00FF66",
  },
} as const;
