import { ChevronsRight } from "lucide-react";
import { useCallback, useMemo } from "react";
import { selectClip } from "@/store/actions/clips";
import { clearHighlight, highlightControls } from "@/store/actions/codeLinks";
import { setCodePanelOpen } from "@/store/actions/layout";
import { useProjectStore } from "@/store/projectStore";
import { useGeneratedCode } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { ChangeLog } from "@/ui/code/ChangeLog";
import { CopyButton } from "@/ui/code/CopyButton";
import { controlAtLine, lineStyles } from "@/ui/code/lineStyles";
import { OpenInStrudelButton } from "@/ui/code/OpenInStrudelButton";
import { ReadOnlyCode } from "@/ui/code/ReadOnlyCode";
import { SelectionBar } from "@/ui/code/SelectionBar";
import { Badge } from "@/ui/primitives/Badge";
import { IconButton } from "@/ui/primitives/IconButton";

/** Panneau de droite : le code Strudel généré, en lecture seule. */
export function CodePanel() {
  const code = useGeneratedCode();
  const tracks = useProjectStore((state) => state.project.tracks);
  const selectedClipId = useUiStore((state) => state.selectedClipId);
  const highlighted = useUiStore((state) => state.highlightedControls);
  const styles = useMemo(
    () =>
      lineStyles(
        code.lines,
        selectedClipId,
        new Map(tracks.map((track) => [track.id, track.color])),
        highlighted,
      ),
    [code.lines, selectedClipId, tracks, highlighted],
  );
  const handleLineHover = useCallback(
    (index: number | null) => {
      const hovered = index === null ? null : controlAtLine(code.lines, index);
      if (hovered === null) clearHighlight("code");
      else highlightControls(hovered, "code");
    },
    [code.lines],
  );
  const handleLineClick = useCallback(
    (index: number) => {
      const clipId = code.lines[index]?.clipId;
      if (clipId) selectClip(clipId);
    },
    [code.lines],
  );
  return (
    <aside
      aria-label="Strudel code"
      className="flex min-h-0 w-100 shrink-0 flex-col border-l border-gray-235 bg-gray-135 max-md:w-full max-md:flex-1 max-md:border-l-0"
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-gray-215 pr-2.5 pl-4">
        <h2 className="text-emphasis font-semibold whitespace-nowrap">Strudel code</h2>
        <Badge>read-only</Badge>
        <span className="flex-1" />
        <OpenInStrudelButton />
        <CopyButton text={code.text} />
        <IconButton
          label="Hide code panel"
          size="sm"
          onClick={() => setCodePanelOpen(false)}
          className="max-md:hidden"
        >
          <ChevronsRight size={14} aria-hidden />
        </IconButton>
      </div>
      <SelectionBar lines={code.lines} />
      <div className="min-h-0 flex-1">
        <ReadOnlyCode
          text={code.text}
          styles={styles}
          onLineHover={handleLineHover}
          onLineClick={handleLineClick}
        />
      </div>
      <ChangeLog />
    </aside>
  );
}
