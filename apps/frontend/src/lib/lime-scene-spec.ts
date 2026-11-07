import { z } from "zod";
import type { LimeSceneBeat } from "./lime-director-schema";

const frameRange = {
  id: z.string().trim().min(1).max(32).regex(/^[a-zA-Z0-9_-]+$/),
  startFrame: z.number().int().nonnegative(),
  endFrame: z.number().int().positive(),
};
const shortText = (maximum = 80) => z.string().trim().min(1).max(maximum);
const textList = (maximum = 5, textLength = 40) => z.array(shortText(textLength)).min(1).max(maximum);
const strictObject = <Shape extends z.ZodRawShape>(shape: Shape) => z.object(shape).strict();

export const limeSceneComponentSchema = z.discriminatedUnion("type", [
  strictObject({ ...frameRange, type: z.literal("Card"), props: strictObject({ title: shortText(48), body: shortText(120).optional(), accent: shortText(24).optional() }) }),
  strictObject({ ...frameRange, type: z.literal("Phone"), props: strictObject({ title: shortText(40).optional(), messages: textList(4, 64) }) }),
  strictObject({ ...frameRange, type: z.literal("Chart"), props: strictObject({ label: shortText(48), values: z.array(z.number().finite().min(-1_000_000).max(1_000_000)).min(2).max(8), suffix: z.string().max(10).optional() }) }),
  strictObject({ ...frameRange, type: z.literal("Counter"), props: strictObject({ value: z.number().finite().min(-1_000_000).max(1_000_000), label: shortText(40), prefix: z.string().max(8).optional(), suffix: z.string().max(12).optional() }) }),
  strictObject({ ...frameRange, type: z.literal("Terminal"), props: strictObject({ command: shortText(60), output: shortText(100).optional() }) }),
  strictObject({ ...frameRange, type: z.literal("BrowserCard"), props: strictObject({ urlLabel: shortText(64), summary: shortText(100).optional(), useRequestedAsset: z.boolean().default(false) }) }),
  strictObject({ ...frameRange, type: z.literal("LogoGrid"), props: strictObject({ labels: textList(6, 28) }) }),
  strictObject({ ...frameRange, type: z.literal("Checklist"), props: strictObject({ items: textList(5, 56) }) }),
  strictObject({ ...frameRange, type: z.literal("Photo"), props: strictObject({ caption: shortText(60).optional(), useRequestedAsset: z.boolean().default(true) }) }),
  strictObject({ ...frameRange, type: z.literal("StatBadge"), props: strictObject({ value: shortText(24), label: shortText(44) }) }),
  strictObject({ ...frameRange, type: z.literal("Ticker"), props: strictObject({ text: shortText(48), repeat: z.number().int().min(2).max(6).default(4) }) }),
]);

export const limeSceneSpecSchema = z.object({
  layout: z.enum(["full", "stack", "split", "editorial"]),
  components: z.array(limeSceneComponentSchema).min(1).max(6),
}).strict().superRefine((spec, context) => {
  const ids = new Set<string>();
  for (const [index, component] of spec.components.entries()) {
    if (component.endFrame <= component.startFrame) context.addIssue({ code: z.ZodIssueCode.custom, path: ["components", index, "endFrame"], message: "Component endFrame must be after startFrame." });
    if (ids.has(component.id)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["components", index, "id"], message: "Component ids must be unique." });
    ids.add(component.id);
  }
});

export type LimeSceneComponentSpec = z.infer<typeof limeSceneComponentSchema>;
export type LimeSceneSpec = z.infer<typeof limeSceneSpecSchema>;

export function validateLimeSceneSpecForBeat(value: unknown, durationInFrames: number): LimeSceneSpec {
  const parsed = limeSceneSpecSchema.parse(value);
  for (const [index, component] of parsed.components.entries()) {
    if (component.endFrame > durationInFrames) {
      throw new Error(`components.${index}.endFrame must fit inside this ${durationInFrames}-frame beat.`);
    }
  }
  return parsed;
}

async function authorOneScene(beat: LimeSceneBeat, assetDescription: string, index: number): Promise<LimeSceneSpec | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.LIME_SCENE_MODEL || process.env.LIME_DIRECTOR_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const durationInFrames = Math.max(1, Math.round((beat.endMs - beat.startMs) * 30 / 1000));
  let previousError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.25,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are the scene agent for a short-form motion-graphics editor. Return one JSON object with layout and 1-4 components. Only use these types: Card(title,body?,accent?), Phone(title?,messages), Chart(label,values,suffix?), Counter(value,label,prefix?,suffix?), Terminal(command,output?), BrowserCard(urlLabel,summary?,useRequestedAsset), LogoGrid(labels), Checklist(items), Photo(caption?,useRequestedAsset), StatBadge(value,label), Ticker(text,repeat). Every component needs a unique id, startFrame, endFrame within the supplied beat duration, and the matching props object. Use only these declared fields. Never return HTML, CSS, SVG, JavaScript, URLs, file paths or executable code. Use a requested real asset only through useRequestedAsset:true. Keep text short and based only on the supplied beat." },
            { role: "user", content: JSON.stringify({ beat, durationInFrames, assetDescription, illustrationProps: beat.illustrationProps, emphasisWords: beat.emphasisWords, previousValidationError: previousError, requiredShape: "{layout:'full|stack|split|editorial',components:[{id,type,startFrame,endFrame,props}]}" }) },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      });
      if (!response.ok) throw new Error(`Lime scene agent ${index + 1} failed (${response.status}).`);
      const data = await response.json();
      const content = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      return validateLimeSceneSpecForBeat(content, durationInFrames);
    } catch (error: any) {
      previousError = error?.message || "Scene spec failed validation.";
      if (attempt === 1) console.warn(`[Lime scene agent] Beat ${index + 1} failed twice; using LimeScene fallback:`, previousError);
    }
  }
  return null;
}

export async function authorLimeSceneSpecs(
  beats: LimeSceneBeat[],
  assetDescriptions: Array<string | undefined> = []
): Promise<Array<LimeSceneSpec | null>> {
  if (!process.env.OPENAI_API_KEY) {
    console.info("[Lime scene agent] OPENAI_API_KEY is not configured; using the proven LimeScene layout for every beat.");
    return beats.map(() => null);
  }
  const results: Array<LimeSceneSpec | null> = new Array(beats.length).fill(null);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(4, beats.length) }, async () => {
    while (cursor < beats.length) {
      const index = cursor++;
      results[index] = await authorOneScene(beats[index], assetDescriptions[index] || "No real asset resolved.", index);
    }
  });
  await Promise.all(workers);
  return results;
}
