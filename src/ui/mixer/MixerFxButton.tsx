import { formatMixerCall } from "@/codegen/mixer";
import { DELAY_RANGE, DRIVE_RANGE } from "@/model/constants";
import { filterLabel, filterToPosition, positionToFilter } from "@/model/filter";
import type { Track } from "@/model/types";
import { setFilter, setMixerParam } from "@/store/actions/mixer";
import { activeFxCount } from "@/ui/mixer/fxParams";
import { stripButtonVariants } from "@/ui/mixer/stripButtonStyle";
import { Popover } from "@/ui/primitives/Popover";
import { ParamPanel } from "@/ui/shared/ParamPanel";
import { ParamSlider } from "@/ui/shared/ParamSlider";

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
      <ParamPanel color={track.color} title={`${track.name} · FX`}>
        <ParamSlider
          label="High-pass"
          valueLabel={filterLabel(mixer.hpf)}
          code={formatMixerCall("hpf", mixer)}
          position={filterToPosition("hpf", mixer.hpf)}
          onChange={(position) => setFilter(track.id, "hpf", positionToFilter("hpf", position))}
        />
        <ParamSlider
          label="Drive"
          valueLabel={mixer.distort.toFixed(2)}
          code={formatMixerCall("distort", mixer)}
          position={mixer.distort / DRIVE_RANGE.max}
          onChange={(position) => setMixerParam(track.id, "distort", position * DRIVE_RANGE.max)}
        />
        <ParamSlider
          label="Delay"
          valueLabel={mixer.delay.toFixed(2)}
          code={formatMixerCall("delay", mixer)}
          position={mixer.delay / DELAY_RANGE.max}
          onChange={(position) => setMixerParam(track.id, "delay", position * DELAY_RANGE.max)}
        />
      </ParamPanel>
    </Popover>
  );
}
