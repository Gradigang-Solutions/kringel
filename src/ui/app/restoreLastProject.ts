import { loadProject, showNotice } from "@/store/actions/project";
import { loadLastProject } from "@/storage/db";
import { checkAllCodeClips } from "@/ui/app/playbackController";

/**
 * Recharge le dernier projet avant le premier rendu, pour ne pas afficher un instant le projet vide.
 * Ne rejette jamais : un échec est signalé à l'utilisateur et l'app démarre sur un projet neuf.
 */
export async function restoreLastProject(): Promise<void> {
  try {
    const project = await loadLastProject();
    if (!project) return;
    loadProject(project, "saved");
    // Pas attendu : l'évaluation des clips de code ne doit pas retarder l'affichage.
    void checkAllCodeClips();
  } catch {
    showNotice("Couldn't open your last project from this browser's storage.");
  }
}
