import { useState } from "react";
import { TRACK_PRESETS } from "@/model/constants";
import { renameProject } from "@/store/actions/project";
import { useProjectStore, type SaveStatus } from "@/store/projectStore";
import { TrackScope } from "@/ui/shared/TrackScope";

const SAVE_LABELS: Readonly<Record<SaveStatus, string>> = {
  never: "Not saved yet",
  pending: "Saving…",
  saved: "Saved",
};

function Logo() {
  return (
    <div className="grid size-4.5 shrink-0 grid-cols-2 gap-0.5" aria-hidden>
      {TRACK_PRESETS.map((preset) => (
        <TrackScope key={preset.name} color={preset.color} className="rounded-2 bg-track" />
      ))}
    </div>
  );
}

export function ProjectBrand() {
  const name = useProjectStore((state) => state.project.name);
  const saveStatus = useProjectStore((state) => state.saveStatus);
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Logo />
      <span className="text-brand font-semibold tracking-tight">Kringle</span>
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
