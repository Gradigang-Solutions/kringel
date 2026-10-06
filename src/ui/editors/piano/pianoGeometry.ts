import { clamp } from "@/lib/math";
import { NOTE_RANGE } from "@/model/constants";
import type { Note } from "@/model/types";

/** Dimensions partagées par le clavier, la grille et la règle. */
export const KEYS_WIDTH = 56;
export const PIANO_ROW_HEIGHT = 17;
export const RULER_HEIGHT = 22;
export const NOTE_INSET = 1.5;
/** Largeur de la poignée de redimensionnement, à droite d'une note. */
export const RESIZE_HANDLE_WIDTH = 6;

export const PIANO_ROW_COUNT = NOTE_RANGE.max - NOTE_RANGE.min + 1;
export const PIANO_GRID_HEIGHT = PIANO_ROW_COUNT * PIANO_ROW_HEIGHT;

export interface PianoLayout {
  readonly width: number;
  readonly stepCount: number;
}

export function stepWidth(layout: PianoLayout): number {
  return Math.max(0, layout.width - KEYS_WIDTH) / layout.stepCount;
}

export function stepX(layout: PianoLayout, step: number): number {
  return KEYS_WIDTH + step * stepWidth(layout);
}

export function pitchY(pitch: number): number {
  return (NOTE_RANGE.max - pitch) * PIANO_ROW_HEIGHT;
}

export function pitchAt(y: number): number {
  return clamp(NOTE_RANGE.max - Math.floor(y / PIANO_ROW_HEIGHT), NOTE_RANGE.min, NOTE_RANGE.max);
}

/** Pas sous le pointeur (arrondi vers le bas), ou null sur le clavier. */
export function stepAt(layout: PianoLayout, x: number): number | null {
  if (x < KEYS_WIDTH) return null;
  return clamp(Math.floor((x - KEYS_WIDTH) / stepWidth(layout)), 0, layout.stepCount - 1);
}

export interface NoteRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function noteRect(
  layout: PianoLayout,
  note: Pick<Note, "pitch" | "start" | "duration">,
): NoteRect {
  return {
    x: stepX(layout, note.start) + 1,
    y: pitchY(note.pitch) + NOTE_INSET,
    width: note.duration * stepWidth(layout) - 2,
    height: PIANO_ROW_HEIGHT - 2 * NOTE_INSET,
  };
}

export interface NoteHit {
  readonly note: Note;
  readonly zone: "body" | "resize";
}

/** Note sous le pointeur ; près de son bord droit, on la redimensionne au lieu de la déplacer. */
export function hitNote(
  layout: PianoLayout,
  notes: readonly Note[],
  x: number,
  y: number,
): NoteHit | null {
  for (const note of [...notes].reverse()) {
    const rect = noteRect(layout, note);
    const isInside =
      x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    if (isInside)
      return { note, zone: x >= rect.x + rect.width - RESIZE_HANDLE_WIDTH ? "resize" : "body" };
  }
  return null;
}
