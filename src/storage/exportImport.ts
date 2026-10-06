import { z } from "zod";
import { PROJECT_SCHEMA_VERSION } from "@/model/constants";
import type { Project } from "@/model/types";
import { isSupportedVersion, parseVersionedProject } from "@/storage/migrate";

const FILE_FORMAT = "kringel-project";
const JSON_INDENT = 2;

export type ImportResult =
  | { readonly isOk: true; readonly project: Project }
  | { readonly isOk: false; readonly error: string };

const envelopeSchema = z.object({
  format: z.literal(FILE_FORMAT),
  version: z.number().int(),
  project: z.unknown(),
});

/** Enveloppe commune au fichier exporté et au lien de partage : format et version, puis le projet. */
export function projectEnvelope(project: Project): z.infer<typeof envelopeSchema> {
  return { format: FILE_FORMAT, version: PROJECT_SCHEMA_VERSION, project };
}

export function serializeProject(project: Project): string {
  return JSON.stringify(projectEnvelope(project), null, JSON_INDENT);
}

export function projectFileName(project: Project): string {
  const slug = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug === "" ? "project" : slug}.kringel.json`;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Le contenu n'est pas du JSON : l'appelant reçoit undefined et signale un fichier invalide.
    return undefined;
  }
}

/** Valide un projet exporté (fichier ou lien) : format, version, puis contenu du projet. */
export function parseProjectFile(text: string): ImportResult {
  const envelope = envelopeSchema.safeParse(parseJson(text));
  if (!envelope.success) return { isOk: false, error: "This is not a Kringel project." };
  const { version } = envelope.data;
  if (version > PROJECT_SCHEMA_VERSION) {
    return { isOk: false, error: "This project was made with a newer version of Kringel." };
  }
  if (!isSupportedVersion(version)) {
    return { isOk: false, error: `Unsupported project version ${version}.` };
  }
  const project = parseVersionedProject(version, envelope.data.project);
  if (project === null)
    return { isOk: false, error: "This Kringel project is damaged and can't be opened." };
  return { isOk: true, project };
}
