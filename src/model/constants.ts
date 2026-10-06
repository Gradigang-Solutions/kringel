export const PROJECT_SCHEMA_VERSION = 1;

export const STEPS_PER_CYCLE = 16;
export const STEPS_PER_BEAT = 4;
export const BEATS_PER_CYCLE = STEPS_PER_CYCLE / STEPS_PER_BEAT;
export const CLIP_CYCLE_OPTIONS = [1, 2, 4] as const;
export const MAX_CLIP_STEPS = STEPS_PER_CYCLE * Math.max(...CLIP_CYCLE_OPTIONS);

export const BPM_RANGE = { min: 40, max: 240, default: 120 } as const;

export const TRACK_PRESETS = [
  { name: "Drums", color: "oklch(0.78 0.14 65)", defaultClipKind: "steps" },
  { name: "Bass", color: "oklch(0.78 0.14 150)", defaultClipKind: "notes" },
  { name: "Lead", color: "oklch(0.78 0.14 240)", defaultClipKind: "notes" },
  { name: "Pad", color: "oklch(0.78 0.14 320)", defaultClipKind: "notes" },
] as const;

export const SCENE_NAMES = ["Intro", "Groove", "Lift", "Break", "Drop", "Outro"] as const;

export const MIXER_DEFAULTS = {
  gain: 1,
  pan: 0.5,
  lpf: null,
  room: 0,
  isMuted: false,
  isSoloed: false,
} as const;

export const GAIN_RANGE = { min: 0, max: 1.25 } as const;
export const PAN_RANGE = { min: 0, max: 1 } as const;
export const LPF_RANGE = { min: 20, max: 20000 } as const;
export const ROOM_RANGE = { min: 0, max: 1 } as const;

export const DEFAULT_VELOCITY = 1;
export const VELOCITY_RANGE = { min: 0.05, max: 1 } as const;

export const DRUM_KITS = [
  {
    id: "RolandTR909",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "rd"],
  },
  {
    id: "RolandTR808",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "cb", "sh"],
  },
  {
    id: "RolandTR707",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "cb", "tb"],
  },
  {
    id: "LinnDrum",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "rd", "cb", "sh"],
  },
] as const;

export const DEFAULT_KIT = "RolandTR909";
export const DEFAULT_DRUM_SOUNDS = ["bd", "sd", "hh", "cp"] as const;

export const DRUM_SOUND_NAMES: Readonly<Record<string, string>> = {
  bd: "Kick",
  sd: "Snare",
  hh: "Hi-hat",
  oh: "Open hat",
  cp: "Clap",
  rim: "Rim",
  lt: "Low tom",
  mt: "Mid tom",
  ht: "High tom",
  cr: "Crash",
  rd: "Ride",
  cb: "Cowbell",
  sh: "Shaker",
  tb: "Tambourine",
};

export const SOUND_SOURCES = ["synth", "sample"] as const;
export const SYNTH_SOUNDS = ["triangle", "sawtooth", "square", "sine", "supersaw"] as const;
export const SAMPLE_SOUNDS = ["piano", "harp", "sax", "organ_full", "ocarina"] as const;

export const PITCH_CLASS_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

/** Les identifiants sont les noms de gamme de Strudel (tonal), avec « : » à la place des espaces. */
export const SCALE_MODES = [
  { id: "major", label: "Major", intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: "minor", label: "Minor", intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: "dorian", label: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: "phrygian", label: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: "lydian", label: "Lydian", intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: "mixolydian", label: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: "harmonic:minor", label: "Harmonic minor", intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: "major:pentatonic", label: "Major pentatonic", intervals: [0, 2, 4, 7, 9] },
  { id: "minor:pentatonic", label: "Minor pentatonic", intervals: [0, 3, 5, 7, 10] },
] as const;

export const NOTE_RANGE = { min: 24, max: 95 } as const;
export const DEFAULT_ANCHOR_OCTAVE = 4;
export const SEMITONES_PER_OCTAVE = 12;

export const DEFAULT_NOTE_DURATION = 2;
