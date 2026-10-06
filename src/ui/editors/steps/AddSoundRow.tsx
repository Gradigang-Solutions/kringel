import { Plus } from "lucide-react";
import { DRUM_KITS } from "@/model/constants";
import type { StepsClip } from "@/model/types";
import { addStepRow, soundName } from "@/store/actions/steps";
import { Button } from "@/ui/primitives/Button";
import { Dropdown } from "@/ui/primitives/Menu";

const MAX_SUGGESTIONS = 5;

function unusedSounds(clip: StepsClip): string[] {
  const kitSounds: readonly string[] = DRUM_KITS.find((kit) => kit.id === clip.kit)?.sounds ?? [];
  const used = new Set(clip.rows.map((row) => row.sound));
  return kitSounds.filter((sound) => !used.has(sound));
}

/** Ajouter un son : menu complet, ou suggestions rapides tirées du kit. */
export function AddSoundRow({ clip }: { readonly clip: StepsClip }) {
  const available = unusedSounds(clip);
  return (
    <div className="grid-steps grid h-8.5 items-center gap-4">
      <Dropdown
        trigger={
          <Button
            variant="dashed"
            size="md"
            className="justify-start gap-1.5"
            disabled={available.length === 0}
          >
            <Plus size={13} aria-hidden />
            Add sound
          </Button>
        }
        items={available.map((sound) => ({
          label: `${soundName(sound)} (${sound})`,
          onSelect: () => addStepRow(clip.id, sound),
        }))}
      />
      <div className="flex items-center gap-1.5">
        {available.length > 0 ? (
          <span className="mr-1 text-label text-fg-3">From this kit:</span>
        ) : null}
        {available.slice(0, MAX_SUGGESTIONS).map((sound) => (
          <button
            key={sound}
            type="button"
            aria-label={`Add ${soundName(sound)}`}
            onClick={() => addStepRow(clip.id, sound)}
            className="rounded-4 border border-gray-265 bg-gray-215 px-2 py-0.75 font-mono text-label text-fg-2 hover:border-gray-330 hover:text-fg-1"
          >
            {sound}
          </button>
        ))}
      </div>
      <span className="max-md:hidden" />
    </div>
  );
}
