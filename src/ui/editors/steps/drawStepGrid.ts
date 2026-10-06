import { withAlpha } from "@/lib/color";
import { DEFAULT_CHANCE, DEFAULT_RATCHET, STEPS_PER_BEAT } from "@/model/constants";
import type { StepRow } from "@/model/types";
import { fillRoundedRect } from "@/ui/shared/canvas/drawPlayhead";
import type { CanvasSize } from "@/ui/shared/canvas/useCanvas";
import { MONO_FONT, themeColor } from "@/ui/shared/canvas/themeColors";
import { stepGridLayout, type StepGridLayout } from "@/ui/editors/steps/stepGeometry";

export interface StepGridData {
  readonly rows: readonly Pick<StepRow, "velocities" | "chances" | "ratchets" | "isMuted">[];
  readonly stepCount: number;
  readonly trackColor: string;
  readonly playheadStep: number | null;
}

const CELL_RADIUS = 4;
const HEADER_RADIUS = 3;
const HEADER_FONT = `500 10px ${MONO_FONT}`;
const ON_ALPHA = 0.2;
const MUTED_ON_ALPHA = 0.1;
const MUTED_FILL_ALPHA = 0.3;
/** Un pas incertain est plus pâle : à 5 % de chances, il garde à peine plus d'un tiers d'opacité. */
const UNCERTAIN_MIN_ALPHA = 0.35;
const RATCHET_GAP = 2;

interface CellRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface CellState {
  readonly velocity: number;
  readonly chance: number;
  readonly ratchet: number;
  readonly isMuted: boolean;
}

function fillColor(cell: CellState, trackColor: string): string {
  if (cell.isMuted) return withAlpha(trackColor, MUTED_FILL_ALPHA);
  if (cell.chance >= DEFAULT_CHANCE) return trackColor;
  return withAlpha(trackColor, UNCERTAIN_MIN_ALPHA + (1 - UNCERTAIN_MIN_ALPHA) * cell.chance);
}

/** Un pas joué plusieurs fois est découpé en autant de tranches. */
function drawRatchetGaps(
  context: CanvasRenderingContext2D,
  rect: CellRect,
  ratchet: number,
  gapColor: string,
): void {
  if (ratchet <= DEFAULT_RATCHET) return;
  context.fillStyle = gapColor;
  for (let slice = 1; slice < ratchet; slice += 1) {
    const x = rect.x + (rect.width * slice) / ratchet - RATCHET_GAP / 2;
    context.fillRect(x, rect.y, RATCHET_GAP, rect.height);
  }
}

function drawHeader(
  context: CanvasRenderingContext2D,
  layout: StepGridLayout,
  data: StepGridData,
): void {
  context.font = HEADER_FONT;
  context.textAlign = "center";
  context.textBaseline = "middle";
  layout.columns.forEach((column, step) => {
    const isPlayhead = step === data.playheadStep;
    if (isPlayhead) {
      const rect = { x: column.start, y: 0, width: column.size, height: layout.header.size };
      fillRoundedRect(context, rect, HEADER_RADIUS, themeColor("fg1"));
    }
    const isBeatStart = step % STEPS_PER_BEAT === 0;
    context.fillStyle = isPlayhead
      ? themeColor("fgInverse")
      : themeColor(isBeatStart ? "fg2" : "fg3");
    context.fillText(String(step + 1), column.start + column.size / 2, layout.header.size / 2);
  });
}

function drawCell(
  context: CanvasRenderingContext2D,
  rect: CellRect,
  cell: CellState,
  offColor: string,
  trackColor: string,
): void {
  const isOn = cell.velocity > 0;
  const background = isOn
    ? withAlpha(trackColor, cell.isMuted ? MUTED_ON_ALPHA : ON_ALPHA)
    : offColor;
  fillRoundedRect(context, rect, CELL_RADIUS, background);
  if (!isOn) return;
  context.save();
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.width, rect.height, CELL_RADIUS);
  context.clip();
  const fillHeight = rect.height * cell.velocity;
  context.fillStyle = fillColor(cell, trackColor);
  context.fillRect(rect.x, rect.y + rect.height - fillHeight, rect.width, fillHeight);
  drawRatchetGaps(context, rect, cell.ratchet, offColor);
  context.restore();
}

function drawPlayheadOutline(context: CanvasRenderingContext2D, rect: CellRect): void {
  context.strokeStyle = themeColor("fg1");
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1, CELL_RADIUS);
  context.stroke();
}

/** Grille du step sequencer : numéros de pas, puis une ligne de cellules par son. */
export function drawStepGrid(
  context: CanvasRenderingContext2D,
  data: StepGridData,
  size: CanvasSize,
): void {
  const layout = stepGridLayout(size.width, data.stepCount, data.rows.length);
  drawHeader(context, layout, data);
  data.rows.forEach((row, rowIndex) => {
    const rowSpan = layout.rows[rowIndex];
    if (!rowSpan) return;
    layout.columns.forEach((column, step) => {
      const rect = { x: column.start, y: rowSpan.start, width: column.size, height: rowSpan.size };
      const isOddBeat = Math.floor(step / STEPS_PER_BEAT) % 2 === 1;
      const offColor = themeColor(isOddBeat ? "cellOff" : "cellOffAlt");
      const cell: CellState = {
        velocity: row.velocities[step] ?? 0,
        chance: row.chances[step] ?? DEFAULT_CHANCE,
        ratchet: row.ratchets[step] ?? DEFAULT_RATCHET,
        isMuted: row.isMuted,
      };
      drawCell(context, rect, cell, offColor, data.trackColor);
      if (step === data.playheadStep) drawPlayheadOutline(context, rect);
    });
  });
}
