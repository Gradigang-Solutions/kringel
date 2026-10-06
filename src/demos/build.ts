import {
  MIXER_DEFAULTS,
  PROJECT_SCHEMA_VERSION,
  SCENE_NAMES,
  STEPS_PER_CYCLE,
  TRACK_PRESETS,
} from "@/model/constants";
import { createStepRow } from "@/model/steps";
import type {
  Clip,
  ClipCycles,
  CodeClip,
  IdGenerator,
  MixerSettings,
  NotesClip,
  PitchClass,
  Project,
  ScaleModeId,
  SoundSource,
  StepsClip,
} from "@/model/types";

/** Identifiants stables pour les démos : « demo-techno-1 », « demo-techno-2 »… */
export function demoIds(demoId: string): IdGenerator {
  let counter = 0;
  return () => {
    counter += 1;
    return `${demoId}-${counter}`;
  };
}

/** Un clip de pas décrit par les pas allumés de chaque son ; une vélocité peut être donnée par pas. */
export function stepsClip(
  nextId: IdGenerator,
  name: string,
  kit: string,
  rows: Readonly<Record<string, readonly number[]>>,
  options: {
    readonly cycles?: ClipCycles;
    readonly velocities?: Readonly<Record<string, number>>;
    readonly swing?: number;
  } = {},
): StepsClip {
  const cycles = options.cycles ?? 1;
  const length = cycles * STEPS_PER_CYCLE;
  return {
    kind: "steps",
    id: nextId(),
    name,
    kit,
    cycles,
    swing: options.swing ?? 0,
    rows: Object.entries(rows).map(([sound, steps]) =>
      createStepRow(
        nextId(),
        sound,
        Array.from({ length }, (_, step) =>
          steps.includes(step) ? (options.velocities?.[sound] ?? 1) : 0,
        ),
      ),
    ),
  };
}

/** [hauteur MIDI, début en pas, durée en pas] */
export type NoteSpec = readonly [number, number, number];

export interface NotesOptions {
  readonly root: PitchClass;
  readonly scale: ScaleModeId;
  readonly soundSource?: SoundSource;
  readonly sound: string;
  readonly cycles?: ClipCycles;
}

export function notesClip(
  nextId: IdGenerator,
  name: string,
  options: NotesOptions,
  notes: readonly NoteSpec[],
): NotesClip {
  return {
    kind: "notes",
    id: nextId(),
    name,
    root: options.root,
    scale: options.scale,
    soundSource: options.soundSource ?? "synth",
    sound: options.sound,
    cycles: options.cycles ?? 1,
    notes: notes.map(([pitch, start, duration]) => ({
      id: nextId(),
      pitch,
      start,
      duration,
      velocity: 1,
    })),
  };
}

export function codeClip(nextId: IdGenerator, name: string, source: string): CodeClip {
  return { kind: "code", id: nextId(), name, source };
}

export interface DemoTrack {
  readonly clips: readonly (Clip | null)[];
  readonly mixer?: Partial<MixerSettings>;
}

/** Projet de démonstration : 4 pistes dans l'ordre des préréglages, une liste de clips par scène. */
export function demoProject(
  nextId: IdGenerator,
  name: string,
  bpm: number,
  tracks: readonly DemoTrack[],
): Project {
  return {
    version: PROJECT_SCHEMA_VERSION,
    id: nextId(),
    name,
    bpm,
    scenes: SCENE_NAMES.map((sceneName) => ({ id: nextId(), name: sceneName })),
    tracks: TRACK_PRESETS.map((preset, index) => ({
      id: nextId(),
      name: preset.name,
      color: preset.color,
      defaultClipKind: preset.defaultClipKind,
      mixer: { ...MIXER_DEFAULTS, ...tracks[index]?.mixer },
      clips: SCENE_NAMES.map((_, sceneIndex) => tracks[index]?.clips[sceneIndex] ?? null),
    })),
  };
}
