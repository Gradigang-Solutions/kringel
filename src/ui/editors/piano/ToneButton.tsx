import { clipFilterCall, envelopeCall } from "@/codegen/notes";
import { filterLabel, filterToPosition, positionToFilter } from "@/model/filter";
import { activeToneCount, envelopeLabel, envelopeMax, type EnvelopeParam } from "@/model/notes";
import type { NotesClip } from "@/model/types";
import { setClipFilter, setEnvelope } from "@/store/actions/notes";
import { useTrack } from "@/store/selectors";
import { Button } from "@/ui/primitives/Button";
import { Popover } from "@/ui/primitives/Popover";
import { ParamPanel } from "@/ui/shared/ParamPanel";
import { ParamSlider } from "@/ui/shared/ParamSlider";

export interface ToneButtonProps {
  readonly clip: NotesClip;
  readonly trackId: string;
}

const ENVELOPE_PARAMS = [
  { param: "attack", label: "Attack" },
  { param: "release", label: "Release" },
] as const satisfies readonly { param: EnvelopeParam; label: string }[];

/** Son propre au clip (enveloppe, passe-bas), rangé dans un panneau pour garder la barre compacte. */
export function ToneButton({ clip, trackId }: ToneButtonProps) {
  const track = useTrack(trackId);
  const activeCount = activeToneCount(clip);
  const isTrackFilterOn = (track?.mixer.lpf ?? null) !== null;
  return (
    <Popover
      label={`${clip.name} tone`}
      side="bottom"
      trigger={
        <Button variant="quiet" aria-label={`${clip.name} tone`}>
          Tone
          {activeCount > 0 ? <span className="font-mono text-track">{activeCount}</span> : null}
        </Button>
      }
    >
      <ParamPanel color={track?.color ?? ""} title={`${clip.name} · Tone`}>
        {ENVELOPE_PARAMS.map(({ param, label }) => (
          <ParamSlider
            key={param}
            label={label}
            valueLabel={envelopeLabel(clip[param])}
            code={envelopeCall(param, clip[param])}
            position={clip[param] / envelopeMax(param)}
            onChange={(position) => setEnvelope(clip.id, param, position * envelopeMax(param))}
          />
        ))}
        <ParamSlider
          label="Cutoff"
          valueLabel={filterLabel(clip.lpf)}
          code={clipFilterCall(clip.lpf)}
          position={filterToPosition("lpf", clip.lpf)}
          onChange={(position) => setClipFilter(clip.id, positionToFilter("lpf", position))}
          notice={clip.lpf !== null && isTrackFilterOn ? "Track filter wins" : undefined}
        />
      </ParamPanel>
    </Popover>
  );
}
