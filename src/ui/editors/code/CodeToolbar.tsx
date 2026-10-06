import { Play } from "lucide-react";
import { setRunAsYouType } from "@/store/actions/code";
import { useUiStore } from "@/store/uiStore";
import { Badge } from "@/ui/primitives/Badge";
import { Button } from "@/ui/primitives/Button";
import { Switch } from "@/ui/primitives/Switch";
import { EditorToolbar } from "@/ui/editors/EditorToolbar";

export interface CodeToolbarProps {
  readonly hasError: boolean;
  readonly isPlayingLastValid: boolean;
  readonly onRun: () => void;
}

export function CodeToolbar({ hasError, isPlayingLastValid, onRun }: CodeToolbarProps) {
  const isRunAsYouType = useUiStore((state) => state.isRunAsYouType);
  return (
    <EditorToolbar>
      <Switch isChecked={isRunAsYouType} onChange={setRunAsYouType} label="Run as I type" />
      <Button onClick={onRun} className="gap-2">
        Run
        <span className="font-mono text-caption text-fg-3 max-md:hidden">⌘↵</span>
      </Button>
      {hasError ? (
        <Badge variant="error">
          <span aria-hidden className="size-1.5 rounded-full bg-error" />1 syntax error
        </Badge>
      ) : null}
      <span className="flex-1" />
      {isPlayingLastValid ? (
        <span className="flex items-center gap-1.75 text-small text-fg-2">
          <Play size={9} fill="currentColor" strokeWidth={0} aria-hidden className="text-track" />
          Still playing the last valid version
        </span>
      ) : null}
    </EditorToolbar>
  );
}
