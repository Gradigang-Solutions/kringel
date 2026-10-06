import { loadProject, newProject, showNotice } from "@/store/actions/project";
import { getProject } from "@/store/projectStore";
import { parseProjectFile, projectFileName, serializeProject } from "@/storage/exportImport";
import { checkAllCodeClips, stopPlayback } from "@/ui/app/playbackController";
import { downloadTextFile, pickTextFile } from "@/ui/shared/files";

const JSON_MIME = "application/json";

export function exportProject(): void {
  const project = getProject();
  downloadTextFile(projectFileName(project), serializeProject(project), JSON_MIME);
}

export async function importProject(): Promise<void> {
  const text = await pickTextFile(`.json,${JSON_MIME}`);
  if (text === null) return;
  const result = parseProjectFile(text);
  if (!result.isOk) {
    showNotice(result.error);
    return;
  }
  stopPlayback();
  loadProject(result.project);
  await checkAllCodeClips();
}

export function startNewProject(): void {
  stopPlayback();
  newProject();
}
