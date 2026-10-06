import type { CodeLineInfo } from "@/codegen/generate";
import { useSelectedClip } from "@/store/selectors";
import { clipLineRange } from "@/ui/code/lineStyles";
import { TrackSwatch } from "@/ui/primitives/TrackSwatch";
import { TrackScope } from "@/ui/shared/TrackScope";

export interface SelectionBarProps {
  readonly lines: readonly CodeLineInfo[];
}

/** Rappelle le clip sélectionné et les lignes de code qu'il occupe. */
export function SelectionBar({ lines }: SelectionBarProps) {
  const selected = useSelectedClip();
  const range = clipLineRange(lines, selected?.clip.id ?? null);
  return (
    <TrackScope
      color={selected?.track.color ?? "transparent"}
      className="flex h-8.5 shrink-0 items-center gap-2 border-b border-gray-215 bg-gray-155 px-4"
    >
      <TrackSwatch tone={selected ? "track" : "muted"} />
      <span className="truncate text-small text-fg-2">
        {selected ? `Selected: ${selected.track.name} › ${selected.clip.name}` : "No clip selected"}
      </span>
      <span className="flex-1" />
      {range ? (
        <span className="font-mono text-caption text-fg-3">
          lines {range[0]}–{range[1]}
        </span>
      ) : null}
      {selected && !range ? <span className="text-caption text-fg-3">not playing</span> : null}
    </TrackScope>
  );
}
