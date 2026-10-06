import { clamp } from "@/lib/math";
import {
  BPM_RANGE,
  MIXER_DEFAULTS,
  PROJECT_SCHEMA_VERSION,
  SCENE_NAMES,
  TRACK_PRESETS,
} from "@/model/constants";
import type {
  Clip,
  ClipKind,
  ClipOfKind,
  IdGenerator,
  Project,
  SlotAddress,
  Track,
} from "@/model/types";

export const UNTITLED_PROJECT_NAME = "Untitled project";

export function createProject(nextId: IdGenerator, name = UNTITLED_PROJECT_NAME): Project {
  return {
    version: PROJECT_SCHEMA_VERSION,
    id: nextId(),
    name,
    bpm: BPM_RANGE.default,
    scenes: SCENE_NAMES.map((sceneName) => ({ id: nextId(), name: sceneName })),
    tracks: TRACK_PRESETS.map((preset) => ({
      id: nextId(),
      name: preset.name,
      color: preset.color,
      mixer: MIXER_DEFAULTS,
      clips: SCENE_NAMES.map(() => null),
    })),
  };
}

export function setBpm(project: Project, bpm: number): Project {
  return { ...project, bpm: Math.round(clamp(bpm, BPM_RANGE.min, BPM_RANGE.max)) };
}

export function renameProject(project: Project, name: string): Project {
  const trimmed = name.trim();
  return trimmed === "" ? project : { ...project, name: trimmed };
}

export function hasAnyClip(project: Project): boolean {
  return project.tracks.some((track) => track.clips.some((clip) => clip !== null));
}

export function findTrack(project: Project, trackId: string): Track | undefined {
  return project.tracks.find((track) => track.id === trackId);
}

export interface LocatedClip {
  readonly track: Track;
  readonly sceneIndex: number;
  readonly clip: Clip;
}

export function findClip(project: Project, clipId: string): LocatedClip | undefined {
  for (const track of project.tracks) {
    const sceneIndex = track.clips.findIndex((clip) => clip?.id === clipId);
    const clip = track.clips[sceneIndex];
    if (clip) return { track, sceneIndex, clip };
  }
  return undefined;
}

export function clipAt(project: Project, address: SlotAddress): Clip | null {
  return findTrack(project, address.trackId)?.clips[address.sceneIndex] ?? null;
}

export function isClipOfKind<K extends ClipKind>(clip: Clip, kind: K): clip is ClipOfKind<K> {
  return clip.kind === kind;
}

export function updateTrack(
  project: Project,
  trackId: string,
  update: (track: Track) => Track,
): Project {
  return {
    ...project,
    tracks: project.tracks.map((track) => (track.id === trackId ? update(track) : track)),
  };
}

export function setSlot(project: Project, address: SlotAddress, clip: Clip | null): Project {
  return updateTrack(project, address.trackId, (track) => ({
    ...track,
    clips: track.clips.map((existing, index) => (index === address.sceneIndex ? clip : existing)),
  }));
}

export function updateClip(
  project: Project,
  clipId: string,
  update: (clip: Clip) => Clip,
): Project {
  const located = findClip(project, clipId);
  if (!located) return project;
  return setSlot(
    project,
    { trackId: located.track.id, sceneIndex: located.sceneIndex },
    update(located.clip),
  );
}

/** Applique la modification seulement si le clip est du type attendu. */
export function updateClipOfKind<K extends ClipKind>(
  project: Project,
  clipId: string,
  kind: K,
  update: (clip: ClipOfKind<K>) => ClipOfKind<K>,
): Project {
  return updateClip(project, clipId, (clip) => (isClipOfKind(clip, kind) ? update(clip) : clip));
}
