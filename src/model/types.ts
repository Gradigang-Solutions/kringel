import type { CLIP_CYCLE_OPTIONS, SCALE_MODES, SOUND_SOURCES } from "@/model/constants";

export type ClipCycles = (typeof CLIP_CYCLE_OPTIONS)[number];
export type ScaleModeId = (typeof SCALE_MODES)[number]["id"];
export type SoundSource = (typeof SOUND_SOURCES)[number];

/** Classe de hauteur : 0 = do, 11 = si. */
export type PitchClass = number;

export interface MixerSettings {
  readonly gain: number;
  readonly pan: number;
  /** Fréquence de coupure du passe-bas en Hz ; null = filtre désactivé. */
  readonly lpf: number | null;
  readonly room: number;
  readonly isMuted: boolean;
  readonly isSoloed: boolean;
}

export interface StepRow {
  readonly id: string;
  readonly sound: string;
  readonly isMuted: boolean;
  /** Une vélocité par pas, sur toute la longueur du clip ; 0 = pas éteint. */
  readonly velocities: readonly number[];
  /** Probabilité que chaque pas allumé joue, de 0 à 1 ; 1 = toujours. */
  readonly chances: readonly number[];
  /** Nombre de coups joués dans chaque pas allumé (ratchet) ; 1 = un seul coup. */
  readonly ratchets: readonly number[];
}

export interface Note {
  readonly id: string;
  readonly pitch: number;
  /** Début et durée en pas (seizièmes de cycle), depuis le début du clip. */
  readonly start: number;
  readonly duration: number;
  readonly velocity: number;
}

export interface StepsClip {
  readonly kind: "steps";
  readonly id: string;
  readonly name: string;
  readonly kit: string;
  readonly cycles: ClipCycles;
  /** Retard des doubles-croches à contretemps, en fraction de pas ; 0 = droit. */
  readonly swing: number;
  readonly rows: readonly StepRow[];
}

export interface NotesClip {
  readonly kind: "notes";
  readonly id: string;
  readonly name: string;
  readonly root: PitchClass;
  readonly scale: ScaleModeId;
  readonly soundSource: SoundSource;
  readonly sound: string;
  readonly cycles: ClipCycles;
  readonly notes: readonly Note[];
}

export interface CodeClip {
  readonly kind: "code";
  readonly id: string;
  readonly name: string;
  readonly source: string;
}

export type Clip = StepsClip | NotesClip | CodeClip;
export type ClipKind = Clip["kind"];
export type ClipOfKind<K extends ClipKind> = Extract<Clip, { kind: K }>;

export interface Track {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  /** Type du clip créé d'un clic dans une case vide de la piste. */
  readonly defaultClipKind: ClipKind;
  readonly mixer: MixerSettings;
  /** Un emplacement par scène. */
  readonly clips: readonly (Clip | null)[];
}

export interface Scene {
  readonly id: string;
  readonly name: string;
}

export interface Project {
  readonly version: number;
  readonly id: string;
  readonly name: string;
  readonly bpm: number;
  readonly tracks: readonly Track[];
  readonly scenes: readonly Scene[];
}

export type IdGenerator = () => string;

export interface SlotAddress {
  readonly trackId: string;
  readonly sceneIndex: number;
}
