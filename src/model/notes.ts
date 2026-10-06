import { clamp } from "@/lib/math";
import { DEFAULT_VELOCITY, NOTE_RANGE, SAMPLE_SOUNDS, SYNTH_SOUNDS } from "@/model/constants";
import { stepCount } from "@/model/timing";
import type {
  ClipCycles,
  IdGenerator,
  Note,
  NotesClip,
  PitchClass,
  ScaleModeId,
  SoundSource,
} from "@/model/types";

export interface NotePlacement {
  readonly pitch: number;
  readonly start: number;
  readonly duration: number;
}

const MIN_DURATION = 1;

/** Garde la note dans le clip : hauteur dans la tessiture, début et fin dans la longueur du clip. */
function fitPlacement(clip: NotesClip, placement: NotePlacement): NotePlacement {
  const length = stepCount(clip.cycles);
  const start = clamp(Math.round(placement.start), 0, length - MIN_DURATION);
  return {
    pitch: clamp(Math.round(placement.pitch), NOTE_RANGE.min, NOTE_RANGE.max),
    start,
    duration: clamp(Math.round(placement.duration), MIN_DURATION, length - start),
  };
}

function updateNote(clip: NotesClip, noteId: string, update: (note: Note) => Note): NotesClip {
  return { ...clip, notes: clip.notes.map((note) => (note.id === noteId ? update(note) : note)) };
}

export function addNote(clip: NotesClip, placement: NotePlacement, nextId: IdGenerator): NotesClip {
  const fitted = fitPlacement(clip, placement);
  const isDuplicate = clip.notes.some(
    (note) => note.pitch === fitted.pitch && note.start === fitted.start,
  );
  if (isDuplicate) return clip;
  return {
    ...clip,
    notes: [...clip.notes, { id: nextId(), velocity: DEFAULT_VELOCITY, ...fitted }],
  };
}

export function moveNote(clip: NotesClip, noteId: string, start: number, pitch: number): NotesClip {
  return updateNote(clip, noteId, (note) => ({
    ...note,
    ...fitPlacement(clip, { pitch, start, duration: note.duration }),
  }));
}

export function resizeNote(clip: NotesClip, noteId: string, duration: number): NotesClip {
  return updateNote(clip, noteId, (note) => ({
    ...note,
    ...fitPlacement(clip, { pitch: note.pitch, start: note.start, duration }),
  }));
}

export function deleteNote(clip: NotesClip, noteId: string): NotesClip {
  return { ...clip, notes: clip.notes.filter((note) => note.id !== noteId) };
}

export function setScale(clip: NotesClip, root: PitchClass, scale: ScaleModeId): NotesClip {
  return { ...clip, root, scale };
}

export function soundsForSource(source: SoundSource): readonly string[] {
  return source === "synth" ? SYNTH_SOUNDS : SAMPLE_SOUNDS;
}

/** Change le son ; si la source change sans son valide, on prend le premier son de la nouvelle source. */
export function setSound(clip: NotesClip, soundSource: SoundSource, sound: string): NotesClip {
  const available = soundsForSource(soundSource);
  const validSound = available.includes(sound) ? sound : (available[0] ?? sound);
  return { ...clip, soundSource, sound: validSound };
}

export function setNotesCycles(clip: NotesClip, cycles: ClipCycles): NotesClip {
  const length = stepCount(cycles);
  return {
    ...clip,
    cycles,
    notes: clip.notes
      .filter((note) => note.start < length)
      .map((note) => ({ ...note, duration: Math.min(note.duration, length - note.start) })),
  };
}
