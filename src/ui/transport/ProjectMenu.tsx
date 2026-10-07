import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { setBackgroundVisuals } from "@/store/actions/layout";
import { useCanRedo, useCanUndo } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { redoAndRecheck, undoAndRecheck } from "@/ui/app/historyCommands";
import { Button } from "@/ui/primitives/Button";
import { Dropdown } from "@/ui/primitives/Menu";
import { AboutDialog } from "@/ui/transport/AboutDialog";
import { exportProject, importProject, startNewProject } from "@/ui/transport/projectFiles";

/** Menu du projet, à côté du bouton Share : historique, fichiers JSON, nouveau projet, visuels, à propos. */
export function ProjectMenu() {
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const isBackgroundVisualsOn = useUiStore((state) => state.isBackgroundVisualsOn);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  return (
    <>
      <Dropdown
        trigger={
          <Button
            variant="subtle"
            size="md"
            aria-label="Project"
            className="gap-1.5 pr-2.5 max-md:pl-2.5"
          >
            <span className="max-md:hidden">Project</span>
            <ChevronDown size={13} aria-hidden />
          </Button>
        }
        items={[
          { label: "Undo", onSelect: undoAndRecheck, isDisabled: !canUndo, shortcut: "⌘Z" },
          { label: "Redo", onSelect: redoAndRecheck, isDisabled: !canRedo, shortcut: "⇧⌘Z" },
          { label: "Export JSON", onSelect: exportProject },
          { label: "Import JSON…", onSelect: () => void importProject() },
          { label: "New project", onSelect: startNewProject },
          {
            label: "Background visuals",
            isChecked: isBackgroundVisualsOn,
            onSelect: () => setBackgroundVisuals(!isBackgroundVisualsOn),
          },
          { label: "About & credits", onSelect: () => setIsAboutOpen(true) },
        ]}
      />
      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
