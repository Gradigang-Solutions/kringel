/** Copie de la liste avec l'élément d'indice `from` déplacé à l'indice `to` (borné à la liste). */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const item = items[from];
  if (item === undefined) return [...items];
  const rest = items.filter((_, index) => index !== from);
  const target = Math.min(Math.max(to, 0), rest.length);
  return [...rest.slice(0, target), item, ...rest.slice(target)];
}

export function insertAt<T>(items: readonly T[], index: number, item: T): T[] {
  return [...items.slice(0, index), item, ...items.slice(index)];
}

export function removeAt<T>(items: readonly T[], index: number): T[] {
  return items.filter((_, itemIndex) => itemIndex !== index);
}
