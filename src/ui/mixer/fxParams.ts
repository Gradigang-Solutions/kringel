import { MIXER_DEFAULTS } from "@/model/constants";
import type { MixerSettings } from "@/model/types";

/** Effets rangés derrière le bouton FX de la tranche. */
export const FX_PARAMS = ["hpf", "distort", "delay"] as const;

/** Nombre d'effets du panneau FX qui s'écartent de leur valeur par défaut. */
export function activeFxCount(mixer: MixerSettings): number {
  return FX_PARAMS.filter((param) => mixer[param] !== MIXER_DEFAULTS[param]).length;
}
