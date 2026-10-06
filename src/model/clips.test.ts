import { describe, expect, it } from "vitest";
import {
  createClip,
  defaultClipName,
  deleteClip,
  duplicateClip,
  renameClip,
  replaceWithCodeClip,
  setCodeSource,
} from "@/model/clips";
import { clipAt, findClip } from "@/model/project";
import {
  makeCodeClip,
  makeIds,
  makeNote,
  makeNotesClip,
  makeProject,
  makeStepsClip,
  trackIdAt,
  withClip,
} from "@/test/builders";

describe("createClip", () => {
  it("crée un clip de pas avec 4 sons par défaut", () => {
    const project = makeProject();
    const address = { trackId: trackIdAt(project, 0), sceneIndex: 0 };
    const clip = clipAt(createClip(project, address, "steps", makeIds("c")), address);
    expect(clip).toMatchObject({ kind: "steps", name: "Beat 1", kit: "RolandTR909", cycles: 1 });
    expect(clip?.kind === "steps" && clip.rows.map((row) => row.sound)).toEqual([
      "bd",
      "sd",
      "hh",
      "cp",
    ]);
  });

  it("crée un clip de notes et un clip de code", () => {
    const project = makeProject();
    const notesAddress = { trackId: trackIdAt(project, 1), sceneIndex: 0 };
    const codeAddress = { trackId: trackIdAt(project, 2), sceneIndex: 0 };
    const withNotes = createClip(project, notesAddress, "notes", makeIds("n"));
    const withCode = createClip(withNotes, codeAddress, "code", makeIds("k"));
    expect(clipAt(withCode, notesAddress)).toMatchObject({
      kind: "notes",
      scale: "minor",
      notes: [],
    });
    expect(clipAt(withCode, codeAddress)).toMatchObject({
      kind: "code",
      source: "",
      name: "Code 1",
    });
  });

  it("n'écrase pas un emplacement occupé", () => {
    const project = withClip(makeProject(), 0, 0, makeStepsClip());
    const address = { trackId: trackIdAt(project, 0), sceneIndex: 0 };
    expect(createClip(project, address, "code", makeIds())).toBe(project);
  });

  it("ignore une piste inconnue", () => {
    const project = makeProject();
    expect(createClip(project, { trackId: "x", sceneIndex: 0 }, "code", makeIds())).toBe(project);
  });
});

describe("defaultClipName", () => {
  it("numérote selon le nombre de clips du même type", () => {
    const project = withClip(makeProject(), 0, 0, makeStepsClip());
    expect(defaultClipName(project, "steps")).toBe("Beat 2");
    expect(defaultClipName(project, "notes")).toBe("Melody 1");
  });
});

describe("deleteClip", () => {
  it("vide l'emplacement", () => {
    const project = withClip(makeProject(), 0, 2, makeStepsClip({ id: "c" }));
    expect(findClip(deleteClip(project, "c"), "c")).toBeUndefined();
  });

  it("ignore un clip inconnu", () => {
    const project = makeProject();
    expect(deleteClip(project, "x")).toBe(project);
  });
});

describe("renameClip", () => {
  it("renomme un clip et ignore un nom vide", () => {
    const project = withClip(makeProject(), 0, 0, makeStepsClip({ id: "c" }));
    expect(findClip(renameClip(project, "c", " Fill "), "c")?.clip.name).toBe("Fill");
    expect(renameClip(project, "c", "")).toBe(project);
  });
});

describe("duplicateClip", () => {
  it("copie le clip dans le premier emplacement libre en dessous, avec de nouveaux identifiants", () => {
    let project = withClip(makeProject(), 0, 0, makeStepsClip({ id: "c" }));
    project = withClip(project, 0, 1, makeCodeClip({ id: "occupe" }));
    const duplicated = duplicateClip(project, "c", makeIds("d"));
    const copy = duplicated.tracks[0]!.clips[2];
    expect(copy).toMatchObject({ kind: "steps", name: "Four on the floor copy", id: "d-1" });
    expect(copy?.kind === "steps" && copy.rows[0]?.id).toBe("d-2");
  });

  it("ne fait rien s'il n'y a plus de place en dessous", () => {
    const project = withClip(makeProject(), 0, 5, makeStepsClip({ id: "c" }));
    expect(duplicateClip(project, "c", makeIds())).toBe(project);
    expect(duplicateClip(project, "x", makeIds())).toBe(project);
  });

  it("donne de nouveaux identifiants aux notes et au code", () => {
    const project = withClip(makeProject(), 0, 0, makeCodeClip({ id: "c" }));
    expect(duplicateClip(project, "c", makeIds("d")).tracks[0]!.clips[1]?.id).toBe("d-1");
  });
});

describe("replaceWithCodeClip", () => {
  it("remplace le clip par un clip de code de même nom", () => {
    const project = withClip(makeProject(), 0, 3, makeStepsClip({ id: "c" }));
    const replaced = replaceWithCodeClip(project, "c", 's("bd*4")', makeIds("k"));
    expect(replaced.tracks[0]!.clips[3]).toEqual({
      kind: "code",
      id: "k-1",
      name: "Four on the floor",
      source: 's("bd*4")',
    });
    expect(replaceWithCodeClip(project, "x", "", makeIds())).toBe(project);
  });
});

describe("setCodeSource", () => {
  it("remplace la source", () => {
    expect(setCodeSource(makeCodeClip(), 's("hh")').source).toBe('s("hh")');
  });
});

describe("duplicateClip, clip de notes", () => {
  it("donne de nouveaux identifiants aux notes copiées", () => {
    const project = withClip(
      makeProject(),
      1,
      0,
      makeNotesClip({ id: "n", notes: [makeNote(60, 0, 4)] }),
    );
    const copy = duplicateClip(project, "n", makeIds("d")).tracks[1]!.clips[1];
    expect(copy?.kind === "notes" && copy.notes.map((note) => note.id)).toEqual(["d-2"]);
  });
});
