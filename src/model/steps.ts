import { clamp, roundTo } from "@/lib/math";
import { DEFAULT_VELOCITY, VELOCITY_RANGE } from "@/model/constants";
import { stepCount } from "@/model/timing";
import type { ClipCycles, IdGenerator, StepRow, StepsClip } from "@/model/types";

const VELOCITY_DECIMALS = 2;

function updateRow(clip: StepsClip, rowId: string, update: (row: StepRow) => StepRow): StepsClip {
  return { ...clip, rows: clip.rows.map((row) => (row.id === rowId ? update(row) : row)) };
}

function setVelocityAt(row: StepRow, step: number, velocity: number): StepRow {
  if (step < 0 || step >= row.velocities.length) return row;
  return {
    ...row,
    velocities: row.velocities.map((value, index) => (index === step ? velocity : value)),
  };
}

export function isStepOn(row: StepRow, step: number): boolean {
  return (row.velocities[step] ?? 0) > 0;
}

export function toggleStep(clip: StepsClip, rowId: string, step: number): StepsClip {
  return updateRow(clip, rowId, (row) =>
    setVelocityAt(row, step, isStepOn(row, step) ? 0 : DEFAULT_VELOCITY),
  );
}

/** Fixe la vélocité d'un pas ; un pas éteint s'allume. */
export function setStepVelocity(
  clip: StepsClip,
  rowId: string,
  step: number,
  velocity: number,
): StepsClip {
  const bounded = roundTo(
    clamp(velocity, VELOCITY_RANGE.min, VELOCITY_RANGE.max),
    VELOCITY_DECIMALS,
  );
  return updateRow(clip, rowId, (row) => setVelocityAt(row, step, bounded));
}

export function addStepRow(clip: StepsClip, sound: string, nextId: IdGenerator): StepsClip {
  const row: StepRow = {
    id: nextId(),
    sound,
    isMuted: false,
    velocities: Array.from({ length: stepCount(clip.cycles) }, () => 0),
  };
  return { ...clip, rows: [...clip.rows, row] };
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

/** Change la longueur : on répète le motif existant pour allonger, on le coupe pour raccourcir. */
export function setStepsCycles(clip: StepsClip, cycles: ClipCycles): StepsClip {
  const length = stepCount(cycles);
  return {
    ...clip,
    cycles,
    rows: clip.rows.map((row) => ({
      ...row,
      velocities: Array.from(
        { length },
        (_, index) => row.velocities[index % row.velocities.length] ?? 0,
      ),
    })),
  };
}
