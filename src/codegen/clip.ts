import { codePattern, firstCallName } from "@/codegen/code";
import { notesPattern, usesScaleDegrees } from "@/codegen/notes";
import { patternLines, type ClipPattern } from "@/codegen/pattern";
import { stepsPattern } from "@/codegen/steps";
import { assertNever } from "@/lib/assertNever";
import type { Clip } from "@/model/types";

/** Motif d'un clip ; pour un clip de code, la source à utiliser est fournie (dernière version valide). */
export function clipPattern(clip: Clip, codeSource: string): ClipPattern | null {
  switch (clip.kind) {
    case "steps":
      return stepsPattern(clip);
    case "notes":
      return notesPattern(clip);
    case "code":
      return codePattern(codeSource);
    default:
      return assertNever(clip);
  }
}

/** Code d'un clip seul, pour le convertir en clip de code. */
export function clipToCodeSource(clip: Clip): string {
  const pattern = clipPattern(clip, clip.kind === "code" ? clip.source : "");
  return pattern ? patternLines(pattern).join("\n") : "";
}

/** Fonction principale écrite par le clip, affichée dans l'en-tête de piste : « s() », « n() »… */
export function clipRootCall(clip: Clip): string {
  switch (clip.kind) {
    case "steps":
      return "s()";
    case "notes":
      return usesScaleDegrees(clip) ? "n()" : "note()";
    case "code": {
      const name = firstCallName(clip.source);
      return name === null ? "code" : `${name}()`;
    }
    default:
      return assertNever(clip);
  }
}
