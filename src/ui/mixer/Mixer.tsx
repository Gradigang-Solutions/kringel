import { useProjectStore } from "@/store/projectStore";
import { MasterStrip } from "@/ui/mixer/MasterStrip";
import { MixerStrip } from "@/ui/mixer/MixerStrip";
import { sessionGridStyle } from "@/ui/shared/sessionGrid";

export function Mixer() {
  const tracks = useProjectStore((state) => state.project.tracks);
  return (
    <section
      aria-label="Mixer"
      className="grid-session grid min-h-0 flex-1 gap-2 overflow-x-auto p-3 max-md:flex max-md:snap-x md:min-h-80"
      style={sessionGridStyle(tracks.length)}
    >
      {tracks.map((track) => (
        <MixerStrip key={track.id} track={track} />
      ))}
      <MasterStrip />
    </section>
  );
}
