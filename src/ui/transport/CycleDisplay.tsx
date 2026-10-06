import { useRef } from "react";
import { getCyclePosition } from "@/engine";
import { cn } from "@/lib/cn";
import { range } from "@/lib/math";
import { BEATS_PER_CYCLE } from "@/model/constants";
import { useIsPlaying } from "@/store/selectors";
import { currentBeat, formatCyclePosition } from "@/ui/transport/cyclePosition";
import { useAnimationFrame } from "@/ui/shared/useAnimationFrame";

const IDLE_POSITION = "—";
const BEAT_ON = "bg-fg-1";
const BEAT_OFF = "bg-gray-300";

function beatClass(isOn: boolean): string {
  return cn("h-1.5 w-4.5 rounded-2", isOn ? BEAT_ON : BEAT_OFF);
}

/** Position dans le cycle, mise à jour à chaque image depuis le moteur. */
export function CycleDisplay() {
  const isPlaying = useIsPlaying();
  const label = useRef<HTMLSpanElement>(null);
  const beats = useRef<HTMLDivElement>(null);
  useAnimationFrame(() => {
    const position = getCyclePosition();
    if (label.current) label.current.textContent = formatCyclePosition(position);
    beats.current?.childNodes.forEach((beat, index) => {
      if (beat instanceof HTMLElement) beat.className = beatClass(index <= currentBeat(position));
    });
  }, isPlaying);
  return (
    <div className="flex items-center gap-2.5" aria-label="Cycle position">
      <span className="text-tiny font-semibold tracking-wide text-fg-3">CYCLE</span>
      <span ref={label} className="min-w-10 font-mono text-value font-medium">
        {IDLE_POSITION}
      </span>
      <div ref={beats} className="flex gap-0.75">
        {range(BEATS_PER_CYCLE).map((beat) => (
          <span key={beat} className={beatClass(false)} />
        ))}
      </div>
    </div>
  );
}
