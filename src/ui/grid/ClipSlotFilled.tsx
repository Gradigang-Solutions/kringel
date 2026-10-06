import { Play, Square } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { ClipPlayStatus } from "@/model/playback";
import type { Clip } from "@/model/types";
import { ClipPreview } from "@/ui/grid/ClipPreview";
import { PlayProgress } from "@/ui/grid/PlayProgress";
import { slotVariants } from "@/ui/grid/slotStyle";

/** Les attributs HTML supplémentaires viennent du déclencheur du menu contextuel (Radix asChild). */
export interface ClipSlotFilledProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  readonly clip: Clip;
  readonly status: ClipPlayStatus;
  readonly isTransportRunning: boolean;
  readonly isSelected: boolean;
  readonly isCompact: boolean;
  readonly onSelect: () => void;
  readonly onOpen: () => void;
  readonly onLaunch: () => void;
  readonly onStop: () => void;
}

function clipCycles(clip: Clip): number {
  return clip.kind === "code" ? 1 : clip.cycles;
}

export function ClipSlotFilled({
  clip,
  status,
  isTransportRunning,
  isSelected,
  isCompact,
  onSelect,
  onOpen,
  onLaunch,
  onStop,
  ...triggerProps
}: ClipSlotFilledProps) {
  const isActive = status === "playing" || status === "stopping";
  const isSounding = isActive && isTransportRunning;
  const state = status === "playing" && !isTransportRunning ? "idle" : status;
  return (
    <div
      {...triggerProps}
      role="button"
      tabIndex={0}
      aria-label={`${clip.name} clip`}
      aria-pressed={isSelected}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
      className={slotVariants({ state, size: isCompact ? "compact" : "regular", isSelected })}
    >
      <div className="flex min-w-0 shrink-0 items-center gap-1.75">
        <button
          type="button"
          aria-label={isActive ? `Stop ${clip.name}` : `Launch ${clip.name}`}
          onClick={(event) => {
            event.stopPropagation();
            if (isActive) onStop();
            else onLaunch();
          }}
          onDoubleClick={(event) => event.stopPropagation()}
          className={cn(
            "flex size-3.5 shrink-0 items-center justify-center rounded-2 hover:bg-white/10 max-md:size-6",
            isActive || status === "queued" ? "text-track" : "text-gray-600",
          )}
        >
          {isSounding ? (
            <Square size={7} fill="currentColor" strokeWidth={0} aria-hidden />
          ) : (
            <Play size={9} fill="currentColor" strokeWidth={0} aria-hidden />
          )}
        </button>
        <span className="min-w-0 flex-1 truncate text-body font-medium">{clip.name}</span>
        {status === "queued" ? (
          <span className="shrink-0 font-mono text-micro font-semibold tracking-tag text-track">
            NEXT CYCLE
          </span>
        ) : null}
      </div>
      <div className="relative min-h-0 flex-1">
        <ClipPreview clip={clip} isPlaying={isSounding} isCompact={isCompact} />
      </div>
      {isSounding ? <PlayProgress cycles={clipCycles(clip)} /> : null}
    </div>
  );
}
