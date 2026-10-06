import { BEATS_PER_CYCLE } from "@/model/constants";
import { INITIAL_PLAYBACK } from "@/model/playback";
import {
  createProject,
  renameProject as renameProjectModel,
  setBpm as setBpmModel,
} from "@/model/project";
import type { Project } from "@/model/types";
import { clearChanges, logValueChange } from "@/store/changeLog";
import { nextId } from "@/store/ids";
import { updatePlayback } from "@/store/playbackStore";
import { getProject, replaceProject, updateProject, type SaveStatus } from "@/store/projectStore";
import { INITIAL_UI, updateUi } from "@/store/uiStore";

/** Remplace le projet courant (démo, import, chargement) et repart d'un état de lecture vide. */
export function loadProject(project: Project, saveStatus: SaveStatus = "pending"): void {
  replaceProject(project, saveStatus);
  updatePlayback(() => INITIAL_PLAYBACK);
  updateUi({
    selectedClipId: null,
    editorClipId: null,
    selectedRowId: null,
    selectedNoteId: null,
    notice: INITIAL_UI.notice,
  });
  clearChanges();
}

export function newProject(): void {
  loadProject(createProject(nextId), "never");
}

export function setBpm(bpm: number): void {
  const before = getProject().bpm;
  updateProject((project) => setBpmModel(project, bpm), "bpm");
  const after = getProject().bpm;
  if (after === before) return;
  logValueChange({
    key: "bpm",
    trackId: null,
    label: "Tempo",
    from: String(before),
    to: String(after),
    code: `setcpm(${after}/${BEATS_PER_CYCLE})`,
  });
}

export function renameProject(name: string): void {
  updateProject((project) => renameProjectModel(project, name));
}

export function showNotice(notice: string | null): void {
  updateUi({ notice });
}
