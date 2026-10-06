import { isSameTrackControls, type TrackControls } from "@/codegen/controls";
import { getUi, updateUi, type HighlightOrigin } from "@/store/uiStore";

/** Met en évidence des contrôles ; le survol du code appelle ceci à chaque mouvement du pointeur. */
export function highlightControls(highlighted: TrackControls, origin: HighlightOrigin): void {
  const current = getUi();
  if (
    current.highlightOrigin === origin &&
    isSameTrackControls(current.highlightedControls, highlighted)
  )
    return;
  updateUi({ highlightedControls: highlighted, highlightOrigin: origin });
}

/**
 * Efface la mise en évidence posée par ce côté seulement : en passant du code à un contrôle, le
 * pointeur peut entrer dans le contrôle avant que le code ne voie sa sortie.
 */
export function clearHighlight(origin: HighlightOrigin): void {
  const current = getUi();
  if (current.highlightedControls === null || current.highlightOrigin !== origin) return;
  updateUi({ highlightedControls: null, highlightOrigin: null });
}
