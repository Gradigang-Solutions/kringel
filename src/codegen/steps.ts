import { call, formatNumber, method, quote } from "@/codegen/format";
import { alternateCycles, eventsInCycle, voiceToMini, type MiniEvent } from "@/codegen/mini";
import type { ClipPattern } from "@/codegen/pattern";
import { range } from "@/lib/math";
import {
  DEFAULT_CHANCE,
  DEFAULT_RATCHET,
  DEFAULT_VELOCITY,
  STEPS_PER_CYCLE,
  SWING_RANGE,
  SWING_SLICES_PER_CYCLE,
} from "@/model/constants";
import type { StepRow, StepsClip } from "@/model/types";

/** Les sons de batterie n'ont pas de durée : la grille se réduit au plus grand pas commun. */
const DRUMS = { ignoreDurations: true } as const;
/** Un ratchet découpe son pas : la grille doit garder la durée d'un pas pour qu'il y reste. */
const DRUMS_WITH_RATCHETS = { ignoreDurations: false } as const;

function hitSteps(row: StepRow): number[] {
  return row.velocities.flatMap((velocity, step) => (velocity > 0 ? [step] : []));
}

function ratchetAt(row: StepRow, step: number): number {
  return row.ratchets[step] ?? DEFAULT_RATCHET;
}

function hasRatchets(row: StepRow): boolean {
  return hitSteps(row).some((step) => ratchetAt(row, step) > DEFAULT_RATCHET);
}

function rowMini(row: StepRow, cycles: number, token: (step: number) => string): string {
  const events: MiniEvent[] = hitSteps(row).map((step) => ({
    start: step,
    duration: 1,
    token: token(step),
  }));
  const options = hasRatchets(row) ? DRUMS_WITH_RATCHETS : DRUMS;
  return alternateCycles(
    range(cycles).map((cycle) =>
      voiceToMini(eventsInCycle(events, cycle, STEPS_PER_CYCLE), STEPS_PER_CYCLE, options),
    ),
  );
}

/** « hh », « hh*2 » (deux coups dans le pas), « hh?0.3 » (30 % de chances de se taire). */
function stepToken(row: StepRow, step: number): string {
  const ratchet = ratchetAt(row, step);
  const chance = row.chances[step] ?? DEFAULT_CHANCE;
  const repeat = ratchet > DEFAULT_RATCHET ? `*${ratchet}` : "";
  const drop = chance < DEFAULT_CHANCE ? `?${formatNumber(1 - chance)}` : "";
  return `${row.sound}${repeat}${drop}`;
}

/** Mini-notation d'une ligne de pas, telle qu'affichée à côté de la ligne dans l'éditeur. */
export function stepRowMini(row: StepRow, cycles: number): string {
  return rowMini(row, cycles, (step) => stepToken(row, step));
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

/** Le swing retarde le second pas de chaque paire : `swingBy(retard, nombre de paires par cycle)`. */
export function swingCall(swing: number): string | null {
  if (swing === SWING_RANGE.min) return null;
  return method("swingBy", formatNumber(swing), formatNumber(SWING_SLICES_PER_CYCLE));
}

function swingCalls(clip: StepsClip): string[] {
  const swing = swingCall(clip.swing);
  return swing === null ? [] : [swing];
}

export function stepsPattern(clip: StepsClip): ClipPattern | null {
  const patterns = soundPatterns(audibleRows(clip), clip.cycles);
  const calls = [method("bank", quote(clip.kit)), ...swingCalls(clip)];
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
