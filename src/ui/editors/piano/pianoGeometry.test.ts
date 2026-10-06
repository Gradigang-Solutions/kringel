import { describe, expect, it } from "vitest";
import {
  hitNote,
  noteRect,
  pitchAt,
  pitchY,
  stepAt,
  stepX,
} from "@/ui/editors/piano/pianoGeometry";
import { makeNote } from "@/test/builders";

// 56 px de clavier, puis 16 pas de 10 px.
const layout = { width: 216, stepCount: 16 };

describe("conversions pointeur ↔ grille", () => {
  it("convertit une abscisse en pas", () => {
    expect(stepAt(layout, 56)).toBe(0);
    expect(stepAt(layout, 85)).toBe(2);
    expect(stepAt(layout, 1000)).toBe(15);
    expect(stepAt(layout, 20)).toBeNull();
    expect(stepX(layout, 2)).toBe(76);
  });

  it("convertit une ordonnée en hauteur, la plus aiguë en haut", () => {
    expect(pitchAt(0)).toBe(95);
    expect(pitchAt(17)).toBe(94);
    expect(pitchAt(100000)).toBe(24);
    expect(pitchY(94)).toBe(17);
  });
});

describe("hitNote", () => {
  const note = makeNote(94, 2, 4);

  it("place la note dans sa ligne et ses pas", () => {
    expect(noteRect(layout, note)).toEqual({ x: 77, y: 18.5, width: 38, height: 14 });
  });

  it("distingue le corps de la note et sa poignée de redimensionnement", () => {
    expect(hitNote(layout, [note], 80, 25)).toEqual({ note, zone: "body" });
    expect(hitNote(layout, [note], 113, 25)).toEqual({ note, zone: "resize" });
    expect(hitNote(layout, [note], 80, 60)).toBeNull();
  });
});
