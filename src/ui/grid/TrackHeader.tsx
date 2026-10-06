import { Square } from "lucide-react";
import { IconButton } from "@/ui/primitives/IconButton";
import { ContextMenuArea, Dropdown, type MenuItem } from "@/ui/primitives/Menu";
import { NameInput } from "@/ui/primitives/NameInput";
import { TrackSwatch } from "@/ui/primitives/TrackSwatch";
import { TrackScope } from "@/ui/shared/TrackScope";

export interface TrackHeaderProps {
  readonly name: string;
  readonly color: string;
  /** Fonction principale du clip actif (« s() », « n() »…), null si la piste est vide. */
  readonly rootCall: string | null;
  /** Actions de la piste : menu ouvert depuis le nom, ou d'un clic droit sur l'en-tête. */
  readonly menuItems: readonly MenuItem[];
  readonly isRenaming: boolean;
  readonly onRename: (name: string) => void;
  readonly onRenameDone: () => void;
  readonly onStop: () => void;
}

export function TrackHeader({
  name,
  color,
  rootCall,
  menuItems,
  isRenaming,
  onRename,
  onRenameDone,
  onStop,
}: TrackHeaderProps) {
  return (
    <ContextMenuArea items={menuItems}>
      <TrackScope
        color={color}
        className="relative flex h-8 items-center gap-2 overflow-hidden rounded-6 bg-gray-195 pr-1 pl-2.5"
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-track" />
        <TrackSwatch />
        {isRenaming ? (
          <NameInput
            label="Track name"
            value={name}
            isAutoFocused
            onCommit={onRename}
            onDone={onRenameDone}
            className="min-w-0"
          />
        ) : (
          <Dropdown
            trigger={
              <button
                type="button"
                aria-label={`${name} track menu`}
                className="truncate rounded-4 px-1 text-body font-semibold hover:bg-gray-225"
              >
                {name}
              </button>
            }
            items={menuItems}
          />
        )}
        {rootCall ? (
          <span className="font-mono text-caption text-fg-3 max-md:hidden">{rootCall}</span>
        ) : null}
        <span className="flex-1" />
        <IconButton label={`Stop ${name}`} variant="ghost" size="sm" onClick={onStop}>
          <Square size={8} fill="currentColor" strokeWidth={0} aria-hidden />
        </IconButton>
      </TrackScope>
    </ContextMenuArea>
  );
}
