import { Slider as RadixSlider } from "radix-ui";
import { cn } from "@/lib/cn";

export interface SliderProps {
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
  readonly label: string;
  /** « center » remplit depuis le milieu (panoramique), « start » depuis le minimum. */
  readonly fillFrom?: "start" | "center";
  readonly valueText?: string;
}

const PERCENT = 100;

function fillStyle(position: number, fillFrom: "start" | "center") {
  if (fillFrom === "start") return { left: "0%", width: `${position * PERCENT}%` };
  const half = 0.5;
  return {
    left: `${Math.min(half, position) * PERCENT}%`,
    width: `${Math.abs(position - half) * PERCENT}%`,
  };
}

/** Curseur horizontal fin à la couleur de la piste courante. */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  fillFrom = "start",
  valueText,
}: SliderProps) {
  const position = max === min ? 0 : (value - min) / (max - min);
  return (
    <RadixSlider.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([next]) => {
        if (next !== undefined) onChange(next);
      }}
      className="relative flex h-3 w-full touch-none items-center select-none"
    >
      <RadixSlider.Track className="relative h-1 grow rounded-2 bg-gray-265">
        <div
          className="absolute inset-y-0 rounded-2 bg-track"
          style={fillStyle(position, fillFrom)}
        />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        aria-label={label}
        aria-valuetext={valueText}
        className={cn("block h-3 w-0.75 rounded-1 bg-fg-1")}
      />
    </RadixSlider.Root>
  );
}
