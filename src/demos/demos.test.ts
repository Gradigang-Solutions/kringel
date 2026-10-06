import { describe, expect, it } from "vitest";
import { DEMOS } from "@/demos";
import { assertNever } from "@/lib/assertNever";
import { isSoundInKit } from "@/model/kits";
import type { Clip, Project } from "@/model/types";
import { projectSchema } from "@/storage/schema";

function projectClips(project: Project): Clip[] {
  return project.tracks.flatMap((track) => track.clips.flatMap((clip) => (clip ? [clip] : [])));
}

/** Identifiants des clips et de ce qu'ils contiennent (lignes de pas, notes). */
function contentIds(clip: Clip): string[] {
  switch (clip.kind) {
    case "steps":
      return [clip.id, ...clip.rows.map((row) => row.id)];
    case "notes":
      return [clip.id, ...clip.notes.map((note) => note.id)];
    case "code":
      return [clip.id];
    default:
      return assertNever(clip);
  }
}

describe("projets de démonstration", () => {
  it.each(DEMOS.map((demo) => [demo.project.name, demo.project] as const))(
    "%s est un projet valide",
    (_, project) => {
      expect(projectSchema.safeParse(project).success).toBe(true);
    },
  );

  it("ont des identifiants de clip, de ligne et de note uniques", () => {
    for (const { project } of DEMOS) {
      const ids = projectClips(project).flatMap(contentIds);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("ne jouent que des sons présents dans le kit de leur clip", () => {
    for (const { project } of DEMOS) {
      for (const clip of projectClips(project)) {
        if (clip.kind !== "steps") continue;
        for (const row of clip.rows)
          expect(isSoundInKit(clip.kit, row.sound), row.sound).toBe(true);
      }
    }
  });
});
