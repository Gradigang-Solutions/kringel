import { create } from "zustand";
import { createProject } from "@/model/project";
import type { Project } from "@/model/types";
import { nextId } from "@/store/ids";

/** never : jamais sauvegardé ; pending : modifications pas encore écrites ; saved : à jour. */
export type SaveStatus = "never" | "pending" | "saved";

interface ProjectStore {
  readonly project: Project;
  readonly saveStatus: SaveStatus;
}

export const useProjectStore = create<ProjectStore>()(() => ({
  project: createProject(nextId),
  saveStatus: "never",
}));

export function getProject(): Project {
  return useProjectStore.getState().project;
}

export function updateProject(update: (project: Project) => Project): void {
  useProjectStore.setState((state) => {
    const project = update(state.project);
    return project === state.project ? state : { project, saveStatus: "pending" };
  });
}

export function replaceProject(project: Project, saveStatus: SaveStatus): void {
  useProjectStore.setState({ project, saveStatus });
}

export function markSaved(project: Project): void {
  useProjectStore.setState((state) =>
    state.project === project ? { saveStatus: "saved" } : state,
  );
}
