import { Dialog } from "radix-ui";
import { Button } from "@/ui/primitives/Button";

export interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (open ? undefined : onCancel())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex w-105 -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-12 border border-gray-280 bg-gray-175 p-6 shadow-overlay max-md:inset-x-4 max-md:w-auto max-md:translate-x-0">
          <Dialog.Title className="text-heading font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="text-title leading-normal text-fg-2">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Button variant="quiet" size="md" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
