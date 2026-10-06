import { assertNever } from "@/lib/assertNever";
import { cn } from "@/lib/cn";
import type { Clip } from "@/model/types";
import { codePreviewLine, notePreviews, stepPreviewRows } from "@/ui/grid/clipPreviewData";

export interface ClipPreviewProps {
  readonly clip: Clip;
  readonly isPlaying: boolean;
  readonly isCompact: boolean;
}

/** Miniature du contenu d'un clip, dessinée à la couleur de la piste. */
export function ClipPreview({ clip, isPlaying, isCompact }: ClipPreviewProps) {
  const strength = isPlaying ? "bg-track" : "bg-track/75";
  switch (clip.kind) {
    case "steps":
      return (
        <div className={cn("absolute inset-0 flex flex-col", isCompact ? "gap-px" : "gap-0.5")}>
          {stepPreviewRows(clip).map((row) => (
            <div key={row.id} className="flex flex-1 gap-px">
              {row.cells.map((isOn, step) => (
                <span
                  key={step}
                  className={cn(
                    "flex-1 rounded-1",
                    isOn ? (row.isMuted ? "bg-track/45" : strength) : "bg-white/7",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      );
    case "notes":
      return (
        <>
          {notePreviews(clip).map((note) => (
            <span
              key={note.id}
              className={cn("absolute rounded-1", isCompact ? "h-0.5" : "h-0.75", strength)}
              style={{
                left: `${note.left}%`,
                width: `calc(${note.width}% - 1px)`,
                top: `${note.top}%`,
              }}
            />
          ))}
        </>
      );
    case "code":
      // En mode compact, la ligne de code ne tiendrait pas sous le nom du clip.
      if (isCompact) return null;
      return (
        <code className="absolute inset-x-0 top-0 truncate font-mono text-caption text-track/90">
          {codePreviewLine(clip.source)}
        </code>
      );
    default:
      return assertNever(clip);
  }
}
