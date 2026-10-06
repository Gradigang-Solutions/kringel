import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { slotVariants } from "@/ui/grid/slotStyle";

/** Les attributs HTML supplémentaires viennent du déclencheur du menu contextuel (Radix asChild). */
export interface ClipSlotEmptyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly isInvite: boolean;
  readonly isCompact: boolean;
  readonly label: string;
  readonly onCreate: () => void;
}

/** Emplacement vide : un clic ou un double-clic crée un clip du type par défaut de la piste. */
export function ClipSlotEmpty({
  isInvite,
  isCompact,
  label,
  onCreate,
  ...triggerProps
}: ClipSlotEmptyProps) {
  return (
    <button
      {...triggerProps}
      type="button"
      aria-label={label}
      onClick={onCreate}
      className={cn(
        slotVariants({
          state: isInvite ? "invite" : "empty",
          size: isCompact ? "compact" : "regular",
        }),
        "group items-center justify-center",
      )}
    >
      <span
        className={cn(
          "font-medium",
          isInvite ? "text-body text-track" : "text-value text-gray-330 group-hover:text-fg-3",
        )}
      >
        {isInvite ? "+ New clip" : "+"}
      </span>
    </button>
  );
}
