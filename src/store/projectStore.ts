import { create } from "zustand";
import {
  emptyHistory,
  recordHistory,
  redoHistory,
  undoHistory,
  type History,
  type HistoryStep,
} from "@/lib/history";
import { createProject } from "@/model/project";
import type { Project } from "@/model/types";
import { nextId } from "@/store/ids";

/** never : jamais sauvegardé ; pending : modifications pas encore écrites ; saved : à jour. */
export type SaveStatus = "never" | "pending" | "saved";

interface ProjectStore {
  readonly project: Project;
  readonly saveStatus: SaveStatus;
  readonly history: History<Project>;
}

const HISTORY_OPTIONS = { limit: 100, mergeWindowMs: 1000 } as const;

export const useProjectStore = create<ProjectStore>()(() => ({
  project: createProject(nextId),
  saveStatus: "never",
  history: emptyHistory(),
}));

export function getProject(): Project {
  return useProjectStore.getState().project;
}

/**
 * Applique une modification annulable. Les modifications successives portant la même clé
 * d'historique (un curseur qu'on glisse) s'annulent en une fois.
 */
export function updateProject(
  update: (project: Project) => Project,
  historyKey: string | null = null,
): void {
  useProjectStore.setState((state) => {
    const project = update(state.project);
    if (project === state.project) return state;
    const history = recordHistory(
      state.history,
      state.project,
      historyKey,
      Date.now(),
      HISTORY_OPTIONS,
    );
    return { project, saveStatus: "pending", history };
  });
}

/** Remplace le projet (chargement, démo, import) : l'historique repart de zéro. */
export function replaceProject(project: Project, saveStatus: SaveStatus): void {
  useProjectStore.setState({ project, saveStatus, history: emptyHistory() });
}

type HistoryMove = (history: History<Project>, present: Project) => HistoryStep<Project> | null;

function applyStep(step: HistoryMove): boolean {
  const state = useProjectStore.getState();
  const result = step(state.history, state.project);
  if (result === null) return false;
  useProjectStore.setState({
    project: result.present,
    history: result.history,
    saveStatus: "pending",
  });
  return true;
}

/** Renvoie false s'il n'y avait rien à annuler. */
export function undoProject(): boolean {
  return applyStep(undoHistory);
}

/** Renvoie false s'il n'y avait rien à rétablir. */
export function redoProject(): boolean {
  return applyStep(redoHistory);
}

export function markSaved(project: Project): void {
  useProjectStore.setState((state) =>
    state.project === project ? { saveStatus: "saved" } : state,
  );
}
