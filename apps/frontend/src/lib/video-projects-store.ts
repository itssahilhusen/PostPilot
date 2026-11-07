import fs from "fs";
import path from "path";
import { BrandKitSettings, DEFAULT_BRAND_KIT } from "@/data/videoTemplates";
import type { LimeSceneBeat } from "./lime-director-schema";

export interface VideoProjectRecord {
  id: string;
  title: string;
  mode: "edit" | "post" | "faceless" | "longform" | "music" | "story";
  status: "QUEUED" | "TRANSCRIBING" | "COMPOSING_GRAPHICS" | "COLOR_GRADING" | "READY" | "FAILED";
  progress: number;
  styleIds: string[];
  platforms: string[];
  approvalStatus?: "pending" | "approved" | "changes_requested";
  timelineNotes?: Array<{
    id: string;
    timestampSec: number;
    note: string;
    createdAt: string;
  }>;
  automation?: {
    keyword?: string;
    offer?: string;
  };
  options?: {
    avatarCutout?: boolean;
    look?: string;
    lookStrength?: number;
  };
  settings?: BrandKitSettings;
  brief?: {
    direction?: string;
    outputFormat?: string;
    topic?: string;
  };
  source: {
    kind: string;
    uploadPaths?: string[];
    brollPaths?: string[];
    durationSec?: number;
    trendId?: string;
    topic?: string;
    language?: string;
  };
  outputVideoUrl?: string;
  errorMessage?: string;
  userRawVideoUrl?: string;
  primaryStyleId?: string;
  thumbnailUrl?: string;
  captionText?: string;
  transcript?: string;
  transcriptWords?: Array<{ word: string; start: number; end: number }>;
  limeBeats?: LimeSceneBeat[];
  researchVisits?: Array<{ url: string; title: string; facts: string[]; status: string }>;
  assets?: Array<{ assetId: string; badge: string; title: string; sourceUrl: string; sceneIds: string[] }>;
  checks?: Array<{ id: string; label: string; status: string; detail?: string }>;
  scenes?: Array<{
    sceneId: string;
    start: number;
    end: number;
    headline: string;
    subAccent: string;
    objective: string;
    visualType: string;
    badgeText?: string;
    onScreenText: string[];
  }>;
  scenePlan?: {
    headline: string;
    subAccent: string;
    metricLabel: string;
    metricCount: number;
    steps: [string, string, string];
    platformCaption: string;
  };
  createdAt: string;
  updatedAt: string;
}

function resolveStoreFile(filename: string): string {
  const candidate1 = path.join(process.cwd(), "apps", "frontend", "src", "lib", filename);
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.join(process.cwd(), "src", "lib", filename);
  if (fs.existsSync(candidate2)) return candidate2;
  return fs.existsSync(path.join(process.cwd(), "apps", "frontend")) ? candidate1 : candidate2;
}

const STORE_PATH = resolveStoreFile("video-projects.json");
const BRANDKIT_PATH = resolveStoreFile("video-brandkit.json");

function ensureFile(filePath: string, defaultData: any) {
  try {
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultData), "utf8");
    }
  } catch (err) {
    console.error("Failed to ensure store file:", err);
  }
}

// High-performance in-memory cache layer to eliminate repetitive 450KB disk reads and event-loop lag
let cachedProjects: VideoProjectRecord[] | null = null;
let projectMap = new Map<string, VideoProjectRecord>();
let cachedMtime = 0;
let storeVersion = Date.now();
let pendingWriteTimer: NodeJS.Timeout | null = null;

function flushProjectsToDisk() {
  if (pendingWriteTimer) {
    clearTimeout(pendingWriteTimer);
    pendingWriteTimer = null;
  }
  if (!cachedProjects) return;
  try {
    const jsonStr = JSON.stringify(cachedProjects);
    fs.writeFileSync(STORE_PATH, jsonStr, "utf8");
    try {
      cachedMtime = fs.statSync(STORE_PATH).mtimeMs;
    } catch {}
  } catch (err) {
    console.error("Error writing video projects store:", err);
  }
}

function loadProjectsFromDisk(): VideoProjectRecord[] {
  ensureFile(STORE_PATH, []);
  try {
    const stat = fs.statSync(STORE_PATH);
    if (cachedProjects && stat.mtimeMs === cachedMtime) {
      return cachedProjects;
    }
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const list: VideoProjectRecord[] = JSON.parse(raw);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    cachedProjects = list;
    cachedMtime = stat.mtimeMs;
    projectMap.clear();
    for (const p of list) {
      projectMap.set(p.id, p);
    }
    return cachedProjects;
  } catch {
    cachedProjects = [];
    return [];
  }
}

export function getVideoProjectsStoreVersion(): string {
  if (!cachedProjects) {
    loadProjectsFromDisk();
  }
  return `"${storeVersion}_${cachedProjects?.length || 0}"`;
}

export function getAllVideoProjects(): VideoProjectRecord[] {
  if (!cachedProjects) {
    return loadProjectsFromDisk();
  }
  // Check if file was modified externally
  try {
    const stat = fs.statSync(STORE_PATH);
    if (stat.mtimeMs !== cachedMtime && !pendingWriteTimer) {
      return loadProjectsFromDisk();
    }
  } catch {}
  return cachedProjects;
}

export function getVideoProjectById(id: string): VideoProjectRecord | null {
  if (!cachedProjects) {
    loadProjectsFromDisk();
  }
  return projectMap.get(id) || null;
}

export function saveVideoProject(project: VideoProjectRecord): VideoProjectRecord {
  const projects = getAllVideoProjects();
  const existingIdx = projects.findIndex((p) => p.id === project.id);
  const updatedProject = {
    ...(existingIdx >= 0 ? projects[existingIdx] : {}),
    ...project,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    projects[existingIdx] = updatedProject;
  } else {
    projects.unshift(updatedProject);
  }

  projectMap.set(updatedProject.id, updatedProject);
  storeVersion = Date.now();

  // Asynchronous debounced write to avoid blocking the event loop on rapid pipeline updates
  if (!pendingWriteTimer) {
    pendingWriteTimer = setTimeout(() => {
      flushProjectsToDisk();
    }, 100);
  }

  return updatedProject;
}

export function deleteVideoProject(id: string): boolean {
  const projects = getAllVideoProjects();
  const filtered = projects.filter((p) => p.id !== id);
  cachedProjects = filtered;
  projectMap.delete(id);
  storeVersion = Date.now();

  try {
    flushProjectsToDisk();
    return true;
  } catch {
    return false;
  }
}

// BrandKit caching
let cachedBrandKit: BrandKitSettings | null = null;
let cachedBrandKitMtime = 0;

export function getSavedBrandKit(): BrandKitSettings {
  ensureFile(BRANDKIT_PATH, DEFAULT_BRAND_KIT);
  try {
    const stat = fs.statSync(BRANDKIT_PATH);
    if (cachedBrandKit && stat.mtimeMs === cachedBrandKitMtime) {
      return cachedBrandKit;
    }
    const raw = fs.readFileSync(BRANDKIT_PATH, "utf8");
    cachedBrandKit = JSON.parse(raw);
    cachedBrandKitMtime = stat.mtimeMs;
    return cachedBrandKit || DEFAULT_BRAND_KIT;
  } catch {
    return DEFAULT_BRAND_KIT;
  }
}

export function saveBrandKit(kit: BrandKitSettings): BrandKitSettings {
  ensureFile(BRANDKIT_PATH, DEFAULT_BRAND_KIT);
  cachedBrandKit = kit;
  try {
    fs.writeFileSync(BRANDKIT_PATH, JSON.stringify(kit), "utf8");
    try {
      cachedBrandKitMtime = fs.statSync(BRANDKIT_PATH).mtimeMs;
    } catch {}
  } catch (err) {
    console.error("Error writing brandkit store:", err);
  }
  return kit;
}
