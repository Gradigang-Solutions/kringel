import { roundTo } from "@/lib/math";

const NUMBER_DECIMALS = 2;

/** Seul point de formatage des nombres du code généré : deux décimales au plus, sans zéros inutiles. */
export function formatNumber(value: number): string {
  return String(roundTo(value, NUMBER_DECIMALS));
}

export function quote(text: string): string {
  return JSON.stringify(text);
}

export function call(name: string, ...args: readonly string[]): string {
  return `${name}(${args.join(", ")})`;
}

export function method(name: string, ...args: readonly string[]): string {
  return `.${call(name, ...args)}`;
}
