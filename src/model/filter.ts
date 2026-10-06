import { clamp, roundToSignificant } from "@/lib/math";
import { FILTER_RANGE } from "@/model/constants";

export type FilterParam = "lpf" | "hpf";

const CUTOFF_SIGNIFICANT_DIGITS = 2;
/**
 * Près de sa butée « ouverte », le curseur de filtre désactive le filtre. La marge reste sous un cran
 * de curseur, pour qu'une flèche du clavier suffise à quitter la butée.
 */
const FILTER_OFF_MARGIN = 0.005;

/** Borne et arrondit une fréquence de coupure ; null = filtre désactivé. */
export function boundCutoff(cutoff: number | null): number | null {
  if (cutoff === null) return null;
  return roundToSignificant(
    clamp(cutoff, FILTER_RANGE.min, FILTER_RANGE.max),
    CUTOFF_SIGNIFICANT_DIGITS,
  );
}

/**
 * Le curseur d'un filtre (0 → 1) suit une échelle logarithmique. Désactivé, le filtre est
 * grand ouvert : en haut pour le passe-bas, en bas pour le passe-haut.
 */
function openPosition(param: FilterParam): number {
  return param === "lpf" ? 1 : 0;
}

export function filterToPosition(param: FilterParam, cutoff: number | null): number {
  if (cutoff === null) return openPosition(param);
  return Math.log(cutoff / FILTER_RANGE.min) / Math.log(FILTER_RANGE.max / FILTER_RANGE.min);
}

export function positionToFilter(param: FilterParam, position: number): number | null {
  if (Math.abs(position - openPosition(param)) <= FILTER_OFF_MARGIN) return null;
  return FILTER_RANGE.min * (FILTER_RANGE.max / FILTER_RANGE.min) ** clamp(position, 0, 1);
}

export function filterLabel(cutoff: number | null): string {
  return cutoff === null ? "Off" : `${cutoff} Hz`;
}
