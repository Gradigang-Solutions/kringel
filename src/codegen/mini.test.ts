import { describe, expect, it } from "vitest";
import { alternateCycles, eventsInCycle, voiceToMini, type MiniEvent } from "@/codegen/mini";

const hits = (token: string, steps: readonly number[]): MiniEvent[] =>
  steps.map((start) => ({ start, duration: 1, token }));
const drums = { ignoreDurations: true };
const melodic = { ignoreDurations: false };

describe("voiceToMini, sons de batterie", () => {
  it("écrit une répétition régulière avec *", () => {
    expect(voiceToMini(hits("bd", [0, 4, 8, 12]), 16, drums)).toBe("bd*4");
    expect(voiceToMini(hits("hh", [0, 2, 4, 6, 8, 10, 12, 14]), 16, drums)).toBe("hh*8");
    expect(voiceToMini(hits("hh", [0]), 16, drums)).toBe("hh");
  });

  it("réduit la grille au plus grand pas commun", () => {
    expect(voiceToMini(hits("sd", [4, 12]), 16, drums)).toBe("~ sd ~ sd");
    expect(voiceToMini(hits("cp", [12]), 16, drums)).toBe("~ ~ ~ cp");
    expect(voiceToMini(hits("bd", [0, 6, 10]), 16, drums)).toBe("bd ~ ~ bd ~ bd ~ ~");
  });

  it("regroupe les longs silences", () => {
    expect(voiceToMini(hits("cp", [15]), 16, drums)).toBe("~@15 cp");
  });

  it("écrit un silence quand il n'y a rien", () => {
    expect(voiceToMini([], 16, drums)).toBe("~");
  });
});

describe("voiceToMini, notes", () => {
  it("tient compte des durées", () => {
    const events = [
      { start: 0, duration: 4, token: "c2" },
      { start: 8, duration: 4, token: "eb2" },
      { start: 12, duration: 4, token: "g2" },
    ];
    expect(voiceToMini(events, 16, melodic)).toBe("c2 ~ eb2 g2");
  });

  it("allonge une note avec @", () => {
    const events = [
      { start: 0, duration: 12, token: "0" },
      { start: 12, duration: 4, token: "2" },
    ];
    expect(voiceToMini(events, 16, melodic)).toBe("0@3 2");
  });

  it("n'écrit pas de répétition pour une note qui dure tout le cycle", () => {
    expect(voiceToMini([{ start: 0, duration: 16, token: "0" }], 16, melodic)).toBe("0");
  });
});

describe("alternateCycles", () => {
  it("écrit une seule fois un motif identique sur tous les cycles", () => {
    expect(alternateCycles(["bd*4", "bd*4"])).toBe("bd*4");
  });

  it("alterne les cycles différents avec < >", () => {
    expect(alternateCycles(["bd*4", "bd ~ bd ~"])).toBe("<bd*4 [bd ~ bd ~]>");
    expect(alternateCycles([])).toBe("~");
  });
});

describe("eventsInCycle", () => {
  it("ramène les évènements au début du cycle et coupe ceux qui dépassent", () => {
    const events = [
      { start: 2, duration: 4 },
      { start: 18, duration: 20 },
    ];
    expect(eventsInCycle(events, 1, 16)).toEqual([{ start: 2, duration: 14 }]);
  });
});
