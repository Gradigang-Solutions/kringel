import { redo, undo } from "@/store/actions/history";
import { checkAllCodeClips } from "@/ui/app/playbackController";

/** Une annulation peut ramener une ancienne source de clip de code : elle doit être revérifiée. */
export function undoAndRecheck(): void {
  if (undo()) void checkAllCodeClips();
}

export function redoAndRecheck(): void {
  if (redo()) void checkAllCodeClips();
}
