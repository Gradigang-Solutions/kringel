import { describe, expect, it } from "vitest";
import type { CodeLineInfo } from "@/codegen/generate";
import { clipControl, mixerControl } from "@/codegen/controls";
import { clipLineRange, controlAtLine, lineStyles } from "@/ui/code/lineStyles";

const plain: CodeLineInfo = { trackId: null, clipId: null, status: null, control: null };
const drums = (
  status: CodeLineInfo["status"],
  control: CodeLineInfo["control"] = null,
): CodeLineInfo => ({ trackId: "t1", clipId: "c1", status, control });
const colors = new Map([["t1", "oklch(0.78 0.14 65)"]]);

describe("lineStyles", () => {
  it("colore les lignes d'une piste et surligne le clip sélectionné", () => {
    const styles = lineStyles([plain, drums("playing"), drums("playing")], "c1", colors, null);
    expect(styles).toEqual([
      {
        line: 2,
        trackColor: "oklch(0.78 0.14 65)",
        isSelected: true,
        isDimmed: false,
        isHighlighted: false,
        tag: null,
      },
      {
        line: 3,
        trackColor: "oklch(0.78 0.14 65)",
        isSelected: true,
        isDimmed: false,
        isHighlighted: false,
        tag: null,
      },
    ]);
  });

  it("atténue un clip en attente et étiquette sa première ligne", () => {
    const styles = lineStyles([drums("queued"), drums("queued")], null, colors, null);
    expect(styles[0]).toMatchObject({ isDimmed: true, tag: { text: "NEXT CYCLE", tone: "track" } });
    expect(styles[1]!.tag).toBeNull();
  });

  it("étiquette un clip de code en erreur", () => {
    expect(lineStyles([drums("error")], null, colors, null)[0]!.tag).toEqual({
      text: "ERROR · LAST VALID",
      tone: "error",
    });
  });
});

describe("mise en évidence d'un contrôle", () => {
  it("met en évidence la ligne écrite par le contrôle survolé, sur sa piste seulement", () => {
    const room = mixerControl("room");
    const lines = [drums("playing"), drums("playing", room), drums("playing", mixerControl("pan"))];
    const highlighted = lineStyles(lines, null, colors, { trackId: "t1", controls: [room] });
    expect(highlighted.map((style) => style.isHighlighted)).toEqual([false, true, false]);
    const otherTrack = lineStyles(lines, null, colors, { trackId: "t2", controls: [room] });
    expect(otherTrack.some((style) => style.isHighlighted)).toBe(false);
  });

  it("met en évidence toutes les lignes d'un panneau survolé", () => {
    const lines = [drums("playing", mixerControl("hpf")), drums("playing", mixerControl("delay"))];
    const panel = { trackId: "t1", controls: [mixerControl("hpf"), mixerControl("delay")] };
    expect(lineStyles(lines, null, colors, panel).every((style) => style.isHighlighted)).toBe(true);
  });
});

describe("controlAtLine", () => {
  it("donne la piste et le contrôle d'une ligne, ou null", () => {
    const lines = [plain, drums("playing", clipControl("kit"))];
    expect(controlAtLine(lines, 1)).toEqual({ trackId: "t1", controls: [clipControl("kit")] });
    expect(controlAtLine(lines, 0)).toBeNull();
    expect(controlAtLine(lines, 9)).toBeNull();
  });
});

describe("clipLineRange", () => {
  it("donne la première et la dernière ligne du clip", () => {
    expect(clipLineRange([plain, drums("playing"), drums("playing"), plain], "c1")).toEqual([2, 3]);
    expect(clipLineRange([plain], "c1")).toBeNull();
    expect(clipLineRange([plain], null)).toBeNull();
  });
});
