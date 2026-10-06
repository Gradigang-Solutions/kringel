import { useEffect } from "react";
import { openSharedProjectOnHashChange } from "@/ui/app/openSharedProject";

/** Ouvre un lien de partage collé dans la barre d'adresse alors que l'app est déjà ouverte. */
export function useSharedLinkListener(): void {
  useEffect(() => {
    const onHashChange = () => {
      void openSharedProjectOnHashChange();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);
}
