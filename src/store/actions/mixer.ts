import { formatMixerCall, type MixerParam } from "@/codegen/mixer";
import {
  lpfLabel,
  panLabel,
  setLpf as setLpfModel,
  setMixerParam as setMixerParamModel,
  toggleMute as toggleMuteModel,
  toggleSolo as toggleSoloModel,
  type ContinuousMixerParam,
} from "@/model/mixer";
import { findTrack } from "@/model/project";
import type { MixerSettings } from "@/model/types";
import { logChange, logValueChange } from "@/store/changeLog";
import { getProject, updateProject } from "@/store/projectStore";

const PARAM_LABELS: Readonly<Record<MixerParam, string>> = {
  gain: "volume",
  pan: "pan",
  lpf: "filter",
  room: "reverb",
};

function displayValue(param: MixerParam, mixer: MixerSettings): string {
  switch (param) {
    case "pan":
      return panLabel(mixer.pan);
    case "lpf":
      return lpfLabel(mixer.lpf);
    case "gain":
    case "room":
      return mixer[param].toFixed(2);
  }
}

function logMixerChange(trackId: string, param: MixerParam, before: MixerSettings): void {
  const track = findTrack(getProject(), trackId);
  if (!track) return;
  logValueChange({
    key: `mixer:${trackId}:${param}`,
    trackId,
    label: `${track.name} ${PARAM_LABELS[param]}`,
    from: displayValue(param, before),
    to: displayValue(param, track.mixer),
    code: formatMixerCall(param, track.mixer) ?? `${param} · default`,
  });
}

function mixerOf(trackId: string): MixerSettings | undefined {
  return findTrack(getProject(), trackId)?.mixer;
}

export function setMixerParam(trackId: string, param: ContinuousMixerParam, value: number): void {
  const before = mixerOf(trackId);
  updateProject((project) => setMixerParamModel(project, trackId, param, value));
  if (before) logMixerChange(trackId, param, before);
}

export function setLpf(trackId: string, lpf: number | null): void {
  const before = mixerOf(trackId);
  updateProject((project) => setLpfModel(project, trackId, lpf));
  if (before) logMixerChange(trackId, "lpf", before);
}

export function toggleMute(trackId: string): void {
  updateProject((project) => toggleMuteModel(project, trackId));
  const track = findTrack(getProject(), trackId);
  if (!track) return;
  logChange({
    key: `mute:${trackId}`,
    trackId,
    text: `${track.mixer.isMuted ? "Muted" : "Unmuted"} ${track.name}`,
    code: track.mixer.isMuted ? "track removed" : "track restored",
  });
}

export function toggleSolo(trackId: string): void {
  updateProject((project) => toggleSoloModel(project, trackId));
  const track = findTrack(getProject(), trackId);
  if (!track) return;
  logChange({
    key: `solo:${trackId}`,
    trackId,
    text: `${track.mixer.isSoloed ? "Soloed" : "Unsoloed"} ${track.name}`,
    code: track.mixer.isSoloed ? "other tracks removed" : "tracks restored",
  });
}
