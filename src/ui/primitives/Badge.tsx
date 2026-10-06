import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex shrink-0 items-center whitespace-nowrap", {
  variants: {
    variant: {
      outline: "rounded-4 border border-gray-280 px-1.5 font-mono text-tiny text-fg-3",
      tag: "rounded-3 border border-current px-1.25 text-micro leading-3.75 font-semibold tracking-tag",
      error: "h-5.5 gap-1.5 rounded-4 bg-error/14 px-2 text-small font-medium text-error-fg",
    },
  },
  defaultVariants: { variant: "outline" },
});

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  readonly children: ReactNode;
  readonly className?: string;
};

export function Badge({ variant, className, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
