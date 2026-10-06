import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { loadLastProject, saveProject } from "@/storage/db";
import { makeProject, makeStepsClip, withClip } from "@/test/builders";

describe("sauvegarde locale", () => {
  it("ne trouve rien au premier lancement", async () => {
    expect(await loadLastProject()).toBeNull();
  });

  it("recharge le dernier projet sauvegardé", async () => {
    const first = makeProject({ id: "a", name: "First" });
    const second = withClip(makeProject({ id: "b", name: "Second" }), 0, 0, makeStepsClip());
    await saveProject(first, 1);
    await saveProject(second, 2);
    expect(await loadLastProject()).toEqual(second);
  });
});
