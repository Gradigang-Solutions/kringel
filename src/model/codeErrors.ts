import type { CodeError } from "@/model/playback";

export interface ErrorExplanation {
  readonly line: number;
  readonly title: string;
  readonly detail: string | null;
}

interface Opener {
  readonly char: string;
  readonly line: number;
  readonly column: number;
}

const CLOSERS: Readonly<Record<string, string>> = { "(": ")", "[": "]", "{": "}" };
const BRACKET_NAMES: Readonly<Record<string, string>> = {
  "(": "a parenthesis",
  "[": "a square bracket",
  "{": "a curly brace",
};
const QUOTES = new Set(['"', "'", "`"]);
const NOT_DEFINED = /^(\w+) is not defined$/;
const NOT_A_FUNCTION = /^(.+) is not a function$/;
const UNTERMINATED_STRING = /^Unterminated (string|template)/;

/** Premier crochet ouvert jamais refermé, en ignorant les chaînes et les commentaires. */
export function findUnclosedBracket(source: string): Opener | null {
  const openers: Opener[] = [];
  const lines = source.split("\n");
  for (const [lineIndex, line] of lines.entries()) {
    let quote: string | null = null;
    for (let column = 0; column < line.length; column += 1) {
      const char = line.charAt(column);
      if (quote !== null) {
        if (char === "\\") column += 1;
        else if (char === quote) quote = null;
        continue;
      }
      if (char === "/" && line.charAt(column + 1) === "/") break;
      if (QUOTES.has(char)) quote = char;
      else if (char in CLOSERS) openers.push({ char, line: lineIndex + 1, column });
      else if (Object.values(CLOSERS).includes(char)) openers.pop();
    }
  }
  return openers[0] ?? null;
}

function bracketExplanation(opener: Opener): ErrorExplanation {
  const name = BRACKET_NAMES[opener.char] ?? "a bracket";
  const closer = CLOSERS[opener.char] ?? ")";
  return {
    line: opener.line,
    title: `Line ${opener.line} — ${name} is never closed`,
    detail: `${opener.char} opens at column ${opener.column + 1} but is never closed. Add ${closer} where the call should end.`,
  };
}

/** Reformule les erreurs les plus courantes en langage simple ; sinon garde le message d'origine. */
export function explainCodeError(source: string, error: CodeError): ErrorExplanation {
  const line = error.line;
  if (UNTERMINATED_STRING.test(error.message)) {
    return {
      line,
      title: `Line ${line} — a string is never closed`,
      detail: 'Add the missing closing quote ".',
    };
  }
  const opener = findUnclosedBracket(source);
  if (opener) return bracketExplanation(opener);
  const undefinedName = NOT_DEFINED.exec(error.message)?.[1];
  if (undefinedName) {
    return {
      line,
      title: `Strudel doesn't know ${undefinedName}`,
      detail: "Check the spelling, or look the function up on strudel.cc.",
    };
  }
  const notCallable = NOT_A_FUNCTION.exec(error.message)?.[1];
  if (notCallable) {
    return {
      line,
      title: `${notCallable} can't be called here`,
      detail: "Check the spelling and the dot before it.",
    };
  }
  return { line, title: `Line ${line} — ${error.message}`, detail: null };
}
