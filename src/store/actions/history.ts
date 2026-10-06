import { forgetMissingClips } from "@/model/playback";
import { findClip } from "@/model/project";
import { updatePlayback } from "@/store/playbackStore";
import { getProject, redoProject, undoProject } from "@/store/projectStore";
import { getUi, updateUi } from "@/store/uiStore";

/** Après une annulation, la lecture et la sélection ne doivent plus viser des clips disparus. */
function forgetMissingSelection(): void {
  const project = getProject();
  const { selectedClipId, editorClipId, historyRevision } = getUi();
  const exists = (clipId: string | null) =>
    clipId !== null && findClip(project, clipId) !== undefined;
  updatePlayback((playback) => forgetMissingClips(playback, project));
  updateUi({
    selectedClipId: exists(selectedClipId) ? selectedClipId : null,
    editorClipId: exists(editorClipId) ? editorClipId : null,
    selectedRowId: null,
    selectedNoteId: null,
    historyRevision: historyRevision + 1,
  });
}

/** Renvoie false s'il n'y avait rien à annuler. */
export function undo(): boolean {
  if (!undoProject()) return false;
  forgetMissingSelection();
  return true;
}

/** Renvoie false s'il n'y avait rien à rétablir. */
export function redo(): boolean {
  if (!redoProject()) return false;
  forgetMissingSelection();
  return true;
}
