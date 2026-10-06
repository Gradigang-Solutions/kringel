import { cva, type VariantProps } from "class-variance-authority";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

const nameInputVariants = cva(
  "field-sizing-content rounded-4 bg-transparent px-1 outline-none hover:bg-gray-205 focus:bg-gray-205",
  {
    variants: {
      size: {
        sm: "min-w-12 text-small font-medium",
        md: "min-w-12 text-body font-semibold",
        lg: "min-w-12 text-title font-medium text-gray-860",
        xl: "min-w-16 text-heading font-semibold",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type NameInputProps = VariantProps<typeof nameInputVariants> & {
  readonly label: string;
  readonly value: string;
  /** Appelé à la validation (Entrée ou perte du focus) quand le nom a été modifié. */
  readonly onCommit: (name: string) => void;
  /** Appelé quand l'édition se termine, validée ou annulée (Échap). */
  readonly onDone?: () => void;
  /** Prend le focus et sélectionne le nom dès l'affichage (renommage depuis un menu). */
  readonly isAutoFocused?: boolean;
  readonly className?: string;
};

/** Nom modifiable en place : on clique, on tape, Entrée valide, Échap annule. */
export function NameInput({
  label,
  value,
  onCommit,
  onDone,
  isAutoFocused = false,
  size,
  className,
}: NameInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  // Échap quitte le champ : la perte du focus qui suit ne doit pas valider le brouillon.
  const isCancelling = useRef(false);
  return (
    <input
      aria-label={label}
      value={draft ?? value}
      autoFocus={isAutoFocused}
      onFocus={(event) => {
        if (isAutoFocused) event.currentTarget.select();
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== null && !isCancelling.current) onCommit(draft);
        isCancelling.current = false;
        setDraft(null);
        onDone?.();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") isCancelling.current = true;
        if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
      }}
      className={cn(nameInputVariants({ size }), className)}
    />
  );
}
