import { call, formatNumber, method, quote } from "@/codegen/format";
import { alternateCycles, eventsInCycle, voiceToMini, type MiniEvent } from "@/codegen/mini";
import type { ClipPattern } from "@/codegen/pattern";
import { range } from "@/lib/math";
import { DEFAULT_VELOCITY, STEPS_PER_CYCLE } from "@/model/constants";
import type { StepRow, StepsClip } from "@/model/types";

const DRUMS = { ignoreDurations: true } as const;

function hitSteps(row: StepRow): number[] {
  return row.velocities.flatMap((velocity, step) => (velocity > 0 ? [step] : []));
}

function rowMini(row: StepRow, cycles: number, token: (step: number) => string): string {
  const events: MiniEvent[] = hitSteps(row).map((step) => ({
    start: step,
    duration: 1,
    token: token(step),
  }));
  return alternateCycles(
    range(cycles).map((cycle) =>
      voiceToMini(eventsInCycle(events, cycle, STEPS_PER_CYCLE), STEPS_PER_CYCLE, DRUMS),
    ),
  );
}

/** Mini-notation d'une ligne de pas, telle qu'affichée à côté de la ligne dans l'éditeur. */
export function stepRowMini(row: StepRow, cycles: number): string {
  return rowMini(row, cycles, () => row.sound);
}

function hasDefaultVelocities(row: StepRow): boolean {
  return row.velocities.every((velocity) => velocity === 0 || velocity === DEFAULT_VELOCITY);
}

function velocityCall(row: StepRow, cycles: number): string {
  const hitVelocities = new Set(row.velocities.filter((velocity) => velocity > 0));
  const [single] = hitVelocities;
  if (hitVelocities.size === 1 && single !== undefined)
    return method("velocity", formatNumber(single));
  const mini = rowMini(row, cycles, (step) => formatNumber(row.velocities[step] ?? 0));
  return method("velocity", quote(mini));
}

/** Une ligne dont les vélocités varient a besoin de son propre motif pour porter `.velocity()`. */
function soundPatterns(audibleRows: readonly StepRow[], cycles: number): string[] {
  const uniform = audibleRows.filter(hasDefaultVelocities);
  const varying = audibleRows.filter((row) => !hasDefaultVelocities(row));
  const combined =
    uniform.length > 0
      ? [call("s", quote(uniform.map((row) => stepRowMini(row, cycles)).join(", ")))]
      : [];
  const separate = varying.map(
    (row) => `${call("s", quote(stepRowMini(row, cycles)))}${velocityCall(row, cycles)}`,
  );
  return [...combined, ...separate];
}

export function audibleRows(clip: StepsClip): StepRow[] {
  return clip.rows.filter((row) => !row.isMuted && hitSteps(row).length > 0);
}

export function stepsPattern(clip: StepsClip): ClipPattern | null {
  const patterns = soundPatterns(audibleRows(clip), clip.cycles);
  const calls = [method("bank", quote(clip.kit))];
  const [single] = patterns;
  if (single === undefined) return null;
  if (patterns.length === 1) return { source: [single], calls };
  const lastIndex = patterns.length - 1;
  return {
    source: [
      "stack(",
      ...patterns.map((pattern, index) => `  ${pattern}${index < lastIndex ? "," : ""}`),
      ")",
    ],
    calls,
  };
}
