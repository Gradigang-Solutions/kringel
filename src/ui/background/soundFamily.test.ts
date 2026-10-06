import { describe, expect, it } from "vitest";
import { makeSoundEvent } from "@/test/builders";
import { BASS_MAX_MIDI, soundFamily } from "@/ui/background/soundFamily";

describe("soundFamily", () => {
  it("classe les sons de batterie par registre", () => {
    expect(soundFamily(makeSoundEvent({ sound: "bd" }))).toBe("low");
    expect(soundFamily(makeSoundEvent({ sound: "sd" }))).toBe("mid");
    expect(soundFamily(makeSoundEvent({ sound: "hh" }))).toBe("high");
    expect(soundFamily(makeSoundEvent({ sound: "pad" }))).toBe("tonal");
  });

  it("lit le nom du son dans un sample préfixé par sa banque", () => {
    expect(soundFamily(makeSoundEvent({ sound: "RolandTR909_hh" }))).toBe("high");
  });

  it("range un son inconnu sans hauteur dans les médiums", () => {
    expect(soundFamily(makeSoundEvent({ sound: "mystery" }))).toBe("mid");
    expect(soundFamily(makeSoundEvent({ sound: "" }))).toBe("mid");
  });

  it("sépare les basses des notes plus aiguës", () => {
    const note = (midi: number) => makeSoundEvent({ sound: "sawtooth", midi });
    expect(soundFamily(note(BASS_MAX_MIDI - 1))).toBe("low");
    expect(soundFamily(note(BASS_MAX_MIDI))).toBe("tonal");
  });
});
