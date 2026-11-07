import { GoogleGenAI } from "@google/genai";
import { TranscriptionResult, isValidApiKey } from "./groq-transcriber";
import { searchCoverrVideos } from "./coverr-client";

export interface PlannedScene {
  sceneId: string;
  start: number;
  end: number;
  headline: string;
  subAccent: string;
  objective: string;
  visualType:
    | "split-hook"
    | "browser-card"
    | "diagram"
    | "counter"
    | "steps"
    | "cta"
    | "coin-proof"
    | "freeze-slam";
  badgeText?: string;
  onScreenText: string[];
  stampText?: string;
  stepProgress?: string;
}

export interface ResearchItem {
  url: string;
  title: string;
  facts: string[];
  status: "ok" | "verified";
  confidence?: number;
}

export interface VideoAssetRecord {
  assetId: string;
  badge: "screenshot" | "recording" | "logo" | "animation" | "cc_image";
  title: string;
  sourceUrl: string;
  thumbnailUrl?: string;
  sceneIds: string[];
}

export interface QualityCheckRecord {
  id: string;
  label: string;
  status: "pass" | "warn";
  detail?: string;
}

export interface RathEditPlan {
  headline: string;
  subAccent: string;
  metricLabel: string;
  metricCount: number;
  steps: [string, string, string];
  platformCaption: string;
  scenes: PlannedScene[];
  researchVisits: ResearchItem[];
  assets: VideoAssetRecord[];
  checks: QualityCheckRecord[];
  cadenceWordsPerMin: number;
}

/** Backward compatibility alias */
export type AuteurEditPlan = RathEditPlan;

/**
 * Call LLM to analyze the real transcript and build the Reerts Rath scene plan.
 */
async function callLLM(prompt: string): Promise<string | null> {
  // 1. OpenAI API if configured
  const openaiKey = process.env.OPENAI_API_KEY;
  if (isValidApiKey(openaiKey)) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an elite short-form video director and motion graphics editor for Reerts Rath. Always respond in valid JSON with scene timing, headlines, visual assets, and quality checks.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch {}
  }

  // 2. Groq API (High-speed Llama / Qwen / GPT-OSS inference)
  const groqApiKey = process.env.GROQ_API_KEY;
  if (isValidApiKey(groqApiKey)) {
    for (const model of ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"]) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are an elite short-form video director and motion graphics editor for Reerts Rath. Always respond in valid JSON with scene timing, headlines, visual assets, and quality checks.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const content = json.choices?.[0]?.message?.content;
          if (content) return content;
        }
      } catch {}
    }
  }

  // 3. DeepSeek API if configured
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (isValidApiKey(deepseekKey)) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deepseekKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an elite short-form video director and motion graphics editor for Reerts Rath. Always respond in valid JSON with scene timing, headlines, visual assets, and quality checks.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch {}
  }

  // 3. Gemini 2.5 Flash / 3.8 Flash API if configured
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (isValidApiKey(geminiApiKey)) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "reerts-rath",
          },
        },
      });
      const res = await ai.models.generateContent({
        model: process.env.GEMINI_VISION_MODEL || "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      if (res.text) return res.text;
    } catch {}
  }

  return null;
}

/**
 * Extract key entities, numbers, and domains from transcript text
 */
function extractTranscriptEntities(text: string): {
  keyTopics: string[];
  numbers: string[];
  probableDomains: string[];
} {
  const words = text.split(/\s+/);
  const numbers: string[] = [];
  const keyTopics: string[] = [];

  // Find numbers or currency amounts
  const numRegex = /(\$?\d+[\d,.]*(?:[kKmMbB]|%|billion|million|thousand)?)/g;
  let match: RegExpExecArray | null;
  while ((match = numRegex.exec(text)) !== null) {
    if (match[1].length > 1 && !numbers.includes(match[1])) {
      numbers.push(match[1]);
    }
  }

  // Find capitalized noun phrases
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[^a-zA-Z0-9]/g, "");
    if (w.length > 3 && /^[A-Z]/.test(w) && !["This", "That", "When", "What", "Then", "Here", "With"].includes(w)) {
      if (!keyTopics.includes(w)) keyTopics.push(w);
    }
  }

  // Probable domain lookups based on recognized terms
  const domainMap: Record<string, string> = {
    ai: "openai.com",
    gpt: "chatgpt.com",
    claude: "anthropic.com",
    gemini: "deepmind.google",
    react: "react.dev",
    next: "nextjs.org",
    node: "nodejs.org",
    python: "python.org",
    figma: "figma.com",
    github: "github.com",
    apple: "apple.com",
    google: "google.com",
    tesla: "tesla.com",
    reerts: "reerts.in",
    rath: "reerts.in",
  };

  const probableDomains: string[] = [];
  const lowerText = text.toLowerCase();
  for (const [key, domain] of Object.entries(domainMap)) {
    if (lowerText.includes(key)) {
      probableDomains.push(domain);
    }
  }

  return { keyTopics: keyTopics.slice(0, 5), numbers: numbers.slice(0, 4), probableDomains };
}

/** Build scenes around the actual spoken phrases, sentence endings, and pauses. */
export function buildDynamicScenesFromTranscript(
  transcript: TranscriptionResult,
  totalDuration: number,
  topic: string
): PlannedScene[] {
  const words = (transcript.words || [])
    .filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end) && word.end > word.start)
    .sort((a, b) => a.start - b.start);
  const groups: typeof words[] = [];

  if (words.length) {
    let group = [words[0]];
    for (let i = 1; i < words.length; i++) {
      const previous = words[i - 1];
      const next = words[i];
      const elapsed = previous.end - group[0].start;
      const pause = next.start - previous.end;
      const sentenceEnded = /[.!?]$/.test(previous.word);
      const shouldSplit = elapsed >= 2.6 && (sentenceEnded || pause >= 0.28 || elapsed >= 5.2);
      if (shouldSplit) {
        groups.push(group);
        group = [];
      }
      group.push(next);
      if (next.end - group[0].start >= 6.2) {
        groups.push(group);
        group = [];
      }
    }
    if (group.length) groups.push(group);
  } else if (transcript.segments?.length) {
    for (const segment of transcript.segments) {
      const segmentWords = segment.text.trim().split(/\s+/).filter(Boolean);
      if (segmentWords.length) {
        const duration = Math.max(0.1, segment.end - segment.start) / segmentWords.length;
        groups.push(segmentWords.map((word, idx) => ({
          word,
          start: segment.start + duration * idx,
          end: segment.start + duration * (idx + 1),
        })));
      }
    }
  }

  // Faceless/topic-led projects have no spoken timestamps; use a short structure
  // derived from the user's supplied topic rather than pretending it was spoken.
  if (!groups.length) {
    const topicWords = topic.split(/\s+/).filter(Boolean);
    const step = Math.max(1, totalDuration / Math.max(1, Math.ceil(totalDuration / 4.5)));
    for (let start = 0, i = 0; start < totalDuration; start += step, i++) {
      groups.push(topicWords.slice(i * 3, i * 3 + 8).map((word, idx) => ({
        word,
        start: start + idx * 0.25,
        end: Math.min(totalDuration, start + (idx + 1) * 0.25),
      })));
    }
  }

  return groups.map((group, i) => {
    const start = Math.max(0, group[0]?.start || 0);
    const end = Math.min(totalDuration, Math.max(start + 0.25, group[group.length - 1]?.end || start + 1));
    const chunkWords = group.map((word) => word.word.replace(/[^\p{L}\p{N}'’-]/gu, "")).filter(Boolean);
    const headline = chunkWords.slice(0, 4).join(" ") || topic.slice(0, 28);
    const subAccent = chunkWords.slice(4, 8).join(" ");
    const normalized = chunkWords.join(" ").toLowerCase();
    const visualType: PlannedScene["visualType"] = i === 0
      ? "split-hook"
      : /\b(first|second|third|step|steps|number|top)\b/.test(normalized)
        ? "steps"
        : /\b(percent|million|billion|\d+|growth|price|cost|revenue)\b/.test(normalized)
          ? "counter"
          : /\b(how|why|because|works|process|system)\b/.test(normalized)
            ? "diagram"
            : "browser-card";
    return {
      sceneId: `s${i + 1}`,
      start,
      end,
      headline: headline.toUpperCase(),
      subAccent: subAccent.toUpperCase(),
      objective: `Illustrate this spoken beat: ${group.map((word) => word.word).join(" ")}`,
      visualType,
      badgeText: i === 0 ? "HOOK" : `BEAT ${String(i + 1).padStart(2, "0")}`,
      onScreenText: [headline, subAccent].filter(Boolean).map((text) => text.toUpperCase()),
    };
  });
}

/** Research records remain empty until a source has actually been fetched and checked. */
function buildDynamicResearchVisits(
  topic: string,
  entities: ReturnType<typeof extractTranscriptEntities>
): ResearchItem[] {
  // Do not label guessed URLs or generated claims as researched/verified sources.
  void topic;
  void entities;
  return [];
}

/** Stores only returned stock assets; these are optional and never fabricated. */
async function buildDynamicAssets(
  topic: string,
  research: ResearchItem[],
  scenes: PlannedScene[]
): Promise<VideoAssetRecord[]> {
  const assets: VideoAssetRecord[] = [];
  const primaryUrl = research[0]?.url || "https://reerts.in";

  // 1. Live Coverr stock video B-roll retrieval
  try {
    const coverrVideos = await searchCoverrVideos(topic, 2);
    for (let i = 0; i < coverrVideos.length; i++) {
      const vid = coverrVideos[i];
      assets.push({
        assetId: vid.id,
        badge: "recording",
        title: `Coverr B-roll · ${vid.title}`,
        sourceUrl: vid.videoUrl,
        thumbnailUrl: vid.thumbnailUrl,
        sceneIds: [scenes[i + 1]?.sceneId || `s${i + 2}`],
      });
    }
  } catch (err: any) {
    console.warn("[Rath Director] Coverr asset fetch notice:", err?.message || err);
  }

  void primaryUrl;
  return assets;
}

/**
 * Planning cannot verify a rendered file, so report that check as pending.
 */
function buildDynamicChecks(totalDuration: number, wordCount: number): QualityCheckRecord[] {
  return [
    {
      id: "render_review",
      label: "Render quality review",
      status: "warn",
      detail: `Planning only (${totalDuration.toFixed(1)} s, ${wordCount} transcript words). Duration, framing, captions, audio, and safe areas have not been measured yet.`,
    },
  ];
}

function fallbackSceneLabel(scene: Partial<PlannedScene> | undefined): string {
  return String(scene?.headline || scene?.onScreenText?.[0] || "").slice(0, 40);
}

/**
 * Main Director Function: Plans the entire video edit with Reerts Rath.
 * Fully dynamic: every scene, headline, research visit, asset, and caption
 * is computed from the ACTUAL video transcript and duration.
 */
export async function planVideoWithRath(params: {
  topic?: string;
  styleName: string;
  durationSec?: number;
  language?: string;
  transcription?: TranscriptionResult;
}): Promise<RathEditPlan> {
  const totalDuration = params.transcription?.duration || params.durationSec || 37.27;
  const transcriptText = (params.transcription?.text || params.topic || "").trim();
  const wordCount = params.transcription?.words?.length || transcriptText.split(/\s+/).length || 60;
  const wpm = Math.round(wordCount / (Math.max(1, totalDuration) / 60)) || 140;

  const topicName = params.topic || transcriptText.slice(0, 45) || "Creative Reel";
  const entities = extractTranscriptEntities(transcriptText);
  const timedWords = (params.transcription?.words || [])
    .slice(0, 700)
    .map((word) => `${word.start.toFixed(2)} ${word.word}`)
    .join(" | ");

  // 1. If LLM is available, generate dynamic scene plan from the real transcript
  const llmPrompt = `Create an edit plan for a ${params.styleName} vertical short (${totalDuration.toFixed(1)} seconds, ${wpm} words per minute).
The transcript below is the source of truth. Do not add claims, statistics, quotes, CTAs, sources, or brands the speaker did not say. Use real transcript timestamps for scene boundaries. Group roughly one sentence per scene, usually 2.5–5.5 seconds, splitting at pauses when possible. Each scene must have a visually distinct treatment chosen from split-hook, browser-card, diagram, counter, steps, cta, coin-proof, freeze-slam. Counter/coin-proof may only use an exact number present in that scene's transcript. Keep on-screen text short and faithful to the spoken words. Return valid JSON only.

Transcript (${totalDuration.toFixed(1)}s):
"${transcriptText}"

Word timestamps (seconds): ${timedWords || "unavailable"}

Return JSON matching this exact structure:
{
  "headline": "Short punchy uppercase hook (max 4 words)",
  "subAccent": "Contrasting subtitle (max 5 words)",
  "metricLabel": "label for a key metric or fact mentioned",
  "metricCount": null,
  "steps": [],
  "platformCaption": "Engaging social media post caption with hashtags",
  "scenes": [
    {
      "sceneId": "s1",
      "start": 0.0,
      "end": 3.0,
      "headline": "PUNCHY HOOK",
      "subAccent": "KEY STATEMENT",
      "objective": "Hook the viewer",
      "visualType": "split-hook",
      "badgeText": "STEP 01",
      "onScreenText": ["WORDS FROM THIS SENTENCE", "ONLY IF SPOKEN"]
    }
  ]
}`;

  try {
    const rawJson = await callLLM(llmPrompt);
    if (rawJson) {
      const match = rawJson.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed.scenes) && parsed.scenes.length >= 3) {
          const researchVisits = buildDynamicResearchVisits(topicName, entities);
          const assets = await buildDynamicAssets(topicName, researchVisits, parsed.scenes);
          const checks = buildDynamicChecks(totalDuration, wordCount);
          const spokenNumbers = new Set(entities.numbers.map((value) => Number(value.replace(/[^0-9]/g, ""))));
          const proposedMetric = Number(parsed.metricCount);
          const metricCount = Number.isFinite(proposedMetric) && spokenNumbers.has(proposedMetric)
            ? proposedMetric
            : 0;
          const proposedMetricLabel = String(parsed.metricLabel || "").trim();
          const metricLabel = metricCount && proposedMetricLabel && transcriptText.toLowerCase().includes(proposedMetricLabel.toLowerCase())
            ? proposedMetricLabel
            : metricCount ? "spoken number" : "";

          return {
            headline: (parsed.headline || "KEY INSIGHT").toUpperCase(),
            subAccent: (parsed.subAccent || "THE BREAKDOWN").toUpperCase(),
            metricLabel,
            metricCount,
            steps: Array.isArray(parsed.steps) && parsed.steps.length === 3
              ? parsed.steps
              : [fallbackSceneLabel(parsed.scenes[0]), fallbackSceneLabel(parsed.scenes[1]), fallbackSceneLabel(parsed.scenes[2])] as [string, string, string],
            platformCaption: parsed.platformCaption || `${transcriptText.slice(0, 160)}... Drop your thoughts below! 👇🔥 #creator #reels #ai`,
            scenes: parsed.scenes,
            researchVisits,
            assets,
            checks,
            cadenceWordsPerMin: wpm,
          };
        }
      }
    }
  } catch (err: any) {
    console.warn("[Rath Director] LLM call fell back to local director:", err?.message || err);
  }

  // 2. High-quality algorithmic scene plan derived directly from the real transcript
  const fallbackScenes = buildDynamicScenesFromTranscript(
    params.transcription || {
      text: transcriptText,
      duration: totalDuration,
      language: params.language || "en",
      words: [],
      segments: [],
    },
    totalDuration,
    topicName
  );

  const researchVisits = buildDynamicResearchVisits(topicName, entities);
  const assets = await buildDynamicAssets(topicName, researchVisits, fallbackScenes);
  const checks = buildDynamicChecks(totalDuration, wordCount);

  const topH1 = fallbackScenes[0]?.headline || "KEY INSIGHT";
  const topH2 = fallbackScenes[0]?.subAccent || "THE BREAKDOWN";

  return {
    headline: topH1,
    subAccent: topH2,
    metricLabel: entities.numbers[0] ? "spoken number" : "",
    metricCount: entities.numbers[0] ? parseInt(entities.numbers[0].replace(/[^0-9]/g, "")) || 0 : 0,
    steps: [
      `01 / ${fallbackScenes[0]?.headline || "The Hook"}`,
      `02 / ${fallbackScenes[1]?.headline || "The Insight"}`,
      `03 / ${fallbackScenes[2]?.headline || "The Takeaway"}`,
    ],
    platformCaption: `${transcriptText.slice(0, 160)}... Let me know your thoughts in the comments! 👇🚀 #${(entities.keyTopics[0] || "content").toLowerCase()} #reels #automation`,
    scenes: fallbackScenes,
    researchVisits,
    assets,
    checks,
    cadenceWordsPerMin: wpm,
  };
}

/** Backward compatibility alias */
export const planVideoWithAuteur = planVideoWithRath;
