/** Le nom tel quel s'il est libre, sinon suivi du premier numéro libre : « Synth 2 », « Synth 3 »… */
export function uniqueName(base: string, taken: readonly string[]): string {
  if (!taken.includes(base)) return base;
  let suffix = 2;
  while (taken.includes(`${base} ${suffix}`)) suffix += 1;
  return `${base} ${suffix}`;
}
