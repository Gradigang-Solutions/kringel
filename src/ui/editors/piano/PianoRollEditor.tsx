import { useEffect, useRef } from "react";
import { DEFAULT_ANCHOR_OCTAVE, SEMITONES_PER_OCTAVE } from "@/model/constants";
import { anchorPitch } from "@/model/scales";
import { stepCount } from "@/model/timing";
import type { NotesClip } from "@/model/types";
import { useTrack } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { drawPianoRoll } from "@/ui/editors/piano/drawPianoRoll";
import { drawRuler } from "@/ui/editors/piano/drawRuler";
import {
  KEYS_WIDTH,
  PIANO_GRID_HEIGHT,
  PIANO_ROW_HEIGHT,
  RULER_HEIGHT,
  pitchY,
} from "@/ui/editors/piano/pianoGeometry";
import { PianoToolbar } from "@/ui/editors/piano/PianoToolbar";
import { usePianoRollPointer } from "@/ui/editors/piano/usePianoRollPointer";
import { useClipPlayhead } from "@/ui/editors/useClipPlayhead";
import { useCanvas } from "@/ui/shared/canvas/useCanvas";

/** Hauteur au centre de la vue à l'ouverture : la moyenne des notes, sinon le do de l'octave par défaut. */
function centerPitch(clip: NotesClip): number {
  if (clip.notes.length === 0)
    return anchorPitch(0, DEFAULT_ANCHOR_OCTAVE) + SEMITONES_PER_OCTAVE / 2;
  return clip.notes.reduce((sum, note) => sum + note.pitch, 0) / clip.notes.length;
}

export interface PianoRollEditorProps {
  readonly clip: NotesClip;
  readonly trackId: string;
}

export function PianoRollEditor({ clip, trackId }: PianoRollEditorProps) {
  const trackColor = useTrack(trackId)?.color ?? "";
  const selectedNoteId = useUiStore((state) => state.selectedNoteId);
  const isOutOfScaleGrayed = useUiStore((state) => state.isOutOfScaleGrayed);
  const steps = stepCount(clip.cycles);
  const playhead = useClipPlayhead(trackId, clip.id, clip.cycles);
  const pointer = usePianoRollPointer(clip, steps);
  const scroller = useRef<HTMLDivElement>(null);

  const grid = useCanvas(
    (context, size) =>
      drawPianoRoll(
        context,
        {
          notes: clip.notes,
          root: clip.root,
          scale: clip.scale,
          isOutOfScaleGrayed,
          trackColor,
          stepCount: steps,
          selectedNoteId,
          playheadPosition: playhead.readPosition(),
        },
        size,
      ),
    playhead.isAnimated,
  );
  const ruler = useCanvas(
    (context, size) =>
      drawRuler(context, { stepCount: steps, playheadPosition: playhead.readPosition() }, size),
    playhead.isAnimated,
  );

  useEffect(() => {
    const element = scroller.current;
    if (element)
      element.scrollTop =
        pitchY(centerPitch(clip)) + PIANO_ROW_HEIGHT / 2 - element.clientHeight / 2;
    // Centrage seulement à l'ouverture du clip : ensuite, la vue reste là où l'utilisateur l'a laissée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PianoToolbar clip={clip} trackId={trackId} />
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-2.5 pb-3.5">
        <canvas
          ref={ruler}
          aria-hidden
          className="w-full shrink-0"
          style={{ height: RULER_HEIGHT }}
        />
        <div ref={scroller} className="relative min-h-0 flex-1 overflow-y-auto">
          <canvas
            ref={grid}
            role="grid"
            aria-label="Piano roll: click to add a note, drag to move, drag its right edge to resize, double-click to delete"
            className="w-full touch-none"
            style={{ height: PIANO_GRID_HEIGHT }}
            {...pointer}
          />
          {/* Le canvas capte tous les gestes : au doigt, on fait défiler les hauteurs en glissant sur le clavier. */}
          <div
            aria-hidden
            className="absolute top-0 left-0 touch-pan-y md:hidden"
            style={{ width: KEYS_WIDTH, height: PIANO_GRID_HEIGHT }}
          />
        </div>
      </div>
    </>
  );
}
