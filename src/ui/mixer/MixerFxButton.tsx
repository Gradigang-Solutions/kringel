import { formatMixerCall } from "@/codegen/mixer";
import { DELAY_RANGE, DRIVE_RANGE } from "@/model/constants";
import { filterLabel, filterToPosition, positionToFilter } from "@/model/mixer";
import type { Track } from "@/model/types";
import { setFilter, setMixerParam } from "@/store/actions/mixer";
import { activeFxCount } from "@/ui/mixer/fxParams";
import { MixerParam } from "@/ui/mixer/MixerParam";
import { stripButtonVariants } from "@/ui/mixer/stripButtonStyle";
import { Popover } from "@/ui/primitives/Popover";
import { TrackScope } from "@/ui/shared/TrackScope";

export interface MixerFxButtonProps {
  readonly track: Track;
}

/** Effets moins courants (passe-haut, distorsion, écho), rangés dans un panneau pour garder la tranche lisible. */
export function MixerFxButton({ track }: MixerFxButtonProps) {
  const { mixer } = track;
  const activeCount = activeFxCount(mixer);
  return (
    <Popover
      label={`${track.name} effects`}
      trigger={
        <button
          type="button"
          aria-label={`${track.name} effects`}
          className={stripButtonVariants({ tone: activeCount > 0 ? "accent" : "off" })}
        >
          FX
          {activeCount > 0 ? <span className="font-mono">{activeCount}</span> : null}
        </button>
      }
    >
      {/* Le panneau s'ouvre hors de la tranche : il repose la couleur de la piste. */}
      <TrackScope color={track.color} className="flex w-48 flex-col gap-3">
        <span className="text-caption font-semibold tracking-caps text-track uppercase">
          {track.name} · FX
        </span>
        <MixerParam
          label="High-pass"
          valueLabel={filterLabel(mixer.hpf)}
          code={formatMixerCall("hpf", mixer)}
          position={filterToPosition("hpf", mixer.hpf)}
          onChange={(position) => setFilter(track.id, "hpf", positionToFilter("hpf", position))}
        />
        <MixerParam
          label="Drive"
          valueLabel={mixer.distort.toFixed(2)}
          code={formatMixerCall("distort", mixer)}
          position={mixer.distort / DRIVE_RANGE.max}
          onChange={(position) => setMixerParam(track.id, "distort", position * DRIVE_RANGE.max)}
        />
        <MixerParam
          label="Delay"
          valueLabel={mixer.delay.toFixed(2)}
          code={formatMixerCall("delay", mixer)}
          position={mixer.delay / DELAY_RANGE.max}
          onChange={(position) => setMixerParam(track.id, "delay", position * DELAY_RANGE.max)}
        />
      </TrackScope>
    </Popover>
  );
}
