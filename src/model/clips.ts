import {
  CLIP_CYCLE_OPTIONS,
  DEFAULT_DRUM_SOUNDS,
  DEFAULT_KIT,
  STEPS_PER_CYCLE,
  SYNTH_SOUNDS,
} from "@/model/constants";
import { findClip, findTrack, setSlot } from "@/model/project";
import type {
  Clip,
  ClipKind,
  CodeClip,
  IdGenerator,
  NotesClip,
  Project,
  SlotAddress,
  StepsClip,
} from "@/model/types";
import { assertNever } from "@/lib/assertNever";

const DEFAULT_CLIP_NAMES: Readonly<Record<ClipKind, string>> = {
  steps: "Beat",
  notes: "Melody",
  code: "Code",
};

const [DEFAULT_CYCLES] = CLIP_CYCLE_OPTIONS;
const DEFAULT_ROOT = 0;

export function createStepsClip(nextId: IdGenerator, name: string): StepsClip {
  return {
    kind: "steps",
    id: nextId(),
    name,
    kit: DEFAULT_KIT,
    cycles: DEFAULT_CYCLES,
    rows: DEFAULT_DRUM_SOUNDS.map((sound) => ({
      id: nextId(),
      sound,
      isMuted: false,
      velocities: Array.from({ length: STEPS_PER_CYCLE }, () => 0),
    })),
  };
}

export function createNotesClip(nextId: IdGenerator, name: string): NotesClip {
  return {
    kind: "notes",
    id: nextId(),
    name,
    root: DEFAULT_ROOT,
    scale: "minor",
    soundSource: "synth",
    sound: SYNTH_SOUNDS[0],
    cycles: DEFAULT_CYCLES,
    notes: [],
  };
}

export function createCodeClip(nextId: IdGenerator, name: string, source = ""): CodeClip {
  return { kind: "code", id: nextId(), name, source };
}

export function createClipOfKind(kind: ClipKind, nextId: IdGenerator, name: string): Clip {
  switch (kind) {
    case "steps":
      return createStepsClip(nextId, name);
    case "notes":
      return createNotesClip(nextId, name);
    case "code":
      return createCodeClip(nextId, name);
    default:
      return assertNever(kind);
  }
}

/** Nom par défaut d'un nouveau clip : « Beat 3 » si le projet contient déjà deux clips de pas. */
export function defaultClipName(project: Project, kind: ClipKind): string {
  const sameKindCount = project.tracks
    .flatMap((track) => track.clips)
    .filter((clip) => clip?.kind === kind).length;
  return `${DEFAULT_CLIP_NAMES[kind]} ${sameKindCount + 1}`;
}

export function createClip(
  project: Project,
  address: SlotAddress,
  kind: ClipKind,
  nextId: IdGenerator,
): Project {
  const track = findTrack(project, address.trackId);
  if (!track || track.clips[address.sceneIndex] !== null) return project;
  return setSlot(project, address, createClipOfKind(kind, nextId, defaultClipName(project, kind)));
}

export function deleteClip(project: Project, clipId: string): Project {
  const located = findClip(project, clipId);
  if (!located) return project;
  return setSlot(project, { trackId: located.track.id, sceneIndex: located.sceneIndex }, null);
}

export function renameClip(project: Project, clipId: string, name: string): Project {
  const located = findClip(project, clipId);
  const trimmed = name.trim();
  if (!located || trimmed === "") return project;
  return setSlot(
    project,
    { trackId: located.track.id, sceneIndex: located.sceneIndex },
    { ...located.clip, name: trimmed },
  );
}

function withFreshIds(clip: Clip, nextId: IdGenerator): Clip {
  switch (clip.kind) {
    case "steps":
      return { ...clip, id: nextId(), rows: clip.rows.map((row) => ({ ...row, id: nextId() })) };
    case "notes":
      return {
        ...clip,
        id: nextId(),
        notes: clip.notes.map((note) => ({ ...note, id: nextId() })),
      };
    case "code":
      return { ...clip, id: nextId() };
    default:
      return assertNever(clip);
  }
}

/** Copie le clip dans le premier emplacement libre sous lui, sur la même piste. */
export function duplicateClip(project: Project, clipId: string, nextId: IdGenerator): Project {
  const located = findClip(project, clipId);
  if (!located) return project;
  const targetIndex = located.track.clips.findIndex(
    (clip, index) => index > located.sceneIndex && clip === null,
  );
  if (targetIndex === -1) return project;
  const copy = { ...withFreshIds(located.clip, nextId), name: `${located.clip.name} copy` };
  return setSlot(project, { trackId: located.track.id, sceneIndex: targetIndex }, copy);
}

/** Remplace un clip par un clip de code de même nom, à la même place. */
export function replaceWithCodeClip(
  project: Project,
  clipId: string,
  source: string,
  nextId: IdGenerator,
): Project {
  const located = findClip(project, clipId);
  if (!located) return project;
  return setSlot(
    project,
    { trackId: located.track.id, sceneIndex: located.sceneIndex },
    createCodeClip(nextId, located.clip.name, source),
  );
}

export function setCodeSource(clip: CodeClip, source: string): CodeClip {
  return { ...clip, source };
}
