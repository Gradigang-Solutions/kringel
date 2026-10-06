import { useUiStore } from "@/store/uiStore";
import { BottomArea } from "@/ui/app/BottomArea";
import { CodePanel } from "@/ui/code/CodePanel";
import { ClipGrid } from "@/ui/grid/ClipGrid";
import { TopBar } from "@/ui/transport/TopBar";

/** Mise en page de la maquette : grille et mixer (ou éditeur) à gauche, code généré à droite. */
export function DesktopWorkspace() {
  const isCodePanelOpen = useUiStore((state) => state.isCodePanelOpen);
  return (
    <>
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <ClipGrid hasEmptyStateOverlay />
          <BottomArea />
        </main>
        {isCodePanelOpen ? <CodePanel /> : null}
      </div>
    </>
  );
}
