import type { ClipPattern } from "@/codegen/pattern";

const TRAILING_SEMICOLONS = /;+\s*$/;

/** Lignes non vides d'une source de clip de code, sans point-virgule final. */
export function codePattern(source: string): ClipPattern | null {
  const trimmed = source.trim().replace(TRAILING_SEMICOLONS, "");
  if (trimmed === "") return null;
  const lines = trimmed.split("\n").map((line) => line.trimEnd());
  return { source: lines, calls: [] };
}

/** Vrai si la ligne se termine par un commentaire « // », hors des chaînes de caractères. */
export function endsWithLineComment(line: string): boolean {
  let quoteChar: string | null = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line.charAt(index);
    if (quoteChar !== null) {
      if (char === "\\") index += 1;
      else if (char === quoteChar) quoteChar = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") quoteChar = char;
    else if (char === "/" && line.charAt(index + 1) === "/") return true;
  }
  return false;
}

const CALL_NAME = /([A-Za-z_$][\w$]*)\s*\(/;

/** Première fonction appelée dans la source, pour l'étiquette de la piste (« chord() »). */
export function firstCallName(source: string): string | null {
  const code = source
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  return CALL_NAME.exec(code)?.[1] ?? null;
}
