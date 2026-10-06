import {
  DEFAULT_CHANCE,
  DEFAULT_RATCHET,
  DEFAULT_VELOCITY,
  MIXER_DEFAULTS,
  NEW_TRACK_NAMES,
  PROJECT_SCHEMA_VERSION,
  SCENE_NAMES,
  STEPS_PER_CYCLE,
  TRACK_COLORS,
  TRACK_COUNT_RANGE,
  TRACK_PRESETS,
} from "@/model/constants";
import { createStepRow } from "@/model/steps";
import type {
  Clip,
  ClipCycles,
  ClipKind,
  CodeClip,
  IdGenerator,
  MixerSettings,
  NotesClip,
  PitchClass,
  Project,
  ScaleModeId,
  SoundSource,
  StepRow,
  StepsClip,
  Track,
} from "@/model/types";

/** Identifiants stables pour les démos : « demo-warehouse-1 », « demo-warehouse-2 »… */
export function demoIds(demoId: string): IdGenerator {
  let counter = 0;
  return () => {
    counter += 1;
    return `${demoId}-${counter}`;
  };
}

export interface StepCell {
  readonly velocity: number;
  readonly chance: number;
  readonly ratchet: number;
}

const REST: StepCell = { velocity: 0, chance: DEFAULT_CHANCE, ratchet: DEFAULT_RATCHET };
const HIT: StepCell = {
  velocity: DEFAULT_VELOCITY,
  chance: DEFAULT_CHANCE,
  ratchet: DEFAULT_RATCHET,
};
const SOFT_VELOCITY = 0.65;
const GHOST_VELOCITY = 0.35;
/** Les ghost notes « ? » ne jouent qu'une fois sur deux : le motif respire d'un cycle à l'autre. */
const GHOST_CHANCE = 0.5;

/**
 * Grille texte d'une ligne de pas, un caractère par pas : `x` coup, `+` coup doux, `o` ghost note,
 * `?` ghost note jouée une fois sur deux, `2` `3` `4` coup répété (ratchet), `.` silence.
 */
const GRID_CELLS: Readonly<Record<string, StepCell>> = {
  ".": REST,
  x: HIT,
  "+": { ...HIT, velocity: SOFT_VELOCITY },
  o: { ...HIT, velocity: GHOST_VELOCITY },
  "?": { ...HIT, velocity: GHOST_VELOCITY, chance: GHOST_CHANCE },
  "2": { ...HIT, ratchet: 2 },
  "3": { ...HIT, ratchet: 3 },
  "4": { ...HIT, ratchet: 4 },
};

const GRID_SPACING = /\s/g;

/** Lit une grille texte ; les espaces ne servent qu'à grouper les pas par temps. */
export function parseStepGrid(grid: string, length: number): StepCell[] {
  const cells = Array.from(grid.replace(GRID_SPACING, ""), (char) => {
    const cell = GRID_CELLS[char];
    if (cell === undefined) throw new Error(`Unknown step "${char}" in "${grid}"`);
    return cell;
  });
  if (cells.length !== length) {
    throw new Error(`"${grid}" has ${cells.length} steps instead of ${length}`);
  }
  return cells;
}

/** Une ligne : la liste des pas allumés, ou une grille texte pour les nuances de jeu. */
export type DemoRow = readonly number[] | string;

function demoRow(
  nextId: IdGenerator,
  sound: string,
  row: DemoRow,
  length: number,
  velocity: number,
): StepRow {
  if (typeof row !== "string") {
    const velocities = Array.from({ length }, (_, step) => (row.includes(step) ? velocity : 0));
    return createStepRow(nextId(), sound, velocities);
  }
  const cells = parseStepGrid(row, length);
  return {
    ...createStepRow(
      nextId(),
      sound,
      cells.map((cell) => cell.velocity),
    ),
    chances: cells.map((cell) => cell.chance),
    ratchets: cells.map((cell) => cell.ratchet),
  };
}

/** Un clip de pas décrit son par son ; une vélocité peut être donnée aux lignes en liste de pas. */
export function stepsClip(
  nextId: IdGenerator,
  name: string,
  kit: string,
  rows: Readonly<Record<string, DemoRow>>,
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
    rows: Object.entries(rows).map(([sound, row]) =>
      demoRow(nextId, sound, row, length, options.velocities?.[sound] ?? DEFAULT_VELOCITY),
    ),
  };
}

/** [hauteur MIDI, début en pas, durée en pas, vélocité] */
export type NoteSpec = readonly [number, number, number, number?];

export interface NotesOptions {
  readonly root: PitchClass;
  readonly scale: ScaleModeId;
  readonly soundSource?: SoundSource;
  readonly sound: string;
  readonly cycles?: ClipCycles;
  readonly attack?: number;
  readonly release?: number;
  readonly lpf?: number;
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
    attack: options.attack ?? 0,
    release: options.release ?? 0,
    lpf: options.lpf ?? null,
    cycles: options.cycles ?? 1,
    notes: notes.map(([pitch, start, duration, velocity]) => ({
      id: nextId(),
      pitch,
      start,
      duration,
      velocity: velocity ?? DEFAULT_VELOCITY,
    })),
  };
}

export function codeClip(nextId: IdGenerator, name: string, source: string): CodeClip {
  return { kind: "code", id: nextId(), name, source };
}

/**
 * Une piste sans nom reprend le préréglage de sa position (Drums, Bass, Lead, Pad) ;
 * une piste nommée crée par défaut le type de son premier clip.
 */
export interface DemoTrack {
  readonly name?: string;
  readonly clips: readonly (Clip | null)[];
  readonly mixer?: Partial<MixerSettings>;
}

function trackIdentity(track: DemoTrack, index: number): Pick<Track, "name" | "defaultClipKind"> {
  const preset = TRACK_PRESETS[index];
  if (track.name === undefined && preset !== undefined) {
    return { name: preset.name, defaultClipKind: preset.defaultClipKind };
  }
  const kind: ClipKind = track.clips.find((clip) => clip !== null)?.kind ?? "steps";
  return { name: track.name ?? NEW_TRACK_NAMES[kind], defaultClipKind: kind };
}

/** Projet de démonstration : une piste par entrée, dans les couleurs de la palette, une liste de clips par scène. */
export function demoProject(
  nextId: IdGenerator,
  name: string,
  bpm: number,
  tracks: readonly DemoTrack[],
): Project {
  if (tracks.length > TRACK_COUNT_RANGE.max) {
    throw new Error(`A demo has at most ${TRACK_COUNT_RANGE.max} tracks`);
  }
  return {
    version: PROJECT_SCHEMA_VERSION,
    id: nextId(),
    name,
    bpm,
    scenes: SCENE_NAMES.map((sceneName) => ({ id: nextId(), name: sceneName })),
    tracks: tracks.map((track, index) => ({
      id: nextId(),
      ...trackIdentity(track, index),
      color: TRACK_COLORS[index] ?? TRACK_COLORS[0],
      mixer: { ...MIXER_DEFAULTS, ...track.mixer },
      clips: SCENE_NAMES.map((_, sceneIndex) => track.clips[sceneIndex] ?? null),
    })),
  };
}
