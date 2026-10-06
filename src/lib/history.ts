/** Historique d'annulation : états passés et états annulés, du plus ancien au plus récent. */
export interface History<T> {
  readonly past: readonly T[];
  readonly future: readonly T[];
  /** Clé et instant du dernier enregistrement, pour fusionner les gestes continus. */
  readonly lastKey: string | null;
  readonly lastAt: number;
}

export interface HistoryOptions {
  readonly limit: number;
  readonly mergeWindowMs: number;
}

export interface HistoryStep<T> {
  readonly history: History<T>;
  readonly present: T;
}

export function emptyHistory<T>(): History<T> {
  return { past: [], future: [], lastKey: null, lastAt: 0 };
}

function isSameGesture<T>(
  history: History<T>,
  key: string | null,
  now: number,
  windowMs: number,
): boolean {
  return key !== null && key === history.lastKey && now - history.lastAt < windowMs;
}

/**
 * Enregistre l'état précédant une modification. Les modifications successives d'une même clé
 * (un curseur qu'on glisse) se fusionnent : une seule annulation ramène au début du geste.
 */
export function recordHistory<T>(
  history: History<T>,
  previous: T,
  key: string | null,
  now: number,
  options: HistoryOptions,
): History<T> {
  if (isSameGesture(history, key, now, options.mergeWindowMs)) {
    return { ...history, future: [], lastAt: now };
  }
  return {
    past: [...history.past, previous].slice(-options.limit),
    future: [],
    lastKey: key,
    lastAt: now,
  };
}

export function undoHistory<T>(history: History<T>, present: T): HistoryStep<T> | null {
  const previous = history.past.at(-1);
  if (previous === undefined) return null;
  return {
    history: {
      past: history.past.slice(0, -1),
      future: [present, ...history.future],
      lastKey: null,
      lastAt: 0,
    },
    present: previous,
  };
}

export function redoHistory<T>(history: History<T>, present: T): HistoryStep<T> | null {
  const [next, ...rest] = history.future;
  if (next === undefined) return null;
  return {
    history: { past: [...history.past, present], future: rest, lastKey: null, lastAt: 0 },
    present: next,
  };
}
