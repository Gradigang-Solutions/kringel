import { ChevronsRight } from "lucide-react";
import { useMemo, useState } from "react";
import { setCodePanelOpen } from "@/store/actions/layout";
import { showNotice } from "@/store/actions/project";
import { useProjectStore } from "@/store/projectStore";
import { useGeneratedCode } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { ChangeLog } from "@/ui/code/ChangeLog";
import { lineStyles } from "@/ui/code/lineStyles";
import { ReadOnlyCode } from "@/ui/code/ReadOnlyCode";
import { SelectionBar } from "@/ui/code/SelectionBar";
import { Badge } from "@/ui/primitives/Badge";
import { Button } from "@/ui/primitives/Button";
import { IconButton } from "@/ui/primitives/IconButton";

const COPIED_FEEDBACK_MS = 1500;

function CopyButton({ text }: { readonly text: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      showNotice("Couldn't copy the code. Select it in the panel and copy it by hand.");
    }
  };
  return (
    <Button variant="quiet" onClick={() => void copy()}>
      {isCopied ? "Copied" : "Copy"}
    </Button>
  );
}

/** Panneau de droite : le code Strudel généré, en lecture seule. */
export function CodePanel() {
  const code = useGeneratedCode();
  const tracks = useProjectStore((state) => state.project.tracks);
  const selectedClipId = useUiStore((state) => state.selectedClipId);
  const styles = useMemo(
    () =>
      lineStyles(
        code.lines,
        selectedClipId,
        new Map(tracks.map((track) => [track.id, track.color])),
      ),
    [code.lines, selectedClipId, tracks],
  );
  return (
    <aside
      aria-label="Strudel code"
      className="flex min-h-0 w-100 shrink-0 flex-col border-l border-gray-235 bg-gray-135"
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-gray-215 pr-2.5 pl-4">
        <h2 className="text-emphasis font-semibold">Strudel code</h2>
        <Badge>read-only</Badge>
        <span className="flex-1" />
        <CopyButton text={code.text} />
        <IconButton label="Hide code panel" size="sm" onClick={() => setCodePanelOpen(false)}>
          <ChevronsRight size={14} aria-hidden />
        </IconButton>
      </div>
      <SelectionBar lines={code.lines} />
      <div className="min-h-0 flex-1">
        <ReadOnlyCode text={code.text} styles={styles} />
      </div>
      <ChangeLog />
    </aside>
  );
}
