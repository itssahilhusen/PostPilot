import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { getFfprobePath } from "./groq-transcriber";

const REPLICATE_API = "https://api.replicate.com/v1";
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const execFileAsync = promisify(execFile);

async function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

/**
 * Optional temporal video matting. This sends the full source video to Replicate
 * only when the user enables the per-project speaker cutout option.
 */
export async function removeVideoBackgroundWithReplicate(
  sourcePath: string,
  _projectId: string
): Promise<string | null> {
  const stat = fs.statSync(sourcePath);
  if (stat.size > MAX_UPLOAD_BYTES) {
    throw new Error("Replicate video cutout supports uploads up to 100 MB in this pipeline.");
  }
  const sourceHash = await hashFile(sourcePath);
  const cacheDir = path.join(os.tmpdir(), "rath-speaker-cutout-cache");
  const outputPath = path.join(cacheDir, `speaker_cutout_${sourceHash}.webm`);
  fs.mkdirSync(cacheDir, { recursive: true });
  const cacheTtlMs = 14 * 24 * 60 * 60 * 1000;
  if (fs.existsSync(outputPath)) {
    const cacheStat = fs.statSync(outputPath);
    if (cacheStat.size > 4096 && Date.now() - cacheStat.mtimeMs < cacheTtlMs) {
      console.info("[Video Cutout] Reusing cached matte for this source clip.");
      return outputPath;
    }
    try { fs.unlinkSync(outputPath); } catch {}
  }
  for (const name of fs.readdirSync(cacheDir)) {
    if (!name.startsWith("speaker_cutout_") || !name.endsWith(".webm")) continue;
    const cachedPath = path.join(cacheDir, name);
    try {
      if (Date.now() - fs.statSync(cachedPath).mtimeMs >= cacheTtlMs) fs.unlinkSync(cachedPath);
    } catch {}
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("Speaker cutout is enabled, but REPLICATE_API_TOKEN is not configured on the server.");

  const { stdout: probeJson } = await execFileAsync(getFfprobePath(), [
    "-v", "error", "-show_entries", "format=duration", "-of", "json", sourcePath,
  ], { maxBuffer: 1024 * 1024 });
  const durationSec = Number(JSON.parse(probeJson).format?.duration || 0);
  if (!durationSec || durationSec > 60) {
    throw new Error("Replicate video cutout accepts clips up to 60 seconds. Trim this clip before using Lime Slides.");
  }

  const authHeaders = { Authorization: `Bearer ${token}` };
  const inputForm = new FormData();
  inputForm.append(
    "content",
    new Blob([fs.readFileSync(sourcePath)], { type: "video/mp4" }),
    path.basename(sourcePath)
  );
  const uploadResponse = await fetch(`${REPLICATE_API}/files`, {
    method: "POST",
    headers: authHeaders,
    body: inputForm,
    signal: AbortSignal.timeout(120_000),
  });
  if (!uploadResponse.ok) {
    throw new Error(`Replicate input upload failed (${uploadResponse.status}): ${(await uploadResponse.text()).slice(0, 300)}`);
  }
  const uploadedFile: any = await uploadResponse.json();
  const fileId = String(uploadedFile.id || "");
  if (!fileId) throw new Error("Replicate did not return an uploaded file ID.");

  const predictionResponse = await fetch(`${REPLICATE_API}/models/bria/video-remove-background/predictions`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "wait=30" },
    body: JSON.stringify({
      input: {
        video_url: `${REPLICATE_API}/files/${encodeURIComponent(fileId)}/download`,
        background_color: "Transparent",
        output_container_and_codec: "webm_vp9",
      },
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!predictionResponse.ok) {
    throw new Error(`Replicate cutout request failed (${predictionResponse.status}): ${(await predictionResponse.text()).slice(0, 300)}`);
  }

  let prediction: any = await predictionResponse.json();
  const deadline = Date.now() + 20 * 60 * 1000;
  while (prediction.status === "starting" || prediction.status === "processing") {
    if (Date.now() >= deadline) throw new Error("Replicate video cutout exceeded the 20 minute render limit.");
    const getUrl = prediction.urls?.get;
    if (!getUrl) throw new Error("Replicate did not return a prediction status URL.");
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const pollResponse = await fetch(getUrl, {
      headers: authHeaders,
      signal: AbortSignal.timeout(30_000),
    });
    if (!pollResponse.ok) throw new Error(`Replicate status check failed (${pollResponse.status}).`);
    prediction = await pollResponse.json();
  }

  if (prediction.status !== "succeeded") {
    throw new Error(`Replicate video cutout ${prediction.status}: ${String(prediction.error || "unknown error").slice(0, 300)}`);
  }
  const outputUrl = typeof prediction.output === "string"
    ? prediction.output
    : Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output?.url;
  if (!outputUrl || typeof outputUrl !== "string") throw new Error("Replicate cutout returned no output video URL.");

  const outputResponse = await fetch(outputUrl, { signal: AbortSignal.timeout(120_000) });
  if (!outputResponse.ok) throw new Error(`Could not download the transparent cutout (${outputResponse.status}).`);
  const output = Buffer.from(await outputResponse.arrayBuffer());
  if (!output.length || output.length > 500 * 1024 * 1024) throw new Error("Replicate returned an invalid or oversized cutout video.");
  const tempOutputPath = `${outputPath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tempOutputPath, output);
  fs.renameSync(tempOutputPath, outputPath);
  return outputPath;
}
