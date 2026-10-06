import { useState } from "react";
import { renameProject } from "@/store/actions/project";
import { useProjectStore, type SaveStatus } from "@/store/projectStore";

const SAVE_LABELS: Readonly<Record<SaveStatus, string>> = {
  never: "Not saved yet",
  pending: "Saving…",
  saved: "Saved",
};

/** Même fichier que le favicon, pour que le logo n'ait qu'une seule source. */
function Logo() {
  return <img src="/favicon.svg" alt="" className="size-4.5 shrink-0" aria-hidden />;
}

export function ProjectBrand() {
  const name = useProjectStore((state) => state.project.name);
  const saveStatus = useProjectStore((state) => state.saveStatus);
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Logo />
      <span className="text-brand font-semibold tracking-tight">Kringel</span>
      <span className="h-4 w-px bg-gray-300" aria-hidden />
      <input
        aria-label="Project name"
        value={draft ?? name}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== null) renameProject(draft);
          setDraft(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="field-sizing-content min-w-12 rounded-4 bg-transparent px-1 text-title font-medium text-gray-860 outline-none hover:bg-gray-205 focus:bg-gray-205"
      />
      <span className="text-small whitespace-nowrap text-fg-3">{SAVE_LABELS[saveStatus]}</span>
    </div>
  );
}
