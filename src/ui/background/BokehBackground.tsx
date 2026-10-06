import { useIsPlaying } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { BokehCanvas } from "@/ui/background/BokehCanvas";
import { usePrefersReducedMotion } from "@/ui/shared/usePrefersReducedMotion";

/** Fond animé pendant la lecture, sauf si l'utilisateur l'a coupé ou si le système demande moins d'animations. */
export function BokehBackground() {
  const isPlaying = useIsPlaying();
  const isOn = useUiStore((state) => state.isBackgroundVisualsOn);
  const prefersReducedMotion = usePrefersReducedMotion();
  if (!isOn || prefersReducedMotion) return null;
  return <BokehCanvas isPlaying={isPlaying} />;
}
