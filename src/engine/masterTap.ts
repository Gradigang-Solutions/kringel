import { getSuperdoughAudioController } from "@strudel/webaudio";

/**
 * Sortie master de Strudel, juste avant les haut-parleurs. Le vumètre et l'enregistreur s'y
 * branchent en parallèle, sans rien changer au son. Strudel ne la recrée qu'après un rendu hors
 * ligne, que l'application n'utilise pas.
 */
export function masterOutput(): AudioNode | null {
  return getSuperdoughAudioController().output.destinationGain;
}
