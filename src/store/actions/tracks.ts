import { findTrack } from "@/model/project";
import {
  addTrack as addTrackModel,
  duplicateTrack as duplicateTrackModel,
  moveTrack as moveTrackModel,
  removeTrack as removeTrackModel,
  renameTrack as renameTrackModel,
} from "@/model/tracks";
import type { ClipKind } from "@/model/types";
import { forgetMissingReferences } from "@/store/actions/references";
import { logChange } from "@/store/changeLog";
import { nextId } from "@/store/ids";
import { getProject, updateProject } from "@/store/projectStore";

/** Chaque piste est une ligne du `stack` : c'est là que le code change. */
const STACK_CODE = "stack(…)";

export function addTrack(kind: ClipKind): void {
  const before = getProject();
  updateProject((project) => addTrackModel(project, kind, nextId));
  const added = getProject().tracks.at(-1);
  if (!added || getProject() === before) return;
  logChange({
    key: `track:add:${added.id}`,
    trackId: added.id,
    text: `New track ${added.name}`,
    code: STACK_CODE,
  });
}

export function duplicateTrack(trackId: string): void {
  const source = findTrack(getProject(), trackId);
  if (!source) return;
  updateProject((project) => duplicateTrackModel(project, trackId, nextId));
  logChange({
    key: `track:duplicate:${trackId}`,
    trackId,
    text: `Duplicated track ${source.name}`,
    code: STACK_CODE,
  });
}

export function removeTrack(trackId: string): void {
  const removed = findTrack(getProject(), trackId);
  if (!removed) return;
  updateProject((project) => removeTrackModel(project, trackId));
  forgetMissingReferences();
  logChange({
    key: `track:remove:${trackId}`,
    trackId: null,
    text: `Deleted track ${removed.name}`,
    code: STACK_CODE,
  });
}

/** Déplace la piste de `offset` colonnes (négatif : vers la gauche). */
export function moveTrack(trackId: string, offset: number): void {
  updateProject((project) => moveTrackModel(project, trackId, offset));
}

export function renameTrack(trackId: string, name: string): void {
  updateProject((project) => renameTrackModel(project, trackId, name));
}
