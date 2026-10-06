import { describe, expect, it } from "vitest";
import { tokenizeLine } from "@/ui/shared/tokenize";

describe("tokenizeLine", () => {
  it("distingue appels, chaînes, nombres et ponctuation", () => {
    expect(tokenizeLine('s("bd*4").gain(0.8)')).toEqual([
      { text: "s", kind: "call" },
      { text: "(", kind: "punctuation" },
      { text: '"bd*4"', kind: "string" },
      { text: ").", kind: "punctuation" },
      { text: "gain", kind: "call" },
      { text: "(", kind: "punctuation" },
      { text: "0.8", kind: "number" },
      { text: ")", kind: "punctuation" },
    ]);
  });

  it("reconnaît un commentaire jusqu'à la fin de la ligne", () => {
    expect(tokenizeLine("  // Drums · Kick")).toEqual([
      { text: "  ", kind: "plain" },
      { text: "// Drums · Kick", kind: "comment" },
    ]);
  });

  it("garde le texte intact", () => {
    const line = "setcpm(124/4) stack( x";
    expect(
      tokenizeLine(line)
        .map((token) => token.text)
        .join(""),
    ).toBe(line);
  });
});
