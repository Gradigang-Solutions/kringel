import { formatNumber, method } from "@/codegen/format";
import { MIXER_DEFAULTS } from "@/model/constants";
import type { MixerSettings } from "@/model/types";

export type MixerParam = "gain" | "pan" | "lpf" | "room";

/** Ordre d'écriture : effets d'abord, niveau en dernier. */
const PARAM_ORDER: readonly MixerParam[] = ["lpf", "room", "pan", "gain"];

/** L'appel écrit par un réglage du mixer, ou null s'il garde sa valeur par défaut. */
export function formatMixerCall(param: MixerParam, mixer: MixerSettings): string | null {
  const value = mixer[param];
  if (value === null || value === MIXER_DEFAULTS[param]) return null;
  return method(param, formatNumber(value));
}

export function mixerCalls(mixer: MixerSettings): string[] {
  return PARAM_ORDER.flatMap((param) => formatMixerCall(param, mixer) ?? []);
}
