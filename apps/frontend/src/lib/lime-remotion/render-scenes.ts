import fs from "fs";
import os from "os";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { LimeSceneProps } from "./LimeScene";

export interface TimedLimeScene extends LimeSceneProps {
  start: number;
  end: number;
}

export interface RenderedLimeScene {
  path: string;
  start: number;
  end: number;
  scene: TimedLimeScene;
}

export interface RenderedLimeSceneStills {
  paths: string[];
  scene: TimedLimeScene;
}

async function runPool<T>(items: T[], concurrency: number, work: (item: T, index: number) => Promise<void>) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await work(items[index], index);
    }
  });
  await Promise.all(workers);
}

function resolveLimeRemotionEntryPoint(): string {
  const relativeEntry = path.join("src", "lib", "lime-remotion", "Root.tsx");
  const candidates = new Set<string>();

  for (const start of [process.cwd(), __dirname]) {
    let current = path.resolve(start);
    for (let depth = 0; depth < 6; depth++) {
      candidates.add(path.join(current, relativeEntry));
      candidates.add(path.join(current, "apps", "frontend", relativeEntry));
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }

  const entryPoint = [...candidates].find((candidate) => fs.existsSync(candidate));
  if (entryPoint) return entryPoint;
  throw new Error(`Lime Slides Remotion entry point was not found. Checked: ${[...candidates].join(", ")}`);
}

function resolveLimeFontDirectory() {
  const candidates = [
    path.join(process.cwd(), "apps", "frontend", "public", "fonts"),
    path.join(process.cwd(), "public", "fonts"),
    path.resolve(__dirname, "../../../public/fonts"),
  ];
  const fontDirectory = candidates.find((candidate) => fs.existsSync(path.join(candidate, "Anton-Regular.ttf"))
    && fs.existsSync(path.join(candidate, "Montserrat-Variable.ttf"))
    && fs.existsSync(path.join(candidate, "Montserrat-ExtraBold.ttf")));
  if (!fontDirectory) throw new Error(`Lime Slides fonts were not found. Checked: ${candidates.join(", ")}`);
  return fontDirectory;
}

function resolveBrowserExecutable() {
  const candidates = [
    process.env.LIME_CHROME_EXECUTABLE_PATH,
    process.env.CHROME_EXECUTABLE_PATH,
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe") : undefined,
    process.env["PROGRAMFILES(X86)"] ? path.join(process.env["PROGRAMFILES(X86)"], "Google/Chrome/Application/chrome.exe") : undefined,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe") : undefined,
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, "Microsoft/Edge/Application/msedge.exe") : undefined,
    process.env["PROGRAMFILES(X86)"] ? path.join(process.env["PROGRAMFILES(X86)"], "Microsoft/Edge/Application/msedge.exe") : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate));
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

// Cache Remotion webpack bundle across stills and clips to eliminate 15-20s of duplicate compilation
let cachedLimeBundle: { serveUrl: string; directory: string; entryMtime: number } | null = null;
let bundlingPromise: Promise<string> | null = null;

export async function getOrBundleLimeServeUrl(): Promise<string> {
  const entryPoint = resolveLimeRemotionEntryPoint();
  let entryMtime = 0;
  try {
    entryMtime = fs.statSync(entryPoint).mtimeMs;
  } catch {}

  if (cachedLimeBundle && cachedLimeBundle.entryMtime === entryMtime && fs.existsSync(cachedLimeBundle.serveUrl)) {
    return cachedLimeBundle.serveUrl;
  }
  if (bundlingPromise) return bundlingPromise;

  bundlingPromise = (async () => {
    try {
      const bundleDir = fs.mkdtempSync(path.join(os.tmpdir(), "lime-bundle-cache-"));
      const publicDir = path.join(bundleDir, "public");
      const publicFontsDir = path.join(publicDir, "fonts");
      fs.mkdirSync(publicFontsDir, { recursive: true });
      const sourceFontsDir = resolveLimeFontDirectory();
      for (const fontName of ["Anton-Regular.ttf", "Montserrat-Variable.ttf", "Montserrat-ExtraBold.ttf"]) {
        fs.copyFileSync(path.join(sourceFontsDir, fontName), path.join(publicFontsDir, fontName));
      }
      const serveUrl = await bundle({ entryPoint, outDir: path.join(bundleDir, "bundle"), publicDir });
      cachedLimeBundle = { serveUrl, directory: bundleDir, entryMtime };
      return serveUrl;
    } finally {
      bundlingPromise = null;
    }
  })();

  return bundlingPromise;
}

/** Render three isolated Remotion stills for each beat before compositing. */
export async function renderLimeSceneStills(
  scenes: TimedLimeScene[],
  projectId: string,
  providedServeUrl?: string
): Promise<{ stills: RenderedLimeSceneStills[]; directory: string; renderMs: number }> {
  const startedAt = Date.now();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `lime-stills-${projectId}-`));
  const stills: RenderedLimeSceneStills[] = new Array(scenes.length);
  try {
    const serveUrl = providedServeUrl || (await getOrBundleLimeServeUrl());
    const browserExecutable = resolveBrowserExecutable();
    await runPool(scenes, 2, async (scene, index) => {
      const durationInFrames = Math.max(1, Math.round((scene.end - scene.start) * 30));
      const inputProps: LimeSceneProps = { ...scene, durationInFrames };
      const composition = await selectComposition({ serveUrl, id: "LimeScene", inputProps: inputProps as any, browserExecutable });
      const frames = [...new Set([0.12, 0.5, 0.88].map((fraction) => Math.max(0, Math.min(durationInFrames - 1, Math.round((durationInFrames - 1) * fraction)))))];
      const paths: string[] = [];
      for (const [sampleIndex, frame] of frames.entries()) {
        const output = path.join(directory, `scene-${String(index).padStart(3, "0")}-still-${sampleIndex}.png`);
        await renderStill({
          composition,
          serveUrl,
          output,
          frame,
          imageFormat: "png",
          inputProps: inputProps as any,
          browserExecutable,
          chromiumOptions: { gl: "angle" },
          logLevel: "error",
        });
        if (!fs.existsSync(output)) throw new Error(`Remotion did not write still ${sampleIndex + 1} for scene ${index + 1}.`);
        paths.push(output);
      }
      stills[index] = { paths, scene };
    });
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }
  return { stills, directory, renderMs: Date.now() - startedAt };
}

export async function renderLimeSceneClips(
  scenes: TimedLimeScene[],
  projectId: string,
  providedServeUrl?: string
): Promise<{ clips: RenderedLimeScene[]; directory: string; renderMs: number }> {
  const startedAt = Date.now();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `lime-remotion-${projectId}-`));
  const serveUrl = providedServeUrl || (await getOrBundleLimeServeUrl());
  const clips: RenderedLimeScene[] = new Array(scenes.length);
  const browserExecutable = resolveBrowserExecutable();

  try {
    await runPool(scenes, 2, async (scene, index) => {
      const durationInFrames = Math.max(1, Math.round((scene.end - scene.start) * 30));
      const inputProps: LimeSceneProps = { ...scene, durationInFrames };
      const composition = await selectComposition({ serveUrl, id: "LimeScene", inputProps: inputProps as any, browserExecutable });
      const outputPath = path.join(directory, `scene-${String(index).padStart(3, "0")}.mov`);
      await renderMedia({
        composition,
        serveUrl,
        codec: "prores",
        pixelFormat: "yuva444p10le",
        proResProfile: "4444",
        outputLocation: outputPath,
        imageFormat: "png",
        inputProps: inputProps as any,
        concurrency: 2,
        chromiumOptions: { gl: "angle" },
        browserExecutable,
        logLevel: "error",
      });
      clips[index] = { path: outputPath, start: scene.start, end: scene.end, scene };
    });
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    throw error;
  }

  const renderMs = Date.now() - startedAt;
  console.info(`[Lime Slides] Rendered ${clips.length} transparent Remotion scenes in ${(renderMs / 1000).toFixed(2)} s (2 parallel workers).`);
  return { clips, directory, renderMs };
}
