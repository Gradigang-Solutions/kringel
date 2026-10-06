import { describe, expect, it } from "vitest";
import { formatElapsed } from "@/ui/transport/recordingTime";

describe("formatElapsed", () => {
  it("écrit minutes et secondes, sans valeur négative", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(9_999)).toBe("0:09");
    expect(formatElapsed(125_000)).toBe("2:05");
    expect(formatElapsed(-50)).toBe("0:00");
  });
});
