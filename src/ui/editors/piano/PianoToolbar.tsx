import { PITCH_CLASS_NAMES, SCALE_MODES, SOUND_SOURCES } from "@/model/constants";
import { soundsForSource } from "@/model/notes";
import type { NotesClip, SoundSource } from "@/model/types";
import { setNotesLength, setOutOfScaleGrayed, setScale, setSound } from "@/store/actions/notes";
import { useUiStore } from "@/store/uiStore";
import { cycleOptions, parseCycles } from "@/ui/editors/cycleOptions";
import { SegmentedControl } from "@/ui/primitives/SegmentedControl";
import { Select } from "@/ui/primitives/Select";
import { Switch } from "@/ui/primitives/Switch";

const SOURCE_LABELS: Readonly<Record<SoundSource, string>> = { synth: "Synth", sample: "Sample" };
const LABEL = "text-label text-fg-3";

export function PianoToolbar({ clip }: { readonly clip: NotesClip }) {
  const isOutOfScaleGrayed = useUiStore((state) => state.isOutOfScaleGrayed);
  return (
    <div className="flex h-10 shrink-0 items-center gap-5.5 border-b border-gray-225 px-4">
      <div className="flex items-center gap-2">
        <span className={LABEL}>Scale</span>
        <Select
          label="Scale root"
          value={String(clip.root)}
          options={PITCH_CLASS_NAMES.map((name, pitchClass) => ({
            value: String(pitchClass),
            label: name,
          }))}
          onChange={(value) => setScale(clip.id, Number(value), clip.scale)}
        />
        <Select
          label="Scale mode"
          value={clip.scale}
          options={SCALE_MODES.map((mode) => ({ value: mode.id, label: mode.label }))}
          onChange={(value) => {
            const mode = SCALE_MODES.find((candidate) => candidate.id === value);
            if (mode) setScale(clip.id, clip.root, mode.id);
          }}
        />
        <div className="ml-1.5">
          <Switch
            isChecked={isOutOfScaleGrayed}
            onChange={setOutOfScaleGrayed}
            label="Gray out other notes"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={LABEL}>Sound</span>
        <SegmentedControl
          label="Sound source"
          options={SOUND_SOURCES.map((source) => ({ value: source, label: SOURCE_LABELS[source] }))}
          value={clip.soundSource}
          onChange={(source) => setSound(clip.id, source, clip.sound)}
        />
        <Select
          label="Sound"
          value={clip.sound}
          options={soundsForSource(clip.soundSource).map((sound) => ({
            value: sound,
            label: sound,
          }))}
          onChange={(sound) => setSound(clip.id, clip.soundSource, sound)}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className={LABEL}>Length</span>
        <SegmentedControl
          label="Clip length in cycles"
          options={cycleOptions()}
          value={String(clip.cycles)}
          onChange={(value) => {
            const cycles = parseCycles(value);
            if (cycles !== null) setNotesLength(clip.id, cycles);
          }}
        />
        <span className="text-label whitespace-nowrap text-fg-3">cycles</span>
      </div>
    </div>
  );
}
