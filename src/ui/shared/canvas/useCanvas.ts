import { useEffect, useRef } from "react";

export interface CanvasSize {
  readonly width: number;
  readonly height: number;
}

export type DrawFunction = (context: CanvasRenderingContext2D, size: CanvasSize) => void;

/**
 * Canvas net sur les écrans haute densité : taille suivie par un ResizeObserver,
 * redessiné quand `draw` change, et à chaque image tant que `isAnimated` est vrai (tête de lecture).
 */
export function useCanvas(draw: DrawFunction, isAnimated: boolean) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  const size = useRef<CanvasSize>({ width: 0, height: 0 });

  const render = () => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const ratio = window.devicePixelRatio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size.current.width, size.current.height);
    drawRef.current(context, size.current);
  };

  useEffect(() => {
    drawRef.current = draw;
    render();
  });

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const ratio = window.devicePixelRatio;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      size.current = { width, height };
      render();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isAnimated) return;
    let frame = requestAnimationFrame(function loop() {
      render();
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isAnimated]);

  return canvas;
}
