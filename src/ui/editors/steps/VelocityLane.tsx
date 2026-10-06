import { useState } from "react";
import type { StepRow } from "@/model/types";
import { setStepVelocity, soundName } from "@/store/actions/steps";
import { drawVelocityLane } from "@/ui/editors/steps/drawVelocityLane";
import { STEP_SPACING, velocityAtHeight } from "@/ui/editors/steps/stepGeometry";
import type { ClipPlayhead } from "@/ui/editors/useClipPlayhead";
import { groupedSpans, nearestSpanIndex, pointerPosition } from "@/ui/shared/canvas/gridGeometry";
import { useCanvas } from "@/ui/shared/canvas/useCanvas";

export interface VelocityLaneProps {
  readonly clipId: string;
  readonly row: StepRow;
  readonly trackColor: string;
  readonly playhead: ClipPlayhead;
}

/** Vélocité de chaque pas de la ligne sélectionnée : glisser verticalement pour la régler. */
export function VelocityLane({ clipId, row, trackColor, playhead }: VelocityLaneProps) {
  const [editedStep, setEditedStep] = useState<number | null>(null);
  const canvas = useCanvas(
    (context, size) =>
      drawVelocityLane(
        context,
        { velocities: row.velocities, trackColor, playheadStep: playhead.readStep() },
        size,
      ),
    playhead.isAnimated,
  );

  const edit = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const element = event.currentTarget;
    const { x, y } = pointerPosition(event, element);
    const step = nearestSpanIndex(
      groupedSpans(element.clientWidth, row.velocities.length, STEP_SPACING),
      x,
    );
    // Seuls les pas allumés ont une vélocité : glisser au-dessus d'un pas éteint ne l'allume pas.
    if (step === null || (row.velocities[step] ?? 0) <= 0) return;
    setEditedStep(step);
    setStepVelocity(clipId, row.id, step, velocityAtHeight(y, element.clientHeight));
  };

  const editedVelocity = editedStep === null ? null : (row.velocities[editedStep] ?? 0);
  return (
    <div className="grid-steps mt-1.5 grid h-17.5 shrink-0 items-stretch gap-4 border-t border-gray-225 pt-2.5">
      <div className="flex flex-col gap-0.75 px-2">
        <span className="text-tiny font-semibold tracking-caps text-fg-3">VELOCITY</span>
        <span className="text-emphasis font-medium">{soundName(row.sound)}</span>
      </div>
      <div className="relative">
        <canvas
          ref={canvas}
          aria-label={`${soundName(row.sound)} velocity`}
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
      <div className="flex flex-col gap-0.75">
        {editedStep === null || editedVelocity === null ? (
          <span className="text-label text-fg-3">Drag a bar to set velocity</span>
        ) : (
          <>
            <span className="text-label text-fg-3">Step {editedStep + 1}</span>
            <span className="font-mono text-body">{editedVelocity.toFixed(2)}</span>
          </>
        )}
      </div>
    </div>
  );
}
