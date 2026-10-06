import { useMemo, useState } from "react";
import { clipRootCall } from "@/codegen/clip";
import { effectiveClipId, type PlaybackState } from "@/model/playback";
import { canAddScene } from "@/model/scenes";
import { canAddTrack, canRemoveTrack } from "@/model/tracks";
import type { Project, Track } from "@/model/types";
import { stopTrack } from "@/store/actions/clips";
import { addScene } from "@/store/actions/scenes";
import {
  addTrack,
  duplicateTrack,
  moveTrack,
  removeTrack,
  renameTrack,
} from "@/store/actions/tracks";
import { usePlaybackStore } from "@/store/playbackStore";
import { useProjectStore } from "@/store/projectStore";
import { AddToGridButton } from "@/ui/grid/AddToGridButton";
import { TrackHeader } from "@/ui/grid/TrackHeader";
import type { MenuItem } from "@/ui/primitives/Menu";
import { sessionGridStyle } from "@/ui/shared/sessionGrid";

/** Fonction affichée dans l'en-tête : celle du clip actif, sinon celle du premier clip de la piste. */
function trackRootCall(track: Track, playback: PlaybackState): string | null {
  const activeId = effectiveClipId(playback, track.id);
  const clip =
    track.clips.find((candidate) => candidate?.id === activeId) ?? track.clips.find(Boolean);
  return clip ? clipRootCall(clip) : null;
}

function trackMenuItems(
  project: Project,
  trackIndex: number,
  track: Track,
  onRename: () => void,
): MenuItem[] {
  return [
    { label: "Rename", onSelect: onRename },
    {
      label: "Duplicate",
      onSelect: () => duplicateTrack(track.id),
      isDisabled: !canAddTrack(project),
    },
    { label: "Move left", onSelect: () => moveTrack(track.id, -1), isDisabled: trackIndex === 0 },
    {
      label: "Move right",
      onSelect: () => moveTrack(track.id, 1),
      isDisabled: trackIndex === project.tracks.length - 1,
    },
    {
      label: "Delete",
      onSelect: () => removeTrack(track.id),
      isDisabled: !canRemoveTrack(project),
    },
  ];
}

/** Collée en haut quand la grille défile ; elle porte la marge du haut pour masquer ce qui passe dessous. */
export function TrackHeaderRow() {
  const project = useProjectStore((state) => state.project);
  const playback = usePlaybackStore((state) => state.playback);
  const [renamingTrackId, setRenamingTrackId] = useState<string | null>(null);
  const { tracks } = project;
  const rootCalls = useMemo(
    () => tracks.map((track) => trackRootCall(track, playback)),
    [tracks, playback],
  );
  return (
    <div
      className="grid-session sticky top-0 z-10 grid gap-2 bg-gray-155 pt-3"
      style={sessionGridStyle(tracks.length)}
    >
      {tracks.map((track, index) => (
        <TrackHeader
          key={track.id}
          name={track.name}
          color={track.color}
          rootCall={rootCalls[index] ?? null}
          menuItems={trackMenuItems(project, index, track, () => setRenamingTrackId(track.id))}
          isRenaming={renamingTrackId === track.id}
          onRename={(name) => renameTrack(track.id, name)}
          onRenameDone={() => setRenamingTrackId(null)}
          onStop={() => stopTrack(track.id)}
        />
      ))}
      <div className="flex h-8 items-center justify-center gap-1 text-tiny font-semibold tracking-caps text-fg-3">
        <span className="max-md:hidden">SCENES</span>
        <AddToGridButton
          canAddTrack={canAddTrack(project)}
          canAddScene={canAddScene(project)}
          onAddTrack={addTrack}
          onAddScene={addScene}
        />
      </div>
    </div>
  );
}
