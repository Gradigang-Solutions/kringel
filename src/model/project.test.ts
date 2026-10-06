import { describe, expect, it } from "vitest";
import {
  clipAt,
  clipIds,
  createProject,
  findClip,
  hasAnyClip,
  renameProject,
  setBpm,
  updateClip,
  updateClipOfKind,
  withProjectId,
} from "@/model/project";
import {
  makeCodeClip,
  makeIds,
  makeProject,
  makeStepsClip,
  trackIdAt,
  withClip,
} from "@/test/builders";

describe("createProject", () => {
  it("crée 4 pistes et 6 scènes vides", () => {
    const project = createProject(makeIds());
    expect(project.tracks.map((track) => track.name)).toEqual(["Drums", "Bass", "Lead", "Pad"]);
    expect(project.scenes).toHaveLength(6);
    expect(project.tracks.every((track) => track.clips.length === 6)).toBe(true);
    expect(hasAnyClip(project)).toBe(false);
    expect(project.bpm).toBe(120);
  });
});

describe("setBpm", () => {
  it("borne et arrondit le tempo", () => {
    const project = makeProject();
    expect(setBpm(project, 124.4).bpm).toBe(124);
    expect(setBpm(project, 1000).bpm).toBe(240);
    expect(setBpm(project, 1).bpm).toBe(40);
  });
});

describe("renameProject", () => {
  it("ignore un nom vide", () => {
    const project = makeProject();
    expect(renameProject(project, "  ")).toBe(project);
    expect(renameProject(project, " Night Drive ").name).toBe("Night Drive");
  });
});

describe("recherche de clip", () => {
  it("retrouve un clip, sa piste et sa scène", () => {
    const project = withClip(makeProject(), 1, 3, makeStepsClip({ id: "c" }));
    const located = findClip(project, "c");
    expect(located?.track.name).toBe("Bass");
    expect(located?.sceneIndex).toBe(3);
    expect(clipAt(project, { trackId: trackIdAt(project, 1), sceneIndex: 3 })?.id).toBe("c");
    expect(hasAnyClip(project)).toBe(true);
  });

  it("renvoie undefined pour un clip inconnu", () => {
    expect(findClip(makeProject(), "inconnu")).toBeUndefined();
    expect(updateClip(makeProject(), "inconnu", (clip) => clip)).toEqual(makeProject());
  });
});

describe("updateClipOfKind", () => {
  it("ne modifie pas un clip d'un autre type", () => {
    const project = withClip(makeProject(), 0, 0, makeCodeClip({ id: "c" }));
    const updated = updateClipOfKind(project, "c", "steps", (clip) => ({ ...clip, name: "x" }));
    expect(findClip(updated, "c")?.clip.name).toBe("Chords");
  });

  it("modifie un clip du type attendu", () => {
    const project = withClip(makeProject(), 0, 0, makeCodeClip({ id: "c" }));
    const updated = updateClipOfKind(project, "c", "code", (clip) => ({
      ...clip,
      source: 's("bd")',
    }));
    expect(findClip(updated, "c")?.clip).toMatchObject({ source: 's("bd")' });
  });
});

describe("withProjectId", () => {
  it("change l'identifiant sans toucher au contenu", () => {
    const project = withClip(makeProject(), 0, 0, makeStepsClip());
    const copy = withProjectId(project, "copy");
    expect(copy.id).toBe("copy");
    expect(copy.tracks).toBe(project.tracks);
  });
});

describe("clipIds", () => {
  it("liste les clips de toutes les pistes, sans les slots vides", () => {
    const project = withClip(
      withClip(makeProject(), 0, 2, makeStepsClip({ id: "a" })),
      3,
      0,
      makeCodeClip({ id: "b" }),
    );
    expect(clipIds(project)).toEqual(["a", "b"]);
    expect(clipIds(makeProject())).toEqual([]);
  });
});
