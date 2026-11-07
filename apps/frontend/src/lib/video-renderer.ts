import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import {
  RathEditPlan,
  AuteurEditPlan,
  PlannedScene,
} from "./gemini-video-pipeline";
import { buildRathAssScript, buildAuteurAssScript, getStyleVisualConfig } from "./auteur-ass-composer";
import { getFfmpegPath, getFfprobePath } from "./media-tool-paths";
import { removeVideoBackgroundWithReplicate } from "./video-background-removal";
import type { LimeRathEditPlan, LimeAuteurEditPlan } from "./lime-director-schema";

const ffmpegBinary = getFfmpegPath();
if (ffmpegBinary && fs.existsSync(ffmpegBinary)) {
  ffmpeg.setFfmpegPath(ffmpegBinary);
}

const ffprobeBinary = getFfprobePath();
if (ffprobeBinary && fs.existsSync(ffprobeBinary)) {
  ffmpeg.setFfprobePath(ffprobeBinary);
}

const execFileAsync = promisify(execFile);

export async function inspectRenderedVideo(
  videoPath: string,
  expectedDurationSec: number
): Promise<Array<{ id: string; label: string; status: "pass" | "warn"; detail: string }>> {
  if (!fs.existsSync(videoPath)) throw new Error(`Rendered video was not found: ${videoPath}`);
  const { stdout } = await execFileAsync(getFfprobePath(), [
    "-v", "error",
    "-show_entries", "format=duration:stream=codec_type,width,height,avg_frame_rate",
    "-of", "json",
    videoPath,
  ], { maxBuffer: 1024 * 1024 });
  const probe = JSON.parse(stdout);
  const videoStream = probe.streams?.find((stream: any) => stream.codec_type === "video");
  const audioStream = probe.streams?.find((stream: any) => stream.codec_type === "audio");
  if (!videoStream) throw new Error("Rendered file contains no video stream.");
  const actualDuration = Number(probe.format?.duration || 0);
  const durationPass = actualDuration > 0 && Math.abs(actualDuration - expectedDurationSec) <= 1.25;
  const portraitPass = videoStream.width === 1080 && videoStream.height === 1920;
  return [
    { id: "render_file", label: "Video file decodes", status: "pass", detail: `${videoStream.width}×${videoStream.height}, ${actualDuration.toFixed(2)} s` },
    { id: "render_duration", label: "Output duration", status: durationPass ? "pass" : "warn", detail: `${actualDuration.toFixed(2)} s rendered; ${expectedDurationSec.toFixed(2)} s expected` },
    { id: "render_resolution", label: "Vertical output size", status: portraitPass ? "pass" : "warn", detail: `${videoStream.width}×${videoStream.height}; 1080×1920 expected` },
    { id: "render_audio", label: "Audio stream", status: audioStream ? "pass" : "warn", detail: audioStream ? "An audio stream is present. Loudness and sound design are not measured." : "No audio stream found." },
  ];
}

export function getVideosDir(): string {
  const candidate1 = path.join(
    process.cwd(),
    "apps",
    "frontend",
    "public",
    "uploads",
    "videos"
  );
  if (fs.existsSync(candidate1)) return candidate1;

  const candidate2 = path.join(process.cwd(), "public", "uploads", "videos");
  if (fs.existsSync(candidate2)) return candidate2;

  const chosen = fs.existsSync(path.join(process.cwd(), "apps", "frontend"))
    ? candidate1
    : candidate2;
  fs.mkdirSync(chosen, { recursive: true });
  return chosen;
}

export function resolveVideoInputPath(videoRelPath: string): string | null {
  if (!videoRelPath) return null;
  const filename = path.basename(videoRelPath);
  const candidates = [
    path.join(getVideosDir(), filename),
    path.join(process.cwd(), "public", "uploads", "videos", filename),
    path.join(
      process.cwd(),
      "apps",
      "frontend",
      "public",
      "uploads",
      "videos",
      filename
    ),
    path.join(process.cwd(), videoRelPath),
    videoRelPath,
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Extract a frame from a video as thumbnail JPEG
 */
export async function extractVideoThumbnail(
  videoRelPath: string,
  projectId: string,
  timestampSec = "1.5"
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const videosDir = getVideosDir();
      const inputPath = resolveVideoInputPath(videoRelPath);

      if (!inputPath || !fs.existsSync(inputPath)) {
        return resolve(videoRelPath);
      }

      const thumbFilename = `thumb_${projectId}.jpg`;

      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timestampSec],
          filename: thumbFilename,
          folder: videosDir,
          size: "720x1280",
        })
        .on("end", () => {
          const directFile = path.join(videosDir, thumbFilename);
          const suffixedFile = path.join(videosDir, `thumb_${projectId}_1.jpg`);
          if (!fs.existsSync(directFile) && fs.existsSync(suffixedFile)) {
            try {
              fs.copyFileSync(suffixedFile, directFile);
            } catch {}
          }
          resolve(`/api/studio/video/${thumbFilename}`);
        })
        .on("error", (err) => {
          console.warn("[FFmpeg Renderer] Thumbnail extraction warning:", err?.message || err);
          resolve(videoRelPath);
        });
    } catch (e: any) {
      console.warn("[FFmpeg Renderer] Thumbnail extraction exception:", e?.message || e);
      resolve(videoRelPath);
    }
  });
}

export interface RenderProjectOptions {
  projectId: string;
  videoRelPath: string;
  styleId: string;
  plan?: LimeRathEditPlan;
  transcriptWords?: Array<{ word: string; start: number; end: number }>;
  headline?: string;
  subAccent?: string;
  durationSec?: number;
  avatarCutout?: boolean;
}

/**
 * Normalizes and stretches/tiles the scene list so that every second from 0..limitSec
 * has an active multi-scene graphic plate.
 */
function prepareRenderScenes(
  rawScenes: PlannedScene[] | undefined,
  limitSec: number
): PlannedScene[] {
  if (!rawScenes || rawScenes.length === 0) {
    return [
      {
        sceneId: "s1",
        start: 0,
        end: limitSec,
        headline: "HOOK",
        subAccent: "OVERVIEW",
        objective: "Hook the viewer with the core statement",
        visualType: "split-hook",
        badgeText: "KEY TAKEAWAY",
        onScreenText: ["OVERVIEW", "KEY TAKEAWAY"],
      },
    ];
  }

  const selected = rawScenes.slice(0, 10).map((s) => ({ ...s }));
  const lastEnd = selected[selected.length - 1]?.end || 37.3;

  if (limitSec > lastEnd + 1.5) {
    const scale = limitSec / Math.max(1, lastEnd);
    return selected.map((sc, idx) => {
      const start = idx === 0 ? 0 : Math.round(sc.start * scale * 100) / 100;
      const end =
        idx === selected.length - 1
          ? limitSec
          : Math.round(sc.end * scale * 100) / 100;
      return {
        ...sc,
        start,
        end: Math.max(start + 0.5, end),
      };
    });
  }

  return selected.map((sc, idx) => {
    const start = idx === 0 ? 0 : Math.min(limitSec - 0.4, Math.max(0, sc.start));
    const end =
      idx === selected.length - 1
        ? limitSec
        : Math.min(limitSec, Math.max(start + 0.5, sc.end));
    return {
      ...sc,
      start,
      end,
    };
  });
}

/**
 * Composite and render the video into the exact selected Reerts Studio style (all 56 styles supported)
 * using:
 * 1. Base 1080x1920 canvas in the style's exact palette with architectural grid lines.
 * 2. Speaker framing geometry tailored per style family:
 *    - Dry Erase & Receipt Roll: Speaker in top window, Whiteboard/Receipt Roll under the chin.
 *    - Split Explainer / Glitch / Paper Studio / Lime Slides / Sketchbook / Bento Box / etc.:
 *      Speaker in bottom card, high-impact motion graphics & proof cards on top.
 * 3. libass vector graphics, stacked headlines, proof badges, timecode, and word-by-word karaoke captions.
 * 4. Broadcast loudness normalization (-14.1 LUFS, 44.1kHz AAC, H.264 Main Profile Level 4.0).
 */
export async function renderProjectVideo(
  options: RenderProjectOptions
): Promise<string> {
  const {
    projectId,
    videoRelPath,
    styleId,
    plan,
    transcriptWords,
    durationSec = 37.3,
  } = options;

  const videosDir = getVideosDir();
  const inputPath = resolveVideoInputPath(videoRelPath);

  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error(`Input video not found for: ${videoRelPath}`);
  }

  const outputFilename = `rendered_${projectId}.mp4`;
  const outputPath = path.join(videosDir, outputFilename);

  const limitSec = Math.min(Math.max(durationSec, 3), 120);
  const theme = getStyleVisualConfig(styleId);
  const safeId = projectId.replace(/[^a-zA-Z0-9_-]/g, "");
  const cutoutPath = options.avatarCutout
    ? await removeVideoBackgroundWithReplicate(inputPath, projectId)
    : null;
  let speakerVideoPath = cutoutPath || inputPath;
  const cleanupCutout = () => {
    if (cutoutPath && fs.existsSync(cutoutPath)) {
      try { fs.unlinkSync(cutoutPath); } catch {}
    }
  };

  // High-fidelity Lime Slides Engine matching Reerts Studio frame-by-frame
  if (styleId === "limeslides" || styleId === "cap-slides") {
    try {
      console.log("[Video Renderer] Delegating to high-fidelity Lime Slides Engine...");
      const { renderLimeSlidesVideo } = await import("./lime-slides-engine");
      try {
        await renderLimeSlidesVideo({
          projectId,
          absVideoPath: speakerVideoPath,
          outputPath,
          plan,
          transcriptWords,
          durationSec: limitSec,
          cutoutVideo: Boolean(cutoutPath),
        });
      } finally {
        cleanupCutout();
      }
      return `/api/studio/video/${outputFilename}`;
    } catch (limeErr: any) {
      cleanupCutout();
      console.error("[Video Renderer] Lime Slides Engine failed:", limeErr?.message);
      throw new Error(`Lime Slides render failed: ${limeErr?.message || "unknown renderer error"}`);
    }
  }

  const renderScenes = prepareRenderScenes(plan?.scenes, limitSec);

  // 1. Build ASS subtitle script with full multi-scene graphic overlays & karaoke captions
  const assFilePath = path.join(os.tmpdir(), `rath_${safeId}.ass`);
  const assContent = buildRathAssScript({
    styleId,
    durationSec: limitSec,
    plan: plan ? { ...plan, scenes: renderScenes } : undefined,
    transcriptWords,
    headlineFallback: options.headline || plan?.headline || "VIRAL EDIT",
    subAccentFallback: options.subAccent || plan?.subAccent || "KEY TAKEAWAYS",
    includeSceneHeaders: true,
  });
  fs.writeFileSync(assFilePath, assContent, "utf8");

  // 2. Speaker framing geometry based on style layoutFamily:
  const isChinBoard =
    theme.layoutFamily === "whiteboard_marker" ||
    theme.layoutFamily === "receipt_roll";

  const spkW = isChinBoard ? 972 : 920;
  const spkH = isChinBoard ? 1020 : 590;
  const spkX = isChinBoard ? 54 : 80;
  const spkY = isChinBoard ? 130 : 1275;

  const colorFilter =
    theme.isDarkCanvas
      ? ",eq=contrast=1.08:saturation=1.04"
      : ",eq=contrast=1.04:saturation=1.05";

  // Properly escape ASS file path for FFmpeg filtergraph on Windows/Linux
  const safeAssPath = assFilePath.replace(/\\/g, "/").replace(/:/g, "\\:");

  return new Promise((resolve, reject) => {
    try {
      const complexFilter: string[] = [
        // Base 1080x1920 @ 30fps canvas in the style's background color
        `color=c=${theme.canvasBgHex}:s=1080x1920:r=30[bg0]`,
        // Architectural grid lines
        `[bg0]drawbox=x=0:y=1260:w=1080:h=2:color=${theme.gridLineHex}@0.45:t=fill[bg1]`,
        `[bg1]drawbox=x=54:y=0:w=2:h=1920:color=${theme.gridLineHex}@0.35:t=fill[bg2]`,
        `[bg2]drawbox=x=1026:y=0:w=2:h=1920:color=${theme.gridLineHex}@0.35:t=fill[bg]`,
        // Scale and crop speaker video
        `[0:v]scale=${spkW}:${spkH}:force_original_aspect_ratio=increase,crop=${spkW}:${spkH},setsar=1${colorFilter}[spk]`,
        // Overlay speaker video onto canvas
        `[bg][spk]overlay=${spkX}:${spkY}:shortest=1[base0]`,
        // Style-colored border around the speaker window
        `[base0]drawbox=x=${spkX - 2}:y=${spkY - 2}:w=${spkW + 4}:h=${spkH + 4}:color=${theme.cardBorderHex}@0.9:t=3[base1]`,
        // Burn in synchronized word-by-word karaoke captions, stacked headlines, crosshairs & timecode via libass
        `[base1]ass='${safeAssPath}'[outv]`,
      ];

      const cmd = ffmpeg()
        .input(speakerVideoPath)
        .complexFilter(complexFilter)
        .audioFilters("loudnorm=I=-14.1:TP=-2.0:LRA=11,aresample=44100")
        .outputOptions([
          "-threads 0",
          "-map [outv]",
          "-map 0:a?",
          "-c:v libx264",
          "-profile:v main",
          "-level 4.0",
          "-preset veryfast",
          "-crf 25",
          "-maxrate 1800k",
          "-bufsize 3600k",
          "-r 30",
          "-pix_fmt yuv420p",
          "-c:a aac",
          "-ar 44100",
          "-ac 2",
          "-b:a 128k",
          "-movflags +faststart",
          `-t ${limitSec}`,
        ])
        .output(outputPath)
        .on("start", (commandLine) => {
          console.log(
            `[FFmpeg Renderer] Running multi-scene composite (${theme.styleName} / ${theme.layoutFamily}):`,
            commandLine
          );
        })
        .on("end", async () => {
          cleanupCutout();
          console.log(`[FFmpeg Renderer] Studio composite finished: ${outputPath}`);
          try {
            if (fs.existsSync(assFilePath)) fs.unlinkSync(assFilePath);
          } catch {}
          try {
            await extractVideoThumbnail(
              `/uploads/videos/${outputFilename}`,
              projectId,
              "1.5"
            );
          } catch {}
          resolve(`/api/studio/video/${outputFilename}`);
        })
        .on("error", (err) => {
          cleanupCutout();
          console.error("[FFmpeg Renderer] FFmpeg studio render error:", err);
          try {
            if (fs.existsSync(assFilePath)) fs.unlinkSync(assFilePath);
          } catch {}
          reject(err);
        });

      cmd.run();
    } catch (e: any) {
      cleanupCutout();
      console.error("[FFmpeg Renderer] Video rendering exception:", e);
      try {
        if (fs.existsSync(assFilePath)) fs.unlinkSync(assFilePath);
      } catch {}
      reject(e);
    }
  });
}
