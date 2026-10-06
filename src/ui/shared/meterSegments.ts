export const METER_SEGMENT_COUNT = 22;
/** Seuils de couleur des segments, comme dans la maquette : jaune à partir du 16e, rouge à partir du 20e. */
const WARN_SEGMENT = 15;
const CLIP_SEGMENT = 19;

export type SegmentTone = "off" | "normal" | "warn" | "clip";

export function segmentTone(index: number, level: number): SegmentTone {
  if (index >= Math.round(level * METER_SEGMENT_COUNT)) return "off";
  if (index >= CLIP_SEGMENT) return "clip";
  return index >= WARN_SEGMENT ? "warn" : "normal";
}
