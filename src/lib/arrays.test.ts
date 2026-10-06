import { describe, expect, it } from "vitest";
import { insertAt, moveItem, removeAt } from "@/lib/arrays";

describe("moveItem", () => {
  it("déplace un élément vers l'avant ou l'arrière", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("borne la destination à la liste", () => {
    expect(moveItem(["a", "b", "c"], 1, 9)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
  });

  it("renvoie une copie inchangée pour un indice inconnu", () => {
    expect(moveItem(["a", "b"], 5, 0)).toEqual(["a", "b"]);
  });
});

describe("insertAt et removeAt", () => {
  it("insère et retire à l'indice demandé", () => {
    expect(insertAt(["a", "c"], 1, "b")).toEqual(["a", "b", "c"]);
    expect(insertAt(["a"], 1, "b")).toEqual(["a", "b"]);
    expect(removeAt(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });
});
