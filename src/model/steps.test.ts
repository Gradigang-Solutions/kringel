import { describe, expect, it } from "vitest";
import {
  addStepRow,
  isStepOn,
  removeStepRow,
  setKit,
  setStepChance,
  setStepRatchet,
  setStepVelocity,
  setStepsCycles,
  setSwing,
  toggleRowMute,
  toggleStep,
} from "@/model/steps";
import { makeIds, makeRow, makeStepsClip } from "@/test/builders";

const clip = makeStepsClip({ rows: [makeRow("bd", [0, 4])] });

describe("toggleStep", () => {
  it("allume un pas éteint à la vélocité par défaut, puis l'éteint", () => {
    const on = toggleStep(clip, "row-bd", 2);
    expect(on.rows[0]!.velocities[2]).toBe(1);
    expect(toggleStep(on, "row-bd", 2).rows[0]!.velocities[2]).toBe(0);
  });

  it("ignore un pas hors du clip", () => {
    expect(toggleStep(clip, "row-bd", 99).rows[0]).toEqual(clip.rows[0]);
  });
});

describe("setStepVelocity", () => {
  it("borne et arrondit la vélocité", () => {
    expect(setStepVelocity(clip, "row-bd", 0, 0.555).rows[0]!.velocities[0]).toBe(0.56);
    expect(setStepVelocity(clip, "row-bd", 0, 3).rows[0]!.velocities[0]).toBe(1);
    expect(setStepVelocity(clip, "row-bd", 1, 0).rows[0]!.velocities[1]).toBe(0.05);
  });
});

describe("isStepOn", () => {
  it("lit l'état d'un pas", () => {
    expect(isStepOn(clip.rows[0]!, 0)).toBe(true);
    expect(isStepOn(clip.rows[0]!, 1)).toBe(false);
    expect(isStepOn(clip.rows[0]!, 99)).toBe(false);
  });
});

describe("lignes de sons", () => {
  it("ajoute une ligne vide de la longueur du clip", () => {
    const added = addStepRow(setStepsCycles(clip, 2), "oh", makeIds("r"));
    expect(added.rows[1]).toMatchObject({ id: "r-1", sound: "oh", isMuted: false });
    expect(added.rows[1]!.velocities).toHaveLength(32);
  });

  it("supprime une ligne", () => {
    expect(removeStepRow(clip, "row-bd").rows).toEqual([]);
  });

  it("coupe et rétablit une ligne", () => {
    expect(toggleRowMute(clip, "row-bd").rows[0]!.isMuted).toBe(true);
  });

  it("change de kit", () => {
    expect(setKit(clip, "RolandTR808").kit).toBe("RolandTR808");
  });
});

describe("setStepsCycles", () => {
  it("répète le motif pour allonger le clip", () => {
    const longer = setStepsCycles(clip, 2);
    expect(longer.cycles).toBe(2);
    expect(longer.rows[0]!.velocities[16]).toBe(1);
    expect(longer.rows[0]!.velocities[20]).toBe(1);
  });

  it("coupe le motif pour raccourcir le clip", () => {
    const longer = toggleStep(setStepsCycles(clip, 2), "row-bd", 30);
    expect(setStepsCycles(longer, 1).rows[0]!.velocities).toHaveLength(16);
  });
});

describe("groove par pas", () => {
  it("arrondit la probabilité au cran de 5 % et la borne", () => {
    expect(setStepChance(clip, "row-bd", 0, 0.42).rows[0]!.chances[0]).toBe(0.4);
    expect(setStepChance(clip, "row-bd", 0, 0).rows[0]!.chances[0]).toBe(0.05);
    expect(setStepChance(clip, "row-bd", 0, 2).rows[0]!.chances[0]).toBe(1);
  });

  it("borne le ratchet à un nombre entier de coups", () => {
    expect(setStepRatchet(clip, "row-bd", 0, 2.6).rows[0]!.ratchets[0]).toBe(3);
    expect(setStepRatchet(clip, "row-bd", 0, 9).rows[0]!.ratchets[0]).toBe(4);
    expect(setStepRatchet(clip, "row-bd", 0, 0).rows[0]!.ratchets[0]).toBe(1);
  });

  it("remet probabilité et ratchet par défaut quand un pas se rallume", () => {
    const tweaked = setStepRatchet(setStepChance(clip, "row-bd", 0, 0.5), "row-bd", 0, 3);
    const relit = toggleStep(toggleStep(tweaked, "row-bd", 0), "row-bd", 0);
    expect(relit.rows[0]).toMatchObject({ velocities: clip.rows[0]!.velocities });
    expect(relit.rows[0]!.chances[0]).toBe(1);
    expect(relit.rows[0]!.ratchets[0]).toBe(1);
  });

  it("garde probabilité et ratchet quand seule la vélocité change", () => {
    const tweaked = setStepChance(clip, "row-bd", 0, 0.5);
    expect(setStepVelocity(tweaked, "row-bd", 0, 0.7).rows[0]!.chances[0]).toBe(0.5);
  });

  it("répète probabilités et ratchets avec le motif quand le clip s'allonge", () => {
    const tweaked = setStepRatchet(setStepChance(clip, "row-bd", 4, 0.5), "row-bd", 4, 2);
    const longer = setStepsCycles(tweaked, 2).rows[0]!;
    expect(longer.chances).toHaveLength(32);
    expect(longer.chances[20]).toBe(0.5);
    expect(longer.ratchets[20]).toBe(2);
  });
});

describe("setSwing", () => {
  it("borne et arrondit le swing", () => {
    expect(setSwing(clip, 0.333).swing).toBe(0.33);
    expect(setSwing(clip, 2).swing).toBe(0.5);
    expect(setSwing(clip, -1).swing).toBe(0);
  });
});
