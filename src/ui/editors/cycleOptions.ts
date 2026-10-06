import { CLIP_CYCLE_OPTIONS } from "@/model/constants";
import type { ClipCycles } from "@/model/types";

export function cycleOptions() {
  return CLIP_CYCLE_OPTIONS.map((cycles) => ({ value: String(cycles), label: String(cycles) }));
}

export function parseCycles(value: string): ClipCycles | null {
  return CLIP_CYCLE_OPTIONS.find((cycles) => String(cycles) === value) ?? null;
}
