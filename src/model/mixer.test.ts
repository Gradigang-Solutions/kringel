import { describe, expect, it } from "vitest";
import {
  formatDecibels,
  gainToDecibels,
  filterLabel,
  filterToPosition,
  panLabel,
  positionToFilter,
  setFilter,
  setMixerParam,
  toggleMute,
  toggleSolo,
} from "@/model/mixer";
import { makeProject, trackIdAt } from "@/test/builders";

const project = makeProject();
const trackId = trackIdAt(project, 0);
const mixerOf = (updated: typeof project) => updated.tracks[0]!.mixer;

describe("setMixerParam", () => {
  it("borne et arrondit les valeurs", () => {
    expect(mixerOf(setMixerParam(project, trackId, "gain", 0.8123)).gain).toBe(0.81);
    expect(mixerOf(setMixerParam(project, trackId, "gain", 3)).gain).toBe(1.25);
    expect(mixerOf(setMixerParam(project, trackId, "pan", -1)).pan).toBe(0);
    expect(mixerOf(setMixerParam(project, trackId, "room", 2)).room).toBe(1);
    expect(mixerOf(setMixerParam(project, trackId, "delay", 0.333)).delay).toBe(0.33);
    expect(mixerOf(setMixerParam(project, trackId, "distort", 9)).distort).toBe(5);
  });
});

describe("setFilter", () => {
  it("arrondit à deux chiffres significatifs, et null désactive le filtre", () => {
    expect(mixerOf(setFilter(project, trackId, "lpf", 812.3)).lpf).toBe(810);
    expect(mixerOf(setFilter(project, trackId, "lpf", 5)).lpf).toBe(20);
    expect(mixerOf(setFilter(project, trackId, "lpf", null)).lpf).toBeNull();
    expect(mixerOf(setFilter(project, trackId, "hpf", 312)).hpf).toBe(310);
  });
});

describe("mute et solo", () => {
  it("bascule mute et solo", () => {
    expect(mixerOf(toggleMute(project, trackId)).isMuted).toBe(true);
    expect(mixerOf(toggleSolo(project, trackId)).isSoloed).toBe(true);
  });
});

describe("curseur de filtre", () => {
  it("convertit dans les deux sens en échelle logarithmique", () => {
    expect(filterToPosition("lpf", null)).toBe(1);
    expect(filterToPosition("lpf", 20)).toBe(0);
    expect(positionToFilter("lpf", 1)).toBeNull();
    expect(positionToFilter("lpf", 0)).toBe(20);
    expect(positionToFilter("lpf", filterToPosition("lpf", 800))).toBeCloseTo(800);
  });

  it("ouvre le passe-haut en bas de sa course", () => {
    expect(filterToPosition("hpf", null)).toBe(0);
    expect(positionToFilter("hpf", 0)).toBeNull();
    expect(positionToFilter("hpf", 1)).toBe(20000);
  });

  it("quitte la butée dès le premier cran de curseur", () => {
    expect(positionToFilter("lpf", 0.99)).not.toBeNull();
    expect(positionToFilter("hpf", 0.01)).not.toBeNull();
  });
});

describe("libellés", () => {
  it("affiche le panoramique comme dans une console", () => {
    expect(panLabel(0.5)).toBe("C");
    expect(panLabel(0.6)).toBe("R20");
    expect(panLabel(0.3)).toBe("L40");
  });

  it("affiche le filtre et les décibels", () => {
    expect(filterLabel(null)).toBe("Off");
    expect(filterLabel(800)).toBe("800 Hz");
    expect(formatDecibels(gainToDecibels(1))).toBe("0.0");
    expect(formatDecibels(gainToDecibels(0))).toBe("-∞");
  });
});
