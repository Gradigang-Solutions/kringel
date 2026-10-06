import * as core from "@strudel/core";
import * as mini from "@strudel/mini";
import * as tonal from "@strudel/tonal";
import * as webaudio from "@strudel/webaudio";

let scope: Promise<unknown> | null = null;

/** Rend les fonctions de Strudel disponibles pour l'évaluation du code, sans démarrer l'audio. */
export function ensureScope(): Promise<unknown> {
  scope ??= core.evalScope(
    Promise.resolve(core),
    Promise.resolve(mini),
    Promise.resolve(tonal),
    Promise.resolve(webaudio),
  );
  return scope;
}
