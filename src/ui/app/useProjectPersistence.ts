import { useEffect } from "react";
import { showNotice } from "@/store/actions/project";
import { markSaved, useProjectStore } from "@/store/projectStore";
import { saveProject } from "@/storage/db";

const AUTOSAVE_DELAY_MS = 600;

/** Sauvegarde chaque modification du projet après un court délai. */
export function useProjectPersistence(): void {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scheduleSave = () => {
      const { project, saveStatus } = useProjectStore.getState();
      if (saveStatus !== "pending") return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        saveProject(project, Date.now())
          .then(() => {
            markSaved(project);
          })
          .catch(() => {
            showNotice("Couldn't save the project in this browser. Export it to keep your work.");
          });
      }, AUTOSAVE_DELAY_MS);
    };
    const unsubscribe = useProjectStore.subscribe((state, previous) => {
      if (state.project !== previous.project) scheduleSave();
    });
    // Un projet ouvert avant le premier rendu (lien de partage) attend déjà d'être sauvegardé.
    scheduleSave();
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);
}
