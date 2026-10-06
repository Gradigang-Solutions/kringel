import { describe, expect, it } from "vitest";
import { MIXER_DEFAULTS } from "@/model/constants";
import { activeFxCount } from "@/ui/mixer/fxParams";

describe("activeFxCount", () => {
  it("compte les effets réglés, sans les réglages de la tranche", () => {
    expect(activeFxCount(MIXER_DEFAULTS)).toBe(0);
    expect(activeFxCount({ ...MIXER_DEFAULTS, room: 0.5, lpf: 800 })).toBe(0);
    expect(activeFxCount({ ...MIXER_DEFAULTS, hpf: 300, delay: 0.4 })).toBe(2);
  });
});
