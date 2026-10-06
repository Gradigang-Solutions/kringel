import { ContextMenu, DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";

export interface MenuItem {
  readonly label: string;
  readonly onSelect: () => void;
  readonly isDisabled?: boolean;
  readonly shortcut?: string;
}

const CONTENT_CLASS =
  "z-50 min-w-40 rounded-6 border border-gray-280 bg-gray-195 p-1 shadow-overlay";
const ITEM_CLASS =
  "flex h-6.5 items-center justify-between gap-6 rounded-4 px-2 text-body text-fg-2 outline-none select-none data-disabled:opacity-35 data-highlighted:bg-gray-250 data-highlighted:text-fg-1";

function ItemContent({ item }: { readonly item: MenuItem }) {
  return (
    <>
      {item.label}
      {item.shortcut ? (
        <span className="font-mono text-caption text-fg-3">{item.shortcut}</span>
      ) : null}
    </>
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
            <DropdownMenu.Item
              key={item.label}
              disabled={item.isDisabled}
              onSelect={item.onSelect}
              className={ITEM_CLASS}
            >
              <ItemContent item={item} />
            </DropdownMenu.Item>
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
            <ContextMenu.Item
              key={item.label}
              disabled={item.isDisabled}
              onSelect={item.onSelect}
              className={ITEM_CLASS}
            >
              <ItemContent item={item} />
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
