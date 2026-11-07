import fs from "fs";
import path from "path";
import os from "os";
import { exec, execFile } from "child_process";
import { promisify } from "util";
import { getFfmpegPath, getFfprobePath } from "./media-tool-paths";

export { getFfmpegPath, getFfprobePath } from "./media-tool-paths";

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
  words: WordTimestamp[];
  segments: TranscriptionSegment[];
}

export function isValidApiKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed.length < 20 ||
    trimmed === "MY_GEMINI_API_KEY" ||
    trimmed.toUpperCase().includes("YOUR_") ||
    trimmed.toUpperCase().includes("PLACEHOLDER") ||
    trimmed.toUpperCase().includes("INSERT_")
  ) {
    return false;
  }
  return true;
}

export async function probeVideoDuration(videoFilePath: string): Promise<number> {
  try {
    const ffprobePath = getFfprobePath();
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoFilePath,
    ], { timeout: 30_000, maxBuffer: 1024 * 1024 });
    const dur = parseFloat(stdout.trim());
    if (!isNaN(dur) && dur > 0) return Math.round(dur * 100) / 100;
  } catch (err: any) {
    console.error("[Transcriber] FFprobe could not read the uploaded video:", err?.message || err);
    throw new Error(`Could not inspect uploaded video metadata with FFprobe: ${err?.message || "unknown error"}`);
  }
  throw new Error("FFprobe returned an invalid video duration.");
}

/**
 * Detect speech pauses and audio activity using FFmpeg silencedetect
 */
export async function detectAudioSpeechIntervals(
  videoFilePath: string,
  totalDuration: number
): Promise<Array<{ start: number; end: number }>> {
  try {
    const ffmpegPath = getFfmpegPath();
    const { stderr } = await execAsync(
      `"${ffmpegPath}" -i "${videoFilePath}" -af silencedetect=noise=-30dB:d=0.35 -f null -`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const silenceStarts: number[] = [];
    const silenceEnds: number[] = [];

    const startRegex = /silence_start:\s*([0-9.]+)/g;
    const endRegex = /silence_end:\s*([0-9.]+)/g;

    let m: RegExpExecArray | null;
    while ((m = startRegex.exec(stderr)) !== null) {
      silenceStarts.push(parseFloat(m[1]));
    }
    while ((m = endRegex.exec(stderr)) !== null) {
      silenceEnds.push(parseFloat(m[1]));
    }

    if (silenceStarts.length > 0 && silenceEnds.length > 0) {
      const speechIntervals: Array<{ start: number; end: number }> = [];
      let currentStart = 0;

      for (let i = 0; i < silenceStarts.length; i++) {
        const silStart = silenceStarts[i];
        const silEnd = silenceEnds[i] ?? silStart + 0.5;

        if (silStart - currentStart > 0.4) {
          speechIntervals.push({
            start: Math.round(currentStart * 100) / 100,
            end: Math.round(silStart * 100) / 100,
          });
        }
        currentStart = silEnd;
      }

      if (totalDuration - currentStart > 0.4) {
        speechIntervals.push({
          start: Math.round(currentStart * 100) / 100,
          end: Math.round(totalDuration * 100) / 100,
        });
      }

      if (speechIntervals.length >= 3) {
        return speechIntervals;
      }
    }
  } catch {}

  // Fallback natural speaking cadence intervals
  const intervals: Array<{ start: number; end: number }> = [];
  const beatLength = Math.min(4.5, Math.max(2.5, totalDuration / 8));
  let cursor = 0.2;
  while (cursor < totalDuration - 0.5) {
    const next = Math.min(totalDuration, cursor + beatLength);
    intervals.push({
      start: Math.round(cursor * 100) / 100,
      end: Math.round((next - 0.2) * 100) / 100,
    });
    cursor = next + 0.15;
  }
  return intervals;
}

export function buildTimedWordsFromText(
  text: string,
  duration: number,
  speechIntervals?: Array<{ start: number; end: number }>
): {
  words: WordTimestamp[];
  segments: TranscriptionSegment[];
} {
  const rawTokens = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (rawTokens.length === 0) {
    return { words: [], segments: [] };
  }

  // If speech intervals are available, distribute words across the active speech zones
  if (speechIntervals && speechIntervals.length > 0) {
    const words: WordTimestamp[] = [];
    const segments: TranscriptionSegment[] = [];

    const totalSpeechDuration = speechIntervals.reduce(
      (acc, cur) => acc + (cur.end - cur.start),
      0
    );

    let tokenIndex = 0;
    speechIntervals.forEach((interval, segIdx) => {
      if (tokenIndex >= rawTokens.length) return;

      const intervalDuration = interval.end - interval.start;
      const proportion = intervalDuration / Math.max(1, totalSpeechDuration);
      const tokensForSegment = Math.max(
        1,
        Math.min(
          rawTokens.length - tokenIndex,
          Math.round(rawTokens.length * proportion)
        )
      );

      const segmentTokens = rawTokens.slice(
        tokenIndex,
        tokenIndex + tokensForSegment
      );
      tokenIndex += tokensForSegment;

      const timePerWord = intervalDuration / Math.max(1, segmentTokens.length);

      segmentTokens.forEach((token, wIdx) => {
        const wStart = Number((interval.start + wIdx * timePerWord).toFixed(2));
        const wEnd = Number(
          Math.min(
            interval.end,
            wStart + Math.max(0.12, timePerWord * 0.95)
          ).toFixed(2)
        );
        words.push({ word: token, start: wStart, end: wEnd });
      });

      segments.push({
        id: segIdx,
        start: interval.start,
        end: interval.end,
        text: segmentTokens.join(" "),
      });
    });

    // Any remaining tokens attached to the last segment
    while (tokenIndex < rawTokens.length && words.length > 0) {
      const extraToken = rawTokens[tokenIndex++];
      const lastWord = words[words.length - 1];
      words.push({
        word: extraToken,
        start: lastWord.end,
        end: Math.min(duration, lastWord.end + 0.3),
      });
      if (segments.length > 0) {
        segments[segments.length - 1].text += " " + extraToken;
      }
    }

    return { words, segments };
  }

  // Standard uniform time distribution across duration
  const effectiveDuration = Math.max(duration - 0.4, 4);
  const timePerWord = effectiveDuration / rawTokens.length;

  const words: WordTimestamp[] = rawTokens.map((w, idx) => {
    const start = Number((0.15 + idx * timePerWord).toFixed(2));
    const end = Number((start + Math.max(0.16, timePerWord * 0.94)).toFixed(2));
    return { word: w, start, end };
  });

  const segments: TranscriptionSegment[] = [];
  const chunkSize = 6;
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    segments.push({
      id: Math.floor(i / chunkSize),
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
      text: chunk.map((c) => c.word).join(" "),
    });
  }

  return { words, segments };
}

function buildTimedWordsFromSegments(
  segments: TranscriptionSegment[],
  text: string,
  duration: number
): WordTimestamp[] {
  if (!segments.length) return buildTimedWordsFromText(text, duration).words;
  return segments.flatMap((segment) => {
    const tokens = segment.text.trim().split(/\s+/).filter(Boolean);
    const span = Math.max(0.05, Math.min(duration, segment.end) - Math.max(0, segment.start));
    const start = Math.max(0, segment.start);
    const perWord = span / Math.max(1, tokens.length);
    return tokens.map((word, index) => ({
      word,
      start: Number((start + index * perWord).toFixed(3)),
      end: Number(Math.min(duration, start + (index + 1) * perWord).toFixed(3)),
    }));
  });
}

/**
 * Compatibility entry point for older callers. Audio activity and a filename cannot
 * recover spoken words, so never manufacture a transcript or word timestamps.
 */
export async function generateContentDerivedTranscription(params: {
  videoFilePath: string;
  duration: number;
  topic?: string;
  language?: string;
}): Promise<TranscriptionResult> {
  throw new Error(
    `No speech-to-text provider succeeded for this ${params.duration.toFixed(1)} second video. ` +
      "Configure GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY; a topic or filename cannot supply a transcript."
  );
}

/**
 * Extract audio from a local video file and transcribe it via:
 * 1. Groq Whisper Large V3 Turbo (if valid GROQ_API_KEY is configured)
 * 2. Gemini 2.5 Flash Speech Transcription (if valid GEMINI_API_KEY is configured)
 * 3. OpenAI Whisper (if valid OPENAI_API_KEY is configured)
 * 4. Content-derived audio interval transcription (real speech timing, NO hardcoded crypto/Binance)
 */
// In-memory cache for transcription results to avoid repeated expensive audio extractions and API calls
const transcriptionCache = new Map<string, { result: TranscriptionResult; mtimeMs: number }>();

export async function transcribeVideoAudio(
  videoFilePath: string,
  options?: { topic?: string; language?: string }
): Promise<TranscriptionResult> {
  if (!fs.existsSync(videoFilePath)) {
    throw new Error(`[Transcriber] Video file not found: ${videoFilePath}`);
  }

  let fileMtime = 0;
  try {
    fileMtime = fs.statSync(videoFilePath).mtimeMs;
    const cached = transcriptionCache.get(videoFilePath);
    if (cached && cached.mtimeMs === fileMtime) {
      console.log(`[Transcriber] Returning cached transcription for: ${path.basename(videoFilePath)}`);
      return cached.result;
    }
  } catch {}

  const cacheAndReturn = (result: TranscriptionResult): TranscriptionResult => {
    transcriptionCache.set(videoFilePath, { result, mtimeMs: fileMtime });
    return result;
  };

  const probedDuration = await probeVideoDuration(videoFilePath);
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  const hasValidGroq = isValidApiKey(groqApiKey);
  const hasValidGemini = isValidApiKey(geminiApiKey);
  const hasValidOpenai = isValidApiKey(openaiApiKey);

  if (hasValidGroq || hasValidGemini || hasValidOpenai) {
    const tempAudioDir = os.tmpdir();
    const tempAudioFile = path.join(
      tempAudioDir,
      `temp_audio_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp3`
    );

    try {
      const ffmpegPath = getFfmpegPath();
      const extractCmd = `"${ffmpegPath}" -y -i "${videoFilePath}" -vn -acodec libmp3lame -ac 1 -ar 16000 -b:a 64k "${tempAudioFile}"`;
      await execAsync(extractCmd);

      // 1. Groq Whisper Large V3 Turbo (Fastest & most accurate word timestamps)
      if (hasValidGroq && fs.existsSync(tempAudioFile)) {
        try {
          console.log("[Transcriber] Sending audio to Groq Whisper Large V3 Turbo...");
          const audioBuffer = fs.readFileSync(tempAudioFile);
          const blob = new Blob([audioBuffer], { type: "audio/mp3" });
          const formData = new FormData();
          formData.append("file", blob, "audio.mp3");
          formData.append("model", "whisper-large-v3-turbo");
          formData.append("response_format", "verbose_json");
          formData.append("timestamp_granularities[]", "word");
          formData.append("timestamp_granularities[]", "segment");
          if (options?.language && options.language !== "auto") {
            formData.append("language", options.language);
          }

          const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqApiKey}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data: any = await response.json();
            const duration = Number(data.duration) || probedDuration;
            const text = (data.text || "").trim();

            if (text.length > 0) {
              const fallbackTimed = buildTimedWordsFromText(text, duration);
              const responseSegments = Array.isArray(data.segments) && data.segments.length > 0
                ? data.segments.map((s: any) => ({ id: Number(s.id) || 0, start: Number(s.start), end: Number(s.end), text: String(s.text || "") }))
                : fallbackTimed.segments;
              console.log(`[Transcriber] Groq Whisper transcribed ${data.words?.length || fallbackTimed.words.length} words.`);
              return cacheAndReturn({
                text,
                language: data.language || options?.language || "en",
                duration,
                words:
                  Array.isArray(data.words) && data.words.length > 0
                    ? data.words.map((w: any) => ({
                        word: String(w.word).trim(),
                        start: Number(w.start),
                        end: Number(w.end),
                      }))
                    : buildTimedWordsFromSegments(responseSegments, text, duration),
                segments: responseSegments,
              });
            }
          } else {
            console.warn("[Transcriber] Groq Whisper API error:", response.status, await response.text());
          }
        } catch (groqErr: any) {
          console.warn("[Transcriber] Groq call error:", groqErr?.message || groqErr);
        }
      }

      // 2. OpenAI Whisper API
      if (hasValidOpenai && fs.existsSync(tempAudioFile)) {
        try {
          console.log("[Transcriber] Sending audio to OpenAI Whisper...");
          const audioBuffer = fs.readFileSync(tempAudioFile);
          const blob = new Blob([audioBuffer], { type: "audio/mp3" });
          const formData = new FormData();
          formData.append("file", blob, "audio.mp3");
          formData.append("model", "whisper-1");
          formData.append("response_format", "verbose_json");
          formData.append("timestamp_granularities[]", "word");
          formData.append("timestamp_granularities[]", "segment");

          const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${openaiApiKey}` },
            body: formData,
          });

          if (response.ok) {
            const data: any = await response.json();
            const text = (data.text || "").trim();
            if (text.length > 0) {
              const duration = Number(data.duration) || probedDuration;
              const fallbackTimed = buildTimedWordsFromText(text, duration);
              const responseSegments = Array.isArray(data.segments) && data.segments.length > 0
                ? data.segments.map((s: any) => ({ id: Number(s.id) || 0, start: Number(s.start), end: Number(s.end), text: String(s.text || "") }))
                : fallbackTimed.segments;
              console.log("[Transcriber] OpenAI Whisper transcribed successfully.");
              return cacheAndReturn({
                text,
                language: data.language || "en",
                duration,
                words:
                  Array.isArray(data.words) && data.words.length > 0
                    ? data.words.map((w: any) => ({
                        word: String(w.word).trim(),
                        start: Number(w.start),
                        end: Number(w.end),
                      }))
                    : buildTimedWordsFromSegments(responseSegments, text, duration),
                segments: responseSegments,
              });
            }
          }
        } catch (openAiErr: any) {
          console.warn("[Transcriber] OpenAI Whisper call error:", openAiErr?.message || openAiErr);
        }
      }

      // 3. Gemini Multimodal Audio Transcription (`gemini-2.5-flash`)
      if (hasValidGemini && fs.existsSync(tempAudioFile)) {
        try {
          console.log("[Transcriber] Sending audio to Gemini 2.5 Flash...");
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({
            apiKey: geminiApiKey,
            httpOptions: { headers: { "User-Agent": "reerts-rath" } },
          });
          const audioBase64 = fs.readFileSync(tempAudioFile).toString("base64");
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: "audio/mp3",
                    data: audioBase64,
                  },
                },
                {
                  text: "You are an expert audio transcriber. Transcribe the spoken audio verbatim in its original spoken language and script. Return ONLY the raw spoken transcript text without commentary.",
                },
              ],
            },
          });

          const transcriptText = (response.text || "").trim();
          if (transcriptText.length > 0) {
            console.log("[Transcriber] Gemini 2.5 Flash transcribed audio successfully.");
            const speechIntervals = await detectAudioSpeechIntervals(videoFilePath, probedDuration);
            const { words, segments } = buildTimedWordsFromText(transcriptText, probedDuration, speechIntervals);
            return cacheAndReturn({
              text: transcriptText,
              language: options?.language || "en",
              duration: probedDuration,
              words,
              segments,
            });
          }
        } catch (geminiErr: any) {
          console.warn("[Transcriber] Gemini transcription call error:", geminiErr?.message || geminiErr);
        }
      }
    } finally {
      if (fs.existsSync(tempAudioFile)) {
        try {
          fs.unlinkSync(tempAudioFile);
        } catch {}
      }
    }
  }

  // Do not invent narration from the filename/topic when every transcription provider fails.
  console.warn(`[Transcriber] No configured provider returned a transcript for ${probedDuration}s video.`);
  return generateContentDerivedTranscription({
    videoFilePath,
    duration: probedDuration,
    topic: options?.topic,
    language: options?.language,
  });
}
