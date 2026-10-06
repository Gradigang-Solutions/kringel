import { LoaderCircle, Play, Square } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHasAnyClip, useIsAudioStarting, useIsPlaying } from "@/store/selectors";
import { startPlayback, stopPlayback } from "@/ui/app/playbackController";
import { IconButton } from "@/ui/primitives/IconButton";
import { BpmControl } from "@/ui/transport/BpmControl";
import { CycleDisplay } from "@/ui/transport/CycleDisplay";

export function TransportControls() {
  const isPlaying = useIsPlaying();
  const hasAnyClip = useHasAnyClip();
  const isAudioStarting = useIsAudioStarting();
  return (
    <div className="flex items-center gap-4.5 max-md:gap-2">
      <div className="flex gap-1">
        <IconButton label="Stop" size="lg" variant="subtle" onClick={stopPlayback}>
          <Square size={10} fill="currentColor" strokeWidth={0} aria-hidden />
        </IconButton>
        <IconButton
          label={isAudioStarting ? "Starting audio…" : "Play"}
          size="lg"
          onClick={() => void startPlayback()}
          className={cn(
            hasAnyClip && "bg-fg-1 text-fg-inverse hover:bg-gray-860 hover:text-fg-inverse",
          )}
          aria-pressed={isPlaying}
          aria-busy={isAudioStarting}
        >
          {isAudioStarting ? (
            <LoaderCircle
              size={14}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden
            />
          ) : (
            <Play size={13} fill="currentColor" strokeWidth={0} aria-hidden />
          )}
        </IconButton>
      </div>
      <BpmControl />
      <div className="max-md:hidden">
        <CycleDisplay />
      </div>
    </div>
  );
}
