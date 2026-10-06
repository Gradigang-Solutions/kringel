import { describe, expect, it } from "vitest";
import { groupedSpans, nearestSpanIndex, spanIndexAt } from "@/ui/shared/canvas/gridGeometry";

const spacing = { groupSize: 4, cellGap: 4, groupGap: 10 };

describe("groupedSpans", () => {
  it("répartit les cellules avec des écarts plus grands entre groupes", () => {
    // 8 cellules, 6 écarts de 4 px et 1 écart de 10 px : (114 - 34) / 8 = 10 px par cellule.
    const spans = groupedSpans(114, 8, spacing);
    expect(spans[0]).toEqual({ start: 0, size: 10 });
    expect(spans[3]).toEqual({ start: 42, size: 10 });
    expect(spans[4]).toEqual({ start: 62, size: 10 });
    expect(spans[7]!.start + spans[7]!.size).toBe(114);
  });

  it("gère une grille sans écart et une grille vide", () => {
    expect(groupedSpans(100, 4, { groupSize: 1, cellGap: 0, groupGap: 0 })[2]).toEqual({
      start: 50,
      size: 25,
    });
    expect(groupedSpans(100, 0, spacing)).toEqual([]);
  });
});

describe("spanIndexAt", () => {
  const spans = groupedSpans(114, 8, spacing);

  it("trouve la cellule sous la position", () => {
    expect(spanIndexAt(spans, 5)).toBe(0);
    expect(spanIndexAt(spans, 63)).toBe(4);
  });

  it("renvoie null dans un écart ou hors de la grille", () => {
    expect(spanIndexAt(spans, 11)).toBeNull();
    expect(spanIndexAt(spans, 200)).toBeNull();
  });
});

describe("nearestSpanIndex", () => {
  it("prend la cellule la plus proche, même dans un écart", () => {
    const spans = groupedSpans(114, 8, spacing);
    expect(nearestSpanIndex(spans, 11)).toBe(0);
    expect(nearestSpanIndex(spans, 500)).toBe(7);
    expect(nearestSpanIndex([], 3)).toBeNull();
  });
});
