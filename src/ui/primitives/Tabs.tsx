import { Tabs as RadixTabs } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon: ReactNode;
}

export interface TabsProps<T extends string> {
  readonly options: readonly TabOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly label: string;
  /** Les `TabPanel`, un par option. */
  readonly children: ReactNode;
}

/** Onglets en barre du bas, à portée de pouce : seul le panneau actif est monté. */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  label,
  children,
}: TabsProps<T>) {
  const handleChange = (next: string) => {
    const option = options.find((candidate) => candidate.value === next);
    if (option) onChange(option.value);
  };
  return (
    <RadixTabs.Root
      value={value}
      onValueChange={handleChange}
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
      <RadixTabs.List
        aria-label={label}
        className="flex shrink-0 border-t border-gray-235 bg-gray-175 pb-safe"
      >
        {options.map((option) => (
          <RadixTabs.Trigger
            key={option.value}
            value={option.value}
            className="flex h-13 flex-1 flex-col items-center justify-center gap-1 text-caption font-medium text-fg-3 select-none data-[state=active]:text-fg-1"
          >
            {option.icon}
            {option.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
    </RadixTabs.Root>
  );
}

export interface TabPanelProps {
  readonly value: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  return (
    <RadixTabs.Content
      value={value}
      className={cn("flex min-h-0 flex-1 flex-col outline-none", className)}
    >
      {children}
    </RadixTabs.Content>
  );
}
