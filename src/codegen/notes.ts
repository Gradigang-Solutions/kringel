import { formatNumber, call, method, quote } from "@/codegen/format";
import { alternateCycles, eventsInCycle, voiceToMini, type MiniEvent } from "@/codegen/mini";
import type { PatternCall } from "@/codegen/controls";
import { optionalCall, settingCall, type ClipPattern } from "@/codegen/pattern";
import { range } from "@/lib/math";
import { DEFAULT_VELOCITY, STEPS_PER_CYCLE } from "@/model/constants";
import {
  anchorOctaveFor,
  isInScale,
  scaleDegree,
  strudelNoteName,
  strudelScaleName,
} from "@/model/scales";
import type { EnvelopeParam } from "@/model/notes";
import type { Note, NotesClip } from "@/model/types";

const MELODIC = { ignoreDurations: false } as const;

interface Chord {
  readonly start: number;
  readonly duration: number;
  readonly notes: readonly Note[];
}

/** Les notes qui commencent et finissent ensemble forment un accord « [a,b] ». */
function groupChords(notes: readonly Note[]): Chord[] {
  const chords = new Map<string, Chord>();
  for (const note of notes) {
    const key = `${note.start}:${note.duration}`;
    const existing = chords.get(key);
    chords.set(key, {
      start: note.start,
      duration: note.duration,
      notes: [...(existing?.notes ?? []), note],
    });
  }
  return [...chords.values()].sort((a, b) => a.start - b.start);
}

/** Répartit les accords en voix qui ne se chevauchent pas. */
function splitVoices(chords: readonly Chord[]): Chord[][] {
  const voices: Chord[][] = [];
  for (const chord of chords) {
    const voice = voices.find((candidate) => {
      const last = candidate.at(-1);
      return last !== undefined && last.start + last.duration <= chord.start;
    });
    if (voice) voice.push(chord);
    else voices.push([chord]);
  }
  return voices;
}

type NoteToken = (note: Note) => string;

function chordToken(chord: Chord, token: NoteToken): string {
  const tokens = [...chord.notes].sort((a, b) => a.pitch - b.pitch).map(token);
  return tokens.length === 1 ? (tokens[0] ?? "~") : `[${tokens.join(",")}]`;
}

function cycleMini(notes: readonly Note[], token: NoteToken): string {
  const voices = splitVoices(groupChords(notes)).map((voice) => {
    const events: MiniEvent[] = voice.map((chord) => ({
      start: chord.start,
      duration: chord.duration,
      token: chordToken(chord, token),
    }));
    return voiceToMini(events, STEPS_PER_CYCLE, MELODIC);
  });
  return voices.length === 0 ? "~" : voices.join(", ");
}

function clipMini(clip: NotesClip, token: NoteToken): string {
  return alternateCycles(
    range(clip.cycles).map((cycle) =>
      cycleMini(eventsInCycle(clip.notes, cycle, STEPS_PER_CYCLE), token),
    ),
  );
}

export function usesScaleDegrees(clip: NotesClip): boolean {
  return clip.notes.every((note) => isInScale(note.pitch, clip.root, clip.scale));
}

function velocityCode(clip: NotesClip): string | null {
  const velocities = new Set(clip.notes.map((note) => note.velocity));
  const [single] = velocities;
  if (velocities.size === 1 && single === DEFAULT_VELOCITY) return null;
  if (velocities.size === 1 && single !== undefined)
    return method("velocity", formatNumber(single));
  return method("velocity", quote(clipMini(clip, (note) => formatNumber(note.velocity))));
}

function velocityCalls(clip: NotesClip): PatternCall[] {
  return optionalCall(velocityCode(clip), null);
}

export function soundCall(sound: string): string {
  return method("s", quote(sound));
}

/** Appel d'enveloppe, ou null quand le clip garde la valeur par défaut de Strudel. */
export function envelopeCall(param: EnvelopeParam, seconds: number): string | null {
  return seconds === 0 ? null : method(param, formatNumber(seconds));
}

/** Passe-bas du clip, ou null quand il est ouvert. */
export function clipFilterCall(cutoff: number | null): string | null {
  return cutoff === null ? null : method("lpf", formatNumber(cutoff));
}

/** Son du clip après la source : enveloppe puis filtre, sans les valeurs par défaut. */
function toneCalls(clip: NotesClip): PatternCall[] {
  return [
    ...optionalCall(envelopeCall("attack", clip.attack), "attack"),
    ...optionalCall(envelopeCall("release", clip.release), "release"),
    ...optionalCall(clipFilterCall(clip.lpf), "lpf"),
  ];
}

/** Notes dans la gamme : degrés avec `n().scale()` ; sinon noms de notes avec `note()`. */
export function notesPattern(clip: NotesClip): ClipPattern | null {
  if (clip.notes.length === 0) return null;
  const sound = settingCall(soundCall(clip.sound), "sound");
  if (!usesScaleDegrees(clip)) {
    const mini = clipMini(clip, (note) => strudelNoteName(note.pitch));
    return {
      source: [call("note", quote(mini))],
      calls: [...velocityCalls(clip), sound, ...toneCalls(clip)],
    };
  }
  const octave = anchorOctaveFor(
    clip.notes.map((note) => note.pitch),
    clip.root,
  );
  const mini = clipMini(clip, (note) =>
    String(scaleDegree(note.pitch, clip.root, clip.scale, octave) ?? 0),
  );
  const scale = settingCall(
    method("scale", quote(strudelScaleName(clip.root, clip.scale, octave))),
    "scale",
  );
  return {
    source: [call("n", quote(mini))],
    calls: [...velocityCalls(clip), scale, sound, ...toneCalls(clip)],
  };
}
