import { z } from "zod";
import { PROJECT_SCHEMA_VERSION } from "@/model/constants";
import type { Project } from "@/model/types";
import { projectSchema } from "@/storage/schema";

const FILE_FORMAT = "kringle-project";
const JSON_INDENT = 2;

export type ImportResult =
  | { readonly isOk: true; readonly project: Project }
  | { readonly isOk: false; readonly error: string };

const envelopeSchema = z.object({
  format: z.literal(FILE_FORMAT),
  version: z.number().int(),
  project: z.unknown(),
});

export function serializeProject(project: Project): string {
  return JSON.stringify(
    { format: FILE_FORMAT, version: PROJECT_SCHEMA_VERSION, project },
    null,
    JSON_INDENT,
  );
}

export function projectFileName(project: Project): string {
  const slug = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug === "" ? "project" : slug}.kringle.json`;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Le contenu n'est pas du JSON : l'appelant reçoit undefined et signale un fichier invalide.
    return undefined;
  }
}

/** Valide un fichier exporté : format, version, puis contenu du projet. */
export function parseProjectFile(text: string): ImportResult {
  const envelope = envelopeSchema.safeParse(parseJson(text));
  if (!envelope.success) return { isOk: false, error: "This file is not a Kringle project." };
  if (envelope.data.version > PROJECT_SCHEMA_VERSION) {
    return { isOk: false, error: "This project was made with a newer version of Kringle." };
  }
  if (envelope.data.version < PROJECT_SCHEMA_VERSION) {
    return { isOk: false, error: `Unsupported project version ${envelope.data.version}.` };
  }
  const project = projectSchema.safeParse(envelope.data.project);
  if (!project.success)
    return { isOk: false, error: "This Kringle project is damaged and can't be opened." };
  return { isOk: true, project: project.data };
}
