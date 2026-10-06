import { swingCall } from "@/codegen/steps";
import { SWING_RANGE } from "@/model/constants";
import type { StepsClip } from "@/model/types";
import { formatSwing, setSwing } from "@/store/actions/steps";
import { Slider } from "@/ui/primitives/Slider";

const SWING_STEP = 0.01;

/** Swing du clip : retard des contretemps, avec l'appel qu'il écrit. */
export function SwingControl({ clip }: { readonly clip: StepsClip }) {
  const code = swingCall(clip.swing);
  return (
    <div className="flex items-center gap-2">
      <span className="text-label text-fg-3">Swing</span>
      <div className="w-20">
        <Slider
          label="Swing"
          value={clip.swing}
          min={SWING_RANGE.min}
          max={SWING_RANGE.max}
          step={SWING_STEP}
          valueText={formatSwing(clip.swing)}
          onChange={(swing) => setSwing(clip.id, swing)}
        />
      </div>
      <span className="w-8 font-mono text-caption">{formatSwing(clip.swing)}</span>
      <span className="font-mono text-caption whitespace-nowrap text-track max-md:hidden">
        {code ?? ""}
      </span>
    </div>
  );
}
