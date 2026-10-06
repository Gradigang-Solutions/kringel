import { updateUi } from "@/store/uiStore";

export function setCodePanelOpen(isCodePanelOpen: boolean): void {
  updateUi({ isCodePanelOpen });
}
