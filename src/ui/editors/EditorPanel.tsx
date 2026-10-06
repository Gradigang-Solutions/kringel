import { assertNever } from "@/lib/assertNever";
import { useProjectStore } from "@/store/projectStore";
import { useEditorClip } from "@/store/selectors";
import { CodeClipEditor } from "@/ui/editors/code/CodeClipEditor";
import { EditorHeader } from "@/ui/editors/EditorHeader";
import { PianoRollEditor } from "@/ui/editors/piano/PianoRollEditor";
import { StepsEditor } from "@/ui/editors/steps/StepsEditor";
import { TrackScope } from "@/ui/shared/TrackScope";
import type { LocatedClip } from "@/model/project";

function EditorBody({ located }: { readonly located: LocatedClip }) {
  const { clip, track } = located;
  switch (clip.kind) {
    case "steps":
      return <StepsEditor clip={clip} trackId={track.id} />;
    case "notes":
      return <PianoRollEditor clip={clip} trackId={track.id} />;
    case "code":
      return <CodeClipEditor clip={clip} trackId={track.id} />;
    default:
      return assertNever(clip);
  }
}

/** Panneau bas d'édition du clip ouvert ; la grille reste visible au-dessus. */
export function EditorPanel() {
  const located = useEditorClip();
  const scenes = useProjectStore((state) => state.project.scenes);
  if (!located) return null;
  const scene = scenes[located.sceneIndex];
  return (
    <TrackScope
      color={located.track.color}
      className="mt-2.5 flex min-h-0 flex-1 flex-col border-t border-gray-280 bg-gray-175 max-md:mt-0 max-md:border-t-0"
    >
      <EditorHeader
        clipId={located.clip.id}
        clipName={located.clip.name}
        kind={located.clip.kind}
        trackName={located.track.name}
        sceneLabel={`Scene ${located.sceneIndex + 1} · ${scene?.name ?? ""}`}
      />
      <EditorBody key={located.clip.id} located={located} />
    </TrackScope>
  );
}
