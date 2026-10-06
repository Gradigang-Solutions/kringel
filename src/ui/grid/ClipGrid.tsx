import { cn } from "@/lib/cn";
import { useProjectStore } from "@/store/projectStore";
import { useHasAnyClip } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { EmptyStateCard } from "@/ui/grid/EmptyStateCard";
import { SceneRow } from "@/ui/grid/SceneRow";
import { TrackHeaderRow } from "@/ui/grid/TrackHeaderRow";

export interface ClipGridProps {
  /** Invitation du premier lancement posée sur la grille vide ; le téléphone l'affiche au-dessus. */
  readonly hasEmptyStateOverlay: boolean;
}

/** Grille de clips : compacte quand un éditeur occupe le bas de l'écran, défilante sur téléphone. */
export function ClipGrid({ hasEmptyStateOverlay }: ClipGridProps) {
  const sceneCount = useProjectStore((state) => state.project.scenes.length);
  const isCompact = useUiStore((state) => state.editorClipId !== null);
  const hasAnyClip = useHasAnyClip();
  return (
    <section
      aria-label="Clip grid"
      className="flex shrink-0 flex-col gap-1.5 px-3 pt-3 max-md:overflow-x-auto"
    >
      <TrackHeaderRow />
      <div className={cn("relative flex flex-col", isCompact ? "gap-1" : "gap-1.5")}>
        {Array.from({ length: sceneCount }, (_, sceneIndex) => (
          <SceneRow
            key={sceneIndex}
            sceneIndex={sceneIndex}
            isCompact={isCompact}
            isProjectEmpty={!hasAnyClip}
          />
        ))}
        {hasAnyClip || !hasEmptyStateOverlay ? null : <EmptyStateCard layout="overlay" />}
      </div>
    </section>
  );
}
