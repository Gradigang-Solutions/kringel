import type { CodeLineInfo } from "@/codegen/generate";

export interface LineTag {
  readonly text: string;
  readonly tone: "track" | "error";
}

export interface LineStyle {
  /** Numéro de ligne, à partir de 1. */
  readonly line: number;
  readonly trackColor: string;
  readonly isSelected: boolean;
  readonly isDimmed: boolean;
  readonly tag: LineTag | null;
}

const QUEUED_TAG: LineTag = { text: "NEXT CYCLE", tone: "track" };
const ERROR_TAG: LineTag = { text: "ERROR · LAST VALID", tone: "error" };

/** Apparence de chaque ligne du code généré : couleur de piste, surlignage, atténuation, étiquette. */
export function lineStyles(
  lines: readonly CodeLineInfo[],
  selectedClipId: string | null,
  colorsByTrack: ReadonlyMap<string, string>,
): LineStyle[] {
  return lines.flatMap((info, index) => {
    const color = info.trackId === null ? undefined : colorsByTrack.get(info.trackId);
    if (color === undefined) return [];
    const isBlockStart = lines[index - 1]?.clipId !== info.clipId;
    const tag = info.status === "queued" ? QUEUED_TAG : info.status === "error" ? ERROR_TAG : null;
    return [
      {
        line: index + 1,
        trackColor: color,
        isSelected: info.clipId !== null && info.clipId === selectedClipId,
        isDimmed: info.status === "queued",
        tag: isBlockStart ? tag : null,
      },
    ];
  });
}

/** Lignes occupées par un clip dans le code, ou null s'il n'y figure pas. */
export function clipLineRange(
  lines: readonly CodeLineInfo[],
  clipId: string | null,
): readonly [number, number] | null {
  if (clipId === null) return null;
  const first = lines.findIndex((line) => line.clipId === clipId);
  if (first === -1) return null;
  const last = lines.findLastIndex((line) => line.clipId === clipId);
  return [first + 1, last + 1];
}
