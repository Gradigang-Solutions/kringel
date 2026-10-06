import { Switch as RadixSwitch } from "radix-ui";
import { useId } from "react";

export interface SwitchProps {
  readonly isChecked: boolean;
  readonly onChange: (isChecked: boolean) => void;
  readonly label: string;
}

/** Interrupteur à la couleur de la piste courante (variable --track-color). */
export function Switch({ isChecked, onChange, label }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-1.75">
      <RadixSwitch.Root
        id={id}
        checked={isChecked}
        onCheckedChange={onChange}
        className="relative h-3.5 w-6.5 rounded-7 bg-gray-300 data-[state=checked]:bg-track"
      >
        <RadixSwitch.Thumb className="absolute top-0.5 left-0.5 block size-2.5 rounded-5 bg-fg-inverse transition-transform data-[state=checked]:translate-x-3" />
      </RadixSwitch.Root>
      <label htmlFor={id} className="text-small text-fg-2">
        {label}
      </label>
    </div>
  );
}
