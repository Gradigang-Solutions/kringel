import { MIXER_DEFAULTS, STEPS_PER_CYCLE } from "@/model/constants";
import { INITIAL_PLAYBACK, type PlaybackState } from "@/model/playback";
import { createProject, setSlot } from "@/model/project";
import type {
  Clip,
  CodeClip,
  IdGenerator,
  MixerSettings,
  Note,
  NotesClip,
  Project,
  StepRow,
  StepsClip,
} from "@/model/types";

/** Générateur d'identifiants déterministe : « id-1 », « id-2 »… */
export function makeIds(prefix = "id"): IdGenerator {
  let counter = 0;
  return () => {
    counter += 1;
    return `${prefix}-${counter}`;
  };
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return { ...createProject(makeIds("p"), "Test project"), ...overrides };
}

export function trackIdAt(project: Project, trackIndex: number): string {
  return project.tracks[trackIndex]!.id;
}

export function withClip(
  project: Project,
  trackIndex: number,
  sceneIndex: number,
  clip: Clip,
): Project {
  return setSlot(project, { trackId: trackIdAt(project, trackIndex), sceneIndex }, clip);
}

export function withMixer(
  project: Project,
  trackIndex: number,
  mixer: Partial<MixerSettings>,
): Project {
  return {
    ...project,
    tracks: project.tracks.map((track, index) =>
      index === trackIndex ? { ...track, mixer: { ...MIXER_DEFAULTS, ...mixer } } : track,
    ),
  };
}

interface RowOptions {
  readonly velocity?: number;
  readonly velocities?: readonly number[];
  readonly isMuted?: boolean;
  readonly length?: number;
}

export function makeRow(
  sound: string,
  onSteps: readonly number[],
  options: RowOptions = {},
): StepRow {
  const length = options.length ?? STEPS_PER_CYCLE;
  const velocities =
    options.velocities ??
    Array.from({ length }, (_, step) => (onSteps.includes(step) ? (options.velocity ?? 1) : 0));
  return { id: `row-${sound}`, sound, isMuted: options.isMuted ?? false, velocities };
}

export function makeStepsClip(overrides: Partial<StepsClip> = {}): StepsClip {
  return {
    kind: "steps",
    id: "steps-clip",
    name: "Four on the floor",
    kit: "RolandTR909",
    cycles: 1,
    rows: [makeRow("bd", [0, 4, 8, 12])],
    ...overrides,
  };
}

export function makeNote(pitch: number, start: number, duration: number, velocity = 1): Note {
  return { id: `note-${pitch}-${start}`, pitch, start, duration, velocity };
}

export function makeNotesClip(overrides: Partial<NotesClip> = {}): NotesClip {
  return {
    kind: "notes",
    id: "notes-clip",
    name: "Root walk",
    root: 0,
    scale: "minor",
    soundSource: "synth",
    sound: "sawtooth",
    cycles: 1,
    notes: [],
    ...overrides,
  };
}

export function makeCodeClip(overrides: Partial<CodeClip> = {}): CodeClip {
  return {
    kind: "code",
    id: "code-clip",
    name: "Chords",
    source: 'chord("<Cm Ab Bb Gm>").voicing()',
    ...overrides,
  };
}

export function makePlayback(overrides: Partial<PlaybackState> = {}): PlaybackState {
  return { ...INITIAL_PLAYBACK, ...overrides };
}

/** Projet tel qu'enregistré en v1 : les pistes n'ont pas encore de type de clip par défaut. */
export function asVersion1(project: Project): unknown {
  return {
    ...project,
    version: 1,
    tracks: project.tracks.map((track) =>
      Object.fromEntries(Object.entries(track).filter(([key]) => key !== "defaultClipKind")),
    ),
  };
}
