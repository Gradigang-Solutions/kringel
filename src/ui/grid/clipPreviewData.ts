import { stepCount } from "@/model/timing";
import type { NotesClip, StepsClip } from "@/model/types";

/** Nombre maximal de lignes de pas visibles dans la miniature d'un clip. */
const MAX_PREVIEW_ROWS = 4;
const PERCENT = 100;
/** Les notes occupent 80 % de la hauteur, pour garder de l'air sous la plus grave. */
const NOTE_HEIGHT_SPAN = 80;

export interface StepPreviewRow {
  readonly id: string;
  readonly isMuted: boolean;
  readonly cells: readonly boolean[];
}

export interface NotePreview {
  readonly id: string;
  readonly left: number;
  readonly width: number;
  readonly top: number;
}

export function stepPreviewRows(clip: StepsClip): StepPreviewRow[] {
  return clip.rows.slice(0, MAX_PREVIEW_ROWS).map((row) => ({
    id: row.id,
    isMuted: row.isMuted,
    cells: row.velocities.map((velocity) => velocity > 0),
  }));
}

/** Position des notes en pourcentage de la miniature : temps en abscisse, hauteur en ordonnée. */
export function notePreviews(clip: NotesClip): NotePreview[] {
  const length = stepCount(clip.cycles);
  const pitches = clip.notes.map((note) => note.pitch);
  const lowest = Math.min(...pitches);
  const span = Math.max(...pitches) - lowest;
  return clip.notes.map((note) => ({
    id: note.id,
    left: (note.start / length) * PERCENT,
    width: (note.duration / length) * PERCENT,
    top: span === 0 ? NOTE_HEIGHT_SPAN / 2 : (1 - (note.pitch - lowest) / span) * NOTE_HEIGHT_SPAN,
  }));
}

/** Première ligne de code utile, pour la miniature d'un clip de code. */
export function codePreviewLine(source: string): string {
  return (
    source
      .split("\n")
      .find((line) => line.trim() !== "" && !line.trim().startsWith("//"))
      ?.trim() ?? ""
  );
}
