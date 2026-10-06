import { useMediaQuery } from "@/ui/shared/useMediaQuery";

/** Même réglage que la variante `motion-reduce:` de Tailwind. */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Vrai quand le système demande moins d'animations : les visuels liés à la lecture se figent. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
