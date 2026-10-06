import { describe, expect, it } from "vitest";
import { boundCutoff, filterLabel, filterToPosition, positionToFilter } from "@/model/filter";

describe("boundCutoff", () => {
  it("arrondit à deux chiffres significatifs dans la plage audible", () => {
    expect(boundCutoff(812.3)).toBe(810);
    expect(boundCutoff(5)).toBe(20);
    expect(boundCutoff(99999)).toBe(20000);
    expect(boundCutoff(null)).toBeNull();
  });
});

describe("curseur de filtre", () => {
  it("convertit dans les deux sens en échelle logarithmique", () => {
    expect(filterToPosition("lpf", null)).toBe(1);
    expect(filterToPosition("lpf", 20)).toBe(0);
    expect(positionToFilter("lpf", 1)).toBeNull();
    expect(positionToFilter("lpf", 0)).toBe(20);
    expect(positionToFilter("lpf", filterToPosition("lpf", 800))).toBeCloseTo(800);
  });

  it("ouvre le passe-haut en bas de sa course", () => {
    expect(filterToPosition("hpf", null)).toBe(0);
    expect(positionToFilter("hpf", 0)).toBeNull();
    expect(positionToFilter("hpf", 1)).toBe(20000);
  });

  it("quitte la butée dès le premier cran de curseur", () => {
    expect(positionToFilter("lpf", 0.99)).not.toBeNull();
    expect(positionToFilter("hpf", 0.01)).not.toBeNull();
  });
});

describe("filterLabel", () => {
  it("affiche la fréquence, ou Off quand le filtre est ouvert", () => {
    expect(filterLabel(null)).toBe("Off");
    expect(filterLabel(800)).toBe("800 Hz");
  });
});
