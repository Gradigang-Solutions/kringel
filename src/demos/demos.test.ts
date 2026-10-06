import { describe, expect, it } from "vitest";
import { DEMOS } from "@/demos";
import { projectSchema } from "@/storage/schema";

describe("projets de démonstration", () => {
  it.each(DEMOS.map((demo) => [demo.project.name, demo.project] as const))(
    "%s est un projet valide",
    (_, project) => {
      expect(projectSchema.safeParse(project).success).toBe(true);
    },
  );

  it("ont des identifiants de clip uniques", () => {
    for (const { project } of DEMOS) {
      const ids = project.tracks.flatMap((track) =>
        track.clips.flatMap((clip) => (clip ? [clip.id] : [])),
      );
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
