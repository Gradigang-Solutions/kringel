import { logChange } from "@/store/changeLog";
import { forgetMissingReferences } from "@/store/actions/references";
import { redoProject, undoProject } from "@/store/projectStore";
import { getUi, updateUi } from "@/store/uiStore";

/** Les éditeurs gardent un état local (CodeMirror) : ils se recréent sur le projet restauré. */
function refreshAfterHistoryMove(): void {
  forgetMissingReferences();
  updateUi({
    selectedRowId: null,
    selectedNoteId: null,
    historyRevision: getUi().historyRevision + 1,
  });
}

/** Renvoie false s'il n'y avait rien à annuler. */
export function undo(): boolean {
  if (!undoProject()) return false;
  refreshAfterHistoryMove();
  // Sans cette ligne, le journal afficherait encore le geste qui vient d'être annulé.
  logChange({ key: "history:undo", trackId: null, text: "Undid last change", code: "⌘Z" });
  return true;
}

/** Renvoie false s'il n'y avait rien à rétablir. */
export function redo(): boolean {
  if (!redoProject()) return false;
  refreshAfterHistoryMove();
  logChange({ key: "history:redo", trackId: null, text: "Redid last change", code: "⇧⌘Z" });
  return true;
}
