import { describe, expect, it } from "vitest";
import { currentBeat, formatCyclePosition } from "@/ui/transport/cyclePosition";

describe("formatCyclePosition", () => {
  it("affiche le cycle et le temps à partir de 1", () => {
    expect(formatCyclePosition(0)).toBe("1.1");
    expect(formatCyclePosition(16.6)).toBe("17.3");
  });
});

describe("currentBeat", () => {
  it("donne le temps en cours dans le cycle", () => {
    expect(currentBeat(2.99)).toBe(3);
    expect(currentBeat(3.25)).toBe(1);
  });
});
