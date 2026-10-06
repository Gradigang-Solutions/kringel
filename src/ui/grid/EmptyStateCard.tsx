import { cva } from "class-variance-authority";
import type { ClipKind, Track } from "@/model/types";
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
  /** Piste visée dans un nouveau projet ; à défaut, la première piste du bon type. */
  readonly trackName: string;
  readonly isHighlighted: boolean;
}

const START_OPTIONS: readonly StartOption[] = [
  {
    title: "Drum pattern",
    subtitle: "Step sequencer",
    code: 's("bd*4")',
    kind: "steps",
    trackName: "Drums",
    isHighlighted: true,
  },
  {
    title: "Melody",
    subtitle: "Piano roll",
    code: 'note("c3 eb3 g3")',
    kind: "notes",
    trackName: "Lead",
    isHighlighted: false,
  },
  {
    title: "Code",
    subtitle: "Write Strudel yourself",
    code: "// start typing",
    kind: "code",
    trackName: "Pad",
    isHighlighted: false,
  },
];

function startTrack(tracks: readonly Track[], option: StartOption): Track | undefined {
  return (
    tracks.find((track) => track.name === option.trackName) ??
    tracks.find((track) => track.defaultClipKind === option.kind) ??
    tracks[0]
  );
}

function StartCard({ option }: { readonly option: StartOption }) {
  const track = useProjectStore((state) => startTrack(state.project.tracks, option));
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

type EmptyStateLayout = "overlay" | "inline";

const wrapperVariants = cva("", {
  variants: {
    layout: {
      overlay: "pointer-events-none absolute inset-0 flex items-center justify-center pl-30",
      inline: "px-3 pt-3",
    },
  },
});

const cardVariants = cva("flex flex-col rounded-12 border border-gray-280", {
  variants: {
    layout: {
      overlay: "pointer-events-auto w-155 gap-4.5 bg-gray-175/97 p-6 shadow-overlay",
      inline: "gap-3.5 bg-gray-175 p-4",
    },
  },
});

const optionsVariants = cva("grid gap-2.5", {
  variants: { layout: { overlay: "grid-cols-3", inline: "grid-cols-1" } },
});

/** Sur téléphone, le code est dans un onglet et il n'y a pas de barre d'espace. */
const GUIDANCE: Readonly<
  Record<EmptyStateLayout, { readonly where: string; readonly hint: string }>
> = {
  overlay: {
    where: "in the panel on the right",
    hint: "Or click any empty slot. Press space to play.",
  },
  inline: { where: "in the Code tab", hint: "Or tap any empty slot below." },
};

export interface EmptyStateCardProps {
  /** Par-dessus la grille vide (desktop), ou au-dessus d'elle (téléphone). */
  readonly layout: EmptyStateLayout;
}

/** Premier lancement : invitation à créer un clip. */
export function EmptyStateCard({ layout }: EmptyStateCardProps) {
  const guidance = GUIDANCE[layout];
  return (
    <div className={wrapperVariants({ layout })}>
      <div className={cardVariants({ layout })}>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-display font-semibold tracking-tight">Make your first loop</h2>
          <p className="text-title leading-normal text-pretty text-fg-2">
            Pick a clip type and start clicking. Every click writes Strudel code {guidance.where} —
            read along and you&apos;ll pick up the language.
          </p>
        </div>
        <div className={optionsVariants({ layout })}>
          {START_OPTIONS.map((option) => (
            <StartCard key={option.title} option={option} />
          ))}
        </div>
        <span className="text-small text-fg-3">{guidance.hint}</span>
      </div>
    </div>
  );
}
