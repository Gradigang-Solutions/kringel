import { assertNever } from "@/lib/assertNever";
import { RATCHET_RANGE } from "@/model/constants";
import type { StepLane } from "@/model/steps";
import type { StepRow } from "@/model/types";
import { levelAtHeight } from "@/ui/editors/steps/stepGeometry";

export const STEP_LANE_OPTIONS: readonly { readonly value: StepLane; readonly label: string }[] = [
  { value: "velocities", label: "Velocity" },
  { value: "chances", label: "Chance" },
  { value: "ratchets", label: "Ratchet" },
];

/** Hauteur de la barre de chaque pas, de 0 à 1 ; 0 pour un pas éteint, qui n'a pas de réglage. */
export function laneLevels(row: StepRow, lane: StepLane): number[] {
  return row.velocities.map((velocity, step) => {
    if (velocity <= 0) return 0;
    const value = row[lane][step] ?? 0;
    return lane === "ratchets" ? value / RATCHET_RANGE.max : value;
  });
}

/** Valeur visée par le pointeur : continue pour vélocité et probabilité, par crans pour le ratchet. */
export function laneValueAtHeight(lane: StepLane, y: number, height: number): number {
  const level = levelAtHeight(y, height);
  switch (lane) {
    case "velocities":
    case "chances":
      return level;
    case "ratchets":
      return Math.max(RATCHET_RANGE.min, Math.ceil(level * RATCHET_RANGE.max));
    default:
      return assertNever(lane);
  }
}
