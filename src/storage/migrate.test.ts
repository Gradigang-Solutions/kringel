import { describe, expect, it } from "vitest";
import { PROJECT_SCHEMA_VERSION } from "@/model/constants";
import { parseVersionedProject } from "@/storage/migrate";
import { asVersion1, makeProject, makeStepsClip, withClip } from "@/test/builders";

describe("parseVersionedProject", () => {
  it("met un projet v1 au format courant", () => {
    const project = withClip(makeProject(), 0, 0, makeStepsClip());
    const upgraded = parseVersionedProject(1, asVersion1(project));
    expect(upgraded?.version).toBe(PROJECT_SCHEMA_VERSION);
    expect(upgraded?.tracks.map((track) => track.defaultClipKind)).toEqual([
      "steps",
      "notes",
      "notes",
      "notes",
    ]);
    expect(upgraded?.tracks[0]?.clips[0]).toEqual(makeStepsClip());
  });

  it("garde un projet courant identique", () => {
    const project = makeProject();
    expect(parseVersionedProject(PROJECT_SCHEMA_VERSION, project)).toEqual(project);
  });

  it("refuse une version inconnue ou un contenu invalide", () => {
    expect(parseVersionedProject(0, makeProject())).toBeNull();
    expect(parseVersionedProject(PROJECT_SCHEMA_VERSION + 1, makeProject())).toBeNull();
    expect(parseVersionedProject(PROJECT_SCHEMA_VERSION, { hello: 1 })).toBeNull();
  });
});
