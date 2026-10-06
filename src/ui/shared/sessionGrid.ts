import type { CSSProperties } from "react";

/**
 * Le nombre de pistes varie : la grille de session (clips, scènes, mixer) lit son nombre de colonnes
 * dans `--track-count`, posé ici en style inline puisqu'il vient du projet.
 */
export function sessionGridStyle(
  trackCount: number,
): CSSProperties & Record<"--track-count", number> {
  return { "--track-count": trackCount };
}
