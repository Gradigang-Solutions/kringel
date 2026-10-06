import { describe, expect, it } from "vitest";
import { LOGO_TURNS_PER_CYCLE, logoRotation, restingRotation } from "@/ui/transport/logoRotation";

describe("logoRotation", () => {
  it("fait un tour complet en autant de cycles que prévu", () => {
    const cyclesPerTurn = 1 / LOGO_TURNS_PER_CYCLE;
    expect(logoRotation(0)).toBe(0);
    expect(logoRotation(cyclesPerTurn / 4)).toBe(90);
    expect(logoRotation(cyclesPerTurn)).toBe(0);
    expect(logoRotation(cyclesPerTurn * 2.5)).toBe(180);
  });
});

describe("restingRotation", () => {
  it("revient au tour le plus proche dans le sens de la rotation", () => {
    expect(restingRotation(90)).toBe(0);
    expect(restingRotation(270)).toBe(360);
  });
});
