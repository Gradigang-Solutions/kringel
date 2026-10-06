/** Un demi-tour par cycle : le logo tourne au tempo du morceau, sans donner le tournis. */
export const LOGO_TURNS_PER_CYCLE = 0.5;
const DEGREES_PER_TURN = 360;
const HALF_TURN = DEGREES_PER_TURN / 2;

/** Angle du logo, en degrés (0 à 360), à une position de lecture donnée en cycles. */
export function logoRotation(cycle: number): number {
  const turns = cycle * LOGO_TURNS_PER_CYCLE;
  return (turns - Math.floor(turns)) * DEGREES_PER_TURN;
}

/** Angle de repos à l'arrêt : le tour le plus proche, pour que le logo finisse sa rotation sans repartir en arrière. */
export function restingRotation(angle: number): number {
  return angle > HALF_TURN ? DEGREES_PER_TURN : 0;
}
