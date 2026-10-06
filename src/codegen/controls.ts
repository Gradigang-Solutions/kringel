import type { MixerParam } from "@/codegen/mixer";

/** Réglage d'un clip qui écrit son propre appel dans le code. */
export type ClipSetting = "kit" | "swing" | "scale" | "sound" | "attack" | "release" | "lpf";

/** Contrôle de l'interface à l'origine d'une ligne du code généré. */
export type CodeControl =
  | { readonly kind: "mixer"; readonly param: MixerParam }
  | { readonly kind: "clip"; readonly setting: ClipSetting };

/** Un appel chaîné et le réglage du clip qui l'écrit (null s'il n'en a pas, comme `.velocity()`). */
export interface PatternCall {
  readonly code: string;
  readonly setting: ClipSetting | null;
}

/**
 * Contrôles d'une piste reliés par le survol entre le code et l'interface. Une ligne de code en
 * désigne un seul ; un bouton qui ouvre un panneau désigne tous ceux du panneau.
 */
export interface TrackControls {
  readonly trackId: string;
  readonly controls: readonly CodeControl[];
}

/** Vrai si les deux ensembles désignent au moins un même contrôle de la même piste. */
export function sharesControl(
  highlighted: TrackControls,
  trackId: string,
  controls: readonly CodeControl[],
): boolean {
  if (highlighted.trackId !== trackId) return false;
  return controls.some((control) =>
    highlighted.controls.some((candidate) => isSameControl(candidate, control)),
  );
}

export function mixerControl(param: MixerParam): CodeControl {
  return { kind: "mixer", param };
}

export function clipControl(setting: ClipSetting): CodeControl {
  return { kind: "clip", setting };
}

export function isSameControl(a: CodeControl, b: CodeControl): boolean {
  if (a.kind === "mixer") return b.kind === "mixer" && a.param === b.param;
  return b.kind === "clip" && a.setting === b.setting;
}

export function isSameTrackControls(a: TrackControls | null, b: TrackControls | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.trackId === b.trackId &&
    a.controls.length === b.controls.length &&
    a.controls.every((control, index) => {
      const other = b.controls[index];
      return other !== undefined && isSameControl(control, other);
    })
  );
}
