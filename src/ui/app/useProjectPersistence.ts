import { useEffect } from "react";
import { loadProject, showNotice } from "@/store/actions/project";
import { markSaved, useProjectStore } from "@/store/projectStore";
import { loadLastProject, saveProject } from "@/storage/db";
import { checkAllCodeClips } from "@/ui/app/playbackController";

const AUTOSAVE_DELAY_MS = 600;

/** Recharge le dernier projet au démarrage, puis sauvegarde chaque modification après un court délai. */
export function useProjectPersistence(): void {
  useEffect(() => {
    void loadLastProject()
      .then(async (project) => {
        if (project) {
          loadProject(project, "saved");
          await checkAllCodeClips();
        }
      })
      .catch(() => {
        showNotice("Couldn't open your last project from this browser's storage.");
      });

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
