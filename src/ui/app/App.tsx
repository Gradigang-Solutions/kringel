import { useEffect } from "react";
import { BokehBackground } from "@/ui/background/BokehBackground";
import { DesktopWorkspace } from "@/ui/app/DesktopWorkspace";
import { Notice } from "@/ui/app/Notice";
import { PhoneWorkspace } from "@/ui/app/PhoneWorkspace";
import { startEngineSync } from "@/ui/app/playbackController";
import { useKeyboardShortcuts } from "@/ui/app/useKeyboardShortcuts";
import { usePreferencesPersistence } from "@/ui/app/usePreferencesPersistence";
import { useProjectPersistence } from "@/ui/app/useProjectPersistence";
import { useSharedLinkListener } from "@/ui/app/useSharedLinkListener";
import { ConvertToCodeDialog } from "@/ui/editors/ConvertToCodeDialog";
import { useIsPhone } from "@/ui/shared/useIsPhone";

export function App() {
  const isPhone = useIsPhone();
  useEffect(() => startEngineSync(), []);
  useKeyboardShortcuts();
  useProjectPersistence();
  usePreferencesPersistence();
  useSharedLinkListener();
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gray-155">
      <BokehBackground />
      {/* Positionné pour passer au-dessus du fond animé, lui-même en position absolue. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {isPhone ? <PhoneWorkspace /> : <DesktopWorkspace />}
      </div>
      <ConvertToCodeDialog />
      <Notice />
    </div>
  );
}
