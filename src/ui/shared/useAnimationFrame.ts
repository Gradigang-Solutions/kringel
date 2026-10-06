import { useEffect, useRef } from "react";

/** Appelle `onFrame` à chaque image tant que le composant est monté, sans passer par l'état React. */
export function useAnimationFrame(onFrame: () => void, isActive = true): void {
  const callback = useRef(onFrame);
  useEffect(() => {
    callback.current = onFrame;
  });
  useEffect(() => {
    if (!isActive) return;
    let frame = requestAnimationFrame(function loop() {
      callback.current();
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isActive]);
}
