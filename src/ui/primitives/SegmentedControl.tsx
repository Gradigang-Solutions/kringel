import { cva, type VariantProps } from "class-variance-authority";
import { ToggleGroup } from "radix-ui";
import { cn } from "@/lib/cn";

const itemVariants = cva(
  "flex items-center rounded-4 font-medium text-fg-2 select-none hover:text-fg-1 disabled:opacity-35 disabled:hover:text-fg-2 data-[state=on]:bg-gray-330 data-[state=on]:text-fg-1",
  {
    variants: {
      size: {
        sm: "h-5 px-2.25 text-small",
        md: "h-5.5 px-2.5 text-small",
      },
    },
    defaultVariants: { size: "sm" },
  },
);

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly isDisabled?: boolean;
}

export type SegmentedControlProps<T extends string> = VariantProps<typeof itemVariants> & {
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly label: string;
  readonly className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size,
  className,
}: SegmentedControlProps<T>) {
  const handleChange = (next: string) => {
    const option = options.find((candidate) => candidate.value === next);
    if (option) onChange(option.value);
  };
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={handleChange}
      aria-label={label}
      className={cn("flex gap-0.5 rounded-6 border border-gray-250 bg-gray-205 p-0.5", className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.isDisabled}
          className={itemVariants({ size })}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
