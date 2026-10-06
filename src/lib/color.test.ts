import { describe, expect, it } from "vitest";
import { withAlpha } from "@/lib/color";

describe("withAlpha", () => {
  it("ajoute une transparence à une couleur oklch", () => {
    expect(withAlpha("oklch(0.78 0.14 65)", 0.2)).toBe("oklch(0.78 0.14 65 / 0.2)");
  });

  it("remplace une transparence existante", () => {
    expect(withAlpha("oklch(0.78 0.14 65 / 0.5)", 1)).toBe("oklch(0.78 0.14 65 / 1)");
  });

  it("refuse une couleur qui n'est pas en oklch", () => {
    expect(() => withAlpha("#ff0000", 0.5)).toThrow();
  });
});
