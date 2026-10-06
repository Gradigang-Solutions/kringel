import { describe, expect, it } from "vitest";
import { parseProjectFile, projectFileName, serializeProject } from "@/storage/exportImport";
import {
  makeCodeClip,
  makeNote,
  makeNotesClip,
  makeProject,
  makeStepsClip,
  withClip,
} from "@/test/builders";

const project = withClip(
  withClip(
    withClip(makeProject({ name: "Night Drive" }), 0, 0, makeStepsClip()),
    1,
    1,
    makeNotesClip({ notes: [makeNote(36, 0, 4)] }),
  ),
  3,
  2,
  makeCodeClip(),
);

describe("export puis import", () => {
  it("redonne un projet identique", () => {
    const result = parseProjectFile(serializeProject(project));
    expect(result).toEqual({ isOk: true, project });
  });

  it("nomme le fichier d'après le projet", () => {
    expect(projectFileName(project)).toBe("night-drive.kringel.json");
    expect(projectFileName(makeProject({ name: "!!!" }))).toBe("project.kringel.json");
  });
});

describe("rejet à l'import", () => {
  it("refuse un fichier qui n'est pas du JSON", () => {
    expect(parseProjectFile("pas du json")).toEqual({
      isOk: false,
      error: "This is not a Kringel project.",
    });
  });

  it("refuse un JSON qui n'est pas un projet Kringel", () => {
    expect(parseProjectFile('{"hello": 1}').isOk).toBe(false);
  });

  it("refuse une version plus récente ou inconnue", () => {
    const newer = JSON.stringify({ format: "kringel-project", version: 99, project });
    const older = JSON.stringify({ format: "kringel-project", version: 0, project });
    expect(parseProjectFile(newer)).toEqual({
      isOk: false,
      error: "This project was made with a newer version of Kringel.",
    });
    expect(parseProjectFile(older).isOk).toBe(false);
  });

  it("refuse un projet abîmé", () => {
    const damaged = JSON.stringify({
      format: "kringel-project",
      version: 1,
      project: { ...project, tracks: [{ ...project.tracks[0], clips: [] }] },
    });
    expect(parseProjectFile(damaged)).toEqual({
      isOk: false,
      error: "This Kringel project is damaged and can't be opened.",
    });
  });

  it("refuse une gamme ou une longueur inconnue", () => {
    const badClip = { ...makeNotesClip(), scale: "klingon", cycles: 3 };
    const bad = withClip(makeProject(), 0, 0, makeNotesClip());
    const text = JSON.stringify({
      format: "kringel-project",
      version: 1,
      project: {
        ...bad,
        tracks: bad.tracks.map((track, index) =>
          index === 0 ? { ...track, clips: [badClip, ...track.clips.slice(1)] } : track,
        ),
      },
    });
    expect(parseProjectFile(text).isOk).toBe(false);
  });
});
