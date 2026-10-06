import { forgetMissingClips } from "@/model/playback";
import { findClip } from "@/model/project";
import { updatePlayback } from "@/store/playbackStore";
import { getProject } from "@/store/projectStore";
import { getUi, updateUi } from "@/store/uiStore";

/**
 * Après une annulation ou la suppression d'une piste ou d'une scène, la lecture et la sélection ne
 * doivent plus viser des clips disparus.
 */
export function forgetMissingReferences(): void {
  const project = getProject();
  const { selectedClipId, editorClipId } = getUi();
  const exists = (clipId: string | null) =>
    clipId !== null && findClip(project, clipId) !== undefined;
  updatePlayback((playback) => forgetMissingClips(playback, project));
  const isEditorKept = exists(editorClipId);
  updateUi({
    selectedClipId: exists(selectedClipId) ? selectedClipId : null,
    editorClipId: isEditorKept ? editorClipId : null,
    ...(isEditorKept ? {} : { selectedRowId: null, selectedNoteId: null }),
  });
}
