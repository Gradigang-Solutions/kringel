import { describe, expect, it } from "vitest";
import { explainCodeError, findUnclosedBracket } from "@/model/codeErrors";

const error = (message: string, line = 1) => ({ line, column: 0, message });

describe("findUnclosedBracket", () => {
  it("trouve la parenthèse jamais refermée", () => {
    const source = 'chord("Cm")\n  .lpf(sine.range(600, 2400).slow(8)\n  .room(0.6)';
    expect(findUnclosedBracket(source)).toEqual({ char: "(", line: 2, column: 6 });
  });

  it("ignore les crochets dans les chaînes et les commentaires", () => {
    expect(findUnclosedBracket('s("[bd sd") // (')).toBeNull();
    expect(findUnclosedBracket("s('a\\'(')")).toBeNull();
  });
});

describe("explainCodeError", () => {
  it("explique une parenthèse non refermée", () => {
    const explanation = explainCodeError('note("c3"\n', error("Unexpected token", 2));
    expect(explanation).toEqual({
      line: 1,
      title: "Line 1 — a parenthesis is never closed",
      detail: "( opens at column 5 but is never closed. Add ) where the call should end.",
    });
  });

  it("explique une chaîne non refermée", () => {
    expect(explainCodeError('s("bd)', error("Unterminated string constant")).title).toBe(
      "Line 1 — a string is never closed",
    );
  });

  it("explique une fonction inconnue", () => {
    expect(explainCodeError("sund()", error("sund is not defined")).title).toBe(
      "Strudel doesn't know sund",
    );
    expect(explainCodeError('s("bd").foo()', error("s(...).foo is not a function")).title).toBe(
      "s(...).foo can't be called here",
    );
  });

  it("garde le message d'origine pour les autres erreurs", () => {
    expect(explainCodeError("1 +", error("Unexpected token", 1))).toEqual({
      line: 1,
      title: "Line 1 — Unexpected token",
      detail: null,
    });
  });
});
