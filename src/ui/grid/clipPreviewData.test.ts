import { describe, expect, it } from "vitest";
import { codePreviewLine, notePreviews, stepPreviewRows } from "@/ui/grid/clipPreviewData";
import { makeNote, makeNotesClip, makeRow, makeStepsClip } from "@/test/builders";

describe("stepPreviewRows", () => {
  it("garde au plus 4 lignes et marque les pas allumés", () => {
    const clip = makeStepsClip({
      rows: ["bd", "sd", "hh", "cp", "oh"].map((sound) => makeRow(sound, [0])),
    });
    const rows = stepPreviewRows(clip);
    expect(rows).toHaveLength(4);
    expect(rows[0]!.cells[0]).toBe(true);
    expect(rows[0]!.cells[1]).toBe(false);
  });
});

describe("notePreviews", () => {
  it("place la note la plus aiguë en haut et la plus grave en bas", () => {
    const clip = makeNotesClip({ notes: [makeNote(60, 0, 4), makeNote(72, 8, 8)] });
    expect(notePreviews(clip)).toEqual([
      { id: "note-60-0", left: 0, width: 25, top: 80 },
      { id: "note-72-8", left: 50, width: 50, top: 0 },
    ]);
  });

  it("centre une hauteur unique", () => {
    expect(notePreviews(makeNotesClip({ notes: [makeNote(60, 0, 16)] }))[0]!.top).toBe(40);
  });
});

describe("codePreviewLine", () => {
  it("prend la première ligne qui n'est pas un commentaire", () => {
    expect(codePreviewLine('// Pad\n\n  chord("Cm")\n')).toBe('chord("Cm")');
    expect(codePreviewLine("")).toBe("");
  });
});
