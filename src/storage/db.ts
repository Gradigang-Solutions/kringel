import Dexie, { type EntityTable } from "dexie";
import { z } from "zod";
import type { Project } from "@/model/types";
import { parseVersionedProject } from "@/storage/migrate";

interface StoredProject {
  readonly id: string;
  readonly savedAt: number;
  readonly data: unknown;
}

interface Setting {
  readonly key: string;
  readonly value: string;
}

const LAST_PROJECT_KEY = "lastProjectId";

/** Un projet enregistré porte sa version : elle choisit la migration à appliquer. */
const storedVersionSchema = z.object({ version: z.number().int() });

class KringelDatabase extends Dexie {
  projects!: EntityTable<StoredProject, "id">;
  settings!: EntityTable<Setting, "key">;

  constructor() {
    super("kringel");
    this.version(1).stores({ projects: "id, savedAt", settings: "key" });
  }
}

const db = new KringelDatabase();

export async function saveProject(project: Project, now: number): Promise<void> {
  await db.transaction("rw", db.projects, db.settings, async () => {
    await db.projects.put({ id: project.id, savedAt: now, data: project });
    await db.settings.put({ key: LAST_PROJECT_KEY, value: project.id });
  });
}

/** Dernier projet ouvert, validé ; null s'il n'y en a pas ou s'il est illisible. */
export async function loadLastProject(): Promise<Project | null> {
  const setting = await db.settings.get(LAST_PROJECT_KEY);
  if (!setting) return null;
  const stored = await db.projects.get(setting.value);
  const versioned = storedVersionSchema.safeParse(stored?.data);
  if (!versioned.success) return null;
  return parseVersionedProject(versioned.data.version, stored?.data);
}
