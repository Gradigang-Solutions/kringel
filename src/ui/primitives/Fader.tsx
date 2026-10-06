import { Slider as RadixSlider } from "radix-ui";

export interface FaderProps {
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** Repère du gain unité (1), dessiné sur la piste. */
  readonly unity: number;
  readonly onChange: (value: number) => void;
  readonly label: string;
  readonly valueText?: string;
}

const PERCENT = 100;

/** Fader vertical du mixer, rempli à la couleur de la piste courante. */
export function Fader({ value, min, max, step, unity, onChange, label, valueText }: FaderProps) {
  const unityPosition = ((unity - min) / (max - min)) * PERCENT;
  return (
    <RadixSlider.Root
      orientation="vertical"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([next]) => {
        if (next !== undefined) onChange(next);
      }}
      className="relative flex h-full w-5 touch-none flex-col items-center select-none"
    >
      <RadixSlider.Track className="relative w-0.5 grow rounded-1 bg-gray-265">
        <RadixSlider.Range className="absolute w-full rounded-1 bg-track" />
      </RadixSlider.Track>
      <div
        aria-hidden
        className="pointer-events-none absolute left-0.75 h-px w-3.5 bg-gray-400"
        style={{ bottom: `${unityPosition}%` }}
      />
      <RadixSlider.Thumb
        aria-label={label}
        aria-valuetext={valueText}
        className="block h-2 w-5 rounded-2 bg-fg-1"
      />
    </RadixSlider.Root>
  );
}
