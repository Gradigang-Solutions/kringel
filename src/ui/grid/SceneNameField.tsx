import { cn } from "@/lib/cn";
import { NameInput } from "@/ui/primitives/NameInput";

export interface SceneNameFieldProps {
  readonly name: string;
  readonly isCompact: boolean;
  readonly onRename: (name: string) => void;
  readonly onDone: () => void;
}

/** Remplace le bouton de lancement le temps du renommage : un champ ne peut pas vivre dans un bouton. */
export function SceneNameField({ name, isCompact, onRename, onDone }: SceneNameFieldProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-6 border border-gray-450 bg-gray-185 px-1.5",
        isCompact ? "h-9.5" : "h-18",
      )}
    >
      <NameInput
        label="Scene name"
        value={name}
        size="sm"
        isAutoFocused
        onCommit={onRename}
        onDone={onDone}
        className="w-full min-w-0"
      />
    </div>
  );
}
