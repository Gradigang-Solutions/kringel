import { describe, expect, it } from "vitest";
import {
  anchorOctaveFor,
  isBlackKey,
  isInScale,
  noteName,
  scaleDegree,
  scaleLabel,
  strudelNoteName,
  strudelScaleName,
} from "@/model/scales";

const C = 0;

describe("noms de notes", () => {
  it("nomme le do central C4", () => {
    expect(noteName(60)).toBe("C4");
    expect(strudelNoteName(63)).toBe("eb4");
    expect(noteName(36)).toBe("C2");
  });

  it("reconnaît les touches noires", () => {
    expect(isBlackKey(61)).toBe(true);
    expect(isBlackKey(60)).toBe(false);
  });
});

describe("isInScale", () => {
  it("accepte les notes de do mineur et refuse les autres", () => {
    expect(isInScale(63, C, "minor")).toBe(true);
    expect(isInScale(64, C, "minor")).toBe(false);
  });

  it("fonctionne sous la tonique", () => {
    expect(isInScale(58, C, "minor")).toBe(true);
  });
});

describe("scaleDegree", () => {
  it("donne le degré relatif à la tonique ancrée", () => {
    expect(scaleDegree(60, C, "minor", 4)).toBe(0);
    expect(scaleDegree(67, C, "minor", 4)).toBe(4);
    expect(scaleDegree(72, C, "minor", 4)).toBe(7);
  });

  it("donne des degrés négatifs sous la tonique", () => {
    expect(scaleDegree(56, C, "minor", 4)).toBe(-2);
  });

  it("renvoie null pour une note hors gamme", () => {
    expect(scaleDegree(64, C, "minor", 4)).toBeNull();
  });
});

describe("anchorOctaveFor", () => {
  it("ancre la tonique sous la note la plus grave", () => {
    expect(anchorOctaveFor([60, 67], C)).toBe(4);
    expect(anchorOctaveFor([58, 67], C)).toBe(3);
    expect(anchorOctaveFor([36], 2)).toBe(1);
  });

  it("utilise l'octave par défaut sans note", () => {
    expect(anchorOctaveFor([], C)).toBe(4);
  });
});

describe("strudelScaleName", () => {
  it("écrit la gamme au format de Strudel", () => {
    expect(strudelScaleName(C, "minor", 4)).toBe("C4:minor");
    expect(strudelScaleName(3, "major:pentatonic", 3)).toBe("Eb3:major:pentatonic");
  });
});

describe("scaleLabel", () => {
  it("donne le libellé affiché d'une gamme", () => {
    expect(scaleLabel("harmonic:minor")).toBe("Harmonic minor");
  });
});
