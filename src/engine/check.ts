import { evaluate, isPattern, type Pattern } from "@strudel/core";
import { transpiler } from "@strudel/transpiler";
import { hapPitch } from "@/engine/pitch";
import { ensureScope } from "@/engine/scope";
import type { PreviewNote } from "@/engine/types";
import type { CodeError } from "@/model/playback";

const LOCATION_SUFFIX = /\s*\(\d+:\d+\)$/;
const NOT_A_PATTERN = 'The code must produce a pattern, like s("bd") or note("c3").';

function readLocation(error: unknown): { line: number; column: number } {
  if (typeof error === "object" && error !== null && "loc" in error) {
    const { loc } = error;
    if (typeof loc === "object" && loc !== null && "line" in loc && "column" in loc) {
      return { line: Number(loc.line), column: Number(loc.column) };
    }
  }
  return { line: 1, column: 0 };
}

function toCodeError(error: unknown): CodeError {
  const message = error instanceof Error ? error.message : String(error);
  return { ...readLocation(error), message: message.replace(LOCATION_SUFFIX, "") };
}

async function evaluatePattern(source: string): Promise<Pattern> {
  await ensureScope();
  const { pattern } = await evaluate(source, transpiler);
  if (!isPattern(pattern)) throw new Error(NOT_A_PATTERN);
  return pattern;
}

/** Vérifie la source d'un clip de code : syntaxe, évaluation, puis interrogation d'un cycle. */
export async function checkSource(source: string): Promise<CodeError | null> {
  if (source.trim() === "") return null;
  try {
    transpiler(source);
    const pattern = await evaluatePattern(source);
    pattern.queryArc(0, 1);
    return null;
  } catch (error) {
    return toCodeError(error);
  }
}

/** Notes produites par la source sur les premiers cycles ; null si la source est invalide. */
export async function previewNotes(source: string, cycles: number): Promise<PreviewNote[] | null> {
  if (source.trim() === "") return [];
  try {
    const pattern = await evaluatePattern(source);
    return pattern.queryArc(0, cycles).flatMap((hap) => {
      const pitch = hapPitch(hap.value);
      if (pitch === null || !hap.hasOnset() || hap.whole === undefined) return [];
      return [{ begin: hap.whole.begin.valueOf(), end: hap.whole.end.valueOf(), pitch }];
    });
  } catch {
    // L'aperçu garde alors la dernière version valide, affichée par l'interface.
    return null;
  }
}
