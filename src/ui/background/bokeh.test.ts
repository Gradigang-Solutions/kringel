import { describe, expect, it } from "vitest";
import { makeRandom, makeSoundEvent } from "@/test/builders";
import {
  advanceScene,
  EMPTY_SCENE,
  haloLook,
  MAX_HALOS,
  MIN_AUDIBLE_POWER,
  smoothBands,
  spawnHalo,
  type Halo,
} from "@/ui/background/bokeh";

const SILENCE = { low: 0, mid: 0, high: 0 };
const random = makeRandom();

function spawn(overrides: Parameters<typeof makeSoundEvent>[0]): Halo {
  const halo = spawnHalo(makeSoundEvent(overrides), random);
  if (halo === null) throw new Error("halo attendu");
  return halo;
}

describe("spawnHalo", () => {
  it("ne lance rien pour un son inaudible", () => {
    expect(spawnHalo(makeSoundEvent({ power: MIN_AUDIBLE_POWER / 2 }), random)).toBeNull();
  });

  it("fait un grand halo en bas pour un kick et une petite étincelle en haut pour un charley", () => {
    const kick = spawn({ sound: "bd" });
    const hat = spawn({ sound: "hh" });
    expect(kick.radius).toBeGreaterThan(hat.radius * 3);
    expect(kick.y).toBeGreaterThan(hat.y);
    expect(kick.lifetime).toBeGreaterThan(hat.lifetime);
  });

  it("grossit et éclaire davantage un son plus fort", () => {
    const soft = spawn({ sound: "sd", power: 0.3 });
    const loud = spawn({ sound: "sd", power: 1 });
    expect(loud.radius).toBeGreaterThan(soft.radius);
    expect(loud.intensity).toBeGreaterThan(soft.intensity);
  });

  it("plafonne l'éclat d'un son saturé", () => {
    expect(spawn({ power: 3 }).intensity).toBe(1);
  });

  it("place une note aiguë plus haut qu'une note grave", () => {
    const low = spawn({ sound: "triangle", midi: 52 });
    const high = spawn({ sound: "triangle", midi: 84 });
    expect(high.y).toBeLessThan(low.y);
  });

  it("garde le halo d'une note tenue plus longtemps", () => {
    const short = spawn({ sound: "piano", midi: 60, duration: 0.1 });
    const held = spawn({ sound: "piano", midi: 60, duration: 2 });
    expect(held.lifetime).toBeGreaterThan(short.lifetime);
  });
});

describe("advanceScene", () => {
  it("lance un halo par son entendu", () => {
    const events = [makeSoundEvent({ sound: "bd" }), makeSoundEvent({ sound: "hh" })];
    const scene = advanceScene(EMPTY_SCENE, events, SILENCE, 0, random);
    expect(scene.halos.map((halo) => halo.family)).toEqual(["low", "high"]);
  });

  it("fait vieillir et monter les halos, puis retire ceux qui sont éteints", () => {
    const started = advanceScene(EMPTY_SCENE, [makeSoundEvent()], SILENCE, 0, random);
    const [halo] = started.halos;
    if (halo === undefined) throw new Error("halo attendu");
    const later = advanceScene(started, [], SILENCE, halo.lifetime / 2, random);
    expect(later.halos[0]?.age).toBe(halo.lifetime / 2);
    expect(later.halos[0]?.y).toBeLessThan(halo.y);
    expect(advanceScene(later, [], SILENCE, halo.lifetime, random).halos).toEqual([]);
  });

  it("ne garde que les halos les plus récents au-delà du plafond", () => {
    const events = Array.from({ length: MAX_HALOS + 5 }, (_, index) =>
      makeSoundEvent({ power: 0.5 + index / (2 * (MAX_HALOS + 5)) }),
    );
    const scene = advanceScene(EMPTY_SCENE, events, SILENCE, 0, random);
    expect(scene.halos).toHaveLength(MAX_HALOS);
    expect(scene.halos.at(-1)?.intensity).toBe(events.at(-1)?.power);
  });
});

describe("smoothBands", () => {
  it("suit une montée plus vite qu'une retombée", () => {
    const step = 0.05;
    const rising = smoothBands(SILENCE, { low: 1, mid: 1, high: 1 }, step);
    const falling = smoothBands({ low: 1, mid: 1, high: 1 }, SILENCE, step);
    expect(rising.low).toBeGreaterThan(1 - falling.low);
  });

  it("ne bouge pas sans temps écoulé", () => {
    expect(smoothBands(SILENCE, { low: 1, mid: 0.5, high: 0.2 }, 0)).toEqual(SILENCE);
  });
});

describe("haloLook", () => {
  const halo = spawn({ sound: "bd", power: 0.8 });

  it("part de zéro, s'allume vite puis s'éteint en s'étalant", () => {
    const at = (age: number) => haloLook({ ...halo, age });
    expect(at(0).alpha).toBe(0);
    expect(at(0.04).alpha).toBeGreaterThan(at(halo.lifetime / 2).alpha);
    expect(at(halo.lifetime).alpha).toBe(0);
    expect(at(halo.lifetime).scale).toBeGreaterThan(at(0).scale);
  });

  it("ne dépasse jamais la puissance du son", () => {
    expect(haloLook({ ...halo, age: 0.04 }).alpha).toBeLessThanOrEqual(halo.intensity);
  });
});
