/** JSON.parse sans exception : un texte qui n'est pas du JSON donne undefined, que la validation rejette ensuite. */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Pas du JSON : l'appelant valide la valeur et signale l'erreur à sa façon.
    return undefined;
  }
}
