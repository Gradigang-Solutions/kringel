import { formatMixerCall } from "@/codegen/mixer";
import { cn } from "@/lib/cn";
import { GAIN_RANGE, MIXER_DEFAULTS, ROOM_RANGE } from "@/model/constants";
import {
  formatDecibels,
  gainToDecibels,
  lpfLabel,
  lpfToPosition,
  panLabel,
  positionToLpf,
} from "@/model/mixer";
import type { Track } from "@/model/types";
import { setLpf, setMixerParam, toggleMute, toggleSolo } from "@/store/actions/mixer";
import { MixerParam } from "@/ui/mixer/MixerParam";
import { Fader } from "@/ui/primitives/Fader";
import { TrackScope } from "@/ui/shared/TrackScope";

const GAIN_STEP = 0.01;

function ToggleButton({
  label,
  title,
  isOn,
  onClick,
}: {
  readonly label: string;
  readonly title: string;
  readonly isOn: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={title}
      aria-pressed={isOn}
      onClick={onClick}
      className={cn(
        "flex h-6 flex-1 items-center justify-center rounded-5 text-label font-semibold",
        isOn
          ? "bg-fg-1 text-fg-inverse"
          : "bg-gray-235 text-fg-2 hover:bg-gray-250 hover:text-fg-1",
      )}
    >
      {label}
    </button>
  );
}

export interface MixerStripProps {
  readonly track: Track;
}

export function MixerStrip({ track }: MixerStripProps) {
  const { mixer } = track;
  const gainCode = formatMixerCall("gain", mixer);
  return (
    <TrackScope
      color={track.color}
      className="flex min-h-0 flex-col gap-2.5 rounded-8 border border-gray-225 bg-gray-185 px-3 py-2.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-caption font-semibold tracking-caps text-track uppercase">
          {track.name}
        </span>
        <span className="font-mono text-caption text-fg-3">
          {formatDecibels(gainToDecibels(mixer.gain))} dB
        </span>
      </div>
      <div className="flex min-h-0 flex-1 gap-3.5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="min-h-0 flex-1">
            <Fader
              value={mixer.gain}
              min={GAIN_RANGE.min}
              max={GAIN_RANGE.max}
              step={GAIN_STEP}
              unity={MIXER_DEFAULTS.gain}
              onChange={(gain) => setMixerParam(track.id, "gain", gain)}
              label={`${track.name} volume`}
              valueText={mixer.gain.toFixed(2)}
            />
          </div>
          <span className="font-mono text-caption">{mixer.gain.toFixed(2)}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <MixerParam
            label="Pan"
            valueLabel={panLabel(mixer.pan)}
            code={formatMixerCall("pan", mixer)}
            position={mixer.pan}
            fillFrom="center"
            onChange={(pan) => setMixerParam(track.id, "pan", pan)}
          />
          <MixerParam
            label="Filter"
            valueLabel={lpfLabel(mixer.lpf)}
            code={formatMixerCall("lpf", mixer)}
            position={lpfToPosition(mixer.lpf)}
            onChange={(position) => setLpf(track.id, positionToLpf(position))}
          />
          <MixerParam
            label="Reverb"
            valueLabel={mixer.room.toFixed(2)}
            code={formatMixerCall("room", mixer)}
            position={mixer.room / ROOM_RANGE.max}
            onChange={(room) => setMixerParam(track.id, "room", room * ROOM_RANGE.max)}
          />
          <div className="flex-1" />
          <div className="flex gap-1.5">
            <ToggleButton
              label="M"
              title={`Mute ${track.name}`}
              isOn={mixer.isMuted}
              onClick={() => toggleMute(track.id)}
            />
            <ToggleButton
              label="S"
              title={`Solo ${track.name}`}
              isOn={mixer.isSoloed}
              onClick={() => toggleSolo(track.id)}
            />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "border-t border-gray-235 pt-2 font-mono text-caption",
          gainCode ? "text-track" : "text-fg-3",
        )}
      >
        {gainCode ?? "gain · default"}
      </div>
    </TrackScope>
  );
}
