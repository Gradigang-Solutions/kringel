import { cva } from "class-variance-authority";

/** Boutons du bas de la tranche (M, S, FX) : même taille, même fond. */
export const stripButtonVariants = cva(
  "flex h-6 flex-1 items-center justify-center gap-1 rounded-5 text-label font-semibold",
  {
    variants: {
      tone: {
        off: "bg-gray-235 text-fg-2 hover:bg-gray-250 hover:text-fg-1",
        on: "bg-fg-1 text-fg-inverse",
        accent: "bg-gray-235 text-track hover:bg-gray-250",
      },
    },
    defaultVariants: { tone: "off" },
  },
);
