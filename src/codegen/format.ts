import { roundTo } from "@/lib/math";

const NUMBER_DECIMALS = 2;

/** Seul point de formatage des nombres du code généré : deux décimales au plus, sans zéros inutiles. */
export function formatNumber(value: number): string {
  return String(roundTo(value, NUMBER_DECIMALS));
}

/** Chaîne entre guillemets doubles : Strudel la lit comme de la mini-notation (`s("bd sd")`). */
export function quote(text: string): string {
  return JSON.stringify(text);
}

/** Chaîne entre apostrophes : Strudel la garde telle quelle, pour une URL où `/` n'est pas un opérateur. */
export function plainString(text: string): string {
  return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

export function call(name: string, ...args: readonly string[]): string {
  return `${name}(${args.join(", ")})`;
}

export function method(name: string, ...args: readonly string[]): string {
  return `.${call(name, ...args)}`;
}
