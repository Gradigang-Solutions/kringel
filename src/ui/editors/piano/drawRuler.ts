import { STEPS_PER_BEAT, STEPS_PER_CYCLE } from "@/model/constants";
import { MONO_FONT, themeColor } from "@/ui/shared/canvas/themeColors";
import type { CanvasSize } from "@/ui/shared/canvas/useCanvas";
import { stepWidth, stepX, type PianoLayout } from "@/ui/editors/piano/pianoGeometry";

const RULER_FONT = `10px ${MONO_FONT}`;
const LABEL_OFFSET = 5;
const LABEL_BASELINE = 8;
const TRIANGLE_HALF_WIDTH = 5;
const TRIANGLE_HEIGHT = 7;
/** En dessous (écran étroit, clip long), les libellés « 1.2 » se chevauchent : seuls les cycles restent numérotés. */
const MIN_BEAT_LABEL_SPACING = 32;

/** « 1 », « 1.2 », « 1.3 », « 1.4 », « 2 »… : cycle puis temps. */
export function rulerLabel(step: number): string {
  const cycle = Math.floor(step / STEPS_PER_CYCLE) + 1;
  const beat = Math.floor((step % STEPS_PER_CYCLE) / STEPS_PER_BEAT) + 1;
  return beat === 1 ? String(cycle) : `${cycle}.${beat}`;
}

export function hasBeatLabels(layout: PianoLayout): boolean {
  return stepWidth(layout) * STEPS_PER_BEAT >= MIN_BEAT_LABEL_SPACING;
}

export function drawRuler(
  context: CanvasRenderingContext2D,
  data: { readonly stepCount: number; readonly playheadPosition: number | null },
  size: CanvasSize,
): void {
  const layout = { width: size.width, stepCount: data.stepCount };
  const isBeatLabeled = hasBeatLabels(layout);
  context.font = RULER_FONT;
  context.textBaseline = "middle";
  for (let step = 0; step < data.stepCount; step += STEPS_PER_BEAT) {
    const isCycle = step % STEPS_PER_CYCLE === 0;
    const x = Math.round(stepX(layout, step));
    context.fillStyle = themeColor(isCycle ? "lineBar" : "lineSubtle");
    context.fillRect(x, 0, 1, size.height);
    if (!isCycle && !isBeatLabeled) continue;
    context.fillStyle = themeColor(isCycle ? "fg1" : "fg3");
    context.fillText(rulerLabel(step), x + LABEL_OFFSET, LABEL_BASELINE);
  }
  if (data.playheadPosition === null) return;
  const x = stepX(layout, data.playheadPosition);
  context.fillStyle = themeColor("fg1");
  context.beginPath();
  context.moveTo(x - TRIANGLE_HALF_WIDTH, size.height - TRIANGLE_HEIGHT);
  context.lineTo(x + TRIANGLE_HALF_WIDTH, size.height - TRIANGLE_HEIGHT);
  context.lineTo(x, size.height);
  context.fill();
}
