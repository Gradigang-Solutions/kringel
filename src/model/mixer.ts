import { clamp, roundTo, roundToSignificant } from "@/lib/math";
import { GAIN_RANGE, LPF_RANGE, PAN_RANGE, ROOM_RANGE } from "@/model/constants";
import { updateTrack } from "@/model/project";
import type { MixerSettings, Project } from "@/model/types";

export type ContinuousMixerParam = "gain" | "pan" | "room";

const PARAM_DECIMALS = 2;
const LPF_SIGNIFICANT_DIGITS = 2;
/** Au-delà de cette position, le curseur de filtre est considéré comme ouvert (filtre désactivé). */
const LPF_OFF_THRESHOLD = 0.995;
const PAN_DISPLAY_SCALE = 200;
const DECIBELS_PER_DECADE = 20;

const RANGES = { gain: GAIN_RANGE, pan: PAN_RANGE, room: ROOM_RANGE } as const;

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

export function setLpf(project: Project, trackId: string, lpf: number | null): Project {
  const bounded =
    lpf === null
      ? null
      : roundToSignificant(clamp(lpf, LPF_RANGE.min, LPF_RANGE.max), LPF_SIGNIFICANT_DIGITS);
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, lpf: bounded }));
}

export function toggleMute(project: Project, trackId: string): Project {
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, isMuted: !mixer.isMuted }));
}

export function toggleSolo(project: Project, trackId: string): Project {
  return updateMixer(project, trackId, (mixer) => ({ ...mixer, isSoloed: !mixer.isSoloed }));
}

/** Position du curseur de filtre (0 → 1) en échelle logarithmique ; filtre désactivé = 1. */
export function lpfToPosition(lpf: number | null): number {
  if (lpf === null) return 1;
  return Math.log(lpf / LPF_RANGE.min) / Math.log(LPF_RANGE.max / LPF_RANGE.min);
}

export function positionToLpf(position: number): number | null {
  if (position >= LPF_OFF_THRESHOLD) return null;
  return LPF_RANGE.min * (LPF_RANGE.max / LPF_RANGE.min) ** clamp(position, 0, 1);
}

/** « C » au centre, « L40 » ou « R40 » de part et d'autre. */
export function panLabel(pan: number): string {
  const offset = Math.round((pan - PAN_RANGE.max / 2) * PAN_DISPLAY_SCALE);
  if (offset === 0) return "C";
  return offset < 0 ? `L${-offset}` : `R${offset}`;
}

export function lpfLabel(lpf: number | null): string {
  return lpf === null ? "Off" : `${lpf} Hz`;
}

export function gainToDecibels(gain: number): number {
  return gain <= 0 ? Number.NEGATIVE_INFINITY : DECIBELS_PER_DECADE * Math.log10(gain);
}

export function formatDecibels(decibels: number): string {
  return Number.isFinite(decibels) ? decibels.toFixed(1) : "-∞";
}
