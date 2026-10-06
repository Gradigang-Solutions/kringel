import { describe, expect, it } from "vitest";
import { call, formatNumber, method, quote } from "@/codegen/format";

describe("formatNumber", () => {
  it("arrondit à deux décimales sans zéros inutiles", () => {
    expect(formatNumber(0.8)).toBe("0.8");
    expect(formatNumber(1)).toBe("1");
    expect(formatNumber(0.55555)).toBe("0.56");
    expect(formatNumber(800)).toBe("800");
  });
});

describe("appels", () => {
  it("écrit les appels et les chaînes", () => {
    expect(call("s", quote("bd"))).toBe('s("bd")');
    expect(method("gain", "0.8")).toBe(".gain(0.8)");
  });
});
