import type { PreviewNote } from "@/engine";
import { withAlpha } from "@/lib/color";
import { pitchClassOf, noteName } from "@/model/scales";
import { drawPlayheadLine } from "@/ui/shared/canvas/drawPlayhead";
import { MONO_FONT, themeColor } from "@/ui/shared/canvas/themeColors";
import type { CanvasSize } from "@/ui/shared/canvas/useCanvas";
import { pitchWindow } from "@/ui/editors/code/previewLayout";

export interface CodePreviewData {
  readonly notes: readonly PreviewNote[];
  readonly cycles: number;
  readonly trackColor: string;
  readonly playheadCycle: number | null;
}

const LABEL_WIDTH = 36;
const LABEL_FONT = `9.5px ${MONO_FONT}`;
const NOTE_FILL_ALPHA = 0.55;
const ROOT_ROW_ALPHA = 0.06;
const NOTE_INSET = 3;
const NOTE_RADIUS = 3;
const MIN_LABELED_ROW_HEIGHT = 10;

/** Aperçu en lecture seule des notes produites par un clip de code. */
export function drawCodePreview(
  context: CanvasRenderingContext2D,
  data: CodePreviewData,
  size: CanvasSize,
): void {
  const window = pitchWindow(data.notes);
  if (window === null) return;
  const rowCount = window.highest - window.lowest + 1;
  const rowHeight = size.height / rowCount;
  const gridWidth = size.width - LABEL_WIDTH;
  const xAt = (cycle: number) => LABEL_WIDTH + (cycle / data.cycles) * gridWidth;
  context.font = LABEL_FONT;
  context.textBaseline = "middle";
  for (let pitch = window.highest; pitch >= window.lowest; pitch -= 1) {
    const y = (window.highest - pitch) * rowHeight;
    const isC = pitchClassOf(pitch) === 0;
    context.fillStyle = isC ? withAlpha(data.trackColor, ROOT_ROW_ALPHA) : themeColor("cellOff");
    context.fillRect(LABEL_WIDTH, y, gridWidth, rowHeight - 1);
    if (rowHeight < MIN_LABELED_ROW_HEIGHT) continue;
    context.fillStyle = themeColor(isC ? "fg2" : "fg3");
    context.fillText(noteName(pitch), 0, y + rowHeight / 2);
  }
  for (let cycle = 0; cycle <= data.cycles; cycle += 1) {
    context.fillStyle = themeColor("lineStrong");
    context.fillRect(Math.round(xAt(cycle)), 0, 1, size.height);
  }
  for (const note of data.notes) {
    const y = (window.highest - Math.round(note.pitch)) * rowHeight;
    const x = xAt(note.begin) + NOTE_INSET;
    const width = Math.max(1, xAt(note.end) - xAt(note.begin) - 2 * NOTE_INSET);
    context.beginPath();
    context.roundRect(x, y + 1, width, rowHeight - 3, NOTE_RADIUS);
    context.fillStyle = withAlpha(data.trackColor, NOTE_FILL_ALPHA);
    context.fill();
    context.strokeStyle = data.trackColor;
    context.lineWidth = 1;
    context.stroke();
  }
  if (data.playheadCycle !== null)
    drawPlayheadLine(context, xAt(data.playheadCycle), 0, size.height);
}
