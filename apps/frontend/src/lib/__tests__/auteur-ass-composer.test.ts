import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hexToAssColor,
  formatAssTime,
  formatSmpteTimecode,
  getStyleVisualConfig,
  buildRathAssScript,
  buildAuteurAssScript,
} from "../auteur-ass-composer";
import { VIDEO_TEMPLATES } from "../../data/videoTemplates";

describe("auteur-ass-composer", () => {
  it("converts #RRGGBB hex into ASS &H00BBGGRR BGR order", () => {
    assert.equal(hexToAssColor("#F4F1EA"), "&H00EAF1F4");
    assert.equal(hexToAssColor("#FF3B4E"), "&H004E3BFF");
    assert.equal(hexToAssColor("#C6FF3D"), "&H003DFFC6");
  });

  it("formats seconds into ASS H:MM:SS.cc and SMPTE 00:MM:SS:FF", () => {
    assert.equal(formatAssTime(0), "0:00:00.00");
    assert.equal(formatAssTime(2.37), "0:00:02.37");
    assert.equal(formatAssTime(65.5), "0:01:05.50");
    assert.equal(formatSmpteTimecode(2.37, 30), "00:00:02:11");
  });

  it("returns distinct style visual themes for all 56 VIDEO_TEMPLATES including Dry Erase, Glitch, Lime Slides, and Paper Studio", () => {
    const paper = getStyleVisualConfig("cap-paper");
    assert.equal(paper.styleName, "Paper Studio");
    assert.equal(paper.canvasBgHex, "0xF4F1EA");
    assert.equal(paper.isDarkCanvas, false);

    const dryErase = getStyleVisualConfig("cap-marker");
    assert.equal(dryErase.styleName, "Dry Erase");
    assert.equal(dryErase.layoutFamily, "whiteboard_marker");
    assert.equal(dryErase.canvasBgHex, "0xF8FAFC");

    const lime = getStyleVisualConfig("limeslides");
    assert.equal(lime.styleName, "Lime Slides");
    assert.equal(lime.canvasBgHex, "0xC6FF3D");

    const glitch = getStyleVisualConfig("classified-yt");
    assert.equal(glitch.styleName, "Glitch");
    assert.equal(glitch.canvasBgHex, "0x0B0B0E");
    assert.equal(glitch.isDarkCanvas, true);

    // Every available style in VIDEO_TEMPLATES must resolve to its exact template name
    const availableStyles = VIDEO_TEMPLATES.filter((t) => t.available !== false);
    for (const tpl of availableStyles) {
      const cfg = getStyleVisualConfig(tpl.id);
      assert.equal(
        cfg.styleName,
        tpl.name,
        `Style ${tpl.id} expected name '${tpl.name}' but got '${cfg.styleName}'`
      );
    }
  });

  it("builds a complete ASS script with crosshairs, EDITED BY REERTS RATH, stacked headlines, and karaoke captions", () => {
    const ass = buildRathAssScript({
      styleId: "cap-paper",
      durationSec: 12,
      transcriptWords: [
        { word: "so", start: 0.1, end: 0.4 },
        { word: "bhai", start: 0.4, end: 0.8 },
        { word: "saap", start: 0.8, end: 1.2 },
        { word: "news", start: 1.2, end: 1.6 },
        { word: "top", start: 1.6, end: 2.0 },
        { word: "ne", start: 2.0, end: 2.4 },
        { word: "dehili", start: 2.4, end: 2.9 },
        { word: "ho", start: 2.9, end: 3.3 },
        { word: "gaya", start: 3.3, end: 3.8 },
      ],
    });

    assert.ok(ass.includes("PlayResX: 1080"));
    assert.ok(ass.includes("PlayResY: 1920"));
    assert.ok(ass.includes("EDITED BY REERTS RATH"));
    assert.ok(ass.includes("1080 × 1920 · 30 FPS"));
    assert.ok(ass.includes("SO BHAI SAAP"));
    assert.ok(ass.includes("NEWS TOP NE"));
    assert.ok(ass.includes("dehili"));
  });
});
