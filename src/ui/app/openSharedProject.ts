import { withProjectId } from "@/model/project";
import { loadProject, showNotice } from "@/store/actions/project";
import { nextId } from "@/store/ids";
import { isShareHash, parseShareHash } from "@/storage/shareLink";
import { checkAllCodeClips, stopPlayback } from "@/ui/app/playbackController";
import { restoreLastProject } from "@/ui/app/restoreLastProject";

/** Retire le projet de l'URL : un rechargement ne doit pas écraser les modifications faites depuis. */
function clearShareHash(): void {
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

/**
 * Ouvre le projet contenu dans l'URL, s'il y en a un. Renvoie l'erreur à afficher si le lien est
 * abîmé, null sinon.
 */
async function openProjectFromHash(): Promise<string | null> {
  const result = await parseShareHash(window.location.hash);
  clearShareHash();
  if (!result.isOk) return result.error;
  stopPlayback();
  loadProject(withProjectId(result.project, nextId()));
  // Pas attendu : l'évaluation des clips de code ne doit pas retarder l'affichage.
  void checkAllCodeClips();
  return null;
}

/** Au démarrage : le projet d'un lien de partage, sinon le dernier projet ouvert dans ce navigateur. */
export async function startWithProject(): Promise<void> {
  if (!isShareHash(window.location.hash)) {
    await restoreLastProject();
    return;
  }
  const error = await openProjectFromHash();
  if (error === null) return;
  await restoreLastProject();
  // Après la restauration, qui efface les notices en chargeant le projet.
  showNotice(error);
}

/** Un lien de partage collé dans un onglet où l'app est déjà ouverte ne recharge pas la page. */
export async function openSharedProjectOnHashChange(): Promise<void> {
  if (!isShareHash(window.location.hash)) return;
  const error = await openProjectFromHash();
  if (error !== null) showNotice(error);
}
