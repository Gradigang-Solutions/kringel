import { create } from "zustand";
import type { TrackControls } from "@/codegen/controls";

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

/** Côté d'où vient la mise en évidence d'un contrôle : survol du code ou de l'interface. */
export type HighlightOrigin = "code" | "interface";

/** Vue affichée sur téléphone, où la grille, le mixer et le code ne tiennent pas ensemble. */
export type PhoneTab = "clips" | "mixer" | "code";

interface UiStore {
  readonly selectedClipId: string | null;
  readonly editorClipId: string | null;
  readonly selectedRowId: string | null;
  readonly selectedNoteId: string | null;
  readonly isCodePanelOpen: boolean;
  readonly phoneTab: PhoneTab;
  readonly isRunAsYouType: boolean;
  readonly isOutOfScaleGrayed: boolean;
  readonly changes: readonly ChangeEntry[];
  readonly notice: string | null;
  /** Clip dont la conversion en code attend une confirmation. */
  readonly pendingConversionClipId: string | null;
  /** Premier Play : le contexte audio démarre et les catalogues de samples se téléchargent. */
  readonly isAudioStarting: boolean;
  /** Incrémenté à chaque annulation ou rétablissement, pour recréer les éditeurs qui gardent leur propre état. */
  readonly historyRevision: number;
  /** Contrôle survolé, dans l'interface ou via sa ligne de code : les deux côtés le mettent en évidence. */
  readonly highlightedControls: TrackControls | null;
  readonly highlightOrigin: HighlightOrigin | null;
  /** Début de l'enregistrement en cours (horloge du navigateur, en ms), ou null. */
  readonly recordingStartedAt: number | null;
  /** Halos du fond pendant la lecture (préférence du navigateur). */
  readonly isBackgroundVisualsOn: boolean;
}

export const MAX_CHANGES = 3;

export const INITIAL_UI: UiStore = {
  selectedClipId: null,
  editorClipId: null,
  selectedRowId: null,
  selectedNoteId: null,
  isCodePanelOpen: true,
  phoneTab: "clips",
  isRunAsYouType: true,
  isOutOfScaleGrayed: true,
  changes: [],
  notice: null,
  pendingConversionClipId: null,
  isAudioStarting: false,
  historyRevision: 0,
  highlightedControls: null,
  highlightOrigin: null,
  recordingStartedAt: null,
  isBackgroundVisualsOn: true,
};

export const useUiStore = create<UiStore>()(() => INITIAL_UI);

export function updateUi(update: Partial<UiStore>): void {
  useUiStore.setState(update);
}

export function getUi(): UiStore {
  return useUiStore.getState();
}
