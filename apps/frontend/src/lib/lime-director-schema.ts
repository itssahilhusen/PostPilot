import { z } from "zod";
import type { TranscriptionResult } from "./groq-transcriber";
import type { RathEditPlan, AuteurEditPlan, PlannedScene } from "./gemini-video-pipeline";

export const LIME_SCENE_TYPES = ["HALO_SPEAKER", "FULL_GRAPHIC", "SPLIT_SPEAKER", "SPEAKER_STICKER", "NUMBERED_STEP", "CTA"] as const;
export const LIME_ILLUSTRATIONS = ["phone", "carousel", "line_chart", "gear_diagram", "swatches", "calendar", "video_player", "editor_window", "primitive"] as const;
export const LIME_SPEAKER_MODES = ["halo", "split", "full", "hidden"] as const;

export const limeAssetRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("screenshot"),
    url: z.string().url(),
    query: z.string().trim().max(120).optional(),
    highlightBox: z.object({ x: z.number().nonnegative(), y: z.number().nonnegative(), width: z.number().positive(), height: z.number().positive() }).optional(),
  }),
  z.object({ type: z.literal("photo"), query: z.string().trim().min(2).max(120) }),
  z.object({ type: z.literal("logo"), query: z.string().trim().min(2).max(80) }),
  z.object({ type: z.literal("none") }),
]);

export type LimeAssetRequest =
  | { type: "screenshot"; url: string; query?: string; highlightBox?: { x: number; y: number; width: number; height: number } }
  | { type: "photo"; query: string }
  | { type: "logo"; query: string }
  | { type: "none" };

export const limeBeatSchema = z.object({
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().positive(),
  sceneType: z.enum(LIME_SCENE_TYPES),
  headline: z.string().trim().min(1).max(40).refine((text) => text === text.toUpperCase(), "Headline must be ALL CAPS.").refine((text) => text.split(/\s+/).length <= 3, "Headline must use at most three words."),
  badge: z.string().trim().max(28).optional(),
  illustration: z.enum(LIME_ILLUSTRATIONS),
  illustrationProps: z.record(z.unknown()).default({}),
  speakerMode: z.enum(LIME_SPEAKER_MODES),
  emphasisWords: z.array(z.string().trim().min(1)).max(4).default([]),
  assetIntent: z.string().trim().max(140).optional(),
  assetRequest: limeAssetRequestSchema.optional(),
  stepIndex: z.number().int().positive().max(99).optional(),
}).refine((beat) => beat.endMs > beat.startMs, { message: "Beat endMs must be after startMs." })
  .refine((beat) => beat.sceneType !== "NUMBERED_STEP" || beat.stepIndex != null, { message: "NUMBERED_STEP requires an enumerated stepIndex." })
  .refine((beat) => beat.stepIndex == null || beat.sceneType === "NUMBERED_STEP", { message: "Only enumerated steps may use stepIndex." });

export const limeDirectorSchema = z.object({
  beats: z.array(limeBeatSchema).min(1).max(160),
});

export type LimeSceneBeat = z.infer<typeof limeBeatSchema>;
export type LimeDirectorPlan = z.infer<typeof limeDirectorSchema>;
export type LimeRathEditPlan = RathEditPlan & { limeBeats?: LimeSceneBeat[] };
/** Backward compatibility alias */
export type LimeAuteurEditPlan = LimeRathEditPlan;
export interface LimeTranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
  words: TranscriptionResult["words"];
}

export function toRathEditPlan(plan: LimeDirectorPlan): LimeRathEditPlan {
  const scenes: PlannedScene[] = plan.beats.map((beat, index) => ({
    sceneId: `lime_beat_${index + 1}`,
    start: beat.startMs / 1000,
    end: beat.endMs / 1000,
    headline: beat.headline,
    subAccent: beat.badge || beat.headline,
    objective: beat.assetIntent || beat.illustration,
    visualType: beat.sceneType === "CTA" ? "cta"
      : beat.sceneType === "NUMBERED_STEP" ? "steps"
      : beat.sceneType === "FULL_GRAPHIC" ? "diagram"
      : "split-hook",
    badgeText: beat.badge,
    onScreenText: [beat.headline],
  }));
  const first = plan.beats[0];
  const headlines = plan.beats.map((beat) => beat.headline);
  return {
    headline: first?.headline || "MAKE BETTER CONTENT",
    subAccent: first?.badge || first?.headline || "MAKE BETTER CONTENT",
    metricLabel: "",
    metricCount: 0,
    steps: [headlines[0] || "", headlines[1] || "", headlines[2] || ""],
    platformCaption: "",
    scenes,
    researchVisits: [],
    assets: [],
    checks: [],
    cadenceWordsPerMin: 145,
    limeBeats: plan.beats,
  };
}

/** Backward compatibility alias */
export const toAuteurEditPlan = toRathEditPlan;

const STOP_WORDS = new Set("a an and are as at be been but by can could did do does for from had has have he her here hers him his how i if in into is it its just me my no not of on or our out she so than that the their them then there these they this those through to up us was we were what when where which who why will with would you your".split(" "));
const STEP_WORDS: Record<string, number> = {
  first: 1, one: 1, second: 2, two: 2, third: 3, three: 3, fourth: 4, four: 4,
  fifth: 5, five: 5, sixth: 6, six: 6, seventh: 7, seven: 7, eighth: 8, eight: 8,
  ninth: 9, nine: 9, tenth: 10, ten: 10,
};

function cleanWord(value: string) {
  return value.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}'’-]+$/gu, "").trim();
}

function groupText(words: TranscriptionResult["words"]) {
  return words.map((word) => word.word.trim()).filter(Boolean).join(" ").replace(/\s+([,.;!?])/g, "$1");
}

function splitLongSegment(words: TranscriptionResult["words"]): Array<TranscriptionResult["words"]> {
  if (words.length < 2) return [words];
  const segments: TranscriptionResult["words"][] = [];
  let remaining = [...words];
  while (remaining.length) {
    const start = remaining[0].start;
    const fitting = remaining.map((word, index) => ({ word, index }))
      .filter(({ word }) => word.end - start <= 2.5);
    if (fitting.length === remaining.length) {
      segments.push(remaining);
      break;
    }
    let cutIndex = fitting.length ? fitting[fitting.length - 1].index : 0;
    const clauseIndex = fitting.filter(({ word }) => /[,;:]$/.test(word.word.trim())).at(-1)?.index;
    if (clauseIndex != null && clauseIndex > 0) cutIndex = clauseIndex;
    const chunk = remaining.slice(0, cutIndex + 1);
    if (!chunk.length) break;
    segments.push(chunk);
    remaining = remaining.slice(cutIndex + 1);
  }
  return segments.filter((segment) => segment.length > 0);
}

function mergeShortSegments(segments: Array<TranscriptionResult["words"]>) {
  const merged = segments.map((segment) => [...segment]);
  for (let index = 0; index < merged.length;) {
    const segment = merged[index];
    const duration = segment[segment.length - 1].end - segment[0].start;
    if (duration >= .8 || merged.length === 1) { index++; continue; }
    const canMergeNext = index + 1 < merged.length
      && merged[index + 1][merged[index + 1].length - 1].end - segment[0].start <= 2.5;
    const canMergePrevious = index > 0
      && segment[segment.length - 1].end - merged[index - 1][0].start <= 2.5;
    if (canMergeNext) {
      merged[index] = [...segment, ...merged[index + 1]];
      merged.splice(index + 1, 1);
    } else if (canMergePrevious) {
      merged[index - 1] = [...merged[index - 1], ...segment];
      merged.splice(index, 1);
      index = Math.max(0, index - 1);
    } else index++;
  }
  return merged;
}

/** Split on sentence punctuation and pauses, then merge/split to keep beats usable. */
export function segmentLimeTranscript(
  inputWords: TranscriptionResult["words"],
  durationSec: number,
  transcript = ""
): LimeTranscriptSegment[] {
  const maxDuration = Math.max(.1, durationSec);
  let words = inputWords.filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end) && word.end > word.start)
    .map((word) => ({ ...word, start: Math.max(0, word.start), end: Math.min(maxDuration, word.end) }))
    .filter((word) => word.end > word.start)
    .sort((a, b) => a.start - b.start);

  if (!words.length && transcript.trim()) {
    const rawWords = transcript.trim().split(/\s+/);
    const durationPerWord = maxDuration / Math.max(1, rawWords.length);
    words = rawWords.map((word, index) => ({ word, start: index * durationPerWord, end: Math.min(maxDuration, (index + 1) * durationPerWord) }));
  }
  if (!words.length) return [];

  const sentenceGroups: Array<TranscriptionResult["words"]> = [];
  let current: TranscriptionResult["words"] = [];
  for (const word of words) {
    const previous = current[current.length - 1];
    const pause = previous ? word.start - previous.end : 0;
    if (current.length && (pause > .35 || /[.!?]["')\]]*$/.test(previous.word.trim()))) {
      sentenceGroups.push(current);
      current = [];
    }
    current.push(word);
  }
  if (current.length) sentenceGroups.push(current);

  const bounded = sentenceGroups.flatMap(splitLongSegment);
  const merged = mergeShortSegments(bounded);
  return merged.map((segment) => ({
    startMs: Math.max(0, Math.round(segment[0].start * 1000)),
    endMs: Math.max(Math.round(segment[0].start * 1000) + 1, Math.round(segment[segment.length - 1].end * 1000)),
    text: groupText(segment),
    words: segment,
  }));
}

function localHeadline(segment: LimeTranscriptSegment, previousHeadline?: string) {
  const frequency = new Map<string, { count: number; order: number }>();
  for (const [order, entry] of segment.words.entries()) {
    const token = cleanWord(entry.word).toLowerCase();
    if (!token || STOP_WORDS.has(token)) continue;
    const existing = frequency.get(token);
    frequency.set(token, { count: (existing?.count || 0) + 1, order: existing?.order ?? order });
  }
  const ranked = [...frequency.entries()].sort((a, b) => b[1].count - a[1].count || a[1].order - b[1].order).map(([token]) => token);
  if (!ranked.length) {
    const first = segment.words.map((word) => cleanWord(word.word)).find(Boolean) || "VIDEO";
    ranked.push(first.toLowerCase());
  }
  const candidates: string[] = [];
  for (let count = Math.min(3, ranked.length); count >= 1; count--) {
    for (let start = 0; start + count <= ranked.length; start++) candidates.push(ranked.slice(start, start + count).join(" ").toUpperCase());
  }
  const distinct = candidates.find((headline) => headline !== previousHeadline);
  return (distinct || candidates[0] || "VIDEO").slice(0, 40);
}

function illustrationForWords(text: string): LimeSceneBeat["illustration"] {
  const value = text.toLowerCase();
  if (/conversation|talk|speak|chat|network|social/.test(value)) return "phone";
  if (/carousel|swipe|slide|story/.test(value)) return "carousel";
  if (/chart|grow|growth|increase|metric|revenue|sales/.test(value)) return "line_chart";
  if (/workflow|autom|process|system|tool/.test(value)) return "gear_diagram";
  if (/brand|color|colour|font|design|style/.test(value)) return "swatches";
  if (/calendar|schedule|date|publish/.test(value)) return "calendar";
  if (/video|edit|clip|reel/.test(value)) return "video_player";
  if (/error|mistake|avoid|bad|wrong/.test(value)) return "editor_window";
  return "primitive";
}

function findStepIndex(text: string): number | undefined {
  const match = text.toLowerCase().match(/\b(?:step|number)\s+(one|two|three|four|five|six|seven|eight|nine|ten|\d{1,2})\b|\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+(?:step|thing|tip|point)\b/i);
  if (!match) return undefined;
  const token = (match[1] || match[2]).toLowerCase();
  return STEP_WORDS[token] || (Number(token) > 0 && Number(token) <= 99 ? Number(token) : undefined);
}

const FALLBACK_LAYOUTS: LimeSceneBeat["sceneType"][] = ["HALO_SPEAKER", "FULL_GRAPHIC", "SPLIT_SPEAKER", "SPEAKER_STICKER"];
const FALLBACK_ILLUSTRATIONS: LimeSceneBeat["illustration"][] = ["phone", "carousel", "line_chart", "gear_diagram", "swatches", "calendar", "video_player", "editor_window", "primitive"];
const SPEAKER_MODE: Record<LimeSceneBeat["sceneType"], LimeSceneBeat["speakerMode"]> = {
  HALO_SPEAKER: "halo", FULL_GRAPHIC: "hidden", SPLIT_SPEAKER: "split",
  SPEAKER_STICKER: "full", NUMBERED_STEP: "hidden", CTA: "hidden",
};

function deterministicBeat(segment: LimeTranscriptSegment, index: number, previous?: LimeSceneBeat): LimeSceneBeat {
  const stepIndex = findStepIndex(segment.text);
  const sameRun = previous && previous.sceneType === FALLBACK_LAYOUTS[index % FALLBACK_LAYOUTS.length];
  const sceneType = stepIndex != null ? "NUMBERED_STEP"
    : (sameRun ? FALLBACK_LAYOUTS[(index + 1) % FALLBACK_LAYOUTS.length] : FALLBACK_LAYOUTS[index % FALLBACK_LAYOUTS.length]);
  let illustration = illustrationForWords(segment.text);
  if (illustration === previous?.illustration) {
    illustration = FALLBACK_ILLUSTRATIONS.find((candidate) => candidate !== previous.illustration && candidate !== illustration)
      || FALLBACK_ILLUSTRATIONS[(index + 1) % FALLBACK_ILLUSTRATIONS.length];
  }
  return limeBeatSchema.parse({
    startMs: segment.startMs,
    endMs: segment.endMs,
    sceneType,
    headline: localHeadline(segment, previous?.headline),
    badge: stepIndex == null ? undefined : `STEP ${stepIndex}`,
    illustration,
    illustrationProps: { concept: segment.text.slice(0, 120) },
    speakerMode: SPEAKER_MODE[sceneType],
    emphasisWords: [],
    assetIntent: segment.text.slice(0, 120),
    stepIndex,
  });
}

export function buildFallbackLimePlan(
  transcript: string,
  words: TranscriptionResult["words"],
  durationSec: number
): LimeDirectorPlan {
  const segments = segmentLimeTranscript(words, durationSec, transcript);
  const beats: LimeSceneBeat[] = [];
  for (const [index, segment] of segments.entries()) {
    beats.push(deterministicBeat(segment, index, beats[index - 1]));
  }
  return limeDirectorSchema.parse({ beats });
}

function beatSequenceFailures(beat: LimeSceneBeat, previous?: LimeSceneBeat, priorSameLayoutMs = 0) {
  const failures: string[] = [];
  if (!previous) return failures;
  if (beat.headline.toLowerCase() === previous.headline.toLowerCase()) failures.push("Adjacent beats must have different headlines.");
  if (beat.illustration === previous.illustration) failures.push("Adjacent beats must use different illustrations.");
  const sameLayoutDuration = beat.sceneType === previous.sceneType ? priorSameLayoutMs + beat.endMs - beat.startMs : 0;
  if (sameLayoutDuration > 1500) failures.push("Do not keep the same layout for more than 1.5 seconds; change this beat's sceneType.");
  return failures;
}

/** Snap timing to the segment's word edges without rewriting any planner-authored visual field. */
export function snapLimeBeatToSegment(beat: Record<string, unknown>, segment: LimeTranscriptSegment) {
  return { ...beat, startMs: segment.startMs, endMs: segment.endMs };
}

export async function validateAndSnapBeats(
  rawBeats: unknown[],
  segments: LimeTranscriptSegment[]
): Promise<LimeDirectorPlan> {
  if (!segments.length) throw new Error("Lime Slides cannot plan a beat because the transcript has no words.");
  const beats: LimeSceneBeat[] = [];
  let priorSameLayoutMs = 0;

  for (const [index, segment] of segments.entries()) {
    const previous = beats[index - 1];
    const seed = deterministicBeat(segment, index, previous);
    const raw = rawBeats[index] && typeof rawBeats[index] === "object" ? rawBeats[index] as Record<string, unknown> : null;
    let candidate: LimeSceneBeat = seed;
    let failures = raw ? [] : ["A beat is required for this transcript sentence segment."];
    if (raw) {
      const parsed = limeBeatSchema.safeParse(snapLimeBeatToSegment(raw, segment));
      if (parsed.success) {
        candidate = parsed.data;
        failures = beatSequenceFailures(candidate, previous, priorSameLayoutMs);
        const spokenStepIndex = findStepIndex(segment.text);
        if (candidate.stepIndex != null && candidate.stepIndex !== spokenStepIndex) {
          failures.push("stepIndex must match an explicitly enumerated step in this transcript segment.");
        }
        if (spokenStepIndex != null && candidate.stepIndex == null) {
          failures.push("Set stepIndex and use NUMBERED_STEP because this transcript segment explicitly enumerates a step.");
        }
      } else failures = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    }
    if (index === segments.length - 1 && rawBeats.length !== segments.length) failures.push(`Return exactly one beat for each of the ${segments.length} transcript segments.`);

    let accepted: LimeSceneBeat | null = failures.length ? null : candidate;
    for (let attempt = 0; !accepted && attempt < 2; attempt++) {
      try {
        const revised = await reviseLimeBeat(candidate, failures, segment.text);
        const parsed = limeBeatSchema.safeParse(snapLimeBeatToSegment(revised, segment));
        if (!parsed.success) failures = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
        else {
          candidate = parsed.data;
          failures = beatSequenceFailures(candidate, previous, priorSameLayoutMs);
          const spokenStepIndex = findStepIndex(segment.text);
          if (candidate.stepIndex != null && candidate.stepIndex !== spokenStepIndex) {
            failures.push("stepIndex must match an explicitly enumerated step in this transcript segment.");
          }
          if (spokenStepIndex != null && candidate.stepIndex == null) {
            failures.push("Set stepIndex and use NUMBERED_STEP because this transcript segment explicitly enumerates a step.");
          }
          if (!failures.length) accepted = candidate;
        }
      } catch (error: any) {
        failures = [...failures, error?.message || "Beat revision failed."];
      }
    }
    if (!accepted) accepted = deterministicBeat(segment, index, previous);
    beats.push(accepted);
    priorSameLayoutMs = accepted.sceneType === previous?.sceneType
      ? priorSameLayoutMs + accepted.endMs - accepted.startMs
      : accepted.endMs - accepted.startMs;
  }

  return limeDirectorSchema.parse({ beats });
}

export async function planLimeSlides(params: {
  transcript: string;
  transcriptionWords: TranscriptionResult["words"];
  durationSec: number;
  topic?: string;
}): Promise<LimeDirectorPlan> {
  const { transcript, transcriptionWords, durationSec } = params;
  const source = transcript || params.topic || "";
  const segments = segmentLimeTranscript(transcriptionWords, durationSec, source);
  if (!segments.length) throw new Error("Lime Slides needs a transcript or timed words before it can plan scenes.");
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.LIME_DIRECTOR_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) return validateAndSnapBeats([], segments);

  let previousError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are a short-form motion design director. Return JSON with exactly one beat for each supplied transcript segment, in the same order. Preserve each segment's startMs and endMs. Make original ALL-CAPS headlines of at most three words that summarize that segment. Do not repeat adjacent headlines or illustrations, and do not keep a layout for more than 1.5 seconds. Choose NUMBERED_STEP and set stepIndex only when the spoken segment explicitly enumerates a step (first/second/step one). Request a real asset only when it improves the scene: assetRequest is {type:'screenshot',url,highlightBox?}, {type:'photo',query}, {type:'logo',query}, or {type:'none'}. Only request screenshots of public https pages. Use an illustration enum from phone, carousel, line_chart, gear_diagram, swatches, calendar, video_player, editor_window, primitive. Never use generic placeholder labels." },
            { role: "user", content: JSON.stringify({ segments: segments.map(({ startMs, endMs, text }) => ({ startMs, endMs, text })), previousValidationError: previousError, requiredBeatShape: "{beats:[{startMs,endMs,sceneType,headline,badge?,illustration,illustrationProps,speakerMode,emphasisWords,assetIntent?,assetRequest:{type,url|query,highlightBox?},stepIndex?}]}" }) },
          ],
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok) throw new Error(`OpenAI scene authoring failed (${response.status}).`);
      const data = await response.json();
      const payload = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      if (!Array.isArray(payload.beats)) throw new Error("Director response did not include a beats array.");
      return validateAndSnapBeats(payload.beats, segments);
    } catch (error: any) {
      previousError = error?.message || "Invalid director output.";
      if (attempt === 0) continue;
    }
  }
  return validateAndSnapBeats([], segments);
}

export async function reviseLimeBeat(beat: LimeSceneBeat, failures: string[], segmentText = ""): Promise<LimeSceneBeat> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("LIME_DIRECTOR_MODEL revision is unavailable because OPENAI_API_KEY is not configured.");
  const model = process.env.LIME_DIRECTOR_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Revise one Lime Slides beat. Keep its startMs and endMs. Return a JSON object with a valid original ALL-CAPS headline of at most three words, meaningful illustration, valid sceneType and speakerMode. Set stepIndex and NUMBERED_STEP only for explicit spoken enumerations. Address every validation failure." },
        { role: "user", content: JSON.stringify({ segmentWords: segmentText, currentBeat: beat, failures, requiredFields: ["startMs", "endMs", "sceneType", "headline", "illustration", "illustrationProps", "speakerMode", "emphasisWords", "assetRequest"] }) },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`OpenAI scene revision failed (${response.status}).`);
  const data = await response.json();
  const revised = limeBeatSchema.parse(JSON.parse(data.choices?.[0]?.message?.content || "{}"));
  return { ...revised, startMs: beat.startMs, endMs: beat.endMs };
}
