import { isSceneActive } from "@/model/playback";
import { usePlaybackStore } from "@/store/playbackStore";
import { useProjectStore } from "@/store/projectStore";
import { launchSceneAndPlay } from "@/ui/app/playbackController";
import { ClipSlot } from "@/ui/grid/ClipSlot";
import { SceneLaunchButton } from "@/ui/grid/SceneLaunchButton";
import { TrackScope } from "@/ui/shared/TrackScope";

export interface SceneRowProps {
  readonly sceneIndex: number;
  readonly isCompact: boolean;
  readonly isProjectEmpty: boolean;
}

export function SceneRow({ sceneIndex, isCompact, isProjectEmpty }: SceneRowProps) {
  const project = useProjectStore((state) => state.project);
  const isActive = usePlaybackStore((state) => isSceneActive(state.playback, project, sceneIndex));
  const scene = project.scenes[sceneIndex];
  if (!scene) return null;
  return (
    <div className="grid-session grid gap-2">
      {project.tracks.map((track, trackIndex) => (
        <TrackScope key={track.id} color={track.color}>
          <ClipSlot
            address={{ trackId: track.id, sceneIndex }}
            trackIndex={trackIndex}
            isCompact={isCompact}
            isInvite={isProjectEmpty && trackIndex === 0 && sceneIndex === 0}
          />
        </TrackScope>
      ))}
      <SceneLaunchButton
        name={scene.name}
        number={sceneIndex + 1}
        isActive={isActive}
        isDisabled={isProjectEmpty}
        isCompact={isCompact}
        onLaunch={() => launchSceneAndPlay(sceneIndex)}
      />
    </div>
  );
}
