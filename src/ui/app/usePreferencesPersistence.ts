import { useEffect } from "react";
import { updateUi, useUiStore } from "@/store/uiStore";
import { loadPreferences, savePreferences } from "@/storage/preferences";

const browserStorage = (): Storage => window.localStorage;

/** Relit les réglages de l'interface au démarrage, puis les enregistre à chaque changement. */
export function usePreferencesPersistence(): void {
  useEffect(() => {
    updateUi(loadPreferences(browserStorage));
    return useUiStore.subscribe((state, previous) => {
      if (state.isBackgroundVisualsOn === previous.isBackgroundVisualsOn) return;
      savePreferences({ isBackgroundVisualsOn: state.isBackgroundVisualsOn }, browserStorage);
    });
  }, []);
}
