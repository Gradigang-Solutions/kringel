import { insertAt, moveItem, removeAt } from "@/lib/arrays";
import { uniqueName } from "@/lib/names";
import { copyClip } from "@/model/clips";
import { NEW_SCENE_NAME, SCENE_COUNT_RANGE } from "@/model/constants";
import type { Clip, IdGenerator, Project, Scene, Track } from "@/model/types";

/*
 * Chaque piste a un emplacement par scène : toute opération sur les scènes s'applique aussi, au
 * même indice, aux emplacements de chaque piste.
 */

export function canAddScene(project: Project): boolean {
  return project.scenes.length < SCENE_COUNT_RANGE.max;
}

export function canRemoveScene(project: Project): boolean {
  return project.scenes.length > SCENE_COUNT_RANGE.min;
}

function sceneNames(project: Project): string[] {
  return project.scenes.map((scene) => scene.name);
}

function mapSlots(
  project: Project,
  update: (clips: readonly (Clip | null)[]) => (Clip | null)[],
): readonly Track[] {
  return project.tracks.map((track) => ({ ...track, clips: update(track.clips) }));
}

/** Ajoute une scène vide en bas de la grille. */
export function addScene(project: Project, nextId: IdGenerator): Project {
  if (!canAddScene(project)) return project;
  const name = uniqueName(`${NEW_SCENE_NAME} ${project.scenes.length + 1}`, sceneNames(project));
  return {
    ...project,
    scenes: [...project.scenes, { id: nextId(), name }],
    tracks: mapSlots(project, (clips) => [...clips, null]),
  };
}

/** Copie la scène juste en dessous, avec une copie indépendante de chacun de ses clips. */
export function duplicateScene(project: Project, sceneIndex: number, nextId: IdGenerator): Project {
  const scene = project.scenes[sceneIndex];
  if (!scene || !canAddScene(project)) return project;
  const copy: Scene = { id: nextId(), name: uniqueName(scene.name, sceneNames(project)) };
  return {
    ...project,
    scenes: insertAt(project.scenes, sceneIndex + 1, copy),
    tracks: mapSlots(project, (clips) => {
      const clip = clips[sceneIndex] ?? null;
      return insertAt(clips, sceneIndex + 1, clip === null ? null : copyClip(clip, nextId));
    }),
  };
}

export function removeScene(project: Project, sceneIndex: number): Project {
  if (!project.scenes[sceneIndex] || !canRemoveScene(project)) return project;
  return {
    ...project,
    scenes: removeAt(project.scenes, sceneIndex),
    tracks: mapSlots(project, (clips) => removeAt(clips, sceneIndex)),
  };
}

/** Déplace la scène de `offset` lignes (négatif : vers le haut), avec ses clips. */
export function moveScene(project: Project, sceneIndex: number, offset: number): Project {
  if (!project.scenes[sceneIndex]) return project;
  const target = sceneIndex + offset;
  return {
    ...project,
    scenes: moveItem(project.scenes, sceneIndex, target),
    tracks: mapSlots(project, (clips) => moveItem(clips, sceneIndex, target)),
  };
}

export function renameScene(project: Project, sceneIndex: number, name: string): Project {
  const trimmed = name.trim();
  if (trimmed === "" || !project.scenes[sceneIndex]) return project;
  return {
    ...project,
    scenes: project.scenes.map((scene, index) =>
      index === sceneIndex ? { ...scene, name: trimmed } : scene,
    ),
  };
}
