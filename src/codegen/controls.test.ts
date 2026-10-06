import { describe, expect, it } from "vitest";
import {
  clipControl,
  isSameControl,
  isSameTrackControls,
  mixerControl,
  sharesControl,
} from "@/codegen/controls";

describe("isSameControl", () => {
  it("compare la nature et le réglage", () => {
    expect(isSameControl(mixerControl("lpf"), mixerControl("lpf"))).toBe(true);
    expect(isSameControl(mixerControl("lpf"), clipControl("lpf"))).toBe(false);
    expect(isSameControl(clipControl("kit"), clipControl("swing"))).toBe(false);
  });
});

describe("sharesControl", () => {
  const fx = { trackId: "t1", controls: [mixerControl("hpf"), mixerControl("delay")] };

  it("reconnaît un contrôle commun sur la même piste", () => {
    expect(sharesControl(fx, "t1", [mixerControl("delay")])).toBe(true);
    expect(sharesControl(fx, "t1", [mixerControl("room")])).toBe(false);
    expect(sharesControl(fx, "t2", [mixerControl("delay")])).toBe(false);
  });
});

describe("isSameTrackControls", () => {
  it("compare piste et contrôles, null compris", () => {
    const room = { trackId: "t1", controls: [mixerControl("room")] };
    expect(isSameTrackControls(room, { trackId: "t1", controls: [mixerControl("room")] })).toBe(
      true,
    );
    expect(isSameTrackControls(room, { trackId: "t2", controls: [mixerControl("room")] })).toBe(
      false,
    );
    expect(isSameTrackControls(room, null)).toBe(false);
    expect(isSameTrackControls(null, null)).toBe(true);
  });
});
