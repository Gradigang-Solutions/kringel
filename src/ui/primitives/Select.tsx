import { ChevronDown } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";
import { cn } from "@/lib/cn";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  /** Titre de section : les options consécutives d'un même groupe sont rassemblées sous lui. */
  readonly group?: string;
}

const ITEM_CLASS =
  "flex h-6.5 items-center rounded-4 px-2 text-body text-fg-2 outline-none select-none data-highlighted:bg-gray-250 data-highlighted:text-fg-1 data-[state=checked]:text-fg-1";

/** Regroupe les options consécutives qui partagent le même groupe (ou aucun). */
function groupOptions(
  options: readonly SelectOption[],
): { group?: string; options: SelectOption[] }[] {
  return options.reduce<{ group?: string; options: SelectOption[] }[]>((groups, option) => {
    const last = groups.at(-1);
    if (last && last.group === option.group) last.options.push(option);
    else groups.push({ group: option.group, options: [option] });
    return groups;
  }, []);
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
            {groupOptions(options).map((section, index) => (
              <RadixSelect.Group key={section.group ?? index}>
                {section.group === undefined ? null : (
                  <RadixSelect.Label className="px-2 pt-1.5 pb-1 text-caption font-semibold tracking-caps text-fg-3 uppercase">
                    {section.group}
                  </RadixSelect.Label>
                )}
                {section.options.map((option) => (
                  <RadixSelect.Item key={option.value} value={option.value} className={ITEM_CLASS}>
                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  </RadixSelect.Item>
                ))}
              </RadixSelect.Group>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
