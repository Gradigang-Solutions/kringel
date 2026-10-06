export type TokenKind = "comment" | "string" | "number" | "call" | "punctuation" | "plain";

export interface CodeToken {
  readonly text: string;
  readonly kind: TokenKind;
}

/** Même découpage que la maquette : commentaires, chaînes, nombres, appels, ponctuation. */
const TOKEN_PATTERN =
  /(\/\/.*$)|("[^"]*"?|'[^']*'?|`[^`]*`?)|(-?\d*\.?\d+)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$"'`\d]+)/g;

function kindOf(match: RegExpExecArray): TokenKind {
  if (match[1] !== undefined) return "comment";
  if (match[2] !== undefined) return "string";
  if (match[3] !== undefined) return "number";
  if (match[4] !== undefined) return "call";
  if (match[7] !== undefined) return "punctuation";
  return "plain";
}

/** Découpe une ligne de code Strudel pour la colorer. */
export function tokenizeLine(line: string): CodeToken[] {
  return [...line.matchAll(TOKEN_PATTERN)].map((match) => ({
    text: match[0],
    kind: kindOf(match),
  }));
}
