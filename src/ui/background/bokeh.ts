import type { SoundEvent, SpectrumBands } from "@/engine";
import { clamp } from "@/lib/math";
import { soundFamily, type SoundFamily } from "@/ui/background/soundFamily";

/** Halo lancé par un son. Positions et rayon relatifs à l'écran (0..1), temps en secondes. */
export interface Halo {
  readonly family: SoundFamily;
  readonly x: number;
  readonly y: number;
  /** Fraction du plus petit côté de l'écran. */
  readonly radius: number;
  /** Puissance du son qui l'a lancé, entre 0 et 1. */
  readonly intensity: number;
  readonly age: number;
  readonly lifetime: number;
  /** Vitesse de montée, en hauteur d'écran par seconde. */
  readonly rise: number;
  readonly sway: number;
}

export interface BokehScene {
  readonly halos: readonly Halo[];
  /** Énergie lissée du master, qui règle les lueurs de fond. */
  readonly glow: SpectrumBands;
}

/** Tirage uniforme entre 0 et 1, injecté pour garder la simulation déterministe en test. */
export type Random = () => number;

interface FamilyStyle {
  readonly minRadius: number;
  readonly maxRadius: number;
  readonly lifetime: number;
  readonly top: number;
  readonly bottom: number;
  readonly rise: number;
}

/**
 * Graves : grands halos lents en bas ; médiums : moyens, partout ; aigus : petites étincelles
 * brèves en haut ; notes : placées en hauteur selon leur hauteur musicale (voir `pitchHeight`).
 */
const FAMILY_STYLES: Readonly<Record<SoundFamily, FamilyStyle>> = {
  low: { minRadius: 0.16, maxRadius: 0.26, lifetime: 1.2, top: 0.55, bottom: 1, rise: 0.01 },
  mid: { minRadius: 0.07, maxRadius: 0.12, lifetime: 0.8, top: 0.15, bottom: 0.85, rise: 0.02 },
  high: { minRadius: 0.015, maxRadius: 0.04, lifetime: 0.45, top: 0.02, bottom: 0.4, rise: 0.05 },
  tonal: { minRadius: 0.05, maxRadius: 0.1, lifetime: 1, top: 0.1, bottom: 0.85, rise: 0.04 },
};

export const MAX_HALOS = 64;
/** En dessous, le son est inaudible (piste coupée par un gain nul) : pas de halo. */
export const MIN_AUDIBLE_POWER = 0.02;
/** Un son faible garde au moins cette part de sa taille, pour rester visible. */
const MIN_SIZE_SHARE = 0.55;
/** Une note tenue laisse un halo un peu plus long qu'elle, dans ces limites (secondes). */
const TONAL_RELEASE = 0.3;
const TONAL_MAX_LIFETIME = 3;
/** Notes placées en hauteur d'écran, du bas (grave) au haut (aigu). */
const PITCH_LOW_MIDI = 48;
const PITCH_HIGH_MIDI = 96;
const MAX_SWAY = 0.015;
/** Le halo s'allume presque instantanément, puis s'éteint : c'est la pulsation. */
const ATTACK_SECONDS = 0.04;
const DECAY_STEEPNESS = 3;
/** Le halo grossit un peu en s'éteignant, comme une onde qui s'étale. */
const FADE_SWELL = 0.35;
/** Temps de réponse des lueurs de fond : montée rapide, retombée lente. */
const GLOW_ATTACK_SECONDS = 0.05;
const GLOW_RELEASE_SECONDS = 0.5;

export const EMPTY_SCENE: BokehScene = { halos: [], glow: { low: 0, mid: 0, high: 0 } };

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

/** Hauteur d'écran (0 en haut) d'une note : plus elle est aiguë, plus le halo monte. */
export function pitchHeight(midi: number, style: Pick<FamilyStyle, "top" | "bottom">): number {
  const amount = clamp((midi - PITCH_LOW_MIDI) / (PITCH_HIGH_MIDI - PITCH_LOW_MIDI), 0, 1);
  return lerp(style.bottom, style.top, amount);
}

function haloLifetime(family: SoundFamily, event: SoundEvent): number {
  const base = FAMILY_STYLES[family].lifetime;
  if (family !== "tonal") return base;
  return clamp(event.duration + TONAL_RELEASE, base, TONAL_MAX_LIFETIME);
}

function haloHeight(family: SoundFamily, event: SoundEvent, random: Random): number {
  const style = FAMILY_STYLES[family];
  if (family === "tonal" && event.midi !== null) return pitchHeight(event.midi, style);
  return lerp(style.top, style.bottom, random());
}

/** Halo d'un son : forme et place selon sa famille, taille et éclat selon sa puissance. */
export function spawnHalo(event: SoundEvent, random: Random): Halo | null {
  if (event.power < MIN_AUDIBLE_POWER) return null;
  const family = soundFamily(event);
  const style = FAMILY_STYLES[family];
  const intensity = clamp(event.power, 0, 1);
  const size = lerp(MIN_SIZE_SHARE, 1, intensity);
  return {
    family,
    x: random(),
    y: haloHeight(family, event, random),
    radius: lerp(style.minRadius, style.maxRadius, random()) * size,
    intensity,
    age: 0,
    lifetime: haloLifetime(family, event),
    rise: style.rise,
    sway: lerp(-MAX_SWAY, MAX_SWAY, random()),
  };
}

function ageHalo(halo: Halo, seconds: number): Halo {
  return {
    ...halo,
    age: halo.age + seconds,
    x: halo.x + halo.sway * seconds,
    y: halo.y - halo.rise * seconds,
  };
}

/** Rapproche une valeur de sa cible, à un rythme indépendant de la cadence d'affichage. */
function approach(current: number, target: number, seconds: number): number {
  const responseTime = target > current ? GLOW_ATTACK_SECONDS : GLOW_RELEASE_SECONDS;
  return lerp(current, target, 1 - Math.exp(-seconds / responseTime));
}

export function smoothBands(
  current: SpectrumBands,
  target: SpectrumBands,
  seconds: number,
): SpectrumBands {
  return {
    low: approach(current.low, target.low, seconds),
    mid: approach(current.mid, target.mid, seconds),
    high: approach(current.high, target.high, seconds),
  };
}

/** Avance la scène d'un pas : les halos vieillissent, les sons entendus en lancent de nouveaux. */
export function advanceScene(
  scene: BokehScene,
  events: readonly SoundEvent[],
  bands: SpectrumBands,
  seconds: number,
  random: Random,
): BokehScene {
  const living = scene.halos
    .map((halo) => ageHalo(halo, seconds))
    .filter((halo) => halo.age < halo.lifetime);
  const spawned = events.flatMap((event) => spawnHalo(event, random) ?? []);
  return {
    halos: [...living, ...spawned].slice(-MAX_HALOS),
    glow: smoothBands(scene.glow, bands, seconds),
  };
}

export interface HaloLook {
  readonly alpha: number;
  readonly scale: number;
}

/** Éclat et taille d'un halo selon son âge : allumage bref, puis extinction en s'étalant. */
export function haloLook(halo: Halo): HaloLook {
  const progress = clamp(halo.age / halo.lifetime, 0, 1);
  const attack = clamp(halo.age / ATTACK_SECONDS, 0, 1);
  const decay = Math.exp(-DECAY_STEEPNESS * progress) * (1 - progress);
  return { alpha: halo.intensity * attack * decay, scale: 1 + FADE_SWELL * progress };
}
