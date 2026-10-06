import type { PreviewNote } from "@/engine";
import { SEMITONES_PER_OCTAVE } from "@/model/constants";

/** Tessiture minimale de l'aperçu : une octave, pour ne pas étirer un motif d'une seule note. */
const MIN_PITCH_SPAN = SEMITONES_PER_OCTAVE;

export interface PitchWindow {
  readonly highest: number;
  readonly lowest: number;
}

/** Hauteurs affichées : de la plus grave à la plus aiguë des notes, élargies à une octave au moins. */
export function pitchWindow(notes: readonly PreviewNote[]): PitchWindow | null {
  if (notes.length === 0) return null;
  const pitches = notes.map((note) => Math.round(note.pitch));
  const lowest = Math.min(...pitches);
  const highest = Math.max(...pitches);
  const missing = Math.max(0, MIN_PITCH_SPAN - (highest - lowest));
  const below = Math.floor(missing / 2);
  return { lowest: lowest - below, highest: highest + (missing - below) };
}
