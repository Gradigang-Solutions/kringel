import { evaluate, isPattern, type Pattern } from "@strudel/core";
import { transpiler } from "@strudel/transpiler";
import { ensureScope } from "@/engine/scope";

const NOT_A_PATTERN = 'The code must produce a pattern, like s("bd") or note("c3").';

/** Évalue du code Strudel hors de la lecture, pour obtenir son motif sans le jouer. */
export async function evaluatePattern(source: string): Promise<Pattern> {
  await ensureScope();
  const { pattern } = await evaluate(source, transpiler);
  if (!isPattern(pattern)) throw new Error(NOT_A_PATTERN);
  return pattern;
}
