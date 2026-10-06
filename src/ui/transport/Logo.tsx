import { useEffect, useRef } from "react";
import { getCyclePosition } from "@/engine";
import { cn } from "@/lib/cn";
import { useIsPlaying } from "@/store/selectors";
import { usePrefersReducedMotion } from "@/ui/shared/usePrefersReducedMotion";
import { useAnimationFrame } from "@/ui/shared/useAnimationFrame";
import { logoRotation, restingRotation } from "@/ui/transport/logoRotation";

function rotate(element: HTMLElement | null, degrees: number): void {
  if (element) element.style.transform = `rotate(${degrees}deg)`;
}

/** Même fichier que le favicon, pour que le logo n'ait qu'une seule source. Il tourne pendant la lecture. */
export function Logo() {
  const isPlaying = useIsPlaying();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isSpinning = isPlaying && !prefersReducedMotion;
  const image = useRef<HTMLImageElement>(null);
  const angle = useRef(0);

  useAnimationFrame(() => {
    angle.current = logoRotation(getCyclePosition());
    rotate(image.current, angle.current);
  }, isSpinning);

  useEffect(() => {
    if (isSpinning) return;
    rotate(image.current, restingRotation(angle.current));
    angle.current = 0;
  }, [isSpinning]);

  return (
    <img
      ref={image}
      src="/favicon.svg"
      alt=""
      aria-hidden
      // La transition ne sert qu'au retour au repos : pendant la lecture, elle retarderait chaque image.
      className={cn("size-7 shrink-0", !isSpinning && "transition-transform duration-500 ease-out")}
    />
  );
}
