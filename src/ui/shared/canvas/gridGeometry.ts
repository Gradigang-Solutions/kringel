export interface Span {
  readonly start: number;
  readonly size: number;
}

export interface GroupedSpacing {
  readonly groupSize: number;
  readonly cellGap: number;
  readonly groupGap: number;
}

/** Longueur totale des écarts entre `count` cellules regroupées. */
export function groupedGapsLength(count: number, spacing: GroupedSpacing): number {
  if (count <= 0) return 0;
  const groups = Math.ceil(count / spacing.groupSize);
  return (count - groups) * spacing.cellGap + (groups - 1) * spacing.groupGap;
}

/**
 * Découpe une longueur en cellules regroupées (les pas par temps de 4) :
 * un petit écart entre cellules, un plus grand entre groupes.
 */
export function groupedSpans(length: number, count: number, spacing: GroupedSpacing): Span[] {
  if (count <= 0) return [];
  const size = Math.max(0, (length - groupedGapsLength(count, spacing)) / count);
  return Array.from({ length: count }, (_, index) => {
    const group = Math.floor(index / spacing.groupSize);
    const indexInGroup = index % spacing.groupSize;
    const groupStart =
      group *
      (spacing.groupSize * size + (spacing.groupSize - 1) * spacing.cellGap + spacing.groupGap);
    return { start: groupStart + indexInGroup * (size + spacing.cellGap), size };
  });
}

/** Indice de la cellule sous une position, ou null entre deux cellules et hors de la grille. */
export function spanIndexAt(spans: readonly Span[], position: number): number | null {
  const index = spans.findIndex(
    (span) => position >= span.start && position < span.start + span.size,
  );
  return index === -1 ? null : index;
}

/** Indice de la cellule la plus proche d'une position, pour glisser sans tomber dans les écarts. */
export function nearestSpanIndex(spans: readonly Span[], position: number): number | null {
  if (spans.length === 0) return null;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  spans.forEach((span, index) => {
    const distance = Math.abs(position - (span.start + span.size / 2));
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/** Position du pointeur relative à l'élément, en pixels CSS. */
export function pointerPosition(
  event: { clientX: number; clientY: number },
  element: Element,
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
