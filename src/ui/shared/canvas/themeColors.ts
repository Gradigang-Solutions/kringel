/**
 * Le canvas ne lit pas les variables CSS : on lit une fois les tokens de theme.css,
 * pour ne pas recopier les valeurs des couleurs.
 */
const TOKENS = {
  fg1: "--color-fg-1",
  fg2: "--color-fg-2",
  fg3: "--color-fg-3",
  fgInverse: "--color-fg-inverse",
  fgOnTrack: "--color-fg-on-track",
  black: "--color-gray-115",
  surfaceDark: "--color-gray-155",
  surfaceOutScale: "--color-gray-165",
  surfaceRow: "--color-gray-175",
  cellOff: "--color-gray-205",
  cellOffAlt: "--color-gray-225",
  inScaleRow: "--color-gray-215",
  lineSubtle: "--color-gray-280",
  lineStrong: "--color-gray-330",
  lineBar: "--color-gray-520",
  keyOutScale: "--color-gray-400",
  keyWhite: "--color-gray-860",
  keyLabel: "--color-gray-235",
  error: "--color-error",
  bokehLow: "--color-bokeh-low",
  bokehMid: "--color-bokeh-mid",
  bokehHigh: "--color-bokeh-high",
  bokehTonal: "--color-bokeh-tonal",
} as const;

export type ThemeToken = keyof typeof TOKENS;

const cache = new Map<ThemeToken, string>();

/** Couleur d'un token de theme.css, lue une fois puis gardée en cache. */
export function themeColor(token: ThemeToken): string {
  const cached = cache.get(token);
  if (cached !== undefined) return cached;
  const value = getComputedStyle(document.documentElement).getPropertyValue(TOKENS[token]).trim();
  cache.set(token, value);
  return value;
}

export const MONO_FONT = "Geist Mono Variable, ui-monospace, monospace";
