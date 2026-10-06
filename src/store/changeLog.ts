import { nextId } from "@/store/ids";
import { getUi, MAX_CHANGES, updateUi, type ChangeEntry, type ValueChange } from "@/store/uiStore";

type NewChange = Omit<ChangeEntry, "id" | "isError"> & { readonly isError?: boolean };

/** Valeur de départ des réglages en cours de modification, pour écrire « 1200 → 800 Hz ». */
const startValues = new Map<string, string>();

export function logChange(change: NewChange): void {
  const { changes } = getUi();
  const entry: ChangeEntry = { id: nextId(), isError: false, ...change };
  const [latest, ...older] = changes;
  const merged = latest?.key === change.key ? [entry, ...older] : [entry, ...changes];
  updateUi({ changes: merged.slice(0, MAX_CHANGES) });
}

/** Une modification de valeur ; les modifications successives du même réglage se fusionnent. */
export function logValueChange(change: ValueChange): void {
  const latestKey = getUi().changes[0]?.key;
  if (latestKey !== change.key) startValues.set(change.key, change.from);
  const from = startValues.get(change.key) ?? change.from;
  logChange({
    key: change.key,
    trackId: change.trackId,
    text: `${change.label} ${from} → ${change.to}`,
    code: change.code,
  });
}

export function clearChanges(): void {
  startValues.clear();
  updateUi({ changes: [] });
}
