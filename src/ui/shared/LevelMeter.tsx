import { useRef } from "react";
import { cn } from "@/lib/cn";
import { range } from "@/lib/math";
import { METER_SEGMENT_COUNT, segmentTone, type SegmentTone } from "@/ui/shared/meterSegments";
import { useAnimationFrame } from "@/ui/shared/useAnimationFrame";

export type MeterColor = "track" | "neutral";

const TONE_CLASSES: Readonly<Record<Exclude<SegmentTone, "normal">, string>> = {
  off: "bg-gray-250",
  warn: "bg-meter-warn",
  clip: "bg-error",
};

const NORMAL_CLASSES: Readonly<Record<MeterColor, string>> = {
  track: "bg-track",
  neutral: "bg-fg-2",
};

export interface LevelMeterProps {
  /** Lit les niveaux (0 → 1) à chaque image, sans passer par l'état React. */
  readonly readLevels: () => readonly [number, number];
  readonly isActive: boolean;
  readonly size: "strip" | "master";
  readonly color: MeterColor;
}

/** Vumètre stéréo segmenté, mis à jour à chaque image sans rendu React. */
export function LevelMeter({ readLevels, isActive, size, color }: LevelMeterProps) {
  const channels = useRef<(HTMLDivElement | null)[]>([]);
  useAnimationFrame(() => {
    const levels = readLevels();
    channels.current.forEach((channel, channelIndex) => {
      const level = levels[channelIndex] ?? 0;
      channel?.childNodes.forEach((segment, index) => {
        if (segment instanceof HTMLElement) segment.className = segmentClass(index, level, color);
      });
    });
  }, isActive);
  return (
    <div className="flex h-full gap-0.5" aria-hidden>
      {[0, 1].map((channelIndex) => (
        <div
          key={channelIndex}
          ref={(element) => {
            channels.current[channelIndex] = element;
          }}
          className={cn("flex flex-col-reverse gap-0.5", size === "strip" ? "w-1.25" : "w-1.75")}
        >
          {range(METER_SEGMENT_COUNT).map((index) => (
            <span key={index} className={segmentClass(index, 0, color)} />
          ))}
        </div>
      ))}
    </div>
  );
}

function segmentClass(index: number, level: number, color: MeterColor): string {
  const tone = segmentTone(index, level);
  return cn("flex-1 rounded-1", tone === "normal" ? NORMAL_CLASSES[color] : TONE_CLASSES[tone]);
}
