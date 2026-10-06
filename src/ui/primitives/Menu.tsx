import { Check } from "lucide-react";
import { ContextMenu, DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { OVERLAY_SURFACE_CLASS } from "@/ui/primitives/overlayStyle";

export interface MenuItem {
  readonly label: string;
  readonly onSelect: () => void;
  readonly isDisabled?: boolean;
  readonly shortcut?: string;
  /** Présent : l'entrée est une case à cocher (un réglage qu'on active ou coupe). */
  readonly isChecked?: boolean;
}

const CHECK_ICON_SIZE = 13;

const CONTENT_CLASS = cn(OVERLAY_SURFACE_CLASS, "min-w-40 p-1");
const ITEM_CLASS =
  "flex h-6.5 items-center justify-between gap-6 rounded-4 px-2 text-body text-fg-2 outline-none select-none data-disabled:opacity-35 data-highlighted:bg-gray-250 data-highlighted:text-fg-1";

function ItemContent({ item, indicator }: ItemContentProps) {
  return (
    <>
      {item.label}
      {item.shortcut ? (
        <span className="font-mono text-caption text-fg-3">{item.shortcut}</span>
      ) : null}
      {indicator}
    </>
  );
}

interface ItemContentProps {
  readonly item: MenuItem;
  readonly indicator?: ReactNode;
}

const checkIcon = <Check size={CHECK_ICON_SIZE} aria-hidden />;

/** Les deux menus de Radix ont les mêmes pièces : une entrée s'écrit une fois pour les deux. */
type MenuParts = typeof DropdownMenu | typeof ContextMenu;

function MenuEntry({ parts, item }: { readonly parts: MenuParts; readonly item: MenuItem }) {
  if (item.isChecked === undefined) {
    return (
      <parts.Item disabled={item.isDisabled} onSelect={item.onSelect} className={ITEM_CLASS}>
        <ItemContent item={item} />
      </parts.Item>
    );
  }
  return (
    <parts.CheckboxItem
      checked={item.isChecked}
      disabled={item.isDisabled}
      onSelect={item.onSelect}
      className={ITEM_CLASS}
    >
      <ItemContent item={item} indicator={<parts.ItemIndicator>{checkIcon}</parts.ItemIndicator>} />
    </parts.CheckboxItem>
  );
}

export interface DropdownProps {
  readonly trigger: ReactNode;
  readonly items: readonly MenuItem[];
}

export function Dropdown({ trigger, items }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={4} className={CONTENT_CLASS}>
          {items.map((item) => (
            <MenuEntry key={item.label} parts={DropdownMenu} item={item} />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export interface ContextMenuAreaProps {
  readonly children: ReactNode;
  readonly items: readonly MenuItem[];
}

export function ContextMenuArea({ children, items }: ContextMenuAreaProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={CONTENT_CLASS}>
          {items.map((item) => (
            <MenuEntry key={item.label} parts={ContextMenu} item={item} />
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
