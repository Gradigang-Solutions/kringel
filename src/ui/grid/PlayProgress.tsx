import { useRef } from "react";
import { getCyclePosition } from "@/engine";
import { useAnimationFrame } from "@/ui/shared/useAnimationFrame";

const PERCENT = 100;

export interface PlayProgressProps {
  readonly cycles: number;
}

/** Barre de progression d'un clip qui joue, lue à chaque image depuis le moteur. */
export function PlayProgress({ cycles }: PlayProgressProps) {
  const bar = useRef<HTMLDivElement>(null);
  useAnimationFrame(() => {
    const progress = (getCyclePosition() % cycles) / cycles;
    if (bar.current) bar.current.style.width = `${progress * PERCENT}%`;
  });
  return <div ref={bar} aria-hidden className="absolute bottom-0 left-0 h-0.5 bg-track" />;
}
