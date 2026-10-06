import { code2hash } from "@strudel/core";

const STRUDEL_REPL_URL = "https://strudel.cc/";

/** Adresse du REPL de strudel.cc ouvert sur ce code : le REPL lit le code depuis le fragment. */
export function strudelReplUrl(code: string): string {
  return `${STRUDEL_REPL_URL}#${code2hash(code)}`;
}
