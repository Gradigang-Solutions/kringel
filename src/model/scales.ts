import {
  DEFAULT_ANCHOR_OCTAVE,
  PITCH_CLASS_NAMES,
  SCALE_MODES,
  SEMITONES_PER_OCTAVE,
} from "@/model/constants";
import { modulo } from "@/lib/math";
import type { PitchClass, ScaleModeId } from "@/model/types";

/** En MIDI, l'octave -1 commence à 0 : do4 = 60. */
const MIDI_OCTAVE_OFFSET = 1;

export function pitchClassOf(pitch: number): PitchClass {
  return modulo(pitch, SEMITONES_PER_OCTAVE);
}

export function octaveOf(pitch: number): number {
  return Math.floor(pitch / SEMITONES_PER_OCTAVE) - MIDI_OCTAVE_OFFSET;
}

export function pitchClassName(pitchClass: PitchClass): string {
  return PITCH_CLASS_NAMES[modulo(pitchClass, SEMITONES_PER_OCTAVE)] ?? "C";
}

/** Nom affiché dans l'interface : « Eb4 ». */
export function noteName(pitch: number): string {
  return `${pitchClassName(pitchClassOf(pitch))}${octaveOf(pitch)}`;
}

/** Nom écrit dans le code Strudel : « eb4 ». */
export function strudelNoteName(pitch: number): string {
  return noteName(pitch).toLowerCase();
}

export function isBlackKey(pitch: number): boolean {
  return pitchClassName(pitchClassOf(pitch)).length > 1;
}

export function scaleIntervals(scale: ScaleModeId): readonly number[] {
  return SCALE_MODES.find((mode) => mode.id === scale)?.intervals ?? [];
}

export function scaleLabel(scale: ScaleModeId): string {
  return SCALE_MODES.find((mode) => mode.id === scale)?.label ?? scale;
}

export function isInScale(pitch: number, root: PitchClass, scale: ScaleModeId): boolean {
  return scaleIntervals(scale).includes(modulo(pitch - root, SEMITONES_PER_OCTAVE));
}

export function anchorPitch(root: PitchClass, octave: number): number {
  return (octave + MIDI_OCTAVE_OFFSET) * SEMITONES_PER_OCTAVE + root;
}

/** Octave de la tonique choisie pour que la note la plus grave soit au degré 0 ou au-dessus. */
export function anchorOctaveFor(pitches: readonly number[], root: PitchClass): number {
  if (pitches.length === 0) return DEFAULT_ANCHOR_OCTAVE;
  const lowest = Math.min(...pitches);
  return Math.floor((lowest - root) / SEMITONES_PER_OCTAVE) - MIDI_OCTAVE_OFFSET;
}

/** Degré de gamme d'une hauteur par rapport à la tonique ancrée, ou null si la note est hors gamme. */
export function scaleDegree(
  pitch: number,
  root: PitchClass,
  scale: ScaleModeId,
  anchorOctave: number,
): number | null {
  const intervals = scaleIntervals(scale);
  const distance = pitch - anchorPitch(root, anchorOctave);
  const octaves = Math.floor(distance / SEMITONES_PER_OCTAVE);
  const index = intervals.indexOf(modulo(distance, SEMITONES_PER_OCTAVE));
  if (index === -1) return null;
  return octaves * intervals.length + index;
}

/** Nom de gamme au format de Strudel : « C4:minor ». */
export function strudelScaleName(root: PitchClass, scale: ScaleModeId, octave: number): string {
  return `${pitchClassName(root)}${octave}:${scale}`;
}
