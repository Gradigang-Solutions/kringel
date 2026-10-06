import { Button } from "@/ui/primitives/Button";
import { setCodePanelOpen } from "@/store/actions/layout";
import { useUiStore } from "@/store/uiStore";
import { ProjectBrand } from "@/ui/transport/ProjectBrand";
import { ProjectMenu } from "@/ui/transport/ProjectMenu";
import { TransportControls } from "@/ui/transport/TransportControls";

export function TopBar() {
  const isCodePanelOpen = useUiStore((state) => state.isCodePanelOpen);
  return (
    <header className="grid h-12 shrink-0 grid-topbar items-center border-b border-gray-235 bg-gray-175 px-3.5">
      <ProjectBrand />
      <TransportControls />
      <div className="flex items-center justify-end gap-2">
        <Button
          size="md"
          variant="subtle"
          aria-pressed={isCodePanelOpen}
          onClick={() => setCodePanelOpen(!isCodePanelOpen)}
        >
          <span className="font-mono text-label text-fg-2">{"{ }"}</span>
          Code
        </Button>
        <ProjectMenu />
      </div>
    </header>
  );
}
