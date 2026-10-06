import { ChevronDown } from "lucide-react";
import { Button } from "@/ui/primitives/Button";
import { Dropdown } from "@/ui/primitives/Menu";
import { exportProject, importProject, startNewProject } from "@/ui/transport/projectFiles";

/** Remplace le bouton « Share » de la maquette : le partage par URL est hors périmètre de la v0. */
export function ProjectMenu() {
  return (
    <Dropdown
      trigger={
        <Button variant="primary" size="md" className="gap-1.5 pr-2.5">
          Project
          <ChevronDown size={13} aria-hidden />
        </Button>
      }
      items={[
        { label: "Export JSON", onSelect: exportProject },
        { label: "Import JSON…", onSelect: () => void importProject() },
        { label: "New project", onSelect: startNewProject },
      ]}
    />
  );
}
