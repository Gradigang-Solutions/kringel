import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setBpm } from "@/model/project";
import {
  getProject,
  redoProject,
  replaceProject,
  undoProject,
  updateProject,
  useProjectStore,
} from "@/store/projectStore";
import { makeProject } from "@/test/builders";

const START = makeProject({ bpm: 100 });

beforeEach(() => {
  vi.useFakeTimers();
  replaceProject(START, "saved");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("historique du projet", () => {
  it("annule puis rétablit une modification", () => {
    updateProject((project) => setBpm(project, 130));
    expect(undoProject()).toBe(true);
    expect(getProject()).toBe(START);
    expect(useProjectStore.getState().saveStatus).toBe("pending");
    expect(redoProject()).toBe(true);
    expect(getProject().bpm).toBe(130);
  });

  it("annule en une fois un geste continu portant la même clé", () => {
    updateProject((project) => setBpm(project, 110), "bpm");
    vi.advanceTimersByTime(100);
    updateProject((project) => setBpm(project, 120), "bpm");
    undoProject();
    expect(getProject()).toBe(START);
    expect(undoProject()).toBe(false);
  });

  it("n'enregistre pas une modification sans effet", () => {
    updateProject((project) => project);
    expect(undoProject()).toBe(false);
  });

  it("repart d'un historique vide quand le projet est remplacé", () => {
    updateProject((project) => setBpm(project, 130));
    replaceProject(makeProject(), "pending");
    expect(undoProject()).toBe(false);
    expect(redoProject()).toBe(false);
  });
});
