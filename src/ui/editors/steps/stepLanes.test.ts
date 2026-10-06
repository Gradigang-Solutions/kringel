import { describe, expect, it } from "vitest";
import { laneLevels, laneValueAtHeight } from "@/ui/editors/steps/stepLanes";
import { makeRow } from "@/test/builders";

describe("laneLevels", () => {
  const row = makeRow("hh", [0, 2], {
    length: 4,
    velocity: 0.5,
    chances: [0.25, 1, 0.75, 1],
    ratchets: [2, 1, 4, 1],
  });

  it("donne une barre par pas allumé, rien pour un pas éteint", () => {
    expect(laneLevels(row, "velocities")).toEqual([0.5, 0, 0.5, 0]);
    expect(laneLevels(row, "chances")).toEqual([0.25, 0, 0.75, 0]);
  });

  it("ramène le ratchet à une hauteur entre 0 et 1", () => {
    expect(laneLevels(row, "ratchets")).toEqual([0.5, 0, 1, 0]);
  });
});

describe("laneValueAtHeight", () => {
  it("lit une valeur continue pour la vélocité et la probabilité", () => {
    expect(laneValueAtHeight("velocities", 15, 60)).toBe(0.75);
    expect(laneValueAtHeight("chances", 60, 60)).toBe(0);
  });

  it("lit le ratchet par crans, au moins un coup", () => {
    expect(laneValueAtHeight("ratchets", 0, 60)).toBe(4);
    expect(laneValueAtHeight("ratchets", 20, 60)).toBe(3);
    expect(laneValueAtHeight("ratchets", 59, 60)).toBe(1);
    expect(laneValueAtHeight("ratchets", 60, 60)).toBe(1);
  });
});
