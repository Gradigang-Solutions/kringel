import type { CSSProperties, HTMLAttributes } from "react";

export type TrackScopeProps = HTMLAttributes<HTMLDivElement> & {
  /** Couleur de la piste, lue dans le modèle. */
  readonly color: string;
};

/** Pose la couleur de piste une seule fois ; les enfants la lisent via les classes « track ». */
export function TrackScope({ color, style, ...props }: TrackScopeProps) {
  const scopedStyle: CSSProperties & Record<"--track-color", string> = {
    ...style,
    "--track-color": color,
  };
  return <div style={scopedStyle} {...props} />;
}
