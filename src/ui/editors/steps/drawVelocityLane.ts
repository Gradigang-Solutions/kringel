import { STEPS_PER_BEAT } from "@/model/constants";
import { groupedSpans } from "@/ui/shared/canvas/gridGeometry";
import { themeColor } from "@/ui/shared/canvas/themeColors";
import type { CanvasSize } from "@/ui/shared/canvas/useCanvas";
import { STEP_SPACING } from "@/ui/editors/steps/stepGeometry";

export interface VelocityLaneData {
  readonly velocities: readonly number[];
  readonly trackColor: string;
  readonly playheadStep: number | null;
}

const BAR_INSET = 3;
const BAR_RADIUS = 2;

/** Barres de vélocité de la ligne sélectionnée, sur une ligne de base. */
export function drawVelocityLane(
  context: CanvasRenderingContext2D,
  data: VelocityLaneData,
  size: CanvasSize,
): void {
  const columns = groupedSpans(size.width, data.velocities.length, STEP_SPACING);
  columns.forEach((column, step) => {
    context.fillStyle = themeColor(
      Math.floor(step / STEPS_PER_BEAT) % 2 === 0 ? "lineSubtle" : "cellOffAlt",
    );
    context.fillRect(column.start, size.height - 1, column.size, 1);
    const velocity = data.velocities[step] ?? 0;
    if (velocity <= 0) return;
    const height = (size.height - 1) * velocity;
    context.fillStyle = step === data.playheadStep ? themeColor("fg1") : data.trackColor;
    context.beginPath();
    context.roundRect(
      column.start + BAR_INSET,
      size.height - 1 - height,
      column.size - 2 * BAR_INSET,
      height,
      [BAR_RADIUS, BAR_RADIUS, 0, 0],
    );
    context.fill();
  });
}
