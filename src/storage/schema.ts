import { z } from "zod";
import { CLIP_CYCLE_OPTIONS, SCALE_MODES, SOUND_SOURCES } from "@/model/constants";
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

const stepRowSchema = z.object({
  id: z.string(),
  sound: z.string(),
  isMuted: z.boolean(),
  velocities: z.array(z.number().min(0).max(1)),
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
