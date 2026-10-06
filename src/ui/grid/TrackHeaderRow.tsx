import { useMemo } from "react";
import { clipRootCall } from "@/codegen/clip";
import { effectiveClipId, type PlaybackState } from "@/model/playback";
import type { Track } from "@/model/types";
import { stopTrack } from "@/store/actions/clips";
import { usePlaybackStore } from "@/store/playbackStore";
import { useProjectStore } from "@/store/projectStore";
import { TrackHeader } from "@/ui/grid/TrackHeader";

/** Fonction affichée dans l'en-tête : celle du clip actif, sinon celle du premier clip de la piste. */
function trackRootCall(track: Track, playback: PlaybackState): string | null {
  const activeId = effectiveClipId(playback, track.id);
  const clip =
    track.clips.find((candidate) => candidate?.id === activeId) ?? track.clips.find(Boolean);
  return clip ? clipRootCall(clip) : null;
}

export function TrackHeaderRow() {
  const tracks = useProjectStore((state) => state.project.tracks);
  const playback = usePlaybackStore((state) => state.playback);
  const rootCalls = useMemo(
    () => tracks.map((track) => trackRootCall(track, playback)),
    [tracks, playback],
  );
  return (
    <div className="grid-session grid gap-2">
      {tracks.map((track, index) => (
        <TrackHeader
          key={track.id}
          name={track.name}
          color={track.color}
          rootCall={rootCalls[index] ?? null}
          onStop={() => stopTrack(track.id)}
        />
      ))}
      <div className="flex h-8 items-center justify-center text-tiny font-semibold tracking-caps text-fg-3">
        SCENES
      </div>
    </div>
  );
}
