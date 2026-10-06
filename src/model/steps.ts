import { clamp, roundTo } from "@/lib/math";
import {
  CHANCE_RANGE,
  DEFAULT_CHANCE,
  DEFAULT_RATCHET,
  DEFAULT_VELOCITY,
  RATCHET_RANGE,
  SWING_RANGE,
  VELOCITY_RANGE,
} from "@/model/constants";
import { stepCount } from "@/model/timing";
import type { ClipCycles, IdGenerator, StepRow, StepsClip } from "@/model/types";

const VALUE_DECIMALS = 2;

/** Réglages par pas d'une ligne, alignés pas à pas sur toute la longueur du clip. */
export type StepLane = "velocities" | "chances" | "ratchets";

/** Une ligne de sons : chaque pas allumé joue à coup sûr, une seule fois. */
export function createStepRow(id: string, sound: string, velocities: readonly number[]): StepRow {
  return {
    id,
    sound,
    isMuted: false,
    velocities,
    chances: velocities.map(() => DEFAULT_CHANCE),
    ratchets: velocities.map(() => DEFAULT_RATCHET),
  };
}

function updateRow(clip: StepsClip, rowId: string, update: (row: StepRow) => StepRow): StepsClip {
  return { ...clip, rows: clip.rows.map((row) => (row.id === rowId ? update(row) : row)) };
}

function setLaneValue(row: StepRow, lane: StepLane, step: number, value: number): StepRow {
  if (step < 0 || step >= row.velocities.length) return row;
  return { ...row, [lane]: row[lane].map((current, index) => (index === step ? value : current)) };
}

export function isStepOn(row: StepRow, step: number): boolean {
  return (row.velocities[step] ?? 0) > 0;
}

/** Un pas qui s'allume repart des réglages par défaut : rien de caché ne survit à son extinction. */
function switchOn(row: StepRow, step: number, velocity: number): StepRow {
  const lit = setLaneValue(row, "velocities", step, velocity);
  if (isStepOn(row, step)) return lit;
  const withChance = setLaneValue(lit, "chances", step, DEFAULT_CHANCE);
  return setLaneValue(withChance, "ratchets", step, DEFAULT_RATCHET);
}

export function toggleStep(clip: StepsClip, rowId: string, step: number): StepsClip {
  return updateRow(clip, rowId, (row) =>
    isStepOn(row, step)
      ? setLaneValue(row, "velocities", step, 0)
      : switchOn(row, step, DEFAULT_VELOCITY),
  );
}

/** Fixe la vélocité d'un pas ; un pas éteint s'allume. */
export function setStepVelocity(
  clip: StepsClip,
  rowId: string,
  step: number,
  velocity: number,
): StepsClip {
  const bounded = roundTo(clamp(velocity, VELOCITY_RANGE.min, VELOCITY_RANGE.max), VALUE_DECIMALS);
  return updateRow(clip, rowId, (row) => switchOn(row, step, bounded));
}

/** Fixe la probabilité qu'un pas joue, au cran de 5 % près. */
export function setStepChance(
  clip: StepsClip,
  rowId: string,
  step: number,
  chance: number,
): StepsClip {
  const snapped = roundTo(
    Math.round(chance / CHANCE_RANGE.step) * CHANCE_RANGE.step,
    VALUE_DECIMALS,
  );
  const bounded = clamp(snapped, CHANCE_RANGE.min, CHANCE_RANGE.max);
  return updateRow(clip, rowId, (row) => setLaneValue(row, "chances", step, bounded));
}

/** Fixe le nombre de coups joués dans un pas. */
export function setStepRatchet(
  clip: StepsClip,
  rowId: string,
  step: number,
  ratchet: number,
): StepsClip {
  const bounded = clamp(Math.round(ratchet), RATCHET_RANGE.min, RATCHET_RANGE.max);
  return updateRow(clip, rowId, (row) => setLaneValue(row, "ratchets", step, bounded));
}

export function setSwing(clip: StepsClip, swing: number): StepsClip {
  const bounded = clamp(swing, SWING_RANGE.min, SWING_RANGE.max);
  return { ...clip, swing: roundTo(bounded, VALUE_DECIMALS) };
}

export function addStepRow(clip: StepsClip, sound: string, nextId: IdGenerator): StepsClip {
  const velocities = Array.from({ length: stepCount(clip.cycles) }, () => 0);
  return { ...clip, rows: [...clip.rows, createStepRow(nextId(), sound, velocities)] };
}

export function removeStepRow(clip: StepsClip, rowId: string): StepsClip {
  return { ...clip, rows: clip.rows.filter((row) => row.id !== rowId) };
}

export function toggleRowMute(clip: StepsClip, rowId: string): StepsClip {
  return updateRow(clip, rowId, (row) => ({ ...row, isMuted: !row.isMuted }));
}

export function setKit(clip: StepsClip, kit: string): StepsClip {
  return { ...clip, kit };
}

/** Répète les valeurs pour allonger, les coupe pour raccourcir. */
function resizeLane(values: readonly number[], length: number, fallback: number): number[] {
  return Array.from({ length }, (_, index) => values[index % values.length] ?? fallback);
}

/** Change la longueur : on répète le motif existant pour allonger, on le coupe pour raccourcir. */
export function setStepsCycles(clip: StepsClip, cycles: ClipCycles): StepsClip {
  const length = stepCount(cycles);
  return {
    ...clip,
    cycles,
    rows: clip.rows.map((row) => ({
      ...row,
      velocities: resizeLane(row.velocities, length, 0),
      chances: resizeLane(row.chances, length, DEFAULT_CHANCE),
      ratchets: resizeLane(row.ratchets, length, DEFAULT_RATCHET),
    })),
  };
}
