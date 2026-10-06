import { z } from "zod";
import {
  ATTACK_RANGE,
  CLIP_CYCLE_OPTIONS,
  FILTER_RANGE,
  MIXER_DEFAULTS,
  RATCHET_RANGE,
  RELEASE_RANGE,
  SCALE_MODES,
  SOUND_SOURCES,
  SWING_RANGE,
} from "@/model/constants";
import { createStepRow } from "@/model/steps";
import type { ClipCycles, ClipKind, Project, ScaleModeId } from "@/model/types";

const SCALE_MODE_IDS: readonly string[] = SCALE_MODES.map((mode) => mode.id);
const CYCLE_OPTIONS: readonly number[] = CLIP_CYCLE_OPTIONS;

const cyclesSchema = z.custom<ClipCycles>(
  (value) => typeof value === "number" && CYCLE_OPTIONS.includes(value),
  "Clip length must be 1, 2 or 4 cycles",
);

const scaleSchema = z.custom<ScaleModeId>(
  (value) => typeof value === "string" && SCALE_MODE_IDS.includes(value),
  "Unknown scale",
);

const stepRowSchema = z
  .object({
    id: z.string(),
    sound: z.string(),
    isMuted: z.boolean(),
    velocities: z.array(z.number().min(0).max(1)),
    // Absents des projets enregistrés avant le groove : chaque pas joue alors à coup sûr, une fois.
    chances: z.array(z.number().min(0).max(1)).optional(),
    ratchets: z.array(z.number().int().min(RATCHET_RANGE.min).max(RATCHET_RANGE.max)).optional(),
  })
  .transform(({ chances, ratchets, ...row }) => {
    const defaults = createStepRow(row.id, row.sound, row.velocities);
    return {
      ...defaults,
      isMuted: row.isMuted,
      chances: chances ?? defaults.chances,
      ratchets: ratchets ?? defaults.ratchets,
    };
  });

const noteSchema = z.object({
  id: z.string(),
  pitch: z.number().int(),
  start: z.number().int().min(0),
  duration: z.number().int().min(1),
  velocity: z.number().min(0).max(1),
});

const clipSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("steps"),
    id: z.string(),
    name: z.string(),
    kit: z.string(),
    cycles: cyclesSchema,
    swing: z.number().min(SWING_RANGE.min).max(SWING_RANGE.max).default(SWING_RANGE.min),
    rows: z.array(stepRowSchema),
  }),
  z.object({
    kind: z.literal("notes"),
    id: z.string(),
    name: z.string(),
    root: z.number().int().min(0).max(11),
    scale: scaleSchema,
    soundSource: z.enum(SOUND_SOURCES),
    sound: z.string(),
    attack: z.number().min(ATTACK_RANGE.min).max(ATTACK_RANGE.max).default(ATTACK_RANGE.min),
    release: z.number().min(RELEASE_RANGE.min).max(RELEASE_RANGE.max).default(RELEASE_RANGE.min),
    lpf: z.number().min(FILTER_RANGE.min).max(FILTER_RANGE.max).nullable().default(null),
    cycles: cyclesSchema,
    notes: z.array(noteSchema),
  }),
  z.object({ kind: z.literal("code"), id: z.string(), name: z.string(), source: z.string() }),
]);

const CLIP_KINDS = ["steps", "notes", "code"] as const satisfies readonly ClipKind[];

const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  // Absent des projets v1 : la migration le déduit de la position de la piste.
  defaultClipKind: z.enum(CLIP_KINDS).default("notes"),
  mixer: z.object({
    gain: z.number(),
    pan: z.number(),
    lpf: z.number().nullable(),
    // Effets ajoutés après les premiers projets : absents, ils gardent leur valeur par défaut.
    hpf: z.number().nullable().default(MIXER_DEFAULTS.hpf),
    distort: z.number().default(MIXER_DEFAULTS.distort),
    delay: z.number().default(MIXER_DEFAULTS.delay),
    room: z.number(),
    isMuted: z.boolean(),
    isSoloed: z.boolean(),
  }),
  clips: z.array(clipSchema.nullable()),
});

/** Schéma du projet, vérifié contre les types du modèle : un écart entre les deux ne compile pas. */
export const projectSchema = z
  .object({
    version: z.number().int(),
    id: z.string(),
    name: z.string(),
    bpm: z.number(),
    tracks: z.array(trackSchema),
    scenes: z.array(z.object({ id: z.string(), name: z.string() })),
  })
  .refine(
    (project) => project.tracks.every((track) => track.clips.length === project.scenes.length),
    "Each track must have one slot per scene",
  ) satisfies z.ZodType<Project>;
