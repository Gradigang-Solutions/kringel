import { cn } from "@/lib/cn";
import { Slider } from "@/ui/primitives/Slider";

export interface MixerParamProps {
  readonly label: string;
  readonly valueLabel: string;
  /** Appel écrit dans le code, ou null quand le réglage garde sa valeur par défaut. */
  readonly code: string | null;
  readonly position: number;
  readonly fillFrom?: "start" | "center";
  readonly onChange: (position: number) => void;
}

const POSITION_STEP = 0.01;

/** Un réglage du mixer : libellé, valeur, curseur et l'appel qu'il écrit. */
export function MixerParam({
  label,
  valueLabel,
  code,
  position,
  fillFrom,
  onChange,
}: MixerParamProps) {
  return (
    <div className="flex flex-col gap-1.25">
      <div className="flex items-baseline justify-between">
        <span className="text-label text-fg-2">{label}</span>
        <span className="font-mono text-caption">{valueLabel}</span>
      </div>
      <Slider
        value={position}
        min={0}
        max={1}
        step={POSITION_STEP}
        onChange={onChange}
        label={label}
        valueText={valueLabel}
        fillFrom={fillFrom}
      />
      <span className={cn("truncate font-mono text-tiny", code ? "text-track" : "text-fg-3")}>
        {code ?? "default"}
      </span>
    </div>
  );
}
