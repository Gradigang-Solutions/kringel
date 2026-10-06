import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, loadPreferences, savePreferences } from "@/storage/preferences";

type TestStorage = Pick<Storage, "getItem" | "setItem">;

function memoryStorage(): TestStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

const blockedStorage = (): TestStorage => {
  throw new Error("bloqué");
};

describe("préférences", () => {
  it("relit ce qui a été enregistré", () => {
    const storage = memoryStorage();
    savePreferences({ isBackgroundVisualsOn: false }, () => storage);
    expect(loadPreferences(() => storage)).toEqual({ isBackgroundVisualsOn: false });
  });

  it("donne les valeurs par défaut au premier lancement", () => {
    expect(loadPreferences(memoryStorage)).toEqual(DEFAULT_PREFERENCES);
  });

  it("rejette une valeur invalide", () => {
    const storage = memoryStorage();
    storage.setItem("kringel.preferences", '{"isBackgroundVisualsOn":"yes"}');
    expect(loadPreferences(() => storage)).toEqual(DEFAULT_PREFERENCES);
    storage.setItem("kringel.preferences", "pas du json");
    expect(loadPreferences(() => storage)).toEqual(DEFAULT_PREFERENCES);
  });

  it("supporte un stockage bloqué par le navigateur", () => {
    expect(() => {
      savePreferences({ isBackgroundVisualsOn: false }, blockedStorage);
    }).not.toThrow();
    expect(loadPreferences(blockedStorage)).toEqual(DEFAULT_PREFERENCES);
  });
});
