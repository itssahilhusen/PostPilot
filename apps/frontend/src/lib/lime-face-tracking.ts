import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const FACE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
const FACE_MODEL_PATH = [
  path.join(process.cwd(), "apps", "frontend", "public", "models", "blaze_face_short_range.tflite"),
  path.join(process.cwd(), "public", "models", "blaze_face_short_range.tflite"),
].find((candidate) => fs.existsSync(candidate)) || path.join(os.tmpdir(), "rath-blaze-face-short-range.tflite");

export interface FaceSample {
  timeSec: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function smoothFaceSamples(samples: FaceSample[]): FaceSample[] {
  if (!samples.length) return [];
  const sorted = [...samples].sort((a, b) => a.timeSec - b.timeSec);
  const interpolated: FaceSample[] = [];
  for (let index = 0; index < sorted.length; index++) {
    const current = sorted[index];
    interpolated.push(current);
    const next = sorted[index + 1];
    if (!next) continue;
    const steps = Math.floor((next.timeSec - current.timeSec) / 0.5);
    for (let step = 1; step < steps; step++) {
      const ratio = step / steps;
      interpolated.push({
        timeSec: current.timeSec + (next.timeSec - current.timeSec) * ratio,
        x: current.x + (next.x - current.x) * ratio,
        y: current.y + (next.y - current.y) * ratio,
        width: current.width + (next.width - current.width) * ratio,
        height: current.height + (next.height - current.height) * ratio,
      });
    }
  }
  return interpolated.map((sample, index) => {
    const neighbors = interpolated.slice(Math.max(0, index - 2), Math.min(interpolated.length, index + 3));
    const average = (key: "x" | "y" | "width" | "height") => neighbors.reduce((sum, item) => sum + item[key], 0) / neighbors.length;
    return { ...sample, x: average("x"), y: average("y"), width: average("width"), height: average("height") };
  });
}

async function ensureFaceModel(): Promise<boolean> {
  if (fs.existsSync(FACE_MODEL_PATH) && fs.statSync(FACE_MODEL_PATH).size > 100_000) return true;
  try {
    const response = await fetch(FACE_MODEL_URL, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) return false;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 100_000 || bytes.length > 15_000_000) return false;
    fs.writeFileSync(FACE_MODEL_PATH, bytes);
    return true;
  } catch {
    return false;
  }
}

/** Sample, detect, and smooth face boxes. Returns null so callers can contain the video. */
export async function detectSpeakerFaceTrack(
  sourcePath: string,
  durationSec: number,
  ffmpegPath: string,
  puppeteer: any
): Promise<{ samples: FaceSample[]; coverage: number } | null> {
  if (!(await ensureFaceModel())) return null;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rath-face-samples-"));
  let browser: any;
  let server: http.Server | undefined;
  let stage = "extract samples";
  try {
    const framePattern = path.join(tmpDir, "frame_%04d.jpg");
    const maxFrames = Math.min(240, Math.max(1, Math.ceil(durationSec * 2)));
    await execFileAsync(ffmpegPath, [
      "-v", "error", "-i", sourcePath, "-vf", "fps=2,scale=640:-1",
      "-frames:v", String(maxFrames), "-q:v", "4", framePattern,
    ], { maxBuffer: 2 * 1024 * 1024, timeout: 120_000 });
    const frames = fs.readdirSync(tmpDir).filter((name) => /^frame_\d+\.jpg$/.test(name)).sort();
    if (!frames.length) return null;

    stage = "serve MediaPipe WASM";
    const resolvePath = (mod: string) => (eval("require.resolve") as typeof require.resolve)(mod);
    const packageRoot = path.dirname(resolvePath("@mediapipe/tasks-vision/vision_wasm_internal.js"));
    const wasmNames = new Set(fs.readdirSync(packageRoot));
    server = http.createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname).slice(1);
      const filePath = pathname === "face-model.tflite"
        ? FACE_MODEL_PATH
        : wasmNames.has(pathname) && /^vision_wasm_[a-z_]+\.(?:js|wasm)$/.test(pathname)
          ? path.join(packageRoot, pathname)
          : null;
      if (!filePath || !fs.existsSync(filePath)) { res.writeHead(404).end(); return; }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", filePath.endsWith(".wasm") ? "application/wasm" : filePath.endsWith(".js") ? "application/javascript" : "application/octet-stream");
      fs.createReadStream(filePath).pipe(res);
    });
    await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") return null;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    stage = "launch face detector browser";
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (error: Error) => console.warn("[Lime Slides] Face detector browser error:", error.message));
    page.on("requestfailed", (request: any) => console.warn("[Lime Slides] Face detector resource failed:", request.url(), request.failure()?.errorText));
    await page.addScriptTag({ path: resolvePath("@mediapipe/tasks-vision/vision_bundle.js") });
    stage = "initialize MediaPipe face detector";
    await page.evaluate(async ({ baseUrl }) => {
      const vision = (window as any).Vision;
      const files = await vision.FilesetResolver.forVisionTasks(baseUrl);
      const detector = await vision.FaceDetector.createFromOptions(files, {
        baseOptions: { modelAssetPath: `${baseUrl}/face-model.tflite`, delegate: "CPU" },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.45,
      });
      (window as any).__rathFaceDetector = detector;
    }, { baseUrl });

    stage = "detect sampled faces";
    const detected: FaceSample[] = [];
    for (let index = 0; index < frames.length; index++) {
      const bytes = fs.readFileSync(path.join(tmpDir, frames[index]));
      const result = await page.evaluate(async ({ imageUrl, timeSec }) => {
        const image = new Image();
        image.src = imageUrl;
        await image.decode();
        const detector = (window as any).__rathFaceDetector;
        const detections = detector.detect(image).detections || [];
        const face = detections
          .filter((item: any) => item.boundingBox && (item.categories?.[0]?.score ?? 0) >= 0.45)
          .sort((a: any, b: any) => b.boundingBox.width * b.boundingBox.height - a.boundingBox.width * a.boundingBox.height)[0];
        if (!face) return null;
        const box = face.boundingBox;
        return {
          timeSec,
          x: box.originX / image.naturalWidth,
          y: box.originY / image.naturalHeight,
          width: box.width / image.naturalWidth,
          height: box.height / image.naturalHeight,
        };
      }, { imageUrl: `data:image/jpeg;base64,${bytes.toString("base64")}`, timeSec: index / 2 });
      if (result) detected.push(result);
    }
    const coverage = detected.length / frames.length;
    if (coverage < 0.95) return null;
    return { samples: smoothFaceSamples(detected), coverage };
  } catch (error: any) {
    console.warn(`[Lime Slides] Face tracking unavailable during ${stage}; using contain framing:`, error?.stack || error?.message || String(error));
    return null;
  } finally {
    await browser?.close().catch(() => {});
    if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

export function buildFaceAwareSpeakerFilter(
  samples: FaceSample[],
  sourceWidth: number,
  sourceHeight: number,
  cropHeight = 1920,
  coverage = 1
): { filter: string; diagnostics: { coverage: number; scale: number } } | null {
  if (!samples.length || !sourceWidth || !sourceHeight) return null;
  const sorted = [...samples].sort((a, b) => a.timeSec - b.timeSec);
  const faceHeights = sorted.map((sample) => sample.height * sourceHeight).sort((a, b) => a - b);
  const medianFaceHeight = faceHeights[Math.floor(faceHeights.length / 2)];
  if (!medianFaceHeight) return null;
  const scale = Math.max(1080 / sourceWidth, cropHeight / sourceHeight, cropHeight * 0.3 / medianFaceHeight);
  const scaledWidth = Math.ceil(sourceWidth * scale / 2) * 2;
  const scaledHeight = Math.ceil(sourceHeight * scale / 2) * 2;
  const maxX = Math.max(0, scaledWidth - 1080);
  const maxY = Math.max(0, scaledHeight - cropHeight);
  const positions = sorted.map((sample) => {
    const faceLeft = sample.x * sourceWidth * scale;
    const faceTop = sample.y * sourceHeight * scale;
    const faceWidth = sample.width * sourceWidth * scale;
    const faceHeight = sample.height * sourceHeight * scale;
    const x = Math.min(maxX, Math.max(0, faceLeft + faceWidth / 2 - 540));
    const eyesY = faceTop + faceHeight * 0.4;
    const noForeheadCropMax = Math.min(maxY, Math.max(0, faceTop - 24));
    const y = Math.min(noForeheadCropMax, Math.max(0, eyesY - cropHeight * 0.4));
    return { timeSec: sample.timeSec, x: Math.round(x), y: Math.round(y) };
  });
  const expression = (axis: "x" | "y") => {
    if (positions.length === 1) return String(positions[0][axis]);
    let nested = String(positions[positions.length - 1][axis]);
    for (let index = positions.length - 2; index >= 0; index--) {
      const a = positions[index];
      const b = positions[index + 1];
      const span = Math.max(0.001, b.timeSec - a.timeSec);
      nested = `if(lt(t\\,${b.timeSec.toFixed(3)})\\,${a[axis]}+(${b[axis]}-${a[axis]})*(t-${a.timeSec.toFixed(3)})/${span.toFixed(3)}\\,${nested})`;
    }
    return nested;
  };
  return {
    filter: `scale=${scaledWidth}:${scaledHeight},crop=1080:${cropHeight}:x='${expression("x")}':y='${expression("y")}',setsar=1,eq=contrast=1.04:saturation=1.05`,
    diagnostics: { coverage, scale },
  };
}
