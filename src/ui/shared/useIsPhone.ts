import { useMediaQuery } from "@/ui/shared/useMediaQuery";

/** Même seuil que les variantes `max-md:` de Tailwind : le JS change la structure, les classes le style. */
const PHONE_MEDIA_QUERY = "(width < 48rem)";

/** Vrai sur un écran étroit, où l'interface passe en onglets. */
export function useIsPhone(): boolean {
  return useMediaQuery(PHONE_MEDIA_QUERY);
}
