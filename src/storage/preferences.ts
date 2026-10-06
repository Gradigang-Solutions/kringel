import { z } from "zod";
import { parseJson } from "@/lib/json";

/** Réglages de l'interface propres à ce navigateur, hors du projet (ni exportés, ni partagés). */
const preferencesSchema = z.object({
  isBackgroundVisualsOn: z.boolean(),
});

export type Preferences = z.infer<typeof preferencesSchema>;

export const DEFAULT_PREFERENCES: Preferences = { isBackgroundVisualsOn: true };

const PREFERENCES_KEY = "kringel.preferences";

/** Fourni à la demande : lire `window.localStorage` lève déjà une exception quand le navigateur le bloque. */
type StorageAccess<Method extends keyof Storage> = () => Pick<Storage, Method>;

export function loadPreferences(storage: StorageAccess<"getItem">): Preferences {
  let stored: string | null;
  try {
    stored = storage().getItem(PREFERENCES_KEY);
  } catch {
    // Stockage bloqué (cookies refusés) : les réglages par défaut conviennent.
    return DEFAULT_PREFERENCES;
  }
  if (stored === null) return DEFAULT_PREFERENCES;
  const parsed = preferencesSchema.safeParse(parseJson(stored));
  return parsed.success ? parsed.data : DEFAULT_PREFERENCES;
}

export function savePreferences(preferences: Preferences, storage: StorageAccess<"setItem">): void {
  try {
    storage().setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Stockage plein ou bloqué : le réglage vaut pour la session, rien d'autre n'en dépend.
  }
}
