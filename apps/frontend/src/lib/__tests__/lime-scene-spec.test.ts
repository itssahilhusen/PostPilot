import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateLimeSceneSpecForBeat } from "../lime-scene-spec";

describe("Lime declarative scene specs", () => {
  it("accepts a typed component kit spec and escaped text props", () => {
    const spec = validateLimeSceneSpecForBeat({
      layout: "stack",
      components: [{
        id: "proof-card",
        type: "Card",
        startFrame: 0,
        endFrame: 30,
        props: { title: "Proof", body: "<script>alert(1)</script>" },
      }],
    }, 30);
    assert.equal(spec.components[0].type, "Card");
  });

  it("rejects arbitrary component kinds, extra executable fields, duplicate ids and out-of-range frames", () => {
    assert.throws(() => validateLimeSceneSpecForBeat({ layout: "stack", components: [{ id: "x", type: "RawHtml", startFrame: 0, endFrame: 10, props: {} }] }, 10));
    assert.throws(() => validateLimeSceneSpecForBeat({ layout: "stack", code: "alert(1)", components: [{ id: "x", type: "Counter", startFrame: 0, endFrame: 10, props: { value: 3, label: "Wins" } }] }, 10));
    assert.throws(() => validateLimeSceneSpecForBeat({ layout: "stack", components: [{ id: "x", type: "Card", startFrame: 0, endFrame: 10, props: { title: "No code", code: "alert(1)" } }] }, 10));
    assert.throws(() => validateLimeSceneSpecForBeat({ layout: "stack", components: [
      { id: "same", type: "Counter", startFrame: 0, endFrame: 10, props: { value: 3, label: "Wins" } },
      { id: "same", type: "Ticker", startFrame: 10, endFrame: 20, props: { text: "Wins" } },
    ] }, 20));
    assert.throws(() => validateLimeSceneSpecForBeat({ layout: "stack", components: [{ id: "x", type: "Card", startFrame: 0, endFrame: 11, props: { title: "Too long" } }] }, 10));
  });
});
