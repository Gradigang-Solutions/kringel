import { useProjectStore } from "@/store/projectStore";
import { MasterStrip } from "@/ui/mixer/MasterStrip";
import { MixerStrip } from "@/ui/mixer/MixerStrip";

export function Mixer() {
  const tracks = useProjectStore((state) => state.project.tracks);
  return (
    <section aria-label="Mixer" className="grid-session grid min-h-0 flex-1 gap-2 p-3">
      {tracks.map((track) => (
        <MixerStrip key={track.id} track={track} />
      ))}
      <MasterStrip />
    </section>
  );
}
