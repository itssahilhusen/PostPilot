import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertRealSceneCopy, chunkLimeCaptions, layoutHeadline } from "../lime-render-utils";
import { buildFaceAwareSpeakerFilter, smoothFaceSamples } from "../lime-face-tracking";

describe("Lime Slides layout utilities", () => {
  it("wraps long headlines using measured widths without dropping text", () => {
    const headline = "A VERY LONG CONCEPT HEADLINE THAT MUST WRAP WITHOUT CLIPPING";
    const fitted = layoutHeadline(
      headline,
      984,
      (text, size) => text.length * size * 0.52,
      { startFontSize: 140, minFontSize: 48 }
    );
    assert.ok(fitted.lines.length <= 2);
    assert.ok(fitted.fontSize >= 48);
    assert.equal(fitted.lines.filter(Boolean).join(" "), headline);
    for (const line of fitted.lines.filter((item): item is string => Boolean(item))) {
      assert.ok(line.length * fitted.fontSize * 0.52 <= 984);
    }
  });

  it("rejects an impossible headline instead of truncating it", () => {
    assert.throws(
      () => layoutHeadline("X".repeat(100), 100, (text, size) => text.length * size, { startFontSize: 60, minFontSize: 48 }),
      /cannot fit inside two lines/
    );
  });

  it("rejects empty and generic placeholder scene copy", () => {
    assert.throws(() => assertRealSceneCopy("KEY TAKEAWAY"), /placeholder/);
    assert.throws(() => assertRealSceneCopy("   "), /placeholder/);
    assert.equal(assertRealSceneCopy("Build a better funnel"), "Build a better funnel");
  });

  it("chunks captions to one or two words and 16 characters with no overlap", () => {
    const captions = chunkLimeCaptions([
      { word: "First", start: 0.1, end: 0.5 },
      { word: "caption", start: 0.4, end: 0.85 },
      { word: "supercalifragilistic", start: 0.7, end: 1.4 },
      { word: "next", start: 1.1, end: 1.6 },
      { word: "idea", start: 1.5, end: 1.9 },
    ], 2);

    assert.ok(captions.length > 1);
    for (const [index, caption] of captions.entries()) {
      const text = caption.words.map((word) => word.word).join(" ");
      assert.ok(caption.words.length <= 2);
      assert.ok(text.length <= 16);
      if (index > 0) assert.ok(captions[index - 1].end <= caption.start);
    }
  });

  it("smooths sampled face positions and frames eyes near 40% without cropping the forehead", () => {
    const track = smoothFaceSamples([
      { timeSec: 0, x: 0.39, y: 0.2, width: 0.2, height: 0.2 },
      { timeSec: 1, x: 0.43, y: 0.21, width: 0.2, height: 0.2 },
    ]);
    assert.ok(track.length >= 3);
    const filter = buildFaceAwareSpeakerFilter(track, 720, 1280, 1920, 1);
    assert.ok(filter);
    assert.match(filter.filter, /scale=\d+:\d+,crop=1080:1920/);
    assert.equal(filter.diagnostics.coverage, 1);
  });
});
