import { describe, expect, it } from "vitest";
import type { CodeLineInfo } from "@/codegen/generate";
import { clipLineRange, lineStyles } from "@/ui/code/lineStyles";

const plain: CodeLineInfo = { trackId: null, clipId: null, status: null };
const drums = (status: CodeLineInfo["status"]): CodeLineInfo => ({
  trackId: "t1",
  clipId: "c1",
  status,
});
const colors = new Map([["t1", "oklch(0.78 0.14 65)"]]);

describe("lineStyles", () => {
  it("colore les lignes d'une piste et surligne le clip sélectionné", () => {
    const styles = lineStyles([plain, drums("playing"), drums("playing")], "c1", colors);
    expect(styles).toEqual([
      { line: 2, trackColor: "oklch(0.78 0.14 65)", isSelected: true, isDimmed: false, tag: null },
      { line: 3, trackColor: "oklch(0.78 0.14 65)", isSelected: true, isDimmed: false, tag: null },
    ]);
  });

  it("atténue un clip en attente et étiquette sa première ligne", () => {
    const styles = lineStyles([drums("queued"), drums("queued")], null, colors);
    expect(styles[0]).toMatchObject({ isDimmed: true, tag: { text: "NEXT CYCLE", tone: "track" } });
    expect(styles[1]!.tag).toBeNull();
  });

  it("étiquette un clip de code en erreur", () => {
    expect(lineStyles([drums("error")], null, colors)[0]!.tag).toEqual({
      text: "ERROR · LAST VALID",
      tone: "error",
    });
  });
});

describe("clipLineRange", () => {
  it("donne la première et la dernière ligne du clip", () => {
    expect(clipLineRange([plain, drums("playing"), drums("playing"), plain], "c1")).toEqual([2, 3]);
    expect(clipLineRange([plain], "c1")).toBeNull();
    expect(clipLineRange([plain], null)).toBeNull();
  });
});
