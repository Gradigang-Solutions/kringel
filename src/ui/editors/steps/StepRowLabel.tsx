import { cn } from "@/lib/cn";
import type { StepRow } from "@/model/types";
import { removeStepRow, selectRow, soundName, toggleRowMute } from "@/store/actions/steps";
import { ContextMenuArea } from "@/ui/primitives/Menu";
import { STEP_ROW_HEIGHT } from "@/ui/editors/steps/stepGeometry";

export interface StepRowLabelProps {
  readonly clipId: string;
  readonly row: StepRow;
  readonly isSelected: boolean;
}

export function StepRowLabel({ clipId, row, isSelected }: StepRowLabelProps) {
  const name = soundName(row.sound);
  return (
    <ContextMenuArea
      items={[{ label: `Remove ${name}`, onSelect: () => removeStepRow(clipId, row.id) }]}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={() => selectRow(row.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter") selectRow(row.id);
        }}
        style={{ height: STEP_ROW_HEIGHT }}
        className={cn(
          "flex items-center gap-2 rounded-6 px-2",
          isSelected ? "bg-gray-225" : "hover:bg-gray-195",
        )}
      >
        <span className="flex-1 truncate text-emphasis font-medium">{name}</span>
        <span className="rounded-3 bg-gray-235 px-1.25 py-px font-mono text-caption text-fg-2 max-md:hidden">
          {row.sound}
        </span>
        <button
          type="button"
          aria-label={`Mute ${name}`}
          aria-pressed={row.isMuted}
          onClick={(event) => {
            event.stopPropagation();
            toggleRowMute(clipId, row.id);
          }}
          className={cn(
            "flex size-5.5 items-center justify-center rounded-4 text-caption font-semibold",
            row.isMuted ? "bg-fg-1 text-fg-inverse" : "bg-gray-235 text-fg-2 hover:text-fg-1",
          )}
        >
          M
        </button>
      </div>
    </ContextMenuArea>
  );
}
