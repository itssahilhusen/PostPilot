import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { getLimeWipeState } from "../lime-remotion/LimeScene";
import { renderLimeSceneClips } from "../lime-remotion/render-scenes";
import { getFfmpegPath } from "../media-tool-paths";
import type { LimeSceneSpec } from "../lime-scene-spec";

const execFileAsync = promisify(execFile);

describe("Lime Slides wipe", () => {
  it("fully clears both wipe bars after frame 8", () => {
    for (let frame = 8; frame < 45; frame++) {
      const state = getLimeWipeState(frame);
      assert.equal(state.opacity, 0, `wipe bars must be invisible at frame ${frame}`);
      assert.ok(state.x > 1080 + 2160 * Math.tan(18 * Math.PI / 180));
    }
  });

  it("keeps the slash moving during the first eight frames", () => {
    const positions = Array.from({ length: 8 }, (_, frame) => getLimeWipeState(frame).x);
    assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]));
    assert.ok(positions[7] > 1080);
  });

  it("renders every frame from 8 onward without black or white wipe pixels in the right edge strip", async () => {
    const result = await renderLimeSceneClips([{
      sceneType: "HALO_SPEAKER",
      speakerMode: "halo",
      headline: "FRAME EDGE",
      illustration: "phone",
      illustrationProps: {},
      emphasisWords: [],
      start: 0,
      end: 0.4,
      durationInFrames: 12,
    }], "wipe-pixel-test");
    try {
      const { stdout } = await execFileAsync(getFfmpegPath(), [
        "-v", "error", "-i", result.clips[0].path,
        "-vf", "select=gte(n\\,8),crop=20:1920:1060:0",
        "-vsync", "0", "-f", "rawvideo", "-pix_fmt", "rgba", "-",
      ], { encoding: "buffer", maxBuffer: 1024 * 1024, timeout: 30_000 } as any);
      const pixels = stdout as unknown as Buffer;
      assert.equal(pixels.length, 4 * 20 * 1920 * 4, "frames 8 through 11 should all be checked");
      let offendingPixels = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (pixels[offset + 3] === 0) continue;
        const isBlack = pixels[offset] < 24 && pixels[offset + 1] < 24 && pixels[offset + 2] < 24;
        const isWhite = pixels[offset] > 245 && pixels[offset + 1] > 245 && pixels[offset + 2] > 245;
        if (isBlack || isWhite) offendingPixels++;
      }
      assert.equal(offendingPixels, 0, "frames 8 onward must not retain the black or white wipe bars at x > 1060");
    } finally {
      fs.rmSync(result.directory, { recursive: true, force: true });
    }
  });

  it("renders the validated declarative component kit", async () => {
    const sceneSpec: LimeSceneSpec = {
      layout: "stack",
      components: [{ id: "test-counter", type: "Counter", startFrame: 0, endFrame: 12, props: { value: 84, label: "New users", suffix: "+" } }],
    };
    const result = await renderLimeSceneClips([{
      sceneType: "FULL_GRAPHIC",
      speakerMode: "hidden",
      headline: "REAL PROOF",
      illustration: "line_chart",
      illustrationProps: { label: "Acquisition" },
      emphasisWords: ["proof"],
      sceneSpec,
      start: 0,
      end: 0.4,
      durationInFrames: 12,
    }], "scene-kit-test");
    try {
      assert.equal(fs.existsSync(result.clips[0].path), true);
    } finally {
      fs.rmSync(result.directory, { recursive: true, force: true });
    }
  });
});
