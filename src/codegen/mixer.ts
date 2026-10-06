import { formatNumber, method } from "@/codegen/format";
import { MIXER_DEFAULTS } from "@/model/constants";
import type { MixerSettings } from "@/model/types";

export type MixerParam = "gain" | "pan" | "lpf" | "hpf" | "distort" | "delay" | "room";

/** Ordre d'écriture : timbre (filtres, distorsion), puis envois (écho, reverb), niveau en dernier. */
const PARAM_ORDER: readonly MixerParam[] = [
  "hpf",
  "lpf",
  "distort",
  "delay",
  "room",
  "pan",
  "gain",
];

/** L'appel écrit par un réglage du mixer, ou null s'il garde sa valeur par défaut. */
export function formatMixerCall(param: MixerParam, mixer: MixerSettings): string | null {
  const value = mixer[param];
  if (value === null || value === MIXER_DEFAULTS[param]) return null;
  return method(param, formatNumber(value));
}

export interface MixerCall {
  readonly code: string;
  readonly param: MixerParam;
}

export function mixerCalls(mixer: MixerSettings): MixerCall[] {
  return PARAM_ORDER.flatMap((param) => {
    const code = formatMixerCall(param, mixer);
    return code === null ? [] : [{ code, param }];
  });
}
