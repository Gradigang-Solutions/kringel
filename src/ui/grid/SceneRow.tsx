import { useState } from "react";
import { isSceneActive } from "@/model/playback";
import { canAddScene, canRemoveScene } from "@/model/scenes";
import type { Project } from "@/model/types";
import { duplicateScene, moveScene, removeScene, renameScene } from "@/store/actions/scenes";
import { usePlaybackStore } from "@/store/playbackStore";
import { useProjectStore } from "@/store/projectStore";
import { launchSceneAndPlay } from "@/ui/app/playbackController";
import { ClipSlot } from "@/ui/grid/ClipSlot";
import { SceneLaunchButton } from "@/ui/grid/SceneLaunchButton";
import { SceneNameField } from "@/ui/grid/SceneNameField";
import { ContextMenuArea, type MenuItem } from "@/ui/primitives/Menu";
import { sessionGridStyle } from "@/ui/shared/sessionGrid";
import { TrackScope } from "@/ui/shared/TrackScope";

export interface SceneRowProps {
  readonly sceneIndex: number;
  readonly isCompact: boolean;
  readonly isProjectEmpty: boolean;
}

function sceneMenuItems(project: Project, sceneIndex: number, onRename: () => void): MenuItem[] {
  return [
    { label: "Rename", onSelect: onRename },
    {
      label: "Duplicate",
      onSelect: () => duplicateScene(sceneIndex),
      isDisabled: !canAddScene(project),
    },
    { label: "Move up", onSelect: () => moveScene(sceneIndex, -1), isDisabled: sceneIndex === 0 },
    {
      label: "Move down",
      onSelect: () => moveScene(sceneIndex, 1),
      isDisabled: sceneIndex === project.scenes.length - 1,
    },
    {
      label: "Delete",
      onSelect: () => removeScene(sceneIndex),
      isDisabled: !canRemoveScene(project),
    },
  ];
}

export function SceneRow({ sceneIndex, isCompact, isProjectEmpty }: SceneRowProps) {
  const project = useProjectStore((state) => state.project);
  const isActive = usePlaybackStore((state) => isSceneActive(state.playback, project, sceneIndex));
  const [isRenaming, setIsRenaming] = useState(false);
  const scene = project.scenes[sceneIndex];
  if (!scene) return null;
  return (
    <div className="grid-session grid gap-2" style={sessionGridStyle(project.tracks.length)}>
      {project.tracks.map((track, trackIndex) => (
        <TrackScope key={track.id} color={track.color}>
          <ClipSlot
            address={{ trackId: track.id, sceneIndex }}
            defaultKind={track.defaultClipKind}
            isCompact={isCompact}
            isInvite={isProjectEmpty && trackIndex === 0 && sceneIndex === 0}
          />
        </TrackScope>
      ))}
      {isRenaming ? (
        <SceneNameField
          name={scene.name}
          isCompact={isCompact}
          onRename={(name) => renameScene(sceneIndex, name)}
          onDone={() => setIsRenaming(false)}
        />
      ) : (
        <ContextMenuArea items={sceneMenuItems(project, sceneIndex, () => setIsRenaming(true))}>
          <SceneLaunchButton
            name={scene.name}
            number={sceneIndex + 1}
            isActive={isActive}
            isDisabled={isProjectEmpty}
            isCompact={isCompact}
            onLaunch={() => launchSceneAndPlay(sceneIndex)}
          />
        </ContextMenuArea>
      )}
    </div>
  );
}
