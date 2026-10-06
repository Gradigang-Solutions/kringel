import { cn } from "@/lib/cn";
import type { Demo } from "@/demos";
import { summarizeDemo } from "@/ui/demos/demoSummary";
import { Button } from "@/ui/primitives/Button";
import { CodeSnippet } from "@/ui/shared/CodeSnippet";
import { TrackScope } from "@/ui/shared/TrackScope";

export interface DemoCardProps {
  readonly demo: Demo;
  readonly onOpen: () => void;
}

export function DemoCard({ demo, onOpen }: DemoCardProps) {
  const { project, genre } = demo;
  const summary = summarizeDemo(project);
  return (
    <article className="flex min-w-0 flex-col gap-2.5 rounded-8 border border-gray-235 bg-gray-185 p-3">
      <div aria-hidden className="flex h-16 shrink-0 flex-col gap-0.75 rounded-5 bg-gray-155 p-1.5">
        {summary.lanes.map((lane) => (
          <TrackScope key={lane.trackId} color={lane.color} className="flex flex-1 gap-0.75">
            {lane.filledScenes.map((isFilled, scene) => (
              <span
                key={scene}
                className={cn("flex-1 rounded-2", isFilled ? "bg-track/80" : "bg-gray-225")}
              />
            ))}
          </TrackScope>
        ))}
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-title font-semibold">{project.name}</h3>
        <span className="text-small text-fg-3">
          {genre} · {project.bpm} BPM
        </span>
      </div>
      <CodeSnippet code={summary.snippet} className="text-caption" />
      <div className="flex-1" />
      <div className="flex items-center justify-between">
        <span className="truncate text-label text-fg-3">
          {summary.usedTrackNames.length} tracks · {summary.usedTrackNames.join(", ")}
        </span>
        <Button variant="subtle" className="font-semibold" onClick={onOpen}>
          Open
        </Button>
      </div>
    </article>
  );
}
