import { useRef } from "react";
import { DEFAULT_NOTE_DURATION } from "@/model/constants";
import type { NotesClip } from "@/model/types";
import { addNote, deleteNote, moveNote, resizeNote, selectNote } from "@/store/actions/notes";
import {
  hitNote,
  pitchAt,
  stepAt,
  stepWidth,
  type PianoLayout,
} from "@/ui/editors/piano/pianoGeometry";
import { pointerPosition } from "@/ui/shared/canvas/gridGeometry";

type Drag =
  | {
      readonly mode: "move";
      readonly noteId: string;
      readonly start: number;
      readonly pitch: number;
      readonly fromStep: number;
      readonly fromPitch: number;
    }
  | {
      readonly mode: "resize";
      readonly noteId: string;
      readonly duration: number;
      readonly fromX: number;
    };

type CanvasPointerEvent = React.PointerEvent<HTMLCanvasElement>;

/** Gestes du piano roll : clic pour ajouter, glisser pour déplacer, bord droit pour allonger, double-clic pour supprimer. */
export function usePianoRollPointer(clip: NotesClip, stepCount: number) {
  const drag = useRef<Drag | null>(null);
  const lastDuration = useRef(DEFAULT_NOTE_DURATION);

  const locate = (event: CanvasPointerEvent) => {
    const layout: PianoLayout = { width: event.currentTarget.clientWidth, stepCount };
    return { layout, ...pointerPosition(event, event.currentTarget) };
  };

  const onPointerDown = (event: CanvasPointerEvent) => {
    if (event.button !== 0) return;
    const { layout, x, y } = locate(event);
    const hit = hitNote(layout, clip.notes, x, y);
    const step = stepAt(layout, x);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (hit) {
      selectNote(hit.note.id);
      drag.current =
        hit.zone === "resize"
          ? { mode: "resize", noteId: hit.note.id, duration: hit.note.duration, fromX: x }
          : {
              mode: "move",
              noteId: hit.note.id,
              start: hit.note.start,
              pitch: hit.note.pitch,
              fromStep: step ?? 0,
              fromPitch: pitchAt(y),
            };
      return;
    }
    if (step === null) return;
    addNote(clip.id, { pitch: pitchAt(y), start: step, duration: lastDuration.current });
  };

  const onPointerMove = (event: CanvasPointerEvent) => {
    const current = drag.current;
    if (!current) return;
    const { layout, x, y } = locate(event);
    if (current.mode === "resize") {
      const duration = Math.max(
        1,
        current.duration + Math.round((x - current.fromX) / stepWidth(layout)),
      );
      lastDuration.current = duration;
      resizeNote(clip.id, current.noteId, duration);
      return;
    }
    const step = stepAt(layout, x) ?? current.fromStep;
    const start = current.start + step - current.fromStep;
    const pitch = current.pitch + pitchAt(y) - current.fromPitch;
    const note = clip.notes.find((candidate) => candidate.id === current.noteId);
    if (note && (note.start !== start || note.pitch !== pitch))
      moveNote(clip.id, current.noteId, start, pitch);
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const onDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const layout: PianoLayout = { width: event.currentTarget.clientWidth, stepCount };
    const { x, y } = pointerPosition(event, event.currentTarget);
    const hit = hitNote(layout, clip.notes, x, y);
    if (hit) deleteNote(clip.id, hit.note.id);
  };

  const onContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    onDoubleClick(event);
  };

  return { onPointerDown, onPointerMove, onPointerUp, onDoubleClick, onContextMenu };
}
