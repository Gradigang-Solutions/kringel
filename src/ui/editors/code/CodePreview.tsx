import { useEffect, useState } from "react";
import { getCyclePosition, previewNotes, type PreviewNote } from "@/engine";
import { cn } from "@/lib/cn";
import { drawCodePreview } from "@/ui/editors/code/drawCodePreview";
import type { ClipPlayhead } from "@/ui/editors/useClipPlayhead";
import { Badge } from "@/ui/primitives/Badge";
import { useCanvas } from "@/ui/shared/canvas/useCanvas";

const PREVIEW_CYCLES = 4;

export interface CodePreviewProps {
  /** Source qui joue : la dernière version valide. */
  readonly source: string | null;
  readonly isStale: boolean;
  readonly trackColor: string;
  readonly playhead: ClipPlayhead;
}

/** « Result » : les notes que produit la dernière version valide, sur quatre cycles. */
export function CodePreview({ source, isStale, trackColor, playhead }: CodePreviewProps) {
  const [notes, setNotes] = useState<readonly PreviewNote[]>([]);

  useEffect(() => {
    let isCurrent = true;
    if (source !== null) {
      void previewNotes(source, PREVIEW_CYCLES).then((result) => {
        if (isCurrent && result !== null) setNotes(result);
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [source]);

  const canvas = useCanvas(
    (context, size) =>
      drawCodePreview(
        context,
        {
          notes,
          cycles: PREVIEW_CYCLES,
          trackColor,
          playheadCycle: playhead.isAnimated ? getCyclePosition() % PREVIEW_CYCLES : null,
        },
        size,
      ),
    playhead.isAnimated,
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2.5 px-4 pt-3 pb-3.5 max-md:h-40 max-md:flex-none">
      <div className="flex items-center gap-2">
        <span className="text-body font-semibold">Result</span>
        <Badge>read-only</Badge>
        <span className="flex-1" />
        <span className={cn("text-label", isStale ? "text-error-title" : "text-fg-3")}>
          {isStale ? "Last valid version" : "Current version"} · {PREVIEW_CYCLES} cycles
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvas}
          aria-label="Notes produced by the code"
          className="absolute inset-0 size-full"
        />
        {notes.length === 0 ? (
          <span className="absolute inset-0 flex items-center justify-center text-small text-fg-3">
            No notes to show yet.
          </span>
        ) : null}
      </div>
    </div>
  );
}
