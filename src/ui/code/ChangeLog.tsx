import { cn } from "@/lib/cn";
import { useProjectStore } from "@/store/projectStore";
import { useUiStore, type ChangeEntry } from "@/store/uiStore";
import { TrackSwatch } from "@/ui/primitives/TrackSwatch";
import { TrackScope } from "@/ui/shared/TrackScope";

function ChangeRow({
  change,
  color,
}: {
  readonly change: ChangeEntry;
  readonly color: string | undefined;
}) {
  const row = (
    <div className="flex min-w-0 items-center gap-2">
      <TrackSwatch size="xs" tone={color ? "track" : "neutral"} />
      <span className="min-w-0 flex-1 truncate text-small text-fg-2">{change.text}</span>
      <span
        className={cn(
          "max-w-40 truncate font-mono text-label whitespace-nowrap",
          change.isError ? "text-error-fg" : color ? "text-track" : "text-fg-1",
        )}
      >
        {change.code}
      </span>
    </div>
  );
  return color ? <TrackScope color={color}>{row}</TrackScope> : row;
}

/** « What your last clicks wrote » : les trois derniers gestes et le code qu'ils ont écrit. */
export function ChangeLog() {
  const changes = useUiStore((state) => state.changes);
  const tracks = useProjectStore((state) => state.project.tracks);
  return (
    <section
      aria-label="Recent changes"
      className="flex shrink-0 flex-col gap-2 border-t border-gray-215 px-4 pt-3 pb-3.5"
    >
      <h3 className="text-tiny font-semibold tracking-caps text-fg-3">
        WHAT YOUR LAST CLICKS WROTE
      </h3>
      {changes.length === 0 ? (
        <span className="text-small text-fg-3">
          Nothing yet. Your first click will show up here.
        </span>
      ) : (
        changes.map((change) => (
          <ChangeRow
            key={change.id}
            change={change}
            color={tracks.find((track) => track.id === change.trackId)?.color}
          />
        ))
      )}
    </section>
  );
}
