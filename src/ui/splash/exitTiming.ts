import { modulo } from "@/lib/math";

/**
 * Début du dernier quart de tour de `k2-turn` (index.html) : le logo est à 270° jusqu'à 91 % de la
 * mesure. `k2-land` part de -90°, donc sans saut, et atteint 0° au bout de 180 ms, la durée d'un quart
 * de tour normal : le logo retombe pile sur le temps fort.
 */
export const EXIT_START_FRACTION = 0.91;

/** Délai, en ms, avant de lancer la sortie pour qu'elle retombe sur le prochain temps fort. */
export function delayUntilExit(elapsedMs: number, loopMs: number): number {
  return modulo(EXIT_START_FRACTION * loopMs - elapsedMs, loopMs);
}
