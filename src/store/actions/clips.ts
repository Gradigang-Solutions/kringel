import { clipRootCall, clipToCodeSource } from "@/codegen/clip";
import {
  createClip as createClipModel,
  deleteClip as deleteClipModel,
  duplicateClip as duplicateClipModel,
  renameClip as renameClipModel,
  replaceWithCodeClip,
} from "@/model/clips";
import {
  forgetClip,
  launchClip as launchClipModel,
  launchScene as launchSceneModel,
  stopTrack as stopTrackModel,
} from "@/model/playback";
import { clipAt, findClip, findTrack } from "@/model/project";
import type { Clip, ClipKind, SlotAddress } from "@/model/types";
import { logChange } from "@/store/changeLog";
import { nextId } from "@/store/ids";
import { getPlayback, updatePlayback } from "@/store/playbackStore";
import { getProject, updateProject } from "@/store/projectStore";
import { getUi, updateUi } from "@/store/uiStore";

function callSummary(clip: Clip): string {
  return clipRootCall(clip).replace("()", "(…)");
}

/** Sélectionne un clip ; si l'éditeur est ouvert, il passe sur ce clip. */
export function selectClip(clipId: string | null): void {
  const { editorClipId } = getUi();
  updateUi({
    selectedClipId: clipId,
    editorClipId: editorClipId === null || clipId === null ? editorClipId : clipId,
    selectedRowId: null,
    selectedNoteId: null,
  });
}

export function requestConversion(clipId: string): void {
  updateUi({ pendingConversionClipId: clipId });
}

export function cancelConversion(): void {
  updateUi({ pendingConversionClipId: null });
}

export function openEditor(clipId: string): void {
  updateUi({
    selectedClipId: clipId,
    editorClipId: clipId,
    selectedRowId: null,
    selectedNoteId: null,
  });
}

export function closeEditor(): void {
  updateUi({ editorClipId: null });
}

export function createClip(address: SlotAddress, kind: ClipKind): void {
  updateProject((project) => createClipModel(project, address, kind, nextId));
  const project = getProject();
  const clip = clipAt(project, address);
  const track = findTrack(project, address.trackId);
  if (!clip || !track) return;
  openEditor(clip.id);
  logChange({
    key: `create:${clip.id}`,
    trackId: track.id,
    text: `New clip ${track.name} › ${clip.name}`,
    code: callSummary(clip),
  });
}

export function deleteClip(clipId: string): void {
  const located = findClip(getProject(), clipId);
  if (!located) return;
  updateProject((project) => deleteClipModel(project, clipId));
  updatePlayback((playback) => forgetClip(playback, clipId));
  const { selectedClipId, editorClipId } = getUi();
  updateUi({
    selectedClipId: selectedClipId === clipId ? null : selectedClipId,
    editorClipId: editorClipId === clipId ? null : editorClipId,
  });
  logChange({
    key: `delete:${clipId}`,
    trackId: located.track.id,
    text: `Deleted ${located.track.name} › ${located.clip.name}`,
    code: `${callSummary(located.clip)} removed`,
  });
}

export function duplicateClip(clipId: string): void {
  updateProject((project) => duplicateClipModel(project, clipId, nextId));
}

export function renameClip(clipId: string, name: string): void {
  updateProject((project) => renameClipModel(project, clipId, name));
}

/** Convertit un clip de pas ou de notes en clip de code, en gardant sa place dans la lecture. */
export function convertToCode(clipId: string): void {
  updateUi({ pendingConversionClipId: null });
  const located = findClip(getProject(), clipId);
  if (!located || located.clip.kind === "code") return;
  const address = { trackId: located.track.id, sceneIndex: located.sceneIndex };
  updateProject((project) =>
    replaceWithCodeClip(project, clipId, clipToCodeSource(located.clip), nextId),
  );
  const converted = clipAt(getProject(), address);
  if (!converted) return;
  const playback = getPlayback();
  const wasPlaying = playback.playingClipIds[located.track.id] === clipId;
  updatePlayback((state) => {
    const forgotten = forgetClip(state, clipId);
    return wasPlaying
      ? {
          ...forgotten,
          playingClipIds: { ...forgotten.playingClipIds, [located.track.id]: converted.id },
        }
      : forgotten;
  });
  openEditor(converted.id);
  logChange({
    key: `convert:${clipId}`,
    trackId: located.track.id,
    text: `${located.clip.name} → code`,
    code: callSummary(converted),
  });
}

export function launchClip(trackId: string, clipId: string): void {
  updatePlayback((playback) => launchClipModel(playback, trackId, clipId));
  const located = findClip(getProject(), clipId);
  if (!located) return;
  logChange({
    key: `launch:${clipId}`,
    trackId,
    text: `Launched ${located.track.name} › ${located.clip.name}`,
    code: callSummary(located.clip),
  });
}

export function stopTrack(trackId: string): void {
  updatePlayback((playback) => stopTrackModel(playback, trackId));
}

export function launchScene(sceneIndex: number): void {
  const project = getProject();
  updatePlayback((playback) => launchSceneModel(playback, project, sceneIndex));
  const scene = project.scenes[sceneIndex];
  if (!scene) return;
  logChange({
    key: `scene:${scene.id}`,
    trackId: null,
    text: `Launched scene ${scene.name}`,
    code: "stack(…)",
  });
}
