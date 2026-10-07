import { describe, expect, it } from "vitest";
import { delayUntilExit } from "@/ui/splash/exitTiming";

const LOOP_MS = 2000;

describe("delayUntilExit", () => {
  it("attend la fin de la première mesure quand l'app est prête tout de suite", () => {
    expect(delayUntilExit(0, LOOP_MS)).toBeCloseTo(1820);
    expect(delayUntilExit(300, LOOP_MS)).toBeCloseTo(1520);
  });

  it("sort sans attendre quand le dernier quart de tour commence", () => {
    expect(delayUntilExit(1820, LOOP_MS)).toBeCloseTo(0);
  });

  it("attend la mesure suivante quand le dernier quart de tour est déjà entamé", () => {
    expect(delayUntilExit(1900, LOOP_MS)).toBeCloseTo(1920);
  });

  it("se cale sur la mesure en cours après plusieurs mesures", () => {
    expect(delayUntilExit(4500, LOOP_MS)).toBeCloseTo(1320);
  });
});
