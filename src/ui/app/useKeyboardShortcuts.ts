import { useEffect } from "react";
import { deleteClip, duplicateClip } from "@/store/actions/clips";
import { deleteNote } from "@/store/actions/notes";
import { getUi } from "@/store/uiStore";
import { togglePlayback } from "@/ui/app/playbackController";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Suppr agit sur la note sélectionnée dans le piano roll, sinon sur le clip sélectionné. */
function deleteSelection(): boolean {
  const { selectedClipId, editorClipId, selectedNoteId } = getUi();
  if (editorClipId !== null && selectedNoteId !== null) {
    deleteNote(editorClipId, selectedNoteId);
    return true;
  }
  if (selectedClipId === null) return false;
  deleteClip(selectedClipId);
  return true;
}

/** Espace : lecture/arrêt. Suppr : supprimer la sélection. ⌘D : dupliquer le clip sélectionné. */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const { selectedClipId } = getUi();
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        if (deleteSelection()) event.preventDefault();
      } else if (event.key === "d" && (event.metaKey || event.ctrlKey) && selectedClipId) {
        event.preventDefault();
        duplicateClip(selectedClipId);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
