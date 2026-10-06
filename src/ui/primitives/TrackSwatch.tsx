import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const swatchVariants = cva("inline-block shrink-0", {
  variants: {
    size: {
      xs: "size-1.5 rounded-1",
      sm: "size-1.75 rounded-2",
      md: "size-2 rounded-2",
      lg: "size-2.5 rounded-2",
    },
    tone: {
      track: "bg-track",
      neutral: "bg-fg-2",
      muted: "bg-gray-300",
    },
  },
  defaultVariants: { size: "md", tone: "track" },
});

export type TrackSwatchProps = VariantProps<typeof swatchVariants> & {
  readonly className?: string;
};

/** Pastille de couleur de piste ; la couleur vient de la variable --track-color du conteneur. */
export function TrackSwatch({ size, tone, className }: TrackSwatchProps) {
  return <span aria-hidden className={cn(swatchVariants({ size, tone }), className)} />;
}
