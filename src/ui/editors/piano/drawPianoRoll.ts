import { withAlpha } from "@/lib/color";
import { range } from "@/lib/math";
import { NOTE_RANGE, STEPS_PER_BEAT, STEPS_PER_CYCLE } from "@/model/constants";
import { isBlackKey, isInScale, noteName, pitchClassOf, strudelNoteName } from "@/model/scales";
import type { Note, PitchClass, ScaleModeId } from "@/model/types";
import { drawPlayheadLine } from "@/ui/shared/canvas/drawPlayhead";
import { MONO_FONT, themeColor } from "@/ui/shared/canvas/themeColors";
import type { CanvasSize } from "@/ui/shared/canvas/useCanvas";
import {
  KEYS_WIDTH,
  PIANO_ROW_COUNT,
  PIANO_ROW_HEIGHT,
  noteRect,
  pitchY,
  stepX,
  type PianoLayout,
} from "@/ui/editors/piano/pianoGeometry";

export interface PianoRollData {
  readonly notes: readonly Note[];
  readonly root: PitchClass;
  readonly scale: ScaleModeId;
  readonly isOutOfScaleGrayed: boolean;
  readonly trackColor: string;
  readonly stepCount: number;
  readonly selectedNoteId: string | null;
  readonly playheadPosition: number | null;
}

const LABEL_FONT = `9.5px ${MONO_FONT}`;
const NOTE_LABEL_FONT = `600 9.5px ${MONO_FONT}`;
const BLACK_KEY_RATIO = 0.64;
const ROOT_ROW_ALPHA = 0.07;
const SIXTEENTH_LINE_ALPHA = 0.045;
const NOTE_RADIUS = 3;
const LABEL_PADDING = 5;
const SELECTION_WIDTH = 2;

function forEachPitch(draw: (pitch: number, y: number) => void): void {
  for (const offset of range(PIANO_ROW_COUNT)) {
    const pitch = NOTE_RANGE.max - offset;
    draw(pitch, pitchY(pitch));
  }
}

function drawRows(context: CanvasRenderingContext2D, data: PianoRollData, width: number): void {
  forEachPitch((pitch, y) => {
    const isOut = data.isOutOfScaleGrayed && !isInScale(pitch, data.root, data.scale);
    const isRoot = pitchClassOf(pitch) === data.root;
    context.fillStyle = isRoot
      ? withAlpha(data.trackColor, ROOT_ROW_ALPHA)
      : themeColor(isOut ? "surfaceOutScale" : "inScaleRow");
    context.fillRect(KEYS_WIDTH, y, width - KEYS_WIDTH, PIANO_ROW_HEIGHT - 1);
  });
}

function drawColumns(context: CanvasRenderingContext2D, layout: PianoLayout, height: number): void {
  for (let step = 0; step <= layout.stepCount; step += 1) {
    const isCycle = step % STEPS_PER_CYCLE === 0;
    const isBeat = step % STEPS_PER_BEAT === 0;
    context.fillStyle = isCycle
      ? themeColor("lineBar")
      : isBeat
        ? themeColor("lineStrong")
        : withAlpha(themeColor("fg1"), SIXTEENTH_LINE_ALPHA);
    context.fillRect(Math.round(stepX(layout, step)), 0, 1, height);
  }
}

function drawKeys(context: CanvasRenderingContext2D, data: PianoRollData): void {
  context.font = LABEL_FONT;
  context.textBaseline = "middle";
  context.textAlign = "left";
  forEachPitch((pitch, y) => {
    const isBlack = isBlackKey(pitch);
    const inScale = isInScale(pitch, data.root, data.scale);
    const isOut = data.isOutOfScaleGrayed && !inScale;
    const keyColor = isBlack ? themeColor("black") : themeColor(isOut ? "keyOutScale" : "keyWhite");
    context.fillStyle = keyColor;
    context.fillRect(0, y, KEYS_WIDTH * (isBlack ? BLACK_KEY_RATIO : 1), PIANO_ROW_HEIGHT - 1);
    if (!inScale) return;
    context.fillStyle = themeColor(isBlack ? "fg2" : "keyLabel");
    context.fillText(noteName(pitch), LABEL_PADDING, y + PIANO_ROW_HEIGHT / 2);
  });
}

function drawNotes(
  context: CanvasRenderingContext2D,
  layout: PianoLayout,
  data: PianoRollData,
): void {
  context.font = NOTE_LABEL_FONT;
  context.textBaseline = "middle";
  for (const note of data.notes) {
    const rect = noteRect(layout, note);
    context.fillStyle = data.trackColor;
    context.beginPath();
    context.roundRect(rect.x, rect.y, rect.width, rect.height, NOTE_RADIUS);
    context.fill();
    if (note.id === data.selectedNoteId) {
      context.strokeStyle = themeColor("fg1");
      context.lineWidth = SELECTION_WIDTH;
      context.stroke();
    }
    context.save();
    context.clip();
    context.fillStyle = themeColor("fgOnTrack");
    context.fillText(
      strudelNoteName(note.pitch),
      rect.x + LABEL_PADDING - 1,
      rect.y + rect.height / 2,
    );
    context.restore();
  }
}

/** Piano roll : lignes de la gamme, grille de pas, clavier, notes et tête de lecture. */
export function drawPianoRoll(
  context: CanvasRenderingContext2D,
  data: PianoRollData,
  size: CanvasSize,
): void {
  const layout = { width: size.width, stepCount: data.stepCount };
  drawRows(context, data, size.width);
  drawColumns(context, layout, size.height);
  drawKeys(context, data);
  drawNotes(context, layout, data);
  if (data.playheadPosition !== null) {
    drawPlayheadLine(context, stepX(layout, data.playheadPosition), 0, size.height);
  }
}
