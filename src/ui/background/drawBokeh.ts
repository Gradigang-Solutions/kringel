import type { SpectrumBands } from "@/engine";
import { withAlpha } from "@/lib/color";
import { haloLook, type BokehScene, type Halo } from "@/ui/background/bokeh";
import type { SoundFamily } from "@/ui/background/soundFamily";
import type { CanvasSize } from "@/ui/shared/canvas/useCanvas";

export type BokehPalette = Readonly<Record<SoundFamily, string>>;

interface GlowSpot {
  /** Bande du master, qui donne aussi la couleur de la famille du même nom. */
  readonly band: keyof SpectrumBands;
  /** Centre relatif à l'écran, rayon relatif au plus grand côté. */
  readonly x: number;
  readonly y: number;
  readonly radius: number;
}

/** Lueurs de fond, une par bande du master : graves en bas à gauche, aigus en haut. */
const GLOW_SPOTS: readonly GlowSpot[] = [
  { band: "low", x: 0.2, y: 1, radius: 0.7 },
  { band: "mid", x: 0.85, y: 0.55, radius: 0.5 },
  { band: "high", x: 0.55, y: 0, radius: 0.45 },
];
const GLOW_MAX_ALPHA = 0.32;
/**
 * Arrêts du dégradé d'un halo : le bord est un peu plus vif que le centre, comme le flou
 * d'objectif d'une lumière (bokeh), puis s'efface.
 */
const HALO_STOPS: readonly (readonly [offset: number, share: number])[] = [
  [0, 0.45],
  [0.72, 0.6],
  [0.88, 0.3],
  [1, 0],
];

function drawGlow(
  context: CanvasRenderingContext2D,
  spot: GlowSpot,
  level: number,
  color: string,
  size: CanvasSize,
): void {
  const alpha = GLOW_MAX_ALPHA * Math.min(1, level);
  if (alpha <= 0) return;
  const x = spot.x * size.width;
  const y = spot.y * size.height;
  const radius = spot.radius * Math.max(size.width, size.height);
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, withAlpha(color, alpha));
  gradient.addColorStop(1, withAlpha(color, 0));
  context.fillStyle = gradient;
  context.fillRect(0, 0, size.width, size.height);
}

function drawHalo(
  context: CanvasRenderingContext2D,
  halo: Halo,
  color: string,
  size: CanvasSize,
): void {
  const { alpha, scale } = haloLook(halo);
  if (alpha <= 0) return;
  const x = halo.x * size.width;
  const y = halo.y * size.height;
  const radius = halo.radius * scale * Math.min(size.width, size.height);
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  for (const [offset, share] of HALO_STOPS) {
    gradient.addColorStop(offset, withAlpha(color, alpha * share));
  }
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

/** Dessine les lueurs de fond puis les halos, en lumière additive. */
export function drawBokeh(
  context: CanvasRenderingContext2D,
  scene: BokehScene,
  size: CanvasSize,
  palette: BokehPalette,
): void {
  context.globalCompositeOperation = "lighter";
  for (const spot of GLOW_SPOTS) {
    drawGlow(context, spot, scene.glow[spot.band], palette[spot.band], size);
  }
  for (const halo of scene.halos) {
    drawHalo(context, halo, palette[halo.family], size);
  }
  context.globalCompositeOperation = "source-over";
}
