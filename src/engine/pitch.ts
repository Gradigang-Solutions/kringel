import { valueToMidi } from "@strudel/core";

/** Hauteur MIDI d'une valeur d'événement Strudel (`note` ou `freq`), ou null pour un son sans hauteur. */
export function hapPitch(value: unknown): number | null {
  if (typeof value !== "object" || value === null) return null;
  try {
    return valueToMidi(value);
  } catch {
    // Un sample de batterie n'a pas de hauteur : ce n'est pas une erreur.
    return null;
  }
}
