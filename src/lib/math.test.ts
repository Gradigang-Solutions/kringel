import { describe, expect, it } from "vitest";
import { clamp, gcd, range, roundTo, roundToSignificant } from "@/lib/math";

describe("clamp", () => {
  it("borne la valeur entre min et max", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});

describe("roundTo", () => {
  it("arrondit au nombre de décimales demandé", () => {
    expect(roundTo(0.123456, 2)).toBe(0.12);
    expect(roundTo(1.005, 0)).toBe(1);
  });
});

describe("roundToSignificant", () => {
  it("garde le nombre de chiffres significatifs demandé", () => {
    expect(roundToSignificant(812.3, 2)).toBe(810);
    expect(roundToSignificant(12345, 2)).toBe(12000);
    expect(roundToSignificant(0, 2)).toBe(0);
  });
});

describe("gcd", () => {
  it("calcule le plus grand diviseur commun", () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(0, 16)).toBe(16);
    expect(gcd(7, 0)).toBe(7);
  });
});

describe("range", () => {
  it("produit les entiers de 0 à n-1", () => {
    expect(range(3)).toEqual([0, 1, 2]);
    expect(range(0)).toEqual([]);
  });
});
