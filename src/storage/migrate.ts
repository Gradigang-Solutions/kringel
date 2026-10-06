import { PROJECT_SCHEMA_VERSION, TRACK_PRESETS } from "@/model/constants";
import type { Project } from "@/model/types";
import { projectSchema } from "@/storage/schema";

const OLDEST_SUPPORTED_VERSION = 1;

export function isSupportedVersion(version: number): boolean {
  return version >= OLDEST_SUPPORTED_VERSION && version <= PROJECT_SCHEMA_VERSION;
}

/**
 * v1 → v2 : les pistes gagnent leur type de clip par défaut. Un projet v1 a toujours les pistes
 * des préréglages, dans l'ordre, puisqu'on ne pouvait ni en ajouter, ni en déplacer.
 */
function upgradeFromV1(project: Project): Project {
  return {
    ...project,
    tracks: project.tracks.map((track, index) => ({
      ...track,
      defaultClipKind: TRACK_PRESETS[index]?.defaultClipKind ?? track.defaultClipKind,
    })),
  };
}

/** Valide un projet enregistré dans une version donnée, puis le met au format courant. */
export function parseVersionedProject(version: number, data: unknown): Project | null {
  if (!isSupportedVersion(version)) return null;
  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) return null;
  const project = version === OLDEST_SUPPORTED_VERSION ? upgradeFromV1(parsed.data) : parsed.data;
  return { ...project, version: PROJECT_SCHEMA_VERSION };
}
