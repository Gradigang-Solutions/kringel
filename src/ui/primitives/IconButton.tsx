import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const iconButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center text-fg-2 select-none hover:text-fg-1 disabled:opacity-35",
  {
    variants: {
      variant: {
        quiet: "bg-gray-195 hover:bg-gray-225",
        subtle: "bg-gray-225 hover:bg-gray-250",
        ghost: "bg-transparent hover:bg-gray-225",
      },
      size: {
        sm: "size-6.5 rounded-5",
        md: "size-7 rounded-6",
        lg: "size-8 rounded-6",
      },
    },
    defaultVariants: { variant: "quiet", size: "md" },
  },
);

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> &
  VariantProps<typeof iconButtonVariants> & {
    /** Libellé accessible, obligatoire pour un bouton sans texte. */
    readonly label: string;
  };

export function IconButton({
  className,
  variant,
  size,
  label,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
