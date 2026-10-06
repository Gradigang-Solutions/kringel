import { describe, expect, it } from "vitest";
import { uniqueName } from "@/lib/names";

describe("uniqueName", () => {
  it("garde le nom s'il est libre", () => {
    expect(uniqueName("Synth", ["Drums"])).toBe("Synth");
  });

  it("ajoute le premier numéro libre", () => {
    expect(uniqueName("Synth", ["Synth"])).toBe("Synth 2");
    expect(uniqueName("Synth", ["Synth", "Synth 2", "Synth 4"])).toBe("Synth 3");
  });
});
