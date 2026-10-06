import { explainCodeError } from "@/model/codeErrors";
import { playedSource } from "@/model/playback";
import type { CodeClip } from "@/model/types";
import { setCodeSource } from "@/store/actions/code";
import { usePlaybackStore } from "@/store/playbackStore";
import { useTrack } from "@/store/selectors";
import { CodePreview } from "@/ui/editors/code/CodePreview";
import { CodeToolbar } from "@/ui/editors/code/CodeToolbar";
import { EditableCode } from "@/ui/editors/code/EditableCode";
import { ErrorBanner } from "@/ui/editors/code/ErrorBanner";
import { useCodeCheck } from "@/ui/editors/code/useCodeCheck";
import { useClipPlayhead } from "@/ui/editors/useClipPlayhead";

export interface CodeClipEditorProps {
  readonly clip: CodeClip;
  readonly trackId: string;
}

/** Clip de code : éditeur à gauche, aperçu du résultat à droite, erreur expliquée en dessous. */
export function CodeClipEditor({ clip, trackId }: CodeClipEditorProps) {
  const trackColor = useTrack(trackId)?.color ?? "";
  const check = usePlaybackStore((state) => state.playback.codeChecks[clip.id]);
  const lastValidSource = usePlaybackStore((state) => playedSource(state.playback, clip.id));
  const playhead = useClipPlayhead(trackId, clip.id, 1);
  const run = useCodeCheck(clip.id, clip.source);
  const error = check?.status === "invalid" ? check.error : null;
  const isStale = error !== null;
  return (
    <>
      <CodeToolbar
        hasError={isStale}
        isPlayingLastValid={isStale && lastValidSource !== null && playhead.isAnimated}
        onRun={run}
      />
      <div className="flex min-h-0 flex-1 max-md:flex-col">
        <div className="flex min-w-0 flex-code-editor flex-col border-r border-gray-235 bg-gray-145 max-md:border-r-0 max-md:border-b">
          <div className="min-h-0 flex-1">
            <EditableCode
              source={clip.source}
              error={error}
              onChange={(source) => setCodeSource(clip.id, source)}
              onRun={run}
            />
          </div>
          {error ? <ErrorBanner explanation={explainCodeError(clip.source, error)} /> : null}
        </div>
        <CodePreview
          source={check === undefined ? clip.source : lastValidSource}
          isStale={isStale}
          trackColor={trackColor}
          playhead={playhead}
        />
      </div>
    </>
  );
}
