import { useRef } from "react";
import type { StepsClip } from "@/model/types";
import { isStepOn } from "@/model/steps";
import { stepCount } from "@/model/timing";
import { toggleStep } from "@/store/actions/steps";
import { drawStepGrid } from "@/ui/editors/steps/drawStepGrid";
import { stepCellAt, stepGridHeight, stepGridLayout } from "@/ui/editors/steps/stepGeometry";
import type { ClipPlayhead } from "@/ui/editors/useClipPlayhead";
import { pointerPosition } from "@/ui/shared/canvas/gridGeometry";
import { useCanvas } from "@/ui/shared/canvas/useCanvas";

export interface StepGridCanvasProps {
  readonly clip: StepsClip;
  readonly trackColor: string;
  readonly playhead: ClipPlayhead;
}

interface Paint {
  readonly row: number;
  readonly isTurningOn: boolean;
  readonly visited: Set<number>;
}

/** Grille de pas : un clic allume ou éteint un pas, un glisser applique le même geste sur la ligne. */
export function StepGridCanvas({ clip, trackColor, playhead }: StepGridCanvasProps) {
  const steps = stepCount(clip.cycles);
  const canvas = useCanvas(
    (context, size) =>
      drawStepGrid(
        context,
        { rows: clip.rows, stepCount: steps, trackColor, playheadStep: playhead.readStep() },
        size,
      ),
    playhead.isAnimated,
  );
  const paint = useRef<Paint | null>(null);

  const cellFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = pointerPosition(event, event.currentTarget);
    const layout = stepGridLayout(event.currentTarget.clientWidth, steps, clip.rows.length);
    return stepCellAt(layout, x, y);
  };

  const applyPaint = (rowIndex: number, step: number) => {
    const row = clip.rows[rowIndex];
    if (!row || !paint.current || paint.current.visited.has(step)) return;
    paint.current.visited.add(step);
    if (isStepOn(row, step) !== paint.current.isTurningOn) toggleStep(clip.id, row.id, step);
  };

  return (
    <canvas
      ref={canvas}
      role="grid"
      aria-label="Step sequencer grid"
      className="w-full touch-none"
      style={{ height: stepGridHeight(clip.rows.length) }}
      onPointerDown={(event) => {
        const cell = cellFromEvent(event);
        const row = cell ? clip.rows[cell.row] : undefined;
        if (!cell || !row) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        paint.current = {
          row: cell.row,
          isTurningOn: !isStepOn(row, cell.step),
          visited: new Set(),
        };
        applyPaint(cell.row, cell.step);
      }}
      onPointerMove={(event) => {
        const cell = cellFromEvent(event);
        if (cell && cell.row === paint.current?.row) applyPaint(cell.row, cell.step);
      }}
      onPointerUp={() => {
        paint.current = null;
      }}
    />
  );
}
