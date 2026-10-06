import { useSyncExternalStore } from "react";

/** Même seuil que les variantes `max-md:` de Tailwind : le JS change la structure, les classes le style. */
const PHONE_MEDIA_QUERY = "(width < 48rem)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(PHONE_MEDIA_QUERY);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function isPhoneScreen(): boolean {
  return window.matchMedia(PHONE_MEDIA_QUERY).matches;
}

/** Vrai sur un écran étroit, où l'interface passe en onglets. */
export function useIsPhone(): boolean {
  return useSyncExternalStore(subscribe, isPhoneScreen);
}
