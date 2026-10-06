import { clamp, roundTo } from "@/lib/math";
import { DELAY_RANGE, DRIVE_RANGE, GAIN_RANGE, PAN_RANGE, ROOM_RANGE } from "@/model/constants";
import { boundCutoff, type FilterParam } from "@/model/filter";
import { updateTrack } from "@/model/project";
import type { MixerSettings, Project } from "@/model/types";

export type ContinuousMixerParam = "gain" | "pan" | "room" | "delay" | "distort";

const PARAM_DECIMALS = 2;
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
  const bounded = boundCutoff(cutoff);
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, [param]: bounded }));
}

export function toggleMute(project: Project, trackId: string): Project {
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, isMuted: !mixer.isMuted }));
}

export function toggleSolo(project: Project, trackId: string): Project {
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, isSoloed: !mixer.isSoloed }));
}

/** « C » au centre, « L40 » ou « R40 » de part et d'autre. */
export function panLabel(pan: number): string {
  const offset = Math.round((pan - PAN_RANGE.max / 2) * PAN_DISPLAY_SCALE);
  if (offset === 0) return "C";
  return offset < 0 ? `L${-offset}` : `R${offset}`;
}

export function gainToDecibels(gain: number): number {
  return gain <= 0 ? Number.NEGATIVE_INFINITY : DECIBELS_PER_DECADE * Math.log10(gain);
}

export function formatDecibels(decibels: number): string {
  return Number.isFinite(decibels) ? decibels.toFixed(1) : "-∞";
}
