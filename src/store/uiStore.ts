import { create } from "zustand";

/** Une ligne de « What your last clicks wrote ». */
export interface ChangeEntry {
  readonly id: string;
  /** Les modifications successives d'un même réglage (un curseur qu'on glisse) se fusionnent. */
  readonly key: string;
  readonly trackId: string | null;
  readonly text: string;
  readonly code: string;
  readonly isError: boolean;
}

export interface ValueChange {
  readonly key: string;
  readonly trackId: string | null;
  readonly label: string;
  readonly from: string;
  readonly to: string;
  readonly code: string;
}

interface UiStore {
  readonly selectedClipId: string | null;
  readonly editorClipId: string | null;
  readonly selectedRowId: string | null;
  readonly selectedNoteId: string | null;
  readonly isCodePanelOpen: boolean;
  readonly isRunAsYouType: boolean;
  readonly isOutOfScaleGrayed: boolean;
  readonly changes: readonly ChangeEntry[];
  readonly notice: string | null;
  /** Clip dont la conversion en code attend une confirmation. */
  readonly pendingConversionClipId: string | null;
}

export const MAX_CHANGES = 3;

export const INITIAL_UI: UiStore = {
  selectedClipId: null,
  editorClipId: null,
  selectedRowId: null,
  selectedNoteId: null,
  isCodePanelOpen: true,
  isRunAsYouType: true,
  isOutOfScaleGrayed: true,
  changes: [],
  notice: null,
  pendingConversionClipId: null,
};

export const useUiStore = create<UiStore>()(() => INITIAL_UI);

export function updateUi(update: Partial<UiStore>): void {
  useUiStore.setState(update);
}

export function getUi(): UiStore {
  return useUiStore.getState();
}
