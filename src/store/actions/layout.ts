import { updateUi, type PhoneTab } from "@/store/uiStore";

export function setCodePanelOpen(isCodePanelOpen: boolean): void {
  updateUi({ isCodePanelOpen });
}

export function setPhoneTab(phoneTab: PhoneTab): void {
  updateUi({ phoneTab });
}

export function setBackgroundVisuals(isBackgroundVisualsOn: boolean): void {
  updateUi({ isBackgroundVisualsOn });
}
