import { describe, expect, it } from "vitest";
import { codePattern, endsWithLineComment, firstCallName } from "@/codegen/code";

describe("codePattern", () => {
  it("retire les espaces et le point-virgule final", () => {
    expect(codePattern('  s("bd");  \n')).toEqual({ source: ['s("bd")'], calls: [] });
  });

  it("ignore une source vide", () => {
    expect(codePattern("   ")).toBeNull();
  });
});

describe("endsWithLineComment", () => {
  it("repère un commentaire de fin de ligne", () => {
    expect(endsWithLineComment('s("bd") // kick')).toBe(true);
  });

  it("ignore « // » dans une chaîne", () => {
    expect(endsWithLineComment('s("http://x")')).toBe(false);
    expect(endsWithLineComment("s('a\\'//')")).toBe(false);
  });
});

describe("firstCallName", () => {
  it("trouve la première fonction appelée hors commentaires", () => {
    expect(firstCallName('// note("c")\nchord("Cm")')).toBe("chord");
    expect(firstCallName("42")).toBeNull();
  });
});
