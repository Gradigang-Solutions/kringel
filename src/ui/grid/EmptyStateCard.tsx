import type { ClipKind } from "@/model/types";
import { createClip } from "@/store/actions/clips";
import { useProjectStore } from "@/store/projectStore";
import { CodeSnippet } from "@/ui/shared/CodeSnippet";
import { TrackScope } from "@/ui/shared/TrackScope";
import { TrackSwatch } from "@/ui/primitives/TrackSwatch";
import { cn } from "@/lib/cn";

interface StartOption {
  readonly title: string;
  readonly subtitle: string;
  readonly code: string;
  readonly kind: ClipKind;
  readonly trackIndex: number;
  readonly isHighlighted: boolean;
}

const LEAD_TRACK_INDEX = 2;
const PAD_TRACK_INDEX = 3;

const START_OPTIONS: readonly StartOption[] = [
  {
    title: "Drum pattern",
    subtitle: "Step sequencer",
    code: 's("bd*4")',
    kind: "steps",
    trackIndex: 0,
    isHighlighted: true,
  },
  {
    title: "Melody",
    subtitle: "Piano roll",
    code: 'note("c3 eb3 g3")',
    kind: "notes",
    trackIndex: LEAD_TRACK_INDEX,
    isHighlighted: false,
  },
  {
    title: "Code",
    subtitle: "Write Strudel yourself",
    code: "// start typing",
    kind: "code",
    trackIndex: PAD_TRACK_INDEX,
    isHighlighted: false,
  },
];

function StartCard({ option }: { readonly option: StartOption }) {
  const track = useProjectStore((state) => state.project.tracks[option.trackIndex]);
  if (!track) return null;
  return (
    <TrackScope color={track.color}>
      <button
        type="button"
        onClick={() => createClip({ trackId: track.id, sceneIndex: 0 }, option.kind)}
        className={cn(
          "flex w-full flex-col gap-2 rounded-8 border bg-gray-215 p-3 text-left hover:bg-gray-225",
          option.isHighlighted ? "border-track/45" : "border-gray-265",
        )}
      >
        <span className="flex items-center gap-2">
          <TrackSwatch tone={option.kind === "code" ? "neutral" : "track"} />
          <span className="text-title font-semibold">{option.title}</span>
        </span>
        <span className="text-small text-fg-2">{option.subtitle}</span>
        <CodeSnippet code={option.code} className="rounded-4 bg-gray-145 px-2 py-1.5 text-label" />
      </button>
    </TrackScope>
  );
}

/** Premier lancement : invitation à créer un clip, par-dessus la grille vide. */
export function EmptyStateCard() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center pl-30">
      <div className="pointer-events-auto flex w-155 flex-col gap-4.5 rounded-12 border border-gray-280 bg-gray-175/97 p-6 shadow-overlay">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-display font-semibold tracking-tight">Make your first loop</h2>
          <p className="text-title leading-normal text-pretty text-fg-2">
            Pick a clip type and start clicking. Every click writes Strudel code in the panel on the
            right — read along and you&apos;ll pick up the language.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {START_OPTIONS.map((option) => (
            <StartCard key={option.title} option={option} />
          ))}
        </div>
        <span className="text-small text-fg-3">Or click any empty slot. Press space to play.</span>
      </div>
    </div>
  );
}
