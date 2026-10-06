import { cva } from "class-variance-authority";

/** Apparence d'un emplacement de la grille selon son état (maquette : slot states). */
export const slotVariants = cva(
  "relative flex w-full flex-col overflow-hidden rounded-6 border text-left outline-none focus-visible:ring-2 focus-visible:ring-fg-2",
  {
    variants: {
      state: {
        empty: "border-gray-225 bg-gray-205 hover:border-gray-280",
        invite: "border-dashed border-track/80 bg-track/8",
        idle: "border-track/20 bg-track/10 hover:border-track/40",
        playing: "border-track/60 bg-track/22",
        queued: "border-dashed border-track bg-track/10",
        stopping: "border-dashed border-track/60 bg-track/22",
      },
      size: {
        regular: "h-18 gap-1.75 px-2.5 py-2",
        compact: "h-9.5 gap-1 px-2 py-1.25",
      },
      isSelected: {
        true: "ring-2 ring-fg-1",
        false: "",
      },
    },
    defaultVariants: { isSelected: false },
  },
);
