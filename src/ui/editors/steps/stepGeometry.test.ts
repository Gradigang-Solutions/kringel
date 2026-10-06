import { describe, expect, it } from "vitest";
import {
  stepCellAt,
  stepGridHeight,
  stepGridLayout,
  velocityAtHeight,
} from "@/ui/editors/steps/stepGeometry";

describe("stepGridLayout", () => {
  const layout = stepGridLayout(400, 16, 2);

  it("place les lignes sous l'en-tête", () => {
    expect(layout.rows).toEqual([
      { start: 24, size: 46 },
      { start: 76, size: 46 },
    ]);
    expect(stepGridHeight(2)).toBe(122);
  });

  it("trouve la cellule sous le pointeur", () => {
    const fifthStep = layout.columns[4]!;
    expect(stepCellAt(layout, fifthStep.start + 1, 80)).toEqual({ row: 1, step: 4 });
  });

  it("ignore l'en-tête et les écarts", () => {
    expect(stepCellAt(layout, 5, 10)).toBeNull();
    expect(stepCellAt(layout, 5, 72)).toBeNull();
  });
});

describe("velocityAtHeight", () => {
  it("convertit une hauteur en vélocité", () => {
    expect(velocityAtHeight(0, 60)).toBe(1);
    expect(velocityAtHeight(45, 60)).toBe(0.25);
    expect(velocityAtHeight(80, 60)).toBe(0);
    expect(velocityAtHeight(10, 0)).toBe(0);
  });
});
