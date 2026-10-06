import { useCallback, useEffect, useRef } from "react";
import { drainSoundEvents, readMasterBands } from "@/engine";
import { cn } from "@/lib/cn";
import { advanceScene, EMPTY_SCENE } from "@/ui/background/bokeh";
import { drawBokeh, type BokehPalette } from "@/ui/background/drawBokeh";
import { themeColor } from "@/ui/shared/canvas/themeColors";
import { useCanvas, type DrawFunction } from "@/ui/shared/canvas/useCanvas";

/** Le fond est flou : la moitié des pixels suffit, et chaque image coûte quatre fois moins. */
const BACKGROUND_RESOLUTION = 0.5;
/** Après une pause de l'onglet, la scène reprend sans sauter d'un coup. */
const MAX_FRAME_SECONDS = 0.1;
const MS_PER_SECOND = 1000;

export interface BokehCanvasProps {
  readonly isPlaying: boolean;
}

function bokehPalette(): BokehPalette {
  return {
    low: themeColor("bokehLow"),
    mid: themeColor("bokehMid"),
    high: themeColor("bokehHigh"),
    tonal: themeColor("bokehTonal"),
  };
}

/** Halos qui suivent les sons entendus ; à l'arrêt, ils s'effacent en fondu puis le dessin s'arrête. */
export function BokehCanvas({ isPlaying }: BokehCanvasProps) {
  const scene = useRef(EMPTY_SCENE);
  const lastFrameAt = useRef<number | null>(null);

  // Déclaré avant useCanvas : la scène repart de zéro avant la première image de la lecture.
  useEffect(() => {
    if (!isPlaying) return;
    scene.current = EMPTY_SCENE;
    lastFrameAt.current = null;
  }, [isPlaying]);

  const draw = useCallback<DrawFunction>((context, size) => {
    const now = performance.now();
    const elapsed = lastFrameAt.current === null ? 0 : (now - lastFrameAt.current) / MS_PER_SECOND;
    lastFrameAt.current = now;
    const seconds = Math.min(MAX_FRAME_SECONDS, elapsed);
    scene.current = advanceScene(
      scene.current,
      drainSoundEvents(),
      readMasterBands(),
      seconds,
      Math.random,
    );
    drawBokeh(context, scene.current, size, bokehPalette());
  }, []);
  const canvas = useCanvas(draw, isPlaying, BACKGROUND_RESOLUTION);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full transition-opacity duration-700",
        isPlaying ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
