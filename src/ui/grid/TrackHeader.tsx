import { Square } from "lucide-react";
import { IconButton } from "@/ui/primitives/IconButton";
import { TrackSwatch } from "@/ui/primitives/TrackSwatch";
import { TrackScope } from "@/ui/shared/TrackScope";

export interface TrackHeaderProps {
  readonly name: string;
  readonly color: string;
  /** Fonction principale du clip actif (« s() », « n() »…), null si la piste est vide. */
  readonly rootCall: string | null;
  readonly onStop: () => void;
}

export function TrackHeader({ name, color, rootCall, onStop }: TrackHeaderProps) {
  return (
    <TrackScope
      color={color}
      className="relative flex h-8 items-center gap-2 overflow-hidden rounded-6 bg-gray-195 pr-1 pl-2.5"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-track" />
      <TrackSwatch />
      <span className="truncate text-body font-semibold">{name}</span>
      {rootCall ? (
        <span className="font-mono text-caption text-fg-3 max-md:hidden">{rootCall}</span>
      ) : null}
      <span className="flex-1" />
      <IconButton label={`Stop ${name}`} variant="ghost" size="sm" onClick={onStop}>
        <Square size={8} fill="currentColor" strokeWidth={0} aria-hidden />
      </IconButton>
    </TrackScope>
  );
}
