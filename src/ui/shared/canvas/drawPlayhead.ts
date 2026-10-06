import { themeColor } from "@/ui/shared/canvas/themeColors";

/** Trait vertical de la tête de lecture, sur toute la hauteur. */
export function drawPlayheadLine(
  context: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number,
): void {
  context.fillStyle = themeColor("fg1");
  context.fillRect(Math.round(x), top, 1, bottom - top);
}

/** Pas en cours dans la boucle d'un clip qui joue. */
export function playheadStep(cyclePosition: number, cycles: number, stepsPerCycle: number): number {
  const positionInClip = cyclePosition % cycles;
  return Math.floor(positionInClip * stepsPerCycle);
}

/** Rectangle aux coins arrondis, rempli. */
export function fillRoundedRect(
  context: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  radius: number,
  color: string,
): void {
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
  context.fill();
}
