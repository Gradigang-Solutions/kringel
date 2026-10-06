import { useState } from "react";
import type { StepLane as StepLaneKind } from "@/model/steps";
import type { StepRow } from "@/model/types";
import { formatStepValue, setStepValue, soundName } from "@/store/actions/steps";
import { drawStepLane } from "@/ui/editors/steps/drawStepLane";
import { STEP_SPACING } from "@/ui/editors/steps/stepGeometry";
import { laneLevels, laneValueAtHeight, STEP_LANE_OPTIONS } from "@/ui/editors/steps/stepLanes";
import type { ClipPlayhead } from "@/ui/editors/useClipPlayhead";
import { SegmentedControl } from "@/ui/primitives/SegmentedControl";
import { groupedSpans, nearestSpanIndex, pointerPosition } from "@/ui/shared/canvas/gridGeometry";
import { useCanvas } from "@/ui/shared/canvas/useCanvas";

export interface StepLaneProps {
  readonly clipId: string;
  readonly row: StepRow;
  readonly trackColor: string;
  readonly playhead: ClipPlayhead;
}

const HINTS: Readonly<Record<StepLaneKind, string>> = {
  velocities: "Drag a bar to set velocity",
  chances: "Lower a bar so the step plays only sometimes",
  ratchets: "Raise a bar to repeat the hit inside its step",
};

/**
 * Réglages par pas de la ligne sélectionnée : vélocité, probabilité ou ratchet, à glisser
 * verticalement. Seuls les pas allumés ont des réglages.
 */
export function StepLane({ clipId, row, trackColor, playhead }: StepLaneProps) {
  const [lane, setLane] = useState<StepLaneKind>("velocities");
  const [editedStep, setEditedStep] = useState<number | null>(null);
  const levels = laneLevels(row, lane);
  const canvas = useCanvas(
    (context, size) =>
      drawStepLane(context, { levels, trackColor, playheadStep: playhead.readStep() }, size),
    playhead.isAnimated,
  );

  const edit = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const element = event.currentTarget;
    const { x, y } = pointerPosition(event, element);
    const step = nearestSpanIndex(
      groupedSpans(element.clientWidth, row.velocities.length, STEP_SPACING),
      x,
    );
    // Glisser au-dessus d'un pas éteint ne l'allume pas.
    if (step === null || (row.velocities[step] ?? 0) <= 0) return;
    setEditedStep(step);
    setStepValue(lane, clipId, row.id, step, laneValueAtHeight(lane, y, element.clientHeight));
  };

  const editedValue = editedStep === null ? undefined : row[lane][editedStep];
  return (
    <div className="grid-steps mt-1.5 grid h-17.5 shrink-0 items-stretch gap-4 border-t border-gray-225 pt-2.5">
      <div className="flex flex-col gap-1.5 px-2 max-md:sticky max-md:left-0 max-md:z-10 max-md:bg-gray-175">
        <SegmentedControl
          label="Per-step setting"
          options={STEP_LANE_OPTIONS}
          value={lane}
          onChange={(next) => {
            setLane(next);
            setEditedStep(null);
          }}
        />
        <span className="text-emphasis font-medium">{soundName(row.sound)}</span>
      </div>
      <div className="relative">
        <canvas
          ref={canvas}
          aria-label={`${soundName(row.sound)} ${lane}`}
          className="absolute inset-0 size-full touch-none"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            edit(event);
          }}
          onPointerMove={(event) => {
            if (event.buttons > 0) edit(event);
          }}
        />
      </div>
      <div className="flex flex-col gap-0.75 max-md:hidden">
        {editedStep === null || editedValue === undefined ? (
          <span className="text-label text-fg-3">{HINTS[lane]}</span>
        ) : (
          <>
            <span className="text-label text-fg-3">Step {editedStep + 1}</span>
            <span className="font-mono text-body">{formatStepValue(lane, editedValue)}</span>
          </>
        )}
      </div>
    </div>
  );
}
