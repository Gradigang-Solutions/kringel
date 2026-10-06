import { describe, expect, it } from "vitest";
import { rulerLabel } from "@/ui/editors/piano/drawRuler";

describe("rulerLabel", () => {
  it("numérote les cycles puis les temps", () => {
    expect(rulerLabel(0)).toBe("1");
    expect(rulerLabel(4)).toBe("1.2");
    expect(rulerLabel(12)).toBe("1.4");
    expect(rulerLabel(16)).toBe("2");
    expect(rulerLabel(20)).toBe("2.2");
  });
});
