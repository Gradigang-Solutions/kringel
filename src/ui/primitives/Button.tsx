import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap select-none disabled:opacity-35",
  {
    variants: {
      variant: {
        subtle: "bg-gray-250 text-fg-1 hover:bg-gray-280",
        quiet: "bg-gray-195 text-fg-2 hover:bg-gray-225 hover:text-fg-1",
        primary: "bg-fg-1 font-semibold text-fg-inverse hover:bg-gray-860",
        ghost: "bg-transparent text-fg-2 hover:bg-gray-225 hover:text-fg-1",
        dashed:
          "border border-dashed border-gray-330 bg-transparent text-fg-2 hover:border-gray-450 hover:text-fg-1",
      },
      size: {
        xs: "h-5.5 rounded-4 px-2 text-small",
        sm: "h-6.5 rounded-5 px-2.5 text-small",
        md: "h-7.5 rounded-6 px-3 text-body",
      },
    },
    defaultVariants: { variant: "subtle", size: "sm" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
