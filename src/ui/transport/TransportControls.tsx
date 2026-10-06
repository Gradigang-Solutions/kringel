import { Play, Square } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHasAnyClip, useIsPlaying } from "@/store/selectors";
import { startPlayback, stopPlayback } from "@/ui/app/playbackController";
import { IconButton } from "@/ui/primitives/IconButton";
import { BpmControl } from "@/ui/transport/BpmControl";
import { CycleDisplay } from "@/ui/transport/CycleDisplay";

export function TransportControls() {
  const isPlaying = useIsPlaying();
  const hasAnyClip = useHasAnyClip();
  return (
    <div className="flex items-center gap-4.5 max-md:gap-2">
      <div className="flex gap-1">
        <IconButton label="Stop" size="lg" variant="subtle" onClick={stopPlayback}>
          <Square size={10} fill="currentColor" strokeWidth={0} aria-hidden />
        </IconButton>
        <IconButton
          label="Play"
          size="lg"
          onClick={() => void startPlayback()}
          className={cn(
            hasAnyClip && "bg-fg-1 text-fg-inverse hover:bg-gray-860 hover:text-fg-inverse",
          )}
          aria-pressed={isPlaying}
        >
          <Play size={13} fill="currentColor" strokeWidth={0} aria-hidden />
        </IconButton>
      </div>
      <BpmControl />
      <div className="max-md:hidden">
        <CycleDisplay />
      </div>
    </div>
  );
}
