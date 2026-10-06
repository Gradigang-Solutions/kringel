import { X } from "lucide-react";
import { useState } from "react";
import type { ClipKind } from "@/model/types";
import { closeEditor, renameClip, requestConversion } from "@/store/actions/clips";
import { IconButton } from "@/ui/primitives/IconButton";
import { SegmentedControl } from "@/ui/primitives/SegmentedControl";
import { TrackSwatch } from "@/ui/primitives/TrackSwatch";

export interface EditorHeaderProps {
  readonly clipId: string;
  readonly clipName: string;
  readonly kind: ClipKind;
  readonly trackName: string;
  readonly sceneLabel: string;
}

const KIND_LABELS: Readonly<Record<ClipKind, string>> = {
  steps: "Steps",
  notes: "Piano roll",
  code: "Code",
};

/** Un clip de pas ou de notes peut devenir du code ; l'inverse demanderait de relire du code (interdit). */
function editAsOptions(kind: ClipKind) {
  return (["steps", "notes", "code"] as const).map((option) => ({
    value: option,
    label: KIND_LABELS[option],
    isDisabled: option !== kind && option !== "code",
  }));
}

export function EditorHeader({ clipId, clipName, kind, trackName, sceneLabel }: EditorHeaderProps) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b border-gray-225 pr-3 pl-4 max-md:h-auto max-md:flex-wrap max-md:gap-2 max-md:py-2 max-md:pl-3">
      <div className="flex h-5.5 items-center gap-1.5 rounded-4 bg-track/15 px-2">
        <TrackSwatch size="sm" />
        <span className="text-label font-semibold text-track">{trackName}</span>
      </div>
      <input
        aria-label="Clip name"
        value={draft ?? clipName}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== null) renameClip(clipId, draft);
          setDraft(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="field-sizing-content min-w-16 rounded-4 bg-transparent px-1 text-heading font-semibold outline-none hover:bg-gray-205 focus:bg-gray-205"
      />
      <span className="text-body text-fg-3 max-md:hidden">{sceneLabel}</span>
      <span className="flex-1" />
      <span className="text-label text-fg-3 max-md:hidden">Edit as</span>
      <SegmentedControl
        label="Edit clip as"
        size="md"
        options={editAsOptions(kind)}
        value={kind}
        onChange={(next) => {
          if (next === "code" && kind !== "code") requestConversion(clipId);
        }}
        // Sur téléphone, sur sa propre ligne : le bouton de fermeture reste en haut à droite.
        className="max-md:order-last max-md:basis-full"
      />
      <IconButton label="Close editor" onClick={closeEditor}>
        <X size={15} aria-hidden />
      </IconButton>
    </div>
  );
}
