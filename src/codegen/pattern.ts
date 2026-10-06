/**
 * Code d'un clip avant mise en page : l'expression source (une ou plusieurs lignes)
 * et les appels chaînés, un par ligne.
 */
export interface ClipPattern {
  readonly source: readonly string[];
  readonly calls: readonly string[];
}

export const CHAIN_INDENT = "  ";

/** Mise en page d'un motif seul, sans indentation de bloc. */
export function patternLines(pattern: ClipPattern): string[] {
  return [...pattern.source, ...pattern.calls.map((methodCall) => `${CHAIN_INDENT}${methodCall}`)];
}
