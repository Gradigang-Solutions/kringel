import { getCyclePosition } from "@/engine";
import { STEPS_PER_CYCLE } from "@/model/constants";
import { useClipPlayStatus, useIsPlaying } from "@/store/selectors";
import { playheadStep } from "@/ui/shared/canvas/drawPlayhead";

export interface ClipPlayhead {
  /** Vrai tant que le clip joue : le canvas se redessine alors à chaque image. */
  readonly isAnimated: boolean;
  /** Position en pas dans le clip, lue auprès du moteur ; null si le clip ne joue pas. */
  readonly readStep: () => number | null;
  /** Position en pas, avec la fraction, pour une tête de lecture continue. */
  readonly readPosition: () => number | null;
}

export function useClipPlayhead(trackId: string, clipId: string, cycles: number): ClipPlayhead {
  const status = useClipPlayStatus(trackId, clipId);
  const isTransportRunning = useIsPlaying();
  const isAnimated = isTransportRunning && (status === "playing" || status === "stopping");
  return {
    isAnimated,
    readStep: () => (isAnimated ? playheadStep(getCyclePosition(), cycles, STEPS_PER_CYCLE) : null),
    readPosition: () => (isAnimated ? (getCyclePosition() % cycles) * STEPS_PER_CYCLE : null),
  };
}
