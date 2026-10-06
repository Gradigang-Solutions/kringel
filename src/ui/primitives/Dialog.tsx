import { Dialog as RadixDialog } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly description: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly className?: string;
}

/** Fenêtre modale centrée : Échap, un clic à côté ou onClose la referment. */
export function Dialog({ isOpen, title, description, onClose, children, className }: DialogProps) {
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={(open) => (open ? undefined : onClose())}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <RadixDialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex w-105 -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-12 border border-gray-280 bg-gray-175 p-6 shadow-overlay max-md:inset-x-4 max-md:w-auto max-md:translate-x-0",
            className,
          )}
        >
          <RadixDialog.Title className="text-heading font-semibold">{title}</RadixDialog.Title>
          <RadixDialog.Description className="text-title leading-normal text-fg-2">
            {description}
          </RadixDialog.Description>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
