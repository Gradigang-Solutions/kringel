import { describe, expect, it } from "vitest";
import { playheadStep } from "@/ui/shared/canvas/drawPlayhead";

describe("playheadStep", () => {
  it("donne le pas en cours dans la boucle du clip", () => {
    expect(playheadStep(0, 1, 16)).toBe(0);
    expect(playheadStep(3.5, 1, 16)).toBe(8);
    expect(playheadStep(3.5, 2, 16)).toBe(24);
  });
});
