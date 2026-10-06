import { STEPS_PER_CYCLE } from "@/model/constants";
import type { ClipCycles } from "@/model/types";

export function stepCount(cycles: ClipCycles): number {
  return cycles * STEPS_PER_CYCLE;
}
