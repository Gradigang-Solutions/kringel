import type { ClipSetting, PatternCall } from "@/codegen/controls";

/**
 * Code d'un clip avant mise en page : l'expression source (une ou plusieurs lignes)
 * et les appels chaînés, un par ligne.
 */
export interface ClipPattern {
  readonly source: readonly string[];
  readonly calls: readonly PatternCall[];
}

export const CHAIN_INDENT = "  ";

/** Mise en page d'un motif seul, sans indentation de bloc. */
export function patternLines(pattern: ClipPattern): string[] {
  return [
    ...pattern.source,
    ...pattern.calls.map((methodCall) => `${CHAIN_INDENT}${methodCall.code}`),
  ];
}

/** Appel écrit par un réglage du clip. */
export function settingCall(code: string, setting: ClipSetting | null): PatternCall {
  return { code, setting };
}

/** Appel facultatif : rien quand le réglage garde sa valeur par défaut. */
export function optionalCall(code: string | null, setting: ClipSetting | null): PatternCall[] {
  return code === null ? [] : [settingCall(code, setting)];
}
