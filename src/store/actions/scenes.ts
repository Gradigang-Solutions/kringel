import {
  addScene as addSceneModel,
  duplicateScene as duplicateSceneModel,
  moveScene as moveSceneModel,
  removeScene as removeSceneModel,
  renameScene as renameSceneModel,
} from "@/model/scenes";
import { forgetMissingReferences } from "@/store/actions/references";
import { logChange } from "@/store/changeLog";
import { nextId } from "@/store/ids";
import { getProject, updateProject } from "@/store/projectStore";

/** Les scènes n'apparaissent pas dans le code : seule la lecture de leurs clips l'écrit. */
const NO_CODE = "no code change";

export function addScene(): void {
  const before = getProject();
  updateProject((project) => addSceneModel(project, nextId));
  const added = getProject().scenes.at(-1);
  if (!added || getProject() === before) return;
  logChange({
    key: `scene:add:${added.id}`,
    trackId: null,
    text: `New scene ${added.name}`,
    code: NO_CODE,
  });
}

export function duplicateScene(sceneIndex: number): void {
  const source = getProject().scenes[sceneIndex];
  if (!source) return;
  updateProject((project) => duplicateSceneModel(project, sceneIndex, nextId));
  logChange({
    key: `scene:duplicate:${source.id}`,
    trackId: null,
    text: `Duplicated scene ${source.name}`,
    code: NO_CODE,
  });
}

export function removeScene(sceneIndex: number): void {
  const removed = getProject().scenes[sceneIndex];
  if (!removed) return;
  updateProject((project) => removeSceneModel(project, sceneIndex));
  forgetMissingReferences();
  logChange({
    key: `scene:remove:${removed.id}`,
    trackId: null,
    text: `Deleted scene ${removed.name}`,
    code: NO_CODE,
  });
}

/** Déplace la scène de `offset` lignes (négatif : vers le haut). */
export function moveScene(sceneIndex: number, offset: number): void {
  updateProject((project) => moveSceneModel(project, sceneIndex, offset));
}

export function renameScene(sceneIndex: number, name: string): void {
  updateProject((project) => renameSceneModel(project, sceneIndex, name));
}
