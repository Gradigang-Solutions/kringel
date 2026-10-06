import { setCodeSource as setCodeSourceModel } from "@/model/clips";
import { recordCodeCheck as recordCodeCheckModel, type CodeError } from "@/model/playback";
import { findClip, updateClipOfKind } from "@/model/project";
import { logChange } from "@/store/changeLog";
import { updatePlayback } from "@/store/playbackStore";
import { getProject, updateProject } from "@/store/projectStore";
import { updateUi } from "@/store/uiStore";

export function setCodeSource(clipId: string, source: string): void {
  updateProject((project) =>
    updateClipOfKind(project, clipId, "code", (clip) => setCodeSourceModel(clip, source)),
  );
}

/** Enregistre le résultat d'une vérification : la source valide joue, sinon la dernière version valide. */
export function recordCodeCheck(
  clipId: string,
  source: string,
  error: CodeError | null,
  shouldLog = true,
): void {
  updatePlayback((playback) => recordCodeCheckModel(playback, clipId, source, error));
  if (!shouldLog) return;
  const located = findClip(getProject(), clipId);
  if (!located) return;
  logChange({
    key: `code:${clipId}`,
    trackId: located.track.id,
    text: `Edited ${located.track.name} › ${located.clip.name}`,
    code: error === null ? "code updated" : "syntax error",
    isError: error !== null,
  });
}

export function setRunAsYouType(isRunAsYouType: boolean): void {
  updateUi({ isRunAsYouType });
}
