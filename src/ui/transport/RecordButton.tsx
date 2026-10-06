import { useRef } from "react";
import { MAX_RECORDING_SECONDS } from "@/engine";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/uiStore";
import { toggleRecording } from "@/ui/app/playbackController";
import { IconButton } from "@/ui/primitives/IconButton";
import { useAnimationFrame } from "@/ui/shared/useAnimationFrame";
import { formatElapsed } from "@/ui/transport/recordingTime";

const SECONDS_PER_MINUTE = 60;

/** Enregistre la sortie audio en WAV ; la durée écoulée s'affiche pendant l'enregistrement. */
export function RecordButton() {
  const startedAt = useUiStore((state) => state.recordingStartedAt);
  const isRecording = startedAt !== null;
  const elapsed = useRef<HTMLSpanElement>(null);
  useAnimationFrame(() => {
    if (elapsed.current && startedAt !== null)
      elapsed.current.textContent = formatElapsed(Date.now() - startedAt);
  }, isRecording);
  return (
    <div className="flex items-center gap-1.5">
      <IconButton
        label={isRecording ? "Stop recording" : "Record"}
        size="lg"
        variant="subtle"
        onClick={() => void toggleRecording()}
        aria-pressed={isRecording}
        title={
          isRecording
            ? "Stop recording and download the WAV file"
            : `Record what you hear as a WAV file (up to ${MAX_RECORDING_SECONDS / SECONDS_PER_MINUTE} minutes)`
        }
      >
        <span
          aria-hidden
          className={cn(
            "size-2.5 rounded-full bg-record",
            isRecording && "animate-pulse motion-reduce:animate-none",
          )}
        />
      </IconButton>
      {isRecording ? (
        <span ref={elapsed} className="min-w-8 font-mono text-value text-record">
          {formatElapsed(0)}
        </span>
      ) : null}
    </div>
  );
}
