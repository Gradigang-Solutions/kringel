import { useEffect } from "react";
import { showNotice } from "@/store/actions/project";
import { markSaved, useProjectStore } from "@/store/projectStore";
import { saveProject } from "@/storage/db";

const AUTOSAVE_DELAY_MS = 600;

/** Sauvegarde chaque modification du projet après un court délai. */
export function useProjectPersistence(): void {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useProjectStore.subscribe((state, previous) => {
      if (state.project === previous.project || state.saveStatus !== "pending") return;
      clearTimeout(timer);
      const { project } = state;
      timer = setTimeout(() => {
        saveProject(project, Date.now())
          .then(() => {
            markSaved(project);
          })
          .catch(() => {
            showNotice("Couldn't save the project in this browser. Export it to keep your work.");
          });
      }, AUTOSAVE_DELAY_MS);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);
}
