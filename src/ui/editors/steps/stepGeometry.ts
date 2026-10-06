import { STEPS_PER_BEAT } from "@/model/constants";
import {
  groupedGapsLength,
  groupedSpans,
  spanIndexAt,
  type Span,
} from "@/ui/shared/canvas/gridGeometry";

/** Dimensions partagées par le canvas et les colonnes DOM qui l'entourent (libellés, mini-notation). */
export const STEP_HEADER_HEIGHT = 18;
export const STEP_ROW_HEIGHT = 46;
export const STEP_ROW_GAP = 6;
export const STEP_SPACING = { groupSize: STEPS_PER_BEAT, cellGap: 4, groupGap: 10 } as const;

/** Largeur minimale d'un pas pour rester touchable au doigt ; au-delà, la grille défile. */
export const MIN_TOUCH_STEP_WIDTH = 24;

export function stepGridMinWidth(stepCount: number): number {
  return stepCount * MIN_TOUCH_STEP_WIDTH + groupedGapsLength(stepCount, STEP_SPACING);
}

export interface StepGridLayout {
  readonly columns: readonly Span[];
  readonly rows: readonly Span[];
  readonly header: Span;
}

export function stepGridHeight(rowCount: number): number {
  return STEP_HEADER_HEIGHT + rowCount * (STEP_ROW_HEIGHT + STEP_ROW_GAP);
}

export function stepGridLayout(width: number, stepCount: number, rowCount: number): StepGridLayout {
  const firstRowTop = STEP_HEADER_HEIGHT + STEP_ROW_GAP;
  return {
    header: { start: 0, size: STEP_HEADER_HEIGHT },
    columns: groupedSpans(width, stepCount, STEP_SPACING),
    rows: Array.from({ length: rowCount }, (_, row) => ({
      start: firstRowTop + row * (STEP_ROW_HEIGHT + STEP_ROW_GAP),
      size: STEP_ROW_HEIGHT,
    })),
  };
}

export interface StepCell {
  readonly row: number;
  readonly step: number;
}

/** Cellule sous le pointeur, ou null dans un écart, l'en-tête ou hors de la grille. */
export function stepCellAt(layout: StepGridLayout, x: number, y: number): StepCell | null {
  const step = spanIndexAt(layout.columns, x);
  const row = spanIndexAt(layout.rows, y);
  return step === null || row === null ? null : { row, step };
}

/** Niveau correspondant à une hauteur dans la piste des réglages par pas : en haut 1, en bas 0. */
export function levelAtHeight(y: number, height: number): number {
  if (height <= 0) return 0;
  return 1 - Math.min(1, Math.max(0, y / height));
}
