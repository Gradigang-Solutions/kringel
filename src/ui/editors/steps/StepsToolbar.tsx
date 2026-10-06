import { clipControl } from "@/codegen/controls";
import { bankCall } from "@/codegen/steps";
import { DRUM_KITS, type KitSource } from "@/model/constants";
import { stepCount } from "@/model/timing";
import type { ClipCycles, StepsClip } from "@/model/types";
import { setKit, setStepsLength } from "@/store/actions/steps";
import { SegmentedControl } from "@/ui/primitives/SegmentedControl";
import { Select } from "@/ui/primitives/Select";
import { cycleOptions, parseCycles } from "@/ui/editors/cycleOptions";
import { EditorToolbar } from "@/ui/editors/EditorToolbar";
import { SwingControl } from "@/ui/editors/steps/SwingControl";
import { CodeLinked } from "@/ui/shared/CodeLinked";

const KIT_GROUPS: Readonly<Record<KitSource, string>> = {
  strudel: "Strudel",
  kringel: "Kringel · CC0",
};

export interface StepsToolbarProps {
  readonly clip: StepsClip;
  readonly trackId: string;
}

export function StepsToolbar({ clip, trackId }: StepsToolbarProps) {
  const steps = stepCount(clip.cycles);
  return (
    <EditorToolbar>
      <CodeLinked
        trackId={trackId}
        controls={[clipControl("kit")]}
        className="flex items-center gap-2"
      >
        <span className="text-label text-fg-3">Kit</span>
        <Select
          label="Drum kit"
          value={clip.kit}
          options={DRUM_KITS.map((kit) => ({
            value: kit.id,
            label: kit.id,
            group: KIT_GROUPS[kit.source],
          }))}
          onChange={(kit) => setKit(clip.id, kit)}
        />
        <span className="font-mono text-caption text-track">{bankCall(clip.kit)}</span>
      </CodeLinked>
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
      <CodeLinked trackId={trackId} controls={[clipControl("swing")]}>
        <SwingControl clip={clip} />
      </CodeLinked>
    </EditorToolbar>
  );
}
