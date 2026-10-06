import { useState } from "react";
import { setBpm } from "@/store/actions/project";
import { useProjectStore } from "@/store/projectStore";

const STEP_BUTTON_CLASS =
  "h-3 w-4 rounded-2 bg-gray-250 text-tiny leading-3 text-fg-2 hover:bg-gray-280 hover:text-fg-1";

export function BpmControl() {
  const bpm = useProjectStore((state) => state.project.bpm);
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    const parsed = Number(draft);
    if (draft !== null && Number.isFinite(parsed)) setBpm(parsed);
    setDraft(null);
  };
  return (
    <div className="flex h-8 items-center gap-1.5 rounded-6 border border-gray-250 bg-gray-205 pr-1 pl-2.5">
      <input
        aria-label="Tempo in BPM"
        inputMode="numeric"
        value={draft ?? String(bpm)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setDraft(null);
        }}
        className="w-8 bg-transparent font-mono text-value font-medium outline-none"
      />
      <span className="text-tiny font-semibold tracking-wide text-fg-3">BPM</span>
      <div className="ml-1 flex flex-col gap-px">
        <button
          type="button"
          aria-label="Increase tempo"
          className={STEP_BUTTON_CLASS}
          onClick={() => setBpm(bpm + 1)}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Decrease tempo"
          className={STEP_BUTTON_CLASS}
          onClick={() => setBpm(bpm - 1)}
        >
          –
        </button>
      </div>
    </div>
  );
}
