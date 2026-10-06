import { useEffect } from "react";
import { DesktopWorkspace } from "@/ui/app/DesktopWorkspace";
import { Notice } from "@/ui/app/Notice";
import { PhoneWorkspace } from "@/ui/app/PhoneWorkspace";
import { startEngineSync } from "@/ui/app/playbackController";
import { useKeyboardShortcuts } from "@/ui/app/useKeyboardShortcuts";
import { useProjectPersistence } from "@/ui/app/useProjectPersistence";
import { useSharedLinkListener } from "@/ui/app/useSharedLinkListener";
import { ConvertToCodeDialog } from "@/ui/editors/ConvertToCodeDialog";
import { useIsPhone } from "@/ui/shared/useIsPhone";

export function App() {
  const isPhone = useIsPhone();
  useEffect(() => startEngineSync(), []);
  useKeyboardShortcuts();
  useProjectPersistence();
  useSharedLinkListener();
  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-155">
      {isPhone ? <PhoneWorkspace /> : <DesktopWorkspace />}
      <ConvertToCodeDialog />
      <Notice />
    </div>
  );
}
