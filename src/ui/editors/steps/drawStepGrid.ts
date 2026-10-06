import { withAlpha } from "@/lib/color";
import { STEPS_PER_BEAT } from "@/model/constants";
import { fillRoundedRect } from "@/ui/shared/canvas/drawPlayhead";
import type { CanvasSize } from "@/ui/shared/canvas/useCanvas";
import { MONO_FONT, themeColor } from "@/ui/shared/canvas/themeColors";
import { stepGridLayout, type StepGridLayout } from "@/ui/editors/steps/stepGeometry";

export interface StepGridData {
  readonly rows: readonly { readonly velocities: readonly number[]; readonly isMuted: boolean }[];
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
  rect: { x: number; y: number; width: number; height: number },
  velocity: number,
  isMuted: boolean,
  offColor: string,
  trackColor: string,
): void {
  const isOn = velocity > 0;
  const background = isOn ? withAlpha(trackColor, isMuted ? MUTED_ON_ALPHA : ON_ALPHA) : offColor;
  fillRoundedRect(context, rect, CELL_RADIUS, background);
  if (!isOn) return;
  context.save();
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.width, rect.height, CELL_RADIUS);
  context.clip();
  const fillHeight = rect.height * velocity;
  context.fillStyle = isMuted ? withAlpha(trackColor, MUTED_FILL_ALPHA) : trackColor;
  context.fillRect(rect.x, rect.y + rect.height - fillHeight, rect.width, fillHeight);
  context.restore();
}

function drawPlayheadOutline(
  context: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
): void {
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
      drawCell(context, rect, row.velocities[step] ?? 0, row.isMuted, offColor, data.trackColor);
      if (step === data.playheadStep) drawPlayheadOutline(context, rect);
    });
  });
}
