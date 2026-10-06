import { readMasterLevels } from "@/engine";
import { useIsPlaying } from "@/store/selectors";
import { LevelMeter } from "@/ui/shared/LevelMeter";

function readLevels(): readonly [number, number] {
  const { left, right } = readMasterLevels();
  return [left, right];
}

/** Vumètre du master, branché sur la sortie réelle de Strudel. */
export function MasterStrip() {
  const isPlaying = useIsPlaying();
  return (
    <div className="flex flex-col items-center gap-2 rounded-8 border border-gray-225 bg-gray-185 p-2.5 max-md:shrink-0 max-md:snap-start">
      <span className="text-caption font-semibold tracking-caps text-fg-2">MASTER</span>
      <div className="min-h-0 flex-1">
        {/* Remonté à chaque départ ou arrêt pour repartir de segments éteints. */}
        <LevelMeter
          key={String(isPlaying)}
          readLevels={readLevels}
          isActive={isPlaying}
          size="master"
          color="neutral"
        />
      </div>
    </div>
  );
}
