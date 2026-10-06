/** Explication courte d'une fonction Strudel, avec le lien vers sa documentation. */
export interface StrudelDoc {
  readonly name: string;
  readonly summary: string;
  readonly url: string;
}

const DOCS_URL = "https://strudel.cc";

/** Les fonctions qu'écrit le générateur, plus les plus courantes des clips de code. */
const FUNCTION_DOCS: Readonly<Record<string, Omit<StrudelDoc, "name">>> = {
  s: {
    summary: "Plays a sound by name: a sample (bd, piano) or a synth waveform (sawtooth).",
    url: "/learn/samples/#default-samples",
  },
  sound: {
    summary: "Long form of s(): plays a sound by name.",
    url: "/learn/samples/#default-samples",
  },
  bank: {
    summary: "Picks the drum machine whose samples play: bd becomes RolandTR909_bd.",
    url: "/learn/samples/#sound-banks",
  },
  samples: {
    summary: "Loads a sample library from a strudel.json file, here from a GitHub repository.",
    url: "/learn/samples/#github-shortcut",
  },
  note: {
    summary: "Plays pitches written as note names (c4, eb3) or MIDI numbers.",
    url: "/learn/notes/",
  },
  n: {
    summary: "Plays numbers: scale degrees once .scale() is set, or sample variants.",
    url: "/learn/tonal/#scalename",
  },
  scale: {
    summary: "Turns the numbers from n() into notes of a scale, from a root note.",
    url: "/learn/tonal/#scalename",
  },
  velocity: {
    summary: "How hard each note is hit, from 0 to 1. Multiplies the gain.",
    url: "/learn/effects/#velocity",
  },
  swingBy: {
    summary: "Delays every second slice of the cycle: swingBy(amount, slices) gives a shuffle.",
    url: "/learn/time-modifiers/#swingby",
  },
  stack: {
    summary: "Plays several patterns at the same time, one per track here.",
    url: "/learn/factories/#stack",
  },
  setcpm: {
    summary: "Sets the tempo in cycles per minute. 120 BPM in 4/4 is 120/4 cycles per minute.",
    url: "/understand/cycles/#setting-cpm",
  },
  lpf: {
    summary: "Low-pass filter: cuts the frequencies above this cutoff, in Hz. Lower is darker.",
    url: "/learn/effects/#lpf",
  },
  hpf: {
    summary: "High-pass filter: cuts the frequencies below this cutoff, in Hz. Higher is thinner.",
    url: "/learn/effects/#hpf",
  },
  room: {
    summary: "Reverb amount, from 0 (dry) to 1. Sends the sound to a shared reverb.",
    url: "/learn/effects/#room",
  },
  delay: {
    summary: "Echo amount, from 0 to 1. The echo repeats every 3/16 of a cycle by default.",
    url: "/learn/effects/#delay",
  },
  distort: {
    summary: "Distortion amount. Small values add grit, large ones saturate.",
    url: "/learn/effects/#distort",
  },
  pan: {
    summary: "Stereo position, from 0 (left) to 1 (right). 0.5 is the center.",
    url: "/learn/effects/#pan",
  },
  gain: {
    summary: "Volume of the sound. 1 is unchanged; above 1 gets louder.",
    url: "/learn/effects/#gain",
  },
  attack: {
    summary: "Time in seconds for each note to fade in. Long attacks make pads swell.",
    url: "/learn/effects/#attack",
  },
  release: {
    summary: "Time in seconds for each note to fade out after it ends.",
    url: "/learn/effects/#release",
  },
};

export const MINI_NOTATION_DOC: StrudelDoc = {
  name: "Mini-notation",
  summary:
    "A rhythm written as text: spaces split the cycle into steps, ~ is a rest, * repeats, ? may skip a hit, < > alternates from cycle to cycle.",
  url: `${DOCS_URL}/learn/mini-notation/`,
};

/** Documentation d'une fonction Strudel par son nom, ou null si elle n'est pas connue. */
export function docFor(name: string): StrudelDoc | null {
  if (!Object.hasOwn(FUNCTION_DOCS, name)) return null;
  const doc = FUNCTION_DOCS[name];
  if (doc === undefined) return null;
  return { name: `${name}()`, summary: doc.summary, url: `${DOCS_URL}${doc.url}` };
}
