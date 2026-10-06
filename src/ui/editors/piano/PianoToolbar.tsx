import { Trash2 } from "lucide-react";
import { PITCH_CLASS_NAMES, SCALE_MODES, SOUND_SOURCES } from "@/model/constants";
import { soundsForSource } from "@/model/notes";
import type { NotesClip, SoundSource } from "@/model/types";
import {
  deleteNote,
  setNotesLength,
  setOutOfScaleGrayed,
  setScale,
  setSound,
} from "@/store/actions/notes";
import { useUiStore } from "@/store/uiStore";
import { cycleOptions, parseCycles } from "@/ui/editors/cycleOptions";
import { SegmentedControl } from "@/ui/primitives/SegmentedControl";
import { Select } from "@/ui/primitives/Select";
import { IconButton } from "@/ui/primitives/IconButton";
import { Switch } from "@/ui/primitives/Switch";
import { EditorToolbar } from "@/ui/editors/EditorToolbar";
import { ToneButton } from "@/ui/editors/piano/ToneButton";

const SOURCE_LABELS: Readonly<Record<SoundSource, string>> = { synth: "Synth", sample: "Sample" };
const LABEL = "text-label text-fg-3";

export interface PianoToolbarProps {
  readonly clip: NotesClip;
  readonly trackId: string;
}

export function PianoToolbar({ clip, trackId }: PianoToolbarProps) {
  const isOutOfScaleGrayed = useUiStore((state) => state.isOutOfScaleGrayed);
  const selectedNoteId = useUiStore((state) => state.selectedNoteId);
  return (
    <EditorToolbar>
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
        <ToneButton clip={clip} trackId={trackId} />
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
      {/* Au doigt, ni touche Suppr ni double-clic fiable : un bouton supprime la note sélectionnée. */}
      {selectedNoteId === null ? null : (
        <IconButton
          label="Delete note"
          size="sm"
          onClick={() => deleteNote(clip.id, selectedNoteId)}
          className="md:hidden"
        >
          <Trash2 size={14} aria-hidden />
        </IconButton>
      )}
    </EditorToolbar>
  );
}
