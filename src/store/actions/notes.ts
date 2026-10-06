import { method, quote } from "@/codegen/format";
import { clipFilterCall, envelopeCall, notesPattern } from "@/codegen/notes";
import { filterLabel } from "@/model/filter";
import {
  addNote as addNoteModel,
  deleteNote as deleteNoteModel,
  envelopeLabel,
  moveNote as moveNoteModel,
  resizeNote as resizeNoteModel,
  setClipFilter as setClipFilterModel,
  setEnvelope as setEnvelopeModel,
  setNotesCycles,
  setScale as setScaleModel,
  setSound as setSoundModel,
  type EnvelopeParam,
  type NotePlacement,
} from "@/model/notes";
import { findClip, isClipOfKind, updateClipOfKind } from "@/model/project";
import { noteName, pitchClassName, scaleLabel } from "@/model/scales";
import type { ClipCycles, NotesClip, PitchClass, ScaleModeId, SoundSource } from "@/model/types";
import { logChange, logValueChange } from "@/store/changeLog";
import { nextId } from "@/store/ids";
import { getProject, updateProject } from "@/store/projectStore";
import { updateUi } from "@/store/uiStore";

function updateNotes(
  clipId: string,
  update: (clip: NotesClip) => NotesClip,
  historyKey: string | null = null,
): void {
  updateProject((project) => updateClipOfKind(project, clipId, "notes", update), historyKey);
}

function notesContext(clipId: string): { trackId: string; clip: NotesClip } | null {
  const located = findClip(getProject(), clipId);
  if (!located || !isClipOfKind(located.clip, "notes")) return null;
  return { trackId: located.track.id, clip: located.clip };
}

/** Code d'un clip de notes résumé à sa première ligne, pour le journal des changements. */
function patternSummary(clip: NotesClip): string {
  return notesPattern(clip)?.source[0] ?? "silence";
}

function logNotesChange(clipId: string, key: string, text: (clip: NotesClip) => string): void {
  const context = notesContext(clipId);
  if (!context) return;
  logChange({
    key,
    trackId: context.trackId,
    text: text(context.clip),
    code: patternSummary(context.clip),
  });
}

export function addNote(clipId: string, placement: NotePlacement): void {
  updateNotes(clipId, (clip) => addNoteModel(clip, placement, nextId));
  const added = notesContext(clipId)?.clip.notes.at(-1);
  updateUi({ selectedNoteId: added?.id ?? null });
  logNotesChange(clipId, `add-note:${added?.id ?? ""}`, () => `Added ${noteName(placement.pitch)}`);
}

export function moveNote(clipId: string, noteId: string, start: number, pitch: number): void {
  updateNotes(clipId, (clip) => moveNoteModel(clip, noteId, start, pitch), `note:${noteId}`);
  logNotesChange(clipId, `move-note:${noteId}`, () => `Moved note to ${noteName(pitch)}`);
}

export function resizeNote(clipId: string, noteId: string, duration: number): void {
  updateNotes(clipId, (clip) => resizeNoteModel(clip, noteId, duration), `note:${noteId}`);
  logNotesChange(clipId, `resize-note:${noteId}`, () => `Note length ${duration} steps`);
}

export function deleteNote(clipId: string, noteId: string): void {
  const note = notesContext(clipId)?.clip.notes.find((candidate) => candidate.id === noteId);
  updateNotes(clipId, (clip) => deleteNoteModel(clip, noteId));
  updateUi({ selectedNoteId: null });
  if (!note) return;
  logNotesChange(clipId, `delete-note:${noteId}`, () => `Removed ${noteName(note.pitch)}`);
}

export function selectNote(noteId: string | null): void {
  updateUi({ selectedNoteId: noteId });
}

export function setScale(clipId: string, root: PitchClass, scale: ScaleModeId): void {
  updateNotes(clipId, (clip) => setScaleModel(clip, root, scale));
  logNotesChange(
    clipId,
    `scale:${clipId}`,
    () => `Scale → ${pitchClassName(root)} ${scaleLabel(scale).toLowerCase()}`,
  );
}

export function setSound(clipId: string, source: SoundSource, sound: string): void {
  updateNotes(clipId, (clip) => setSoundModel(clip, source, sound));
  const context = notesContext(clipId);
  if (!context) return;
  logChange({
    key: `sound:${clipId}`,
    trackId: context.trackId,
    text: `Sound → ${context.clip.sound}`,
    code: method("s", quote(context.clip.sound)),
  });
}

const ENVELOPE_LABELS: Readonly<Record<EnvelopeParam, string>> = {
  attack: "Attack",
  release: "Release",
};

export function setEnvelope(clipId: string, param: EnvelopeParam, seconds: number): void {
  const before = notesContext(clipId)?.clip[param] ?? 0;
  const key = `envelope:${param}:${clipId}`;
  updateNotes(clipId, (clip) => setEnvelopeModel(clip, param, seconds), key);
  const context = notesContext(clipId);
  if (!context) return;
  const after = context.clip[param];
  logValueChange({
    key,
    trackId: context.trackId,
    label: ENVELOPE_LABELS[param],
    from: envelopeLabel(before),
    to: envelopeLabel(after),
    code: envelopeCall(param, after) ?? `${param} · default`,
  });
}

export function setClipFilter(clipId: string, cutoff: number | null): void {
  const before = notesContext(clipId)?.clip.lpf ?? null;
  const key = `clip-lpf:${clipId}`;
  updateNotes(clipId, (clip) => setClipFilterModel(clip, cutoff), key);
  const context = notesContext(clipId);
  if (!context) return;
  logValueChange({
    key,
    trackId: context.trackId,
    label: "Clip filter",
    from: filterLabel(before),
    to: filterLabel(context.clip.lpf),
    code: clipFilterCall(context.clip.lpf) ?? "lpf · off",
  });
}

export function setNotesLength(clipId: string, cycles: ClipCycles): void {
  updateNotes(clipId, (clip) => setNotesCycles(clip, cycles));
}

export function setOutOfScaleGrayed(isOutOfScaleGrayed: boolean): void {
  updateUi({ isOutOfScaleGrayed });
}
