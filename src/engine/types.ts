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

/** Son entendu à l'instant, tel que l'a joué Strudel. */
export interface SoundEvent {
  /** Nom du son (`bd`, `sawtooth`, `piano`…), vide si le motif n'en donne pas. */
  readonly sound: string;
  readonly midi: number | null;
  /** Gain × vélocité de l'événement (1 par défaut). */
  readonly power: number;
  /** Durée de la note, en secondes. */
  readonly duration: number;
}

/** Énergie du master par bande de fréquences, entre 0 et 1. */
export interface SpectrumBands {
  readonly low: number;
  readonly mid: number;
  readonly high: number;
}
