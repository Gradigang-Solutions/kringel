import { quote } from "@/codegen/format";
import { DRUM_KITS } from "@/model/constants";
import { stepCount } from "@/model/timing";
import type { ClipCycles, StepsClip } from "@/model/types";
import { setKit, setStepsLength } from "@/store/actions/steps";
import { SegmentedControl } from "@/ui/primitives/SegmentedControl";
import { Select } from "@/ui/primitives/Select";
import { cycleOptions, parseCycles } from "@/ui/editors/cycleOptions";

export function StepsToolbar({ clip }: { readonly clip: StepsClip }) {
  const steps = stepCount(clip.cycles);
  return (
    <div className="flex h-10 shrink-0 items-center gap-5.5 border-b border-gray-225 px-4">
      <div className="flex items-center gap-2">
        <span className="text-label text-fg-3">Kit</span>
        <Select
          label="Drum kit"
          value={clip.kit}
          options={DRUM_KITS.map((kit) => ({ value: kit.id, label: kit.id }))}
          onChange={(kit) => setKit(clip.id, kit)}
        />
        <span className="font-mono text-caption text-track">.bank({quote(clip.kit)})</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-label text-fg-3">Length</span>
        <SegmentedControl
          label="Clip length in cycles"
          options={cycleOptions()}
          value={String(clip.cycles)}
          onChange={(value) => {
            const cycles: ClipCycles | null = parseCycles(value);
            if (cycles !== null) setStepsLength(clip.id, cycles);
          }}
        />
        <span className="text-label whitespace-nowrap text-fg-3">
          {steps} steps · {clip.cycles} {clip.cycles === 1 ? "cycle" : "cycles"}
        </span>
      </div>
    </div>
  );
}
