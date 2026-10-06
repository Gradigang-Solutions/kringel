import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { generateCode, type GeneratedCode } from "@/codegen/generate";
import { clipPlayStatus, type ClipPlayStatus, type PlaybackState } from "@/model/playback";
import { findClip, findTrack, hasAnyClip, type LocatedClip } from "@/model/project";
import type { Project, Track } from "@/model/types";
import { getPlayback, usePlaybackStore } from "@/store/playbackStore";
import { getProject, useProjectStore } from "@/store/projectStore";
import { useUiStore } from "@/store/uiStore";

let cached: { project: Project; playback: PlaybackState; code: GeneratedCode } | null = null;

/** Code généré, recalculé seulement quand le projet ou l'état de lecture changent. */
export function selectGeneratedCode(project: Project, playback: PlaybackState): GeneratedCode {
  if (cached?.project !== project || cached.playback !== playback) {
    cached = { project, playback, code: generateCode(project, playback) };
  }
  return cached.code;
}

export function getGeneratedCode(): GeneratedCode {
  return selectGeneratedCode(getProject(), getPlayback());
}

export function useGeneratedCode(): GeneratedCode {
  const project = useProjectStore((state) => state.project);
  const playback = usePlaybackStore((state) => state.playback);
  return useMemo(() => selectGeneratedCode(project, playback), [project, playback]);
}

export function useTrack(trackId: string): Track | undefined {
  return useProjectStore((state) => findTrack(state.project, trackId));
}

export function useLocatedClip(clipId: string | null): LocatedClip | undefined {
  return useProjectStore(
    useShallow((state) => (clipId === null ? undefined : findClip(state.project, clipId))),
  );
}

export function useSelectedClip(): LocatedClip | undefined {
  const selectedClipId = useUiStore((state) => state.selectedClipId);
  return useLocatedClip(selectedClipId);
}

export function useEditorClip(): LocatedClip | undefined {
  const editorClipId = useUiStore((state) => state.editorClipId);
  return useLocatedClip(editorClipId);
}

export function useClipPlayStatus(trackId: string, clipId: string): ClipPlayStatus {
  return usePlaybackStore((state) => clipPlayStatus(state.playback, trackId, clipId));
}

export function useIsPlaying(): boolean {
  return usePlaybackStore((state) => state.playback.isPlaying);
}

export function useHasAnyClip(): boolean {
  return useProjectStore((state) => hasAnyClip(state.project));
}
