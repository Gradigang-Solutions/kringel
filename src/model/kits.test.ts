import { describe, expect, it } from "vitest";
import { isSoundInKit, kitSounds, kitSource, usesKringelSamples } from "@/model/kits";
import { makeProject, makeStepsClip, withClip } from "@/test/builders";

describe("kits", () => {
  it("donne l'origine et les sons d'un kit", () => {
    expect(kitSource("RolandTR909")).toBe("strudel");
    expect(kitSource("Fischer808")).toBe("kringel");
    expect(kitSource("Inconnu")).toBeNull();
    expect(kitSounds("KringelPercussion")).toContain("ta");
  });

  it("signale un son absent du kit, sauf pour un kit inconnu", () => {
    expect(isSoundInKit("KringelPercussion", "bd")).toBe(false);
    expect(isSoundInKit("RolandTR909", "bd")).toBe(true);
    expect(isSoundInKit("Inconnu", "bd")).toBe(true);
  });
});

describe("usesKringelSamples", () => {
  it("repère un clip de pas qui joue un kit Kringel, même hors lecture", () => {
    expect(usesKringelSamples(withClip(makeProject(), 0, 0, makeStepsClip()))).toBe(false);
    const project = withClip(makeProject(), 0, 3, makeStepsClip({ kit: "Fischer808" }));
    expect(usesKringelSamples(project)).toBe(true);
  });
});
