import { describe, expect, it } from "vitest";
import { summarizeDemo } from "@/ui/demos/demoSummary";
import { makeCodeClip, makeProject, makeRow, makeStepsClip, withClip } from "@/test/builders";

describe("summarizeDemo", () => {
  it("résume l'occupation de la grille et les pistes utilisées", () => {
    let project = withClip(
      makeProject(),
      0,
      1,
      makeStepsClip({ rows: [makeRow("bd", [0, 4, 8, 12])] }),
    );
    project = withClip(project, 3, 0, makeCodeClip({ id: "pad" }));
    const summary = summarizeDemo(project);
    expect(summary.usedTrackNames).toEqual(["Drums", "Pad"]);
    expect(summary.lanes[0]!.filledScenes).toEqual([false, true, false, false, false, false]);
    expect(summary.snippet).toBe('s("bd*4")');
  });

  it("prend le premier clip quand la deuxième scène est vide", () => {
    const project = withClip(makeProject(), 3, 0, makeCodeClip());
    expect(summarizeDemo(project).snippet).toBe('chord("<Cm Ab Bb Gm>").voicing()');
    expect(summarizeDemo(makeProject()).snippet).toBe("");
  });
});
