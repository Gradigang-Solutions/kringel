import type { CSSProperties } from "react";
import { stepRowMini } from "@/codegen/steps";
import { cn } from "@/lib/cn";
import type { StepsClip } from "@/model/types";
import { useTrack } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { AddSoundRow } from "@/ui/editors/steps/AddSoundRow";
import { StepGridCanvas } from "@/ui/editors/steps/StepGridCanvas";
import {
  STEP_HEADER_HEIGHT,
  STEP_ROW_GAP,
  STEP_ROW_HEIGHT,
  stepGridMinWidth,
} from "@/ui/editors/steps/stepGeometry";
import { StepRowLabel } from "@/ui/editors/steps/StepRowLabel";
import { StepsToolbar } from "@/ui/editors/steps/StepsToolbar";
import { StepLane } from "@/ui/editors/steps/StepLane";
import { useClipPlayhead } from "@/ui/editors/useClipPlayhead";
import { stepCount } from "@/model/timing";

const COLUMN_TITLE = "text-tiny font-semibold tracking-caps text-fg-3";

export interface StepsEditorProps {
  readonly clip: StepsClip;
  readonly trackId: string;
}

export function StepsEditor({ clip, trackId }: StepsEditorProps) {
  const trackColor = useTrack(trackId)?.color ?? "";
  const selectedRowId = useUiStore((state) => state.selectedRowId);
  const playhead = useClipPlayhead(trackId, clip.id, clip.cycles);
  const selectedRow = clip.rows.find((row) => row.id === selectedRowId) ?? clip.rows[0];
  const columnStyle = { gap: STEP_ROW_GAP };
  // Lue par min-w-steps-content sur téléphone, où la grille défile plutôt que d'écraser les pas.
  const scrollerStyle: CSSProperties & Record<"--step-grid-min-width", string> = {
    "--step-grid-min-width": `${stepGridMinWidth(stepCount(clip.cycles))}px`,
  };
  return (
    <>
      <StepsToolbar clip={clip} trackId={trackId} />
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-3 pb-3.5 max-md:overflow-x-auto max-md:px-0"
        style={scrollerStyle}
      >
        <div className="flex min-w-steps-content flex-col gap-1.5 max-md:px-3">
          <div className="grid-steps grid gap-4">
            {/* Sur téléphone, les sons restent visibles pendant qu'on fait défiler les pas. */}
            <div
              className="flex flex-col max-md:sticky max-md:left-0 max-md:z-10 max-md:bg-gray-175"
              style={columnStyle}
            >
              <span
                className={cn(COLUMN_TITLE, "flex items-center")}
                style={{ height: STEP_HEADER_HEIGHT }}
              >
                SOUND
              </span>
              {clip.rows.map((row) => (
                <StepRowLabel
                  key={row.id}
                  clipId={clip.id}
                  kit={clip.kit}
                  row={row}
                  isSelected={row.id === selectedRow?.id}
                />
              ))}
            </div>
            <StepGridCanvas clip={clip} trackColor={trackColor} playhead={playhead} />
            <div className="flex min-w-0 flex-col max-md:hidden" style={columnStyle}>
              <span
                className={cn(COLUMN_TITLE, "flex items-center")}
                style={{ height: STEP_HEADER_HEIGHT }}
              >
                MINI-NOTATION
              </span>
              {clip.rows.map((row) => (
                <span
                  key={row.id}
                  style={{ height: STEP_ROW_HEIGHT }}
                  className={cn(
                    "flex items-center truncate font-mono text-body",
                    row.isMuted ? "text-fg-3 line-through" : "text-track",
                  )}
                >
                  &quot;{stepRowMini(row, clip.cycles)}&quot;
                </span>
              ))}
            </div>
          </div>
          <AddSoundRow clip={clip} />
          {selectedRow ? (
            <StepLane
              clipId={clip.id}
              row={selectedRow}
              trackColor={trackColor}
              playhead={playhead}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
