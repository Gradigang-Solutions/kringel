import { describe, expect, it } from "vitest";
import { TRACK_COLORS, TRACK_COUNT_RANGE } from "@/model/constants";
import {
  addTrack,
  duplicateTrack,
  moveTrack,
  nextTrackColor,
  removeTrack,
  renameTrack,
} from "@/model/tracks";
import type { Project } from "@/model/types";
import { makeIds, makeProject, makeStepsClip, trackIdAt, withClip } from "@/test/builders";

function names(project: Project): string[] {
  return project.tracks.map((track) => track.name);
}

function addMany(project: Project, count: number): Project {
  const nextId = makeIds("t");
  return Array.from({ length: count }).reduce<Project>(
    (current) => addTrack(current, "notes", nextId),
    project,
  );
}

describe("addTrack", () => {
  it("ajoute à droite une piste vide, avec un emplacement par scène", () => {
    const project = addTrack(makeProject(), "notes", makeIds("t"));
    const added = project.tracks.at(-1);
    expect(added).toMatchObject({ id: "t-1", name: "Synth", defaultClipKind: "notes" });
    expect(added?.clips).toHaveLength(project.scenes.length);
    expect(added?.clips.every((clip) => clip === null)).toBe(true);
  });

  it("donne un nom libre et la première couleur inutilisée", () => {
    const project = addTrack(addTrack(makeProject(), "steps", makeIds("t")), "steps", makeIds("u"));
    expect(names(project).slice(4)).toEqual(["Drums 2", "Drums 3"]);
    expect(project.tracks.map((track) => track.color)).toEqual(TRACK_COLORS.slice(0, 6));
  });

  it("ne dépasse pas le nombre maximal de pistes", () => {
    const full = addMany(makeProject(), TRACK_COUNT_RANGE.max);
    expect(full.tracks).toHaveLength(TRACK_COUNT_RANGE.max);
  });
});

describe("nextTrackColor", () => {
  it("reprend la couleur d'une piste supprimée", () => {
    const project = removeTrack(makeProject(), trackIdAt(makeProject(), 1));
    expect(nextTrackColor(project)).toBe(TRACK_COLORS[1]);
  });
});

describe("duplicateTrack", () => {
  it("insère juste à droite une copie indépendante des clips", () => {
    const source = withClip(makeProject(), 0, 2, makeStepsClip({ id: "beat" }));
    const project = duplicateTrack(source, trackIdAt(source, 0), makeIds("d"));
    expect(names(project)).toEqual(["Drums", "Drums 2", "Bass", "Lead", "Pad"]);
    const copy = project.tracks[1];
    expect(copy?.defaultClipKind).toBe("steps");
    expect(copy?.clips[2]).toMatchObject({ name: "Four on the floor copy" });
    expect(copy?.clips[2]?.id).not.toBe("beat");
    expect(copy?.color).toBe(TRACK_COLORS[4]);
  });
});

describe("removeTrack", () => {
  it("retire la piste", () => {
    const source = makeProject();
    expect(names(removeTrack(source, trackIdAt(source, 1)))).toEqual(["Drums", "Lead", "Pad"]);
  });

  it("garde toujours au moins une piste", () => {
    const single = { ...makeProject(), tracks: makeProject().tracks.slice(0, 1) };
    expect(removeTrack(single, trackIdAt(single, 0))).toBe(single);
  });
});

describe("moveTrack", () => {
  it("déplace la piste d'une colonne, sans sortir de la grille", () => {
    const source = makeProject();
    expect(names(moveTrack(source, trackIdAt(source, 0), 1))).toEqual([
      "Bass",
      "Drums",
      "Lead",
      "Pad",
    ]);
    expect(names(moveTrack(source, trackIdAt(source, 0), -1))).toEqual(names(source));
  });
});

describe("renameTrack", () => {
  it("renomme sans espaces autour et ignore un nom vide", () => {
    const source = makeProject();
    const id = trackIdAt(source, 0);
    expect(names(renameTrack(source, id, "  Perc  "))[0]).toBe("Perc");
    expect(renameTrack(source, id, "   ")).toBe(source);
  });
});
