import { X } from "lucide-react";
import type { ClipKind } from "@/model/types";
import { closeEditor, renameClip, requestConversion } from "@/store/actions/clips";
import { IconButton } from "@/ui/primitives/IconButton";
import { NameInput } from "@/ui/primitives/NameInput";
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
  return (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b border-gray-225 pr-3 pl-4 max-md:h-auto max-md:flex-wrap max-md:gap-2 max-md:py-2 max-md:pl-3">
      <div className="flex h-5.5 items-center gap-1.5 rounded-4 bg-track/15 px-2">
        <TrackSwatch size="sm" />
        <span className="text-label font-semibold text-track">{trackName}</span>
      </div>
      <NameInput
        label="Clip name"
        value={clipName}
        size="xl"
        onCommit={(name) => renameClip(clipId, name)}
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
