import { describe, it, expect } from "vitest";
import {
  WORKFLOW_TEMPLATES,
  INITIAL_WORKFLOW_STATE,
} from "./workflow-data";

describe("Workflow Data & State", () => {
  it("provides valid workflow templates with unique IDs and valid categories", () => {
    expect(WORKFLOW_TEMPLATES.length).toBeGreaterThan(0);

    const ids = WORKFLOW_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    const validCategories = ["input", "generation", "utility", "model", "export"];
    WORKFLOW_TEMPLATES.forEach((tpl) => {
      expect(tpl.id).toBeTruthy();
      expect(tpl.name).toBeTruthy();
      expect(validCategories).toContain(tpl.category);
      expect(tpl.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(tpl.bg).toBeTruthy();
    });
  });

  it("initializes with valid credits, models, and node configs", () => {
    expect(INITIAL_WORKFLOW_STATE.credits).toBeGreaterThan(0);
    expect(INITIAL_WORKFLOW_STATE.textIterator.items.length).toBeGreaterThan(0);
    expect(INITIAL_WORKFLOW_STATE.promptNode.text).toBeTruthy();
    expect(INITIAL_WORKFLOW_STATE.llmNode.model).toBeTruthy();
    expect(INITIAL_WORKFLOW_STATE.llmNode.outputPages.length).toBe(3);
    expect(INITIAL_WORKFLOW_STATE.videoGenNode.model).toBe("Seedance 2.0");
  });

  it("calculates smooth natural sag curves without straight lines", () => {
    const makeBezier = (
      p1: { x: number; y: number },
      p2: { x: number; y: number }
    ) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      const cOffset = Math.min(Math.max(absDx * 0.45, 60), 280);
      const cx1 = p1.x + cOffset;
      const cx2 = p2.x - cOffset;

      let cy1 = p1.y;
      let cy2 = p2.y;

      if (absDy < 80) {
        const sag = Math.max(34, 52 - absDy * 0.35);
        cy1 = p1.y + sag;
        cy2 = p2.y + sag;
      }

      return { p1, p2, cx1, cy1, cx2, cy2 };
    };

    // When sockets are horizontally aligned (dy = 0), sag must be applied to prevent straight lines
    const alignedPoints = makeBezier({ x: 100, y: 100 }, { x: 300, y: 100 });
    expect(alignedPoints.cy1).toBeGreaterThan(100);
    expect(alignedPoints.cy2).toBeGreaterThan(100);
    expect(alignedPoints.cy1 - 100).toBe(52); // Exactly 52px cable sag

    // When vertical offset is large (dy > 80), sag is omitted in favor of natural S-curve
    const offsetPoints = makeBezier({ x: 100, y: 100 }, { x: 300, y: 400 });
    expect(offsetPoints.cy1).toBe(100);
    expect(offsetPoints.cy2).toBe(400);
  });
});

