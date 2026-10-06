import { describe, expect, it } from "vitest";
import { segmentTone } from "@/ui/shared/meterSegments";

describe("segmentTone", () => {
  it("éteint les segments au-dessus du niveau", () => {
    expect(segmentTone(10, 0.4)).toBe("off");
    expect(segmentTone(5, 0.4)).toBe("normal");
  });

  it("passe au jaune puis au rouge en haut de l'échelle", () => {
    expect(segmentTone(16, 1)).toBe("warn");
    expect(segmentTone(20, 1)).toBe("clip");
  });
});
