import type { SoundEvent } from "@/engine";

export const SOUND_FAMILIES = ["low", "mid", "high", "tonal"] as const;
export type SoundFamily = (typeof SOUND_FAMILIES)[number];

/** Sous ce do (C3), une note sonne comme une basse. */
export const BASS_MAX_MIDI = 48;

/** Sons de batterie (noms de `DRUM_SOUND_NAMES`) classés par registre ; les autres sont des médiums. */
const DRUM_FAMILIES: Readonly<Record<string, SoundFamily>> = {
  bd: "low",
  stomp: "low",
  chest: "low",
  belly: "low",
  ghe: "low",
  tun: "low",
  hh: "high",
  oh: "high",
  cr: "high",
  rd: "high",
  sh: "high",
  tb: "high",
  snap: "high",
  hiss: "high",
  te: "high",
  drone: "tonal",
  choir: "tonal",
  glass: "tonal",
  pad: "tonal",
};

/** Un clip de code peut écrire `RolandTR909_bd` au lieu de `s("bd").bank(…)`. */
function drumName(sound: string): string {
  const separator = sound.lastIndexOf("_");
  return separator === -1 ? sound : sound.slice(separator + 1);
}

/** Famille d'un son pour les visuels : registre de la batterie, ou hauteur de la note. */
export function soundFamily(event: Pick<SoundEvent, "sound" | "midi">): SoundFamily {
  if (event.midi !== null) return event.midi < BASS_MAX_MIDI ? "low" : "tonal";
  return DRUM_FAMILIES[drumName(event.sound)] ?? "mid";
}
