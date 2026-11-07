import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { LimeSceneBeat } from "./lime-director-schema";
import type { LimeResolvedAsset } from "./lime-assets";
import type { LimeSceneSpec } from "./lime-scene-spec";
import { chunkLimeCaptions, assertRealSceneCopy } from "./lime-render-utils";
import { getFfmpegPath } from "./media-tool-paths";

const execFileAsync = promisify(execFile);
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const LIME_RGB = [204, 255, 8] as const;
const VISION_MODEL_DEFAULT = "gemini-3.8-flash";
const visionResponseSchema = z.object({
  passed: z.boolean(),
  failures: z.array(z.string().trim().min(1).max(240)).max(12),
  emptyAreaPercent: z.number().min(0).max(100).nullable(),
}).strict();

export interface LimeQualityScene {
  beat: LimeSceneBeat;
  asset?: Pick<LimeResolvedAsset, "type" | "dataUri" | "alt"> | null;
  sceneSpec?: LimeSceneSpec | null;
}

export interface LimeQualityReport {
  checks: Array<{ id: string; label: string; status: "pass" | "warn" | "fail"; detail: string }>;
  failedScenes: Array<{ index: number; failures: string[] }>;
  numbers: {
    visualChanges: number;
    headlineUniquePercent: number;
    maxCaptionActive: number;
    faceInsideCropPercent: number;
    emptyAreaMaxPercent: number | null;
    motionCoveragePercent: number | null;
    maxStillDurationSec: number | null;
    visionScenesChecked: number;
    requestedAssetsUsed: number;
    renderMs: number;
  };
}

function luminance(hex: string) {
  const rgb = hex.match(/[0-9a-f]{2}/gi)!.map((part) => parseInt(part, 16) / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
}

function contrastRatio(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}

export function measureLimeBackgroundPercent(rgba: Uint8Array, width = FRAME_WIDTH, height = FRAME_HEIGHT) {
  if (rgba.length < width * height * 4) throw new Error("RGBA frame buffer is shorter than its declared dimensions.");
  const blockSize = 32;
  let limeBlocks = 0;
  let blockCount = 0;
  for (let top = 0; top < height; top += blockSize) {
    for (let left = 0; left < width; left += blockSize) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let samples = 0;
      for (let y = top; y < Math.min(height, top + blockSize); y += 4) {
        for (let x = left; x < Math.min(width, left + blockSize); x += 4) {
          const offset = (y * width + x) * 4;
          red += rgba[offset];
          green += rgba[offset + 1];
          blue += rgba[offset + 2];
          samples++;
        }
      }
      if (samples) {
        const delta = Math.hypot(red / samples - LIME_RGB[0], green / samples - LIME_RGB[1], blue / samples - LIME_RGB[2]);
        if (delta <= 26) limeBlocks++;
        blockCount++;
      }
    }
  }
  return blockCount ? limeBlocks / blockCount * 100 : 0;
}

export function getUniqueLimeVisualPairCount(beats: LimeSceneBeat[]) {
  const pairs = beats.map((beat) => `${beat.headline.trim().toLocaleUpperCase()}\u0000${beat.illustration}`);
  return new Set(pairs).size;
}

export function getMaximumActiveCaptionCount(captions: Array<{ start: number; end: number }>) {
  const events = captions.flatMap((caption) => [
    { time: caption.start, delta: 1 },
    { time: caption.end, delta: -1 },
  ]).sort((a, b) => a.time - b.time || a.delta - b.delta);
  let active = 0;
  let maximum = 0;
  for (const event of events) {
    active += event.delta;
    maximum = Math.max(maximum, active);
  }
  return maximum;
}

let modelValidation: Promise<void> | null = null;

export function getLimeVisionModelName() {
  return process.env.GEMINI_VISION_MODEL?.trim() || VISION_MODEL_DEFAULT;
}

export async function validateLimeVisionModel(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is required; Lime Slides visual QA cannot be skipped.");
  if (!modelValidation) {
    const model = getLimeVisionModelName();
    modelValidation = (async () => {
      const ai = new GoogleGenAI({ apiKey });
      await ai.models.get({ model });
      console.info(`[Lime Slides QA] Gemini model validated: ${model}`);
    })();
  }
  try {
    await modelValidation;
  } catch (error: any) {
    modelValidation = null;
    const detail = error?.message || String(error);
    console.error(`[Lime Slides QA] FAILED to validate Gemini model "${getLimeVisionModelName()}": ${detail}`);
    throw new Error(`Gemini vision model validation failed: ${detail}`);
  }
}

function findPuppeteer() {
  try { return require("puppeteer"); } catch {}
  const roots = new Set<string>();
  for (const start of [process.cwd(), __dirname]) {
    let current = path.resolve(start);
    for (let depth = 0; depth < 8; depth++) {
      roots.add(current);
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  for (const root of roots) {
    const pnpmRoot = path.join(root, "node_modules", ".pnpm");
    if (!fs.existsSync(pnpmRoot)) continue;
    for (const entry of fs.readdirSync(pnpmRoot).filter((name) => name.startsWith("puppeteer@"))) {
      const candidate = path.join(pnpmRoot, entry, "node_modules", "puppeteer");
      if (fs.existsSync(candidate)) return require(candidate);
    }
  }
  throw new Error("Puppeteer is required for browser-based Lime headline measurement.");
}

function findBrowserExecutable() {
  const candidates = [
    process.env.LIME_CHROME_EXECUTABLE_PATH,
    process.env.CHROME_EXECUTABLE_PATH,
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe") : undefined,
    process.env["PROGRAMFILES(X86)"] ? path.join(process.env["PROGRAMFILES(X86)"], "Google/Chrome/Application/chrome.exe") : undefined,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe") : undefined,
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, "Microsoft/Edge/Application/msedge.exe") : undefined,
    process.env["PROGRAMFILES(X86)"] ? path.join(process.env["PROGRAMFILES(X86)"], "Microsoft/Edge/Application/msedge.exe") : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate));
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function measureHeadlinesWithBrowser(beats: LimeSceneBeat[]) {
  const fontDirCandidates = [
    path.join(process.cwd(), "apps", "frontend", "public", "fonts"),
    path.join(process.cwd(), "public", "fonts"),
    path.resolve(__dirname, "../../public/fonts"),
  ];
  const fontsDir = fontDirCandidates.find((candidate) => fs.existsSync(path.join(candidate, "Anton-Regular.ttf")) && fs.existsSync(path.join(candidate, "Montserrat-ExtraBold.ttf")));
  if (!fontsDir) throw new Error("Bundled Anton and Montserrat ExtraBold font files were not found for visual QA.");
  const anton = fs.readFileSync(path.join(fontsDir, "Anton-Regular.ttf")).toString("base64");
  const montserrat = fs.readFileSync(path.join(fontsDir, "Montserrat-ExtraBold.ttf")).toString("base64");
  const puppeteer = findPuppeteer();
  const browser = await puppeteer.launch({ headless: true, executablePath: findBrowserExecutable(), args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: FRAME_WIDTH, height: FRAME_HEIGHT, deviceScaleFactor: 1 });
    await page.setContent("<!doctype html><html><head></head><body></body></html>", { waitUntil: "domcontentloaded" });
    return await page.evaluate(async ({ headlines, antonBase64, montserratBase64 }) => {
      const antonFace = new FontFace("Anton", `url(data:font/ttf;base64,${antonBase64})`, { weight: "400" });
      const montserratFace = new FontFace("Montserrat ExtraBold", `url(data:font/ttf;base64,${montserratBase64})`, { weight: "800" });
      await Promise.all([antonFace.load(), montserratFace.load()]);
      document.fonts.add(antonFace);
      document.fonts.add(montserratFace);
      await document.fonts.ready;
      const fontsReady = document.fonts.check('400 16px "Anton"') && document.fonts.check('800 16px "Montserrat ExtraBold"');
      const context = document.createElement("canvas").getContext("2d");
      if (!context) throw new Error("Canvas text measurement was unavailable.");
      const results = headlines.map((headline) => {
        const words = headline.trim().replace(/\s+/g, " ").split(" ");
        for (let size = 136; size >= 52; size -= 2) {
          context.font = `900 ${size}px Anton, 'Arial Narrow', Impact, sans-serif`;
          const lines: string[] = [];
          let line = "";
          let failed = false;
          for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (context.measureText(candidate).width <= 984) line = candidate;
            else if (!line || context.measureText(word).width > 984) { failed = true; break; }
            else { lines.push(line); line = word; }
            if (lines.length > 1) { failed = true; break; }
          }
          if (!failed) {
            if (line) lines.push(line);
            if (lines.length <= 2) {
              const element = document.createElement("div");
              element.textContent = lines.join("\n");
              element.style.cssText = `position:absolute;left:-10000px;top:0;width:984px;max-width:984px;overflow:hidden;white-space:pre-line;font:900 ${size}px/0.95 Anton, 'Arial Narrow', Impact, sans-serif;`;
              document.body.appendChild(element);
              const fits = element.scrollWidth <= element.clientWidth && element.scrollHeight <= size * 2;
              element.remove();
              return { headline, fits, size, lines: lines.length };
            }
          }
        }
        return { headline, fits: false, size: 0, lines: 3 };
      });
      return { fontsReady, results };
    }, { headlines: beats.map((beat) => beat.headline), antonBase64: anton, montserratBase64: montserrat });
  } finally {
    await browser.close().catch(() => {});
  }
}

async function compositeStillOnSource(sourcePath: string, stillPath: string, atSec: number): Promise<Buffer> {
  const ffmpeg = getFfmpegPath();
  const filter = `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xCCFF08,setsar=1,format=rgba[bg];[bg][1:v]overlay=0:0:format=auto,format=rgba[out]`;
  const { stdout } = await execFileAsync(ffmpeg, [
    "-v", "error", "-ss", Math.max(0, atSec).toFixed(3), "-i", sourcePath, "-i", stillPath,
    "-filter_complex", filter, "-map", "[out]", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "pipe:1",
  ], { encoding: "buffer", timeout: 45_000, maxBuffer: FRAME_WIDTH * FRAME_HEIGHT * 4 + 1024 * 1024 });
  return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
}

async function writeRgbaJpeg(buffer: Buffer, directory: string, prefix: string, index: number) {
  const rawPath = path.join(directory, `${prefix}-${index}.rgba`);
  const imagePath = path.join(directory, `${prefix}-${index}.jpg`);
  fs.writeFileSync(rawPath, buffer);
  try {
    await execFileAsync(getFfmpegPath(), [
      "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", "1080x1920", "-i", rawPath,
      "-frames:v", "1", "-q:v", "2", imagePath,
    ], { timeout: 30_000, maxBuffer: 1024 * 1024 });
  } finally {
    try { fs.unlinkSync(rawPath); } catch {}
  }
  return imagePath;
}

async function inspectWithGemini(framePaths: string[], headline: string) {
  const apiKey = process.env.GEMINI_API_KEY!.trim();
  const ai = new GoogleGenAI({ apiKey });
  const model = getLimeVisionModelName();
  const parts: any[] = [{ text: `Visually inspect these three frames from one Lime Slides scene. Return exactly JSON matching {"passed":boolean,"failures":string[],"emptyAreaPercent":number|null}. Report only objective defects: clipped headline or illustration text outside 48px safe margins, text overlap, placeholder labels, unoccupied lime background area exceeding 25% of the whole frame, or a face cropped through the forehead. Ignore the source video itself. Headline: ${headline}.` }];
  for (const framePath of framePaths) {
    parts.push({ inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(framePath).toString("base64") } });
  }
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: { responseMimeType: "application/json" },
  });
  const parsed = visionResponseSchema.safeParse(JSON.parse((response.text || "{}").replace(/^```json\s*/i, "").replace(/```$/i, "").trim()));
  if (!parsed.success) throw new Error(`Gemini returned invalid visual QA JSON: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`);
  return parsed.data;
}

async function measureSceneMotion(clipPaths: string[]) {
  const ffmpeg = getFfmpegPath();
  const values: number[] = [];
  for (const clipPath of clipPaths) {
    const { stderr } = await execFileAsync(ffmpeg, [
      "-v", "info", "-i", clipPath,
      "-vf", "fps=10,tblend=all_mode=difference,signalstats,metadata=print",
      "-f", "null", "-",
    ], { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 });
    values.push(...[...stderr.matchAll(/lavfi\.signalstats\.YAVG=([0-9.]+)/g)].map((match) => Number(match[1])));
  }
  if (!values.length) return { coverage: null, maxStillDurationSec: null };
  const movingThreshold = 1.2;
  let stillFrames = 0;
  let longestStillFrames = 0;
  let movingFrames = 0;
  for (const value of values) {
    if (value >= movingThreshold) {
      movingFrames++;
      longestStillFrames = Math.max(longestStillFrames, stillFrames);
      stillFrames = 0;
    } else stillFrames++;
  }
  longestStillFrames = Math.max(longestStillFrames, stillFrames);
  return { coverage: movingFrames / values.length, maxStillDurationSec: longestStillFrames / 10 };
}

function requestedAssetIsVisible(scene: LimeQualityScene) {
  const request = scene.beat.assetRequest;
  if (!request || request.type === "none") return true;
  if (!scene.asset?.dataUri) return false;
  if (!scene.sceneSpec) return true; // LimeScene's proven fallback displays a supplied asset directly.
  return scene.sceneSpec.components.some((component) =>
    (component.type === "Photo" || component.type === "BrowserCard") && component.props.useRequestedAsset ||
    component.type === "LogoGrid" && request.type === "logo"
  );
}

export async function checkLimeSceneClips(options: {
  sourceVideoPath: string;
  scenes: LimeQualityScene[];
  stillPaths: string[][];
  sceneClipPaths: string[];
  transcriptWords: Array<{ word: string; start: number; end: number }>;
  durationSec: number;
  faceTrackCoverage: number;
  faceFallbackContain: boolean;
  renderMs: number;
}): Promise<LimeQualityReport> {
  const { sourceVideoPath, scenes, stillPaths, sceneClipPaths, transcriptWords, durationSec, faceTrackCoverage, faceFallbackContain, renderMs } = options;
  const failures = scenes.map(() => [] as string[]);
  const checks: LimeQualityReport["checks"] = [];
  let emptyAreaMaxPercent: number | null = null;
  let visionScenesChecked = 0;
  let requestedAssetsUsed = 0;
  const beats = scenes.map((scene) => scene.beat);
  const contrast = Math.min(contrastRatio("#0A0A0A", "#CCFF08"), contrastRatio("#0A0A0A", "#FFFFFF"));
  checks.push({ id: "contrast", label: "Text contrast", status: contrast >= 4.5 ? "pass" : "fail", detail: `${contrast.toFixed(2)}:1 minimum; 4.5:1 required` });

  try {
    const measurement = await measureHeadlinesWithBrowser(beats);
    if (!measurement.fontsReady) throw new Error("document.fonts.check() failed for Anton or Montserrat ExtraBold.");
    measurement.results.forEach((result, index) => {
      if (!result.fits) failures[index].push(`Headline does not fit within the 48px safe margin in two lines: ${result.headline}`);
    });
    checks.push({ id: "headline_safe_margin", label: "Headline safe margins", status: measurement.results.every((result) => result.fits) ? "pass" : "fail", detail: `DOM and canvas measurement used loaded Anton and Montserrat ExtraBold; document.fonts.check() passed for both.` });
    checks.push({ id: "bundled_fonts", label: "Bundled fonts", status: "pass", detail: "Anton and Montserrat ExtraBold loaded and verified with document.fonts.check()." });
  } catch (error: any) {
    const detail = error?.message || String(error);
    failures.forEach((items) => items.push(`Browser font measurement failed: ${detail}`));
    checks.push({ id: "headline_safe_margin", label: "Headline safe margins", status: "fail", detail });
    checks.push({ id: "bundled_fonts", label: "Bundled fonts", status: "fail", detail });
    console.error("[Lime Slides QA] FAILED browser headline measurement:", detail);
  }

  for (const [index, scene] of scenes.entries()) {
    const beat = scene.beat;
    try { assertRealSceneCopy(beat.headline, "Headline"); }
    catch (error: any) { failures[index].push(error?.message || "Headline is invalid."); }
    if (beat.badge && /^(KEY TAKEAWAY|VERIFIED RESULT|STEP\s*0?\d+)$/i.test(beat.badge)) failures[index].push("Remove the placeholder badge.");
    if (beat.sceneType === "NUMBERED_STEP" && beat.stepIndex == null) failures[index].push("A numbered badge is allowed only when the speaker enumerated a step.");
    if (beat.stepIndex != null && beat.sceneType !== "NUMBERED_STEP") failures[index].push("Enumerated step is missing its numbered-step layout.");
    if (!requestedAssetIsVisible(scene)) failures[index].push(`The requested ${beat.assetRequest?.type} asset is missing or not used in the scene.`);
    else if (beat.assetRequest && beat.assetRequest.type !== "none" && scene.asset?.dataUri) requestedAssetsUsed++;
    if (stillPaths[index]?.length !== 3) failures[index].push("Scene QA did not produce exactly three Remotion stills.");
  }

  const uniquePairs = getUniqueLimeVisualPairCount(beats);
  const uniquePercent = beats.length ? uniquePairs / beats.length * 100 : 100;
  const minimumUniquePercent = 80;
  if (uniquePercent < minimumUniquePercent) {
    const seen = new Set<string>();
    beats.forEach((beat, index) => {
      const pair = `${beat.headline.trim().toLocaleUpperCase()}\u0000${beat.illustration}`;
      if (seen.has(pair)) failures[index].push(`Headline and illustration pair is duplicated; at least ${minimumUniquePercent}% of pairs must be unique.`);
      seen.add(pair);
    });
  }
  checks.push({ id: "visual_changes", label: "Unique headline and illustration pairs", status: uniquePercent >= minimumUniquePercent ? "pass" : "fail", detail: `${uniquePairs}/${beats.length} unique pairs (${uniquePercent.toFixed(1)}%); at least ${minimumUniquePercent}% required.` });

  const captions = chunkLimeCaptions(transcriptWords || [], durationSec);
  const maxCaptionActive = getMaximumActiveCaptionCount(captions);
  checks.push({ id: "caption_overlap", label: "Active caption count", status: maxCaptionActive <= 1 ? "pass" : "fail", detail: `Maximum ${maxCaptionActive} active captions; at most one is allowed.` });
  if (maxCaptionActive > 1) {
    captions.forEach((caption, index) => {
      if (index && captions[index - 1].end > caption.start) {
        const sceneIndex = beats.findIndex((beat) => caption.start >= beat.startMs / 1000 && caption.start < beat.endMs / 1000);
        if (sceneIndex >= 0) failures[sceneIndex].push("Caption timing overlaps the previous caption.");
      }
    });
  }

  try {
    await validateLimeVisionModel();
    for (const [index, scene] of scenes.entries()) {
      const stills = stillPaths[index] || [];
      const compositeBuffers: Buffer[] = [];
      for (const [sampleIndex, stillPath] of stills.entries()) {
        const fraction = [0.12, 0.5, 0.88][sampleIndex];
        const absoluteTime = (scene.beat.startMs + (scene.beat.endMs - scene.beat.startMs) * fraction) / 1000;
        const composite = await compositeStillOnSource(sourceVideoPath, stillPath, absoluteTime);
        compositeBuffers.push(composite);
        const emptyPercent = measureLimeBackgroundPercent(composite);
        emptyAreaMaxPercent = Math.max(emptyAreaMaxPercent ?? 0, emptyPercent);
        if (emptyPercent > 25) failures[index].push(`Scene has ${emptyPercent.toFixed(1)}% unoccupied lime blocks; the limit is 25%.`);
      }
      const imageTempPaths: string[] = [];
      try {
        for (const [sampleIndex, buffer] of compositeBuffers.entries()) {
          const imagePath = await writeRgbaJpeg(buffer, path.dirname(stills[sampleIndex]), `qa-scene-${index}`, sampleIndex);
          imageTempPaths.push(imagePath);
        }
        const vision = await inspectWithGemini(imageTempPaths, scene.beat.headline);
        visionScenesChecked++;
        if (!vision.passed) failures[index].push(...(vision.failures.length ? vision.failures : ["Gemini vision rejected this scene without a detailed reason."]));
        if (vision.emptyAreaPercent != null) {
          emptyAreaMaxPercent = Math.max(emptyAreaMaxPercent ?? 0, vision.emptyAreaPercent);
          if (vision.emptyAreaPercent > 25) failures[index].push(`Gemini measured ${vision.emptyAreaPercent.toFixed(1)}% empty scene area; the limit is 25%.`);
        }
      } finally {
        for (const imagePath of imageTempPaths) try { fs.unlinkSync(imagePath); } catch {}
      }
    }
    checks.push({ id: "gemini_vision", label: "Gemini visual review", status: "pass", detail: `${visionScenesChecked}/${scenes.length} scenes reviewed with ${getLimeVisionModelName()}.` });
  } catch (error: any) {
    const detail = error?.message || String(error);
    console.error("[Lime Slides QA] FAILED Gemini visual review:", detail);
    failures.forEach((items) => items.push(`Gemini visual QA failed: ${detail}`));
    checks.push({ id: "gemini_vision", label: "Gemini visual review", status: "fail", detail: `Visual QA did not complete; render is blocked. ${detail}` });
  }

  let motionCoverage: number | null = null;
  let maxStillDurationSec: number | null = null;
  try {
    const motion = await measureSceneMotion(sceneClipPaths);
    motionCoverage = motion.coverage;
    maxStillDurationSec = motion.maxStillDurationSec;
  } catch (error: any) {
    console.error("[Lime Slides QA] FAILED scene motion measurement:", error?.message || error);
  }
  const motionPass = motionCoverage != null && motionCoverage >= .9 && maxStillDurationSec != null && maxStillDurationSec <= .6;
  if (!motionPass) failures.forEach((items) => items.push("Scene motion coverage must be at least 90% with no still interval longer than 0.6 seconds."));
  checks.push({ id: "motion", label: "Scene motion", status: motionPass ? "pass" : "fail", detail: motionCoverage == null
    ? "Could not measure scene-to-scene frame differences."
    : `${(motionCoverage * 100).toFixed(1)}% moving 10fps frame differences; max still interval ${maxStillDurationSec?.toFixed(2) ?? "unknown"}s.` });

  const facePercent = faceTrackCoverage >= .95 ? faceTrackCoverage * 100 : faceFallbackContain ? 100 : faceTrackCoverage * 100;
  const facePass = faceTrackCoverage >= .95 || faceFallbackContain;
  checks.push({ id: "speaker_face_crop", label: "Speaker framing", status: facePass ? "pass" : "warn", detail: faceFallbackContain ? "No stable face track; source video was contained to avoid cropping the face." : `${Math.round(faceTrackCoverage * 100)}% sampled face detection coverage.` });
  checks.push({ id: "requested_assets", label: "Requested real assets", status: scenes.every((scene) => !scene.beat.assetRequest || scene.beat.assetRequest.type === "none" || requestedAssetIsVisible(scene)) ? "pass" : "fail", detail: `${requestedAssetsUsed} requested assets were resolved and used.` });

  return {
    checks,
    failedScenes: failures.map((items, index) => ({ index, failures: [...new Set(items)] })).filter((item) => item.failures.length > 0),
    numbers: {
      visualChanges: uniquePairs,
      headlineUniquePercent: uniquePercent,
      maxCaptionActive,
      faceInsideCropPercent: facePercent,
      emptyAreaMaxPercent,
      motionCoveragePercent: motionCoverage == null ? null : motionCoverage * 100,
      maxStillDurationSec,
      visionScenesChecked,
      requestedAssetsUsed,
      renderMs,
    },
  };
}
