import { BEATS_PER_CYCLE } from "@/model/constants";

/** « 17.3 » : 17e cycle, 3e temps (numérotés à partir de 1, comme dans un DAW). */
export function formatCyclePosition(position: number): string {
  const cycle = Math.floor(position);
  return `${cycle + 1}.${currentBeat(position) + 1}`;
}

/** Temps en cours dans le cycle, de 0 à BEATS_PER_CYCLE - 1. */
export function currentBeat(position: number): number {
  const fraction = position - Math.floor(position);
  return Math.min(BEATS_PER_CYCLE - 1, Math.floor(fraction * BEATS_PER_CYCLE));
}
