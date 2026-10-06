import { describe, expect, it } from "vitest";
import { clipRootCall, clipToCodeSource } from "@/codegen/clip";
import { makeCodeClip, makeNote, makeNotesClip, makeRow, makeStepsClip } from "@/test/builders";

describe("clipToCodeSource", () => {
  it("convertit un clip de pas en code", () => {
    const clip = makeStepsClip({ rows: [makeRow("bd", [0, 4, 8, 12]), makeRow("sd", [4, 12])] });
    expect(clipToCodeSource(clip)).toMatchInlineSnapshot(`
      "s("bd*4, ~ sd ~ sd")
        .bank("RolandTR909")"
    `);
  });

  it("convertit un clip de notes en code", () => {
    const clip = makeNotesClip({ notes: [makeNote(48, 0, 4), makeNote(51, 4, 4)] });
    expect(clipToCodeSource(clip)).toMatchInlineSnapshot(`
      "n("0 2 ~ ~")
        .scale("C3:minor")
        .s("sawtooth")"
    `);
  });

  it("renvoie une source vide pour un clip vide, et la source d'un clip de code", () => {
    expect(clipToCodeSource(makeNotesClip())).toBe("");
    expect(clipToCodeSource(makeCodeClip({ source: 's("bd")' }))).toBe('s("bd")');
  });
});

describe("clipRootCall", () => {
  it("donne la fonction principale de chaque type de clip", () => {
    expect(clipRootCall(makeStepsClip())).toBe("s()");
    expect(clipRootCall(makeNotesClip({ notes: [makeNote(60, 0, 1)] }))).toBe("n()");
    expect(clipRootCall(makeNotesClip({ notes: [makeNote(64, 0, 1)] }))).toBe("note()");
    expect(clipRootCall(makeCodeClip())).toBe("chord()");
    expect(clipRootCall(makeCodeClip({ source: "// rien\n" }))).toBe("code");
  });
});
