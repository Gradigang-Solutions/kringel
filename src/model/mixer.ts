import { clamp, roundTo, roundToSignificant } from "@/lib/math";
import {
  DELAY_RANGE,
  DRIVE_RANGE,
  FILTER_RANGE,
  GAIN_RANGE,
  PAN_RANGE,
  ROOM_RANGE,
} from "@/model/constants";
import { updateTrack } from "@/model/project";
import type { MixerSettings, Project } from "@/model/types";

export type ContinuousMixerParam = "gain" | "pan" | "room" | "delay" | "distort";
export type FilterParam = "lpf" | "hpf";

const PARAM_DECIMALS = 2;
const CUTOFF_SIGNIFICANT_DIGITS = 2;
/**
 * Près de sa butée « ouverte », le curseur de filtre désactive le filtre. La marge reste sous un cran
 * de curseur, pour qu'une flèche du clavier suffise à quitter la butée.
 */
const FILTER_OFF_MARGIN = 0.005;
const PAN_DISPLAY_SCALE = 200;
const DECIBELS_PER_DECADE = 20;

const RANGES = {
  gain: GAIN_RANGE,
  pan: PAN_RANGE,
  room: ROOM_RANGE,
  delay: DELAY_RANGE,
  distort: DRIVE_RANGE,
} as const;

function updateMixer(
  project: Project,
  trackId: string,
  update: (mixer: MixerSettings) => MixerSettings,
): Project {
  return updateTrack(project, trackId, (track) => ({ ...track, mixer: update(track.mixer) }));
}

export function setMixerParam(
  project: Project,
  trackId: string,
  param: ContinuousMixerParam,
  value: number,
): Project {
  const { min, max } = RANGES[param];
  const bounded = roundTo(clamp(value, min, max), PARAM_DECIMALS);
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, [param]: bounded }));
}

export function setFilter(
  project: Project,
  trackId: string,
  param: FilterParam,
  cutoff: number | null,
): Project {
  const bounded =
    cutoff === null
      ? null
      : roundToSignificant(
          clamp(cutoff, FILTER_RANGE.min, FILTER_RANGE.max),
          CUTOFF_SIGNIFICANT_DIGITS,
        );
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, [param]: bounded }));
}

export function toggleMute(project: Project, trackId: string): Project {
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, isMuted: !mixer.isMuted }));
}

export function toggleSolo(project: Project, trackId: string): Project {
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, isSoloed: !mixer.isSoloed }));
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

/** « C » au centre, « L40 » ou « R40 » de part et d'autre. */
export function panLabel(pan: number): string {
  const offset = Math.round((pan - PAN_RANGE.max / 2) * PAN_DISPLAY_SCALE);
  if (offset === 0) return "C";
  return offset < 0 ? `L${-offset}` : `R${offset}`;
}

export function filterLabel(cutoff: number | null): string {
  return cutoff === null ? "Off" : `${cutoff} Hz`;
}

export function gainToDecibels(gain: number): number {
  return gain <= 0 ? Number.NEGATIVE_INFINITY : DECIBELS_PER_DECADE * Math.log10(gain);
}

export function formatDecibels(decibels: number): string {
  return Number.isFinite(decibels) ? decibels.toFixed(1) : "-∞";
}
