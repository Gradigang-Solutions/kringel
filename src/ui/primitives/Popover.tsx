import { Popover as RadixPopover } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { OVERLAY_SURFACE_CLASS } from "@/ui/primitives/overlayStyle";

export interface PopoverProps {
  readonly trigger: ReactNode;
  /** Nom accessible du panneau ouvert. */
  readonly label: string;
  readonly children: ReactNode;
}

/** Petit panneau ancré à son déclencheur ; Échap ou un clic à côté le referme. */
export function Popover({ trigger, label, children }: PopoverProps) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          aria-label={label}
          side="top"
          align="end"
          sideOffset={6}
          collisionPadding={8}
          className={cn(OVERLAY_SURFACE_CLASS, "p-3")}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
