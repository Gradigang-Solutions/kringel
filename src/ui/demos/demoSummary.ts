import { clipToCodeSource } from "@/codegen/clip";
import type { Project } from "@/model/types";

const PREFERRED_SCENE = 1;

export interface DemoLane {
  readonly trackId: string;
  readonly color: string;
  readonly filledScenes: readonly boolean[];
}

export interface DemoSummary {
  readonly lanes: readonly DemoLane[];
  readonly usedTrackNames: readonly string[];
  readonly snippet: string;
}

/** Extrait de code représentatif : le premier clip de la deuxième scène, sinon le premier clip du projet. */
function representativeSnippet(project: Project): string {
  const inPreferredScene = project.tracks
    .map((track) => track.clips[PREFERRED_SCENE])
    .find(Boolean);
  const clip = inPreferredScene ?? project.tracks.flatMap((track) => track.clips).find(Boolean);
  return clip ? (clipToCodeSource(clip).split("\n")[0] ?? "") : "";
}

/** Résumé d'une démo pour sa carte : occupation de la grille, pistes utilisées, extrait de code. */
export function summarizeDemo(project: Project): DemoSummary {
  return {
    lanes: project.tracks.map((track) => ({
      trackId: track.id,
      color: track.color,
      filledScenes: track.clips.map((clip) => clip !== null),
    })),
    usedTrackNames: project.tracks
      .filter((track) => track.clips.some(Boolean))
      .map((track) => track.name),
    snippet: representativeSnippet(project),
  };
}
