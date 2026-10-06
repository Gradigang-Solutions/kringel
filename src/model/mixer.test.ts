import { describe, expect, it } from "vitest";
import {
  formatDecibels,
  gainToDecibels,
  lpfLabel,
  lpfToPosition,
  panLabel,
  positionToLpf,
  setLpf,
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
  });
});

describe("setLpf", () => {
  it("arrondit à deux chiffres significatifs, et null désactive le filtre", () => {
    expect(mixerOf(setLpf(project, trackId, 812.3)).lpf).toBe(810);
    expect(mixerOf(setLpf(project, trackId, 5)).lpf).toBe(20);
    expect(mixerOf(setLpf(project, trackId, null)).lpf).toBeNull();
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
    expect(lpfToPosition(null)).toBe(1);
    expect(lpfToPosition(20)).toBe(0);
    expect(positionToLpf(1)).toBeNull();
    expect(positionToLpf(0)).toBe(20);
    expect(positionToLpf(lpfToPosition(800))).toBeCloseTo(800);
  });
});

describe("libellés", () => {
  it("affiche le panoramique comme dans une console", () => {
    expect(panLabel(0.5)).toBe("C");
    expect(panLabel(0.6)).toBe("R20");
    expect(panLabel(0.3)).toBe("L40");
  });

  it("affiche le filtre et les décibels", () => {
    expect(lpfLabel(null)).toBe("Off");
    expect(lpfLabel(800)).toBe("800 Hz");
    expect(formatDecibels(gainToDecibels(1))).toBe("0.0");
    expect(formatDecibels(gainToDecibels(0))).toBe("-∞");
  });
});
