import { ChevronDown } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";
import { cn } from "@/lib/cn";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps {
  readonly options: readonly SelectOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
  readonly className?: string;
}

export function Select({ options, value, onChange, label, className }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger
        aria-label={label}
        className={cn(
          "flex h-6.5 items-center gap-2.5 rounded-5 border border-gray-265 bg-gray-205 pr-2 pl-2.5 text-body hover:border-gray-300",
          className,
        )}
      >
        <RadixSelect.Value />
        <RadixSelect.Icon className="text-fg-3">
          <ChevronDown size={12} aria-hidden />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-80 min-w-(--radix-select-trigger-width) overflow-hidden rounded-6 border border-gray-280 bg-gray-195 p-1 shadow-overlay"
        >
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="flex h-6.5 items-center rounded-4 px-2 text-body text-fg-2 outline-none select-none data-highlighted:bg-gray-250 data-highlighted:text-fg-1 data-[state=checked]:text-fg-1"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
