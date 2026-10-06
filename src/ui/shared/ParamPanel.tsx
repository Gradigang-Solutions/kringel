import type { ReactNode } from "react";
import { TrackScope } from "@/ui/shared/TrackScope";

export interface ParamPanelProps {
  /** Couleur de la piste : le panneau s'ouvre hors de son conteneur et la repose. */
  readonly color: string;
  readonly title: string;
  readonly children: ReactNode;
}

/** Contenu d'un popover de réglages : titre à la couleur de la piste, puis les curseurs. */
export function ParamPanel({ color, title, children }: ParamPanelProps) {
  return (
    <TrackScope color={color} className="flex w-48 flex-col gap-3">
      <span className="text-caption font-semibold tracking-caps text-track uppercase">{title}</span>
      {children}
    </TrackScope>
  );
}
