import { clipIds } from "@/model/project";
import type { Project } from "@/model/types";

export interface CodeError {
  readonly line: number;
  readonly column: number;
  readonly message: string;
}

/**
 * Résultat de la dernière vérification d'un clip de code. La source retenue est celle qui joue :
 * tant qu'une modification n'est pas validée, la musique garde la dernière version valide.
 */
export type CodeCheck =
  | { readonly status: "valid"; readonly source: string }
  | {
      readonly status: "invalid";
      readonly error: CodeError;
      readonly lastValidSource: string | null;
    };

/**
 * État de lecture : ni sauvegardé ni exporté.
 * Les clés des enregistrements sont des identifiants de piste ou de clip.
 */
export interface PlaybackState {
  readonly isPlaying: boolean;
  /** Clip actif de chaque piste. */
  readonly playingClipIds: Readonly<Record<string, string>>;
  /** Changement prévu au prochain cycle : un clip à lancer, ou null pour arrêter la piste. */
  readonly queuedClipIds: Readonly<Record<string, string | null>>;
  readonly codeChecks: Readonly<Record<string, CodeCheck>>;
}

export type ClipPlayStatus = "playing" | "queued" | "stopping" | "idle";

export const INITIAL_PLAYBACK: PlaybackState = {
  isPlaying: false,
  playingClipIds: {},
  queuedClipIds: {},
  codeChecks: {},
};

function withoutKey<T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));
}

/** Clip dont le code est généré pour la piste : celui en attente s'il y en a un, sinon celui qui joue. */
export function effectiveClipId(state: PlaybackState, trackId: string): string | null {
  const queued = state.queuedClipIds[trackId];
  if (queued !== undefined) return queued;
  return state.playingClipIds[trackId] ?? null;
}

export function clipPlayStatus(
  state: PlaybackState,
  trackId: string,
  clipId: string,
): ClipPlayStatus {
  const queued = state.queuedClipIds[trackId];
  const isActive = state.playingClipIds[trackId] === clipId;
  if (queued === clipId && !isActive) return "queued";
  if (isActive && queued !== undefined && queued !== clipId) return "stopping";
  return isActive ? "playing" : "idle";
}

/** Lancer un clip : immédiat à l'arrêt, au cycle suivant pendant la lecture. */
export function launchClip(state: PlaybackState, trackId: string, clipId: string): PlaybackState {
  if (!state.isPlaying) {
    return {
      ...state,
      playingClipIds: { ...state.playingClipIds, [trackId]: clipId },
      queuedClipIds: withoutKey(state.queuedClipIds, trackId),
    };
  }
  if (state.playingClipIds[trackId] === clipId) {
    return { ...state, queuedClipIds: withoutKey(state.queuedClipIds, trackId) };
  }
  return { ...state, queuedClipIds: { ...state.queuedClipIds, [trackId]: clipId } };
}

export function stopTrack(state: PlaybackState, trackId: string): PlaybackState {
  if (state.playingClipIds[trackId] === undefined) {
    return { ...state, queuedClipIds: withoutKey(state.queuedClipIds, trackId) };
  }
  if (!state.isPlaying) {
    return { ...state, playingClipIds: withoutKey(state.playingClipIds, trackId) };
  }
  return { ...state, queuedClipIds: { ...state.queuedClipIds, [trackId]: null } };
}

/** Lancer une scène : chaque piste lance son clip de la scène, ou s'arrête si l'emplacement est vide. */
export function launchScene(
  state: PlaybackState,
  project: Project,
  sceneIndex: number,
): PlaybackState {
  return project.tracks.reduce((next, track) => {
    const clip = track.clips[sceneIndex];
    return clip ? launchClip(next, track.id, clip.id) : stopTrack(next, track.id);
  }, state);
}

/** Appliquer les changements en attente, au début du cycle. */
export function commitQueued(state: PlaybackState): PlaybackState {
  const merged = { ...state.playingClipIds, ...state.queuedClipIds };
  const playing = Object.fromEntries(
    Object.entries(merged).filter((entry): entry is [string, string] => entry[1] !== null),
  );
  return { ...state, playingClipIds: playing, queuedClipIds: {} };
}

export function setPlaying(state: PlaybackState, isPlaying: boolean): PlaybackState {
  const committed = isPlaying ? state : commitQueued(state);
  return { ...committed, isPlaying };
}

/** Retire un clip supprimé ou remplacé de l'état de lecture. */
export function forgetClip(state: PlaybackState, clipId: string): PlaybackState {
  const playing = Object.fromEntries(
    Object.entries(state.playingClipIds).filter(([, id]) => id !== clipId),
  );
  const queued = Object.fromEntries(
    Object.entries(state.queuedClipIds).filter(([, id]) => id !== clipId),
  );
  return {
    ...state,
    playingClipIds: playing,
    queuedClipIds: queued,
    codeChecks: withoutKey(state.codeChecks, clipId),
  };
}

export function recordCodeCheck(
  state: PlaybackState,
  clipId: string,
  source: string,
  error: CodeError | null,
): PlaybackState {
  const check: CodeCheck =
    error === null
      ? { status: "valid", source }
      : { status: "invalid", error, lastValidSource: playedSource(state, clipId) };
  return { ...state, codeChecks: { ...state.codeChecks, [clipId]: check } };
}

/** Source qui joue pour un clip de code vérifié ; null s'il n'a jamais été valide. */
export function playedSource(state: PlaybackState, clipId: string): string | null {
  const check = state.codeChecks[clipId];
  if (check === undefined) return null;
  return check.status === "valid" ? check.source : check.lastValidSource;
}

/** Une scène est active quand chaque piste qui a un clip dans la scène joue ce clip. */
export function isSceneActive(state: PlaybackState, project: Project, sceneIndex: number): boolean {
  const sceneClips = project.tracks.flatMap((track) => {
    const clip = track.clips[sceneIndex];
    return clip ? [{ trackId: track.id, clipId: clip.id }] : [];
  });
  return (
    sceneClips.length > 0 &&
    sceneClips.every(({ trackId, clipId }) => state.playingClipIds[trackId] === clipId)
  );
}

/** Retire de l'état de lecture les clips absents du projet (après une annulation, par exemple). */
export function forgetMissingClips(state: PlaybackState, project: Project): PlaybackState {
  const existing = new Set(clipIds(project));
  const isKnown = (clipId: string | null) => clipId === null || existing.has(clipId);
  return {
    ...state,
    playingClipIds: Object.fromEntries(
      Object.entries(state.playingClipIds).filter(([, clipId]) => isKnown(clipId)),
    ),
    queuedClipIds: Object.fromEntries(
      Object.entries(state.queuedClipIds).filter(([, clipId]) => isKnown(clipId)),
    ),
    codeChecks: Object.fromEntries(
      Object.entries(state.codeChecks).filter(([clipId]) => existing.has(clipId)),
    ),
  };
}
