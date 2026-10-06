import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";
import { BottomArea } from "@/ui/app/BottomArea";
import { Notice } from "@/ui/app/Notice";
import { startEngineSync } from "@/ui/app/playbackController";
import { useKeyboardShortcuts } from "@/ui/app/useKeyboardShortcuts";
import { useProjectPersistence } from "@/ui/app/useProjectPersistence";
import { CodePanel } from "@/ui/code/CodePanel";
import { ConvertToCodeDialog } from "@/ui/editors/ConvertToCodeDialog";
import { ClipGrid } from "@/ui/grid/ClipGrid";
import { TopBar } from "@/ui/transport/TopBar";

export function App() {
  const isCodePanelOpen = useUiStore((state) => state.isCodePanelOpen);
  useEffect(() => startEngineSync(), []);
  useKeyboardShortcuts();
  useProjectPersistence();
  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-155">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <ClipGrid />
          <BottomArea />
        </main>
        {isCodePanelOpen ? <CodePanel /> : null}
      </div>
      <ConvertToCodeDialog />
      <Notice />
    </div>
  );
}
