import { describe, expect, it } from "vitest";
import { formatMixerCall, mixerCalls } from "@/codegen/mixer";
import { MIXER_DEFAULTS } from "@/model/constants";

describe("formatMixerCall", () => {
  it("écrit l'appel d'un réglage modifié", () => {
    expect(formatMixerCall("lpf", { ...MIXER_DEFAULTS, lpf: 800 })).toBe(".lpf(800)");
    expect(formatMixerCall("gain", { ...MIXER_DEFAULTS, gain: 0.8 })).toBe(".gain(0.8)");
  });

  it("n'écrit rien pour une valeur par défaut", () => {
    expect(formatMixerCall("lpf", MIXER_DEFAULTS)).toBeNull();
    expect(formatMixerCall("pan", MIXER_DEFAULTS)).toBeNull();
  });
});

describe("mixerCalls", () => {
  it("ordonne les appels : filtre, reverb, panoramique, niveau", () => {
    expect(mixerCalls({ ...MIXER_DEFAULTS, gain: 0.6, pan: 0.6, lpf: 800, room: 0.3 })).toEqual([
      ".lpf(800)",
      ".room(0.3)",
      ".pan(0.6)",
      ".gain(0.6)",
    ]);
  });
});
