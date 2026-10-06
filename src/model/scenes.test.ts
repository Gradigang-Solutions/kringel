import { describe, expect, it } from "vitest";
import { SCENE_COUNT_RANGE } from "@/model/constants";
import { addScene, duplicateScene, moveScene, removeScene, renameScene } from "@/model/scenes";
import type { Project } from "@/model/types";
import { makeIds, makeProject, makeStepsClip, withClip } from "@/test/builders";

function sceneNames(project: Project): string[] {
  return project.scenes.map((scene) => scene.name);
}

function hasOneSlotPerScene(project: Project): boolean {
  return project.tracks.every((track) => track.clips.length === project.scenes.length);
}

const withBeat = withClip(makeProject(), 0, 1, makeStepsClip({ id: "beat" }));

describe("addScene", () => {
  it("ajoute une scène vide en bas, avec un emplacement par piste", () => {
    const project = addScene(makeProject(), makeIds("s"));
    expect(project.scenes.at(-1)).toEqual({ id: "s-1", name: "Scene 7" });
    expect(hasOneSlotPerScene(project)).toBe(true);
    expect(project.tracks.every((track) => track.clips.at(-1) === null)).toBe(true);
  });

  it("ne dépasse pas le nombre maximal de scènes", () => {
    const nextId = makeIds("s");
    const full = Array.from({ length: SCENE_COUNT_RANGE.max }).reduce<Project>(
      (project) => addScene(project, nextId),
      makeProject(),
    );
    expect(full.scenes).toHaveLength(SCENE_COUNT_RANGE.max);
  });
});

describe("duplicateScene", () => {
  it("insère juste en dessous une copie indépendante des clips", () => {
    const project = duplicateScene(withBeat, 1, makeIds("d"));
    expect(sceneNames(project).slice(0, 4)).toEqual(["Intro", "Groove", "Groove 2", "Lift"]);
    expect(hasOneSlotPerScene(project)).toBe(true);
    const drums = project.tracks[0];
    expect(drums?.clips[1]?.id).toBe("beat");
    expect(drums?.clips[2]).toMatchObject({ name: "Four on the floor copy" });
    expect(drums?.clips[2]?.id).not.toBe("beat");
    expect(project.tracks[1]?.clips[2]).toBeNull();
  });
});

describe("removeScene", () => {
  it("retire la scène et ses emplacements", () => {
    const project = removeScene(withBeat, 1);
    expect(sceneNames(project)).toEqual(["Intro", "Lift", "Break", "Drop", "Outro"]);
    expect(hasOneSlotPerScene(project)).toBe(true);
    expect(project.tracks[0]?.clips.some((clip) => clip !== null)).toBe(false);
  });

  it("garde toujours au moins une scène", () => {
    const single = withBeat.scenes.reduce<Project>((project) => removeScene(project, 0), withBeat);
    expect(single.scenes).toHaveLength(SCENE_COUNT_RANGE.min);
    expect(removeScene(single, 0)).toBe(single);
  });
});

describe("moveScene", () => {
  it("déplace la scène avec ses clips", () => {
    const project = moveScene(withBeat, 1, -1);
    expect(sceneNames(project).slice(0, 2)).toEqual(["Groove", "Intro"]);
    expect(project.tracks[0]?.clips[0]?.id).toBe("beat");
    expect(hasOneSlotPerScene(project)).toBe(true);
  });
});

describe("renameScene", () => {
  it("renomme et ignore un nom vide", () => {
    expect(sceneNames(renameScene(withBeat, 0, " Start "))[0]).toBe("Start");
    expect(renameScene(withBeat, 0, "")).toBe(withBeat);
  });
});
