import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCanRedo, useCanUndo } from "@/store/selectors";
import { redoAndRecheck, undoAndRecheck } from "@/ui/app/historyCommands";
import { Button } from "@/ui/primitives/Button";
import { Dropdown } from "@/ui/primitives/Menu";
import { CreditsDialog } from "@/ui/transport/CreditsDialog";
import { exportProject, importProject, startNewProject } from "@/ui/transport/projectFiles";

/** Menu du projet, à côté du bouton Share : historique, fichiers JSON, nouveau projet, crédits. */
export function ProjectMenu() {
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
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
          { label: "Sound credits", onSelect: () => setIsCreditsOpen(true) },
        ]}
      />
      <CreditsDialog isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
    </>
  );
}
