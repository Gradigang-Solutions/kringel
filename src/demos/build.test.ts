import { describe, expect, it } from "vitest";
import { demoIds, demoProject, parseStepGrid, stepsClip } from "@/demos/build";
import { MIXER_DEFAULTS, TRACK_COLORS, TRACK_COUNT_RANGE, TRACK_PRESETS } from "@/model/constants";

describe("parseStepGrid", () => {
  it("lit coups, nuances, ratchets et silences en ignorant les espaces", () => {
    expect(parseStepGrid("x+o? 2.34", 8)).toEqual([
      { velocity: 1, chance: 1, ratchet: 1 },
      { velocity: 0.65, chance: 1, ratchet: 1 },
      { velocity: 0.35, chance: 1, ratchet: 1 },
      { velocity: 0.35, chance: 0.5, ratchet: 1 },
      { velocity: 1, chance: 1, ratchet: 2 },
      { velocity: 0, chance: 1, ratchet: 1 },
      { velocity: 1, chance: 1, ratchet: 3 },
      { velocity: 1, chance: 1, ratchet: 4 },
    ]);
  });

  it("refuse un caractère inconnu", () => {
    expect(() => parseStepGrid("x.y.", 4)).toThrow('Unknown step "y"');
  });

  it("refuse une grille qui n'a pas la longueur du clip", () => {
    expect(() => parseStepGrid("x...", 16)).toThrow("4 steps instead of 16");
  });
});

describe("stepsClip", () => {
  it("construit une ligne à partir d'une grille texte", () => {
    const clip = stepsClip(demoIds("t"), "Hats", "RolandTR909", { hh: "x..? ..2. .... ...." });
    const [row] = clip.rows;
    expect(row?.velocities.slice(0, 7)).toEqual([1, 0, 0, 0.35, 0, 0, 1]);
    expect(row?.chances[3]).toBe(0.5);
    expect(row?.ratchets[6]).toBe(2);
  });

  it("garde la liste de pas allumés avec une vélocité par son", () => {
    const clip = stepsClip(
      demoIds("t"),
      "Kick",
      "RolandTR909",
      { bd: [0, 8] },
      {
        velocities: { bd: 0.5 },
      },
    );
    expect(clip.rows[0]?.velocities.filter((velocity) => velocity > 0)).toEqual([0.5, 0.5]);
  });
});

describe("demoProject", () => {
  it("reprend les préréglages pour les pistes sans nom", () => {
    const project = demoProject(demoIds("t"), "Demo", 120, [{ clips: [] }, { clips: [] }]);
    expect(project.tracks.map((track) => track.name)).toEqual([
      TRACK_PRESETS[0].name,
      TRACK_PRESETS[1].name,
    ]);
  });

  it("accepte jusqu'à huit pistes nommées, chacune dans sa couleur", () => {
    const nextId = demoIds("t");
    const kick = stepsClip(nextId, "Kick", "RolandTR909", { bd: [0] });
    const tracks = TRACK_COLORS.map((_, index) => ({
      name: `Track ${index + 1}`,
      clips: [kick],
      mixer: { gain: 0.5 },
    }));
    const project = demoProject(nextId, "Demo", 120, tracks);
    expect(project.tracks).toHaveLength(TRACK_COUNT_RANGE.max);
    expect(project.tracks.map((track) => track.color)).toEqual([...TRACK_COLORS]);
    expect(project.tracks[5]).toMatchObject({
      name: "Track 6",
      defaultClipKind: "steps",
      mixer: { ...MIXER_DEFAULTS, gain: 0.5 },
    });
  });

  it("refuse plus de pistes que le maximum", () => {
    const tracks = Array.from({ length: TRACK_COUNT_RANGE.max + 1 }, () => ({ clips: [] }));
    expect(() => demoProject(demoIds("t"), "Demo", 120, tracks)).toThrow();
  });
});
