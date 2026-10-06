import { describe, expect, it } from "vitest";
import { emptyHistory, recordHistory, redoHistory, undoHistory } from "@/lib/history";

const OPTIONS = { limit: 3, mergeWindowMs: 1000 };

function recordAll(states: readonly string[]) {
  return states.reduce(
    (history, state, index) => recordHistory(history, state, null, index, OPTIONS),
    emptyHistory<string>(),
  );
}

describe("recordHistory", () => {
  it("empile l'état précédent et vide les états annulés", () => {
    const undone = undoHistory(recordAll(["a", "b"]), "c");
    const history = recordHistory(undone!.history, "b", null, 10, OPTIONS);
    expect(history.past).toEqual(["a", "b"]);
    expect(history.future).toEqual([]);
  });

  it("ne garde que les derniers états au-delà de la limite", () => {
    expect(recordAll(["a", "b", "c", "d"]).past).toEqual(["b", "c", "d"]);
  });

  it("fusionne les modifications d'une même clé rapprochées dans le temps", () => {
    const first = recordHistory(emptyHistory<string>(), "a", "fader", 0, OPTIONS);
    const second = recordHistory(first, "b", "fader", 500, OPTIONS);
    const third = recordHistory(second, "c", "fader", 1200, OPTIONS);
    expect(third.past).toEqual(["a"]);
  });

  it("sépare les modifications d'une même clé espacées dans le temps", () => {
    const first = recordHistory(emptyHistory<string>(), "a", "fader", 0, OPTIONS);
    expect(recordHistory(first, "b", "fader", 1000, OPTIONS).past).toEqual(["a", "b"]);
  });

  it("sépare les modifications de clés différentes ou sans clé", () => {
    const first = recordHistory(emptyHistory<string>(), "a", "fader", 0, OPTIONS);
    expect(recordHistory(first, "b", "pan", 10, OPTIONS).past).toEqual(["a", "b"]);
    const unkeyed = recordHistory(emptyHistory<string>(), "a", null, 0, OPTIONS);
    expect(recordHistory(unkeyed, "b", null, 10, OPTIONS).past).toEqual(["a", "b"]);
  });
});

describe("undoHistory et redoHistory", () => {
  it("revient à l'état précédent puis le rétablit", () => {
    const undone = undoHistory(recordAll(["a", "b"]), "c");
    expect(undone?.present).toBe("b");
    const redone = redoHistory(undone!.history, undone!.present);
    expect(redone?.present).toBe("c");
    expect(redone?.history.past).toEqual(["a", "b"]);
  });

  it("ne fait rien sans état à annuler ou à rétablir", () => {
    expect(undoHistory(emptyHistory<string>(), "a")).toBeNull();
    expect(redoHistory(emptyHistory<string>(), "a")).toBeNull();
  });

  it("ne fusionne pas une modification faite juste après une annulation", () => {
    const first = recordHistory(emptyHistory<string>(), "a", "fader", 0, OPTIONS);
    const undone = undoHistory(first, "b");
    const history = recordHistory(undone!.history, "a", "fader", 10, OPTIONS);
    expect(history.past).toEqual(["a"]);
  });
});
