import { describe, expect, it } from "vitest";
import { pitchWindow } from "@/ui/editors/code/previewLayout";

describe("pitchWindow", () => {
  it("couvre toutes les notes", () => {
    const notes = [
      { begin: 0, end: 1, pitch: 43 },
      { begin: 1, end: 2, pitch: 62 },
    ];
    expect(pitchWindow(notes)).toEqual({ lowest: 43, highest: 62 });
  });

  it("élargit à une octave autour d'une note seule", () => {
    expect(pitchWindow([{ begin: 0, end: 1, pitch: 60 }])).toEqual({ lowest: 54, highest: 66 });
    expect(pitchWindow([])).toBeNull();
  });
});
