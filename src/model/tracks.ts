import { insertAt, moveItem } from "@/lib/arrays";
import { uniqueName } from "@/lib/names";
import { copyClip } from "@/model/clips";
import {
  MIXER_DEFAULTS,
  NEW_TRACK_NAMES,
  TRACK_COLORS,
  TRACK_COUNT_RANGE,
} from "@/model/constants";
import { updateTrack } from "@/model/project";
import type { ClipKind, IdGenerator, Project, Track } from "@/model/types";

export function canAddTrack(project: Project): boolean {
  return project.tracks.length < TRACK_COUNT_RANGE.max;
}

export function canRemoveTrack(project: Project): boolean {
  return project.tracks.length > TRACK_COUNT_RANGE.min;
}

/** Première couleur de la palette qu'aucune piste n'utilise ; si toutes le sont, la palette reboucle. */
export function nextTrackColor(project: Project): string {
  const used = new Set(project.tracks.map((track) => track.color));
  return (
    TRACK_COLORS.find((color) => !used.has(color)) ??
    TRACK_COLORS[project.tracks.length % TRACK_COLORS.length] ??
    TRACK_COLORS[0]
  );
}

function trackNames(project: Project): string[] {
  return project.tracks.map((track) => track.name);
}

function trackIndex(project: Project, trackId: string): number {
  return project.tracks.findIndex((track) => track.id === trackId);
}

/** Ajoute une piste vide à droite, nommée d'après le type de clip qu'elle crée par défaut. */
export function addTrack(project: Project, kind: ClipKind, nextId: IdGenerator): Project {
  if (!canAddTrack(project)) return project;
  const track: Track = {
    id: nextId(),
    name: uniqueName(NEW_TRACK_NAMES[kind], trackNames(project)),
    color: nextTrackColor(project),
    defaultClipKind: kind,
    mixer: MIXER_DEFAULTS,
    clips: project.scenes.map(() => null),
  };
  return { ...project, tracks: [...project.tracks, track] };
}

/** Copie la piste juste à sa droite, avec ses clips et son mixer, dans une nouvelle couleur. */
export function duplicateTrack(project: Project, trackId: string, nextId: IdGenerator): Project {
  const index = trackIndex(project, trackId);
  const track = project.tracks[index];
  if (!track || !canAddTrack(project)) return project;
  const copy: Track = {
    ...track,
    id: nextId(),
    name: uniqueName(track.name, trackNames(project)),
    color: nextTrackColor(project),
    clips: track.clips.map((clip) => (clip === null ? null : copyClip(clip, nextId))),
  };
  return { ...project, tracks: insertAt(project.tracks, index + 1, copy) };
}

export function removeTrack(project: Project, trackId: string): Project {
  if (!canRemoveTrack(project)) return project;
  return { ...project, tracks: project.tracks.filter((track) => track.id !== trackId) };
}

/** Déplace la piste de `offset` colonnes (négatif : vers la gauche). */
export function moveTrack(project: Project, trackId: string, offset: number): Project {
  const index = trackIndex(project, trackId);
  if (index === -1) return project;
  return { ...project, tracks: moveItem(project.tracks, index, index + offset) };
}

export function renameTrack(project: Project, trackId: string, name: string): Project {
  const trimmed = name.trim();
  if (trimmed === "") return project;
  return updateTrack(project, trackId, (track) => ({ ...track, name: trimmed }));
}
