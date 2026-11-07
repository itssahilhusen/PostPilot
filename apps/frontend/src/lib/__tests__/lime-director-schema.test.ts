import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildFallbackLimePlan, limeDirectorSchema, segmentLimeTranscript, validateAndSnapBeats } from "../lime-director-schema";

const words = [
  { word: "I", start: 0, end: .18 }, { word: "build", start: .2, end: .48 },
  { word: "product", start: .52, end: .82 }, { word: "pages.", start: .86, end: 1.18 },
  { word: "People", start: 1.55, end: 1.82 }, { word: "trust", start: 1.85, end: 2.1 },
  { word: "clear", start: 2.14, end: 2.4 }, { word: "labels.", start: 2.44, end: 2.75 },
  { word: "Show", start: 3.1, end: 3.35 }, { word: "results", start: 3.38, end: 3.68 },
  { word: "with", start: 3.72, end: 3.88 }, { word: "evidence.", start: 3.92, end: 4.3 },
];

describe("Lime Slides Director schema", () => {
  it("rejects headlines over three words or not in uppercase", () => {
    const base = {
      startMs: 0,
      endMs: 1000,
      sceneType: "FULL_GRAPHIC",
      headline: "A concept that is too long",
      illustration: "phone",
      illustrationProps: {},
      speakerMode: "hidden",
      emphasisWords: [],
    };
    assert.equal(limeDirectorSchema.safeParse({ beats: [base] }).success, false);
    assert.equal(limeDirectorSchema.safeParse({ beats: [{ ...base, headline: "lowercase" }] }).success, false);
  });

  it("segments on sentence punctuation and long pauses, then keeps beat durations bounded", () => {
    const segmented = segmentLimeTranscript(words, 5);
    assert.equal(segmented.length, 3);
    assert.deepEqual(segmented.map((segment) => segment.text), [
      "I build product pages.", "People trust clear labels.", "Show results with evidence.",
    ]);
    assert.ok(segmented.every((segment) => segment.endMs > segment.startMs));

    const longWords = Array.from({ length: 12 }, (_, index) => ({ word: `word${index}`, start: index * .3, end: index * .3 + .2 }));
    const longSegments = segmentLimeTranscript(longWords, 4);
    assert.ok(longSegments.every((segment) => segment.endMs - segment.startMs <= 2500));
  });

  it("builds distinct fallback headlines from each sentence's own words", () => {
    const plan = buildFallbackLimePlan("unrelated transcript ignored", words, 5);
    assert.equal(plan.beats.length, 3);
    assert.deepEqual(plan.beats.map((beat) => beat.headline), ["BUILD PRODUCT PAGES", "PEOPLE TRUST CLEAR", "SHOW RESULTS EVIDENCE"]);
    assert.notEqual(plan.beats[0].headline, plan.beats[1].headline);
    assert.ok(plan.beats.every((beat, index) => index === 0 || beat.illustration !== plan.beats[index - 1].illustration));
    assert.ok(plan.beats.every((beat) => beat.stepIndex == null && beat.sceneType !== "NUMBERED_STEP"));
  });

  it("only accepts a numbered badge when its number is spoken in that segment", async () => {
    const stepWords = [
      { word: "Step", start: 0, end: .2 },
      { word: "two", start: .21, end: .4 },
      { word: "is", start: .41, end: .52 },
      { word: "research.", start: .53, end: .9 },
    ];
    const segment = segmentLimeTranscript(stepWords, 1)[0];
    const result = await validateAndSnapBeats([{
      startMs: segment.startMs,
      endMs: segment.endMs,
      sceneType: "NUMBERED_STEP",
      headline: "DO RESEARCH",
      illustration: "editor_window",
      illustrationProps: {},
      speakerMode: "hidden",
      emphasisWords: [],
      stepIndex: 1,
    }], [segment]);
    assert.equal(result.beats[0].stepIndex, 2);
    assert.equal(result.beats[0].sceneType, "NUMBERED_STEP");
  });

  it("snaps only beat timing and preserves the planner's visual fields", async () => {
    const segment = segmentLimeTranscript(words, 5)[0];
    const plannerBeat = {
      startMs: 12,
      endMs: 901,
      sceneType: "FULL_GRAPHIC",
      headline: "PRODUCT PAGES",
      badge: "CLEAR COPY",
      illustration: "phone",
      illustrationProps: { label: "Pages" },
      speakerMode: "split",
      emphasisWords: ["product"],
      assetIntent: "Show a product page",
    };
    const result = await validateAndSnapBeats([plannerBeat], [segment]);
    assert.deepEqual(result.beats[0], {
      ...plannerBeat,
      startMs: segment.startMs,
      endMs: segment.endMs,
    });
  });

  it("repairs repeated adjacent headlines with beat-local copy", async () => {
    const segments = segmentLimeTranscript(words, 5);
    const template = {
      sceneType: "FULL_GRAPHIC",
      headline: "SAME TITLE",
      illustration: "phone",
      illustrationProps: {},
      speakerMode: "hidden",
      emphasisWords: [],
    };
    const result = await validateAndSnapBeats(segments.map((segment) => ({ ...template, startMs: segment.startMs, endMs: segment.endMs })), segments);
    assert.notEqual(result.beats[0].headline, result.beats[1].headline);
    assert.notEqual(result.beats[0].illustration, result.beats[1].illustration);
  });

  it("allows numbered badges only for beats with an explicit step index", () => {
    const base = {
      startMs: 0,
      endMs: 1000,
      sceneType: "NUMBERED_STEP",
      headline: "TRACK RESULTS",
      illustration: "line_chart",
      illustrationProps: {},
      speakerMode: "hidden",
      emphasisWords: [],
    };
    assert.equal(limeDirectorSchema.safeParse({ beats: [base] }).success, false);
    assert.equal(limeDirectorSchema.safeParse({ beats: [{ ...base, stepIndex: 2, badge: "STEP 2" }] }).success, true);
  });
});
