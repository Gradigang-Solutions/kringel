import { describe, expect, it } from "vitest";
import {
  MIN_TOUCH_STEP_WIDTH,
  stepCellAt,
  stepGridHeight,
  stepGridLayout,
  stepGridMinWidth,
  levelAtHeight,
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

describe("levelAtHeight", () => {
  it("convertit une hauteur en vélocité", () => {
    expect(levelAtHeight(0, 60)).toBe(1);
    expect(levelAtHeight(45, 60)).toBe(0.25);
    expect(levelAtHeight(80, 60)).toBe(0);
    expect(levelAtHeight(10, 0)).toBe(0);
  });
});

describe("stepGridMinWidth", () => {
  it("donne à chaque pas au moins la largeur touchable une fois les écarts retirés", () => {
    const minWidth = stepGridMinWidth(16);
    const columns = stepGridLayout(minWidth, 16, 1).columns;
    expect(columns[0]!.size).toBeCloseTo(MIN_TOUCH_STEP_WIDTH);
    expect(columns[15]!.start + columns[15]!.size).toBeCloseTo(minWidth);
  });
});
