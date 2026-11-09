/**
 * PostPilot Design System Tokens
 * Source of Truth: Stitch MCP (PostPilot)
 */

export const tokens = {
  colors: {
    brand: {
      lime: "#C5F52A",
      limeHover: "#B1DE22",
      dark: "#000000",
      surface: "#050505",
      card: "#111111",
      panel: "#0A0A0A",
      rail: "#050505",
      border: "#1F1F1F",
      borderLight: "#262626",
      muted: "#737373",
    },
    tags: {
      web: { color: "#C5F52A", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)" },
      x: { color: "#C084FC", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)" },
      reddit: { color: "#FBBF24", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)" },
      security: { color: "#22D3EE", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)" },
      newsletter: { color: "#F472B6", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)" },
      research: { color: "#C5F52A", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)" },
      aiSynthesis: { color: "#000000", bg: "#C5F52A", border: "transparent" },
    },
    glass: {
      shell: "rgba(14, 18, 19, 0.75)",
      shellBorder: "rgba(255, 255, 255, 0.08)",
      shellToolbar: "rgba(14, 18, 19, 0.45)",
      cardBg: "rgba(255, 255, 255, 0.08)",
      cardBorder: "rgba(255, 255, 255, 0.14)",
      cardBorderLime: "rgba(197, 245, 42, 0.35)",
      pillActiveBg: "rgba(255, 255, 255, 0.12)",
      pillActiveBorder: "rgba(255, 255, 255, 0.2)",
      pillInactiveBg: "rgba(255, 255, 255, 0.06)",
      pillInactiveBorder: "rgba(255, 255, 255, 0.12)",
      inputBg: "rgba(255, 255, 255, 0.06)",
      inputBorder: "rgba(255, 255, 255, 0.14)",
    },
  },
  typography: {
    fontSans: "var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif",
    fontMono: "monospace",
  },
  radius: {
    xs: "0.25rem",    // 4px
    sm: "0.375rem",   // 6px
    md: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "16": "1rem",     // 16px
    "20": "1.25rem",  // 20px
    full: "9999px",
  },
  shadows: {
    shell: "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
    header: "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.12) 0px 1px 0px inset",
    card: "rgba(0, 0, 0, 0.35) 0px 8px 24px, rgba(255, 255, 255, 0.1) 0px 1px 1px inset",
    limeGlow: "rgba(197, 245, 42, 0.45) 0px 0px 16px, rgba(255, 255, 255, 0.4) 0px 1px 1px inset, rgba(0, 0, 0, 0.25) 0px -1px 2px inset",
    insetSoft: "rgba(255, 255, 255, 0.08) 0px 1px 1px inset",
    insetPill: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
  },
} as const;

export type DesignTokens = typeof tokens;
