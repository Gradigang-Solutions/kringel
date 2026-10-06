import { DRUM_KITS, type KitSource } from "@/model/constants";
import type { Project } from "@/model/types";

export function kitSource(kitId: string): KitSource | null {
  return DRUM_KITS.find((kit) => kit.id === kitId)?.source ?? null;
}

export function kitSounds(kitId: string): readonly string[] {
  return DRUM_KITS.find((kit) => kit.id === kitId)?.sounds ?? [];
}

/** Un kit inconnu (projet importé) ne signale rien : on ne sait pas ce qu'il contient. */
export function isSoundInKit(kitId: string, sound: string): boolean {
  const sounds = kitSounds(kitId);
  return sounds.length === 0 || sounds.includes(sound);
}

/** Vrai si un clip de pas du projet joue un kit de la banque Kringel, à charger dans le code. */
export function usesKringelSamples(project: Project): boolean {
  return project.tracks.some((track) =>
    track.clips.some((clip) => clip?.kind === "steps" && kitSource(clip.kit) === "kringel"),
  );
}
