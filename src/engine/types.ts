/** Note produite par un motif, pour l'aperçu en lecture seule d'un clip de code. */
export interface PreviewNote {
  readonly begin: number;
  readonly end: number;
  readonly pitch: number;
}

export interface StereoLevels {
  readonly left: number;
  readonly right: number;
}
