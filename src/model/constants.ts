export const PROJECT_SCHEMA_VERSION = 2;

export const STEPS_PER_CYCLE = 16;
export const STEPS_PER_BEAT = 4;
export const BEATS_PER_CYCLE = STEPS_PER_CYCLE / STEPS_PER_BEAT;
export const CLIP_CYCLE_OPTIONS = [1, 2, 4] as const;
export const MAX_CLIP_STEPS = STEPS_PER_CYCLE * Math.max(...CLIP_CYCLE_OPTIONS);

export const BPM_RANGE = { min: 40, max: 240, default: 120 } as const;

/** Palette des pistes : les quatre premières couleurs sont celles des pistes d'un nouveau projet. */
export const TRACK_COLORS = [
  "oklch(0.78 0.14 65)",
  "oklch(0.78 0.14 150)",
  "oklch(0.78 0.14 240)",
  "oklch(0.78 0.14 320)",
  "oklch(0.78 0.14 25)",
  "oklch(0.78 0.14 195)",
  "oklch(0.78 0.14 105)",
  "oklch(0.78 0.14 280)",
] as const;

export const TRACK_PRESETS = [
  { name: "Drums", color: TRACK_COLORS[0], defaultClipKind: "steps" },
  { name: "Bass", color: TRACK_COLORS[1], defaultClipKind: "notes" },
  { name: "Lead", color: TRACK_COLORS[2], defaultClipKind: "notes" },
  { name: "Pad", color: TRACK_COLORS[3], defaultClipKind: "notes" },
] as const;

/** Nom de base d'une piste ajoutée, selon le type de clip qu'elle crée par défaut. */
export const NEW_TRACK_NAMES = { steps: "Drums", notes: "Synth", code: "Code" } as const;

export const TRACK_COUNT_RANGE = { min: 1, max: TRACK_COLORS.length } as const;

export const SCENE_NAMES = ["Intro", "Groove", "Lift", "Break", "Drop", "Outro"] as const;
export const NEW_SCENE_NAME = "Scene";
export const SCENE_COUNT_RANGE = { min: 1, max: 12 } as const;

export const MIXER_DEFAULTS = {
  gain: 1,
  pan: 0.5,
  lpf: null,
  hpf: null,
  distort: 0,
  delay: 0,
  room: 0,
  isMuted: false,
  isSoloed: false,
} as const;

export const GAIN_RANGE = { min: 0, max: 1.25 } as const;
export const PAN_RANGE = { min: 0, max: 1 } as const;
/** Fréquences de coupure des filtres passe-bas et passe-haut, en Hz. */
export const FILTER_RANGE = { min: 20, max: 20000 } as const;
export const ROOM_RANGE = { min: 0, max: 1 } as const;
/** Envoi vers l'écho : Strudel le cale sur 3/16 de cycle, avec une réinjection de 0,5. */
export const DELAY_RANGE = { min: 0, max: 1 } as const;
/** La distorsion monte vite en volume : au-delà de 5, elle sature tout. */
export const DRIVE_RANGE = { min: 0, max: 5 } as const;

/** Enveloppe d'un clip de notes, en secondes ; 0 laisse la valeur par défaut de Strudel. */
export const ATTACK_RANGE = { min: 0, max: 2 } as const;
export const RELEASE_RANGE = { min: 0, max: 4 } as const;

export const DEFAULT_VELOCITY = 1;
export const VELOCITY_RANGE = { min: 0.05, max: 1 } as const;
export const DEFAULT_CHANCE = 1;
export const CHANCE_RANGE = { min: 0.05, max: 1, step: 0.05 } as const;
export const DEFAULT_RATCHET = 1;
export const RATCHET_RANGE = { min: 1, max: 4 } as const;

/** Au-delà d'un demi-pas de retard, le contretemps rejoint le pas suivant. */
export const SWING_RANGE = { min: 0, max: 0.5 } as const;
/** Le swing travaille par paires de pas : le second de chaque paire est retardé. */
export const SWING_SLICES_PER_CYCLE = STEPS_PER_CYCLE / 2;

/**
 * Banque de samples CC0 de Kringel, hébergée sur GitHub (raw.githubusercontent.com sert les fichiers
 * avec CORS) : le code généré qui l'utilise sonne pareil une fois collé dans strudel.cc.
 */
export const KRINGEL_SAMPLES_URL = "github:Gradigang-Solutions/kringel-samples";

/** D'où viennent les sons d'un kit : chargés par défaut sur strudel.cc, ou par `samples()` depuis la banque Kringel. */
export type KitSource = "strudel" | "kringel";

export const DRUM_KITS = [
  {
    id: "RolandTR909",
    source: "strudel",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "rd"],
  },
  {
    id: "RolandTR808",
    source: "strudel",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "cb", "sh"],
  },
  {
    id: "RolandTR707",
    source: "strudel",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "cb", "tb"],
  },
  {
    id: "LinnDrum",
    source: "strudel",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "rd", "cb", "sh"],
  },
  {
    id: "Fischer808",
    source: "kringel",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "mt", "ht", "cr", "cb", "sh"],
  },
  {
    id: "SonicPiAcoustic",
    source: "kringel",
    sounds: ["bd", "sd", "hh", "oh", "lt", "mt", "ht", "cr", "rd", "cb"],
  },
  {
    id: "SonicPiElectro",
    source: "kringel",
    sounds: ["bd", "sd", "hh", "oh", "cp", "rim", "lt", "cr", "cb"],
  },
  {
    id: "KringelPercussion",
    source: "kringel",
    sounds: [
      "ta",
      "na",
      "ghe",
      "tun",
      "ke",
      "te",
      "clap",
      "snap",
      "stomp",
      "chest",
      "belly",
      "heel",
    ],
  },
  {
    id: "KringelTextures",
    source: "kringel",
    sounds: [
      "drone",
      "choir",
      "glass",
      "swoosh",
      "pad",
      "hiss",
      "scratch",
      "rewind",
      "glitch",
      "robot",
    ],
  },
] as const satisfies readonly { id: string; source: KitSource; sounds: readonly string[] }[];

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
  ta: "Tabla ta",
  na: "Tabla na",
  ghe: "Tabla ghe",
  tun: "Tabla tun",
  ke: "Tabla ke",
  te: "Tabla te",
  clap: "Hand clap",
  snap: "Finger snap",
  stomp: "Stomp",
  chest: "Chest thump",
  belly: "Belly slap",
  heel: "Heel",
  drone: "Drone",
  choir: "Choir",
  glass: "Glass hum",
  swoosh: "Swoosh",
  pad: "Pad",
  hiss: "Vinyl hiss",
  scratch: "Scratch",
  rewind: "Rewind",
  glitch: "Glitch",
  robot: "Robot",
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
