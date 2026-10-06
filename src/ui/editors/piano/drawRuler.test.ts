import { describe, expect, it } from "vitest";
import { hasBeatLabels, rulerLabel } from "@/ui/editors/piano/drawRuler";
import { KEYS_WIDTH } from "@/ui/editors/piano/pianoGeometry";

describe("rulerLabel", () => {
  it("numérote les cycles puis les temps", () => {
    expect(rulerLabel(0)).toBe("1");
    expect(rulerLabel(4)).toBe("1.2");
    expect(rulerLabel(12)).toBe("1.4");
    expect(rulerLabel(16)).toBe("2");
    expect(rulerLabel(20)).toBe("2.2");
  });
});

describe("hasBeatLabels", () => {
  it("numérote les temps quand la place le permet", () => {
    expect(hasBeatLabels({ width: KEYS_WIDTH + 640, stepCount: 64 })).toBe(true);
  });

  it("ne garde que les cycles quand les temps sont trop serrés", () => {
    expect(hasBeatLabels({ width: KEYS_WIDTH + 300, stepCount: 64 })).toBe(false);
  });
});
