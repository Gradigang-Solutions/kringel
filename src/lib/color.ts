const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+\s*)?\)$/;

/** Ajoute une transparence à une couleur oklch, pour le canvas et CodeMirror qui ne lisent pas les variables CSS. */
export function withAlpha(color: string, alpha: number): string {
  const match = OKLCH_PATTERN.exec(color.trim());
  if (!match) {
    throw new Error(`Couleur oklch attendue, reçu : ${color}`);
  }
  const [, lightness, chroma, hue] = match;
  return `oklch(${lightness ?? ""} ${chroma ?? ""} ${hue ?? ""} / ${alpha})`;
}
