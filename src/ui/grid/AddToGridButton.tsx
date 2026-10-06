import { Plus } from "lucide-react";
import type { ClipKind } from "@/model/types";
import { IconButton } from "@/ui/primitives/IconButton";
import { Dropdown, type MenuItem } from "@/ui/primitives/Menu";

const TRACK_KIND_LABELS: Readonly<Record<ClipKind, string>> = {
  steps: "New drum track",
  notes: "New synth track",
  code: "New code track",
};

export interface AddToGridButtonProps {
  readonly canAddTrack: boolean;
  readonly canAddScene: boolean;
  /** Le type choisi est celui des clips créés d'un clic dans les cases vides de la piste. */
  readonly onAddTrack: (kind: ClipKind) => void;
  readonly onAddScene: () => void;
}

/** Un seul bouton pour agrandir la grille : une piste à droite, ou une scène en bas. */
export function AddToGridButton({
  canAddTrack,
  canAddScene,
  onAddTrack,
  onAddScene,
}: AddToGridButtonProps) {
  const trackItems: MenuItem[] = (["steps", "notes", "code"] as const).map((kind) => ({
    label: TRACK_KIND_LABELS[kind],
    onSelect: () => onAddTrack(kind),
    isDisabled: !canAddTrack,
  }));
  return (
    <Dropdown
      trigger={
        <IconButton label="Add track or scene" variant="ghost" size="sm">
          <Plus size={13} aria-hidden />
        </IconButton>
      }
      items={[
        ...trackItems,
        { label: "New scene", onSelect: onAddScene, isDisabled: !canAddScene },
      ]}
    />
  );
}
