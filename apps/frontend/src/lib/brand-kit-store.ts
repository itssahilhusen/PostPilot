import fs from "fs";
import path from "path";

export interface BrandKitSettings {
  id?: string;
  name?: string;
  brandName?: string;
  brandHandle?: string;
  logoUrl?: string;
  accent?: string;
  accentHi?: string;
  accent2?: string;
  bg?: string;
  panel?: string;
  panel2?: string;
  ink?: string;
  dim?: string;
  line?: string;
  font?: {
    display?: string;
    body?: string;
    serif?: string;
    mono?: string;
  };
}

export const DEFAULT_BRAND_KIT: BrandKitSettings = {
  brandName: "PostPilot",
  brandHandle: "@postpilot",
  accent: "#10b981",
  accentHi: "#34d399",
  accent2: "#059669",
  bg: "#0a0a0c",
  panel: "#16161a",
  panel2: "#1f1f24",
  ink: "#ffffff",
  dim: "#9ca3af",
  line: "rgba(255,255,255,0.15)",
  font: {
    display: "Inter",
    body: "Inter",
    serif: "Instrument Serif",
    mono: "Geist Mono",
  },
};

function resolveBrandKitPath(): string {
  const dataDir = path.resolve(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "brandkit.json");
}

let cachedBrandKit: BrandKitSettings | null = null;

export function getSavedBrandKit(): BrandKitSettings {
  const filePath = resolveBrandKitPath();
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_BRAND_KIT, null, 2), "utf8");
    } catch {}
    return DEFAULT_BRAND_KIT;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    cachedBrandKit = JSON.parse(raw);
    return cachedBrandKit || DEFAULT_BRAND_KIT;
  } catch {
    return DEFAULT_BRAND_KIT;
  }
}

export function saveBrandKit(kit: Partial<BrandKitSettings>): BrandKitSettings {
  const current = getSavedBrandKit();
  const merged: BrandKitSettings = { ...current, ...kit };
  const filePath = resolveBrandKitPath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), "utf8");
    cachedBrandKit = merged;
  } catch (err) {
    console.error("Error saving brandkit:", err);
  }
  return merged;
}

