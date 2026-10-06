import { cancelConversion, convertToCode } from "@/store/actions/clips";
import { useLocatedClip } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { ConfirmDialog } from "@/ui/primitives/ConfirmDialog";

/** Confirmation avant de convertir un clip en code : le retour en arrière n'est pas possible. */
export function ConvertToCodeDialog() {
  const pendingClipId = useUiStore((state) => state.pendingConversionClipId);
  const located = useLocatedClip(pendingClipId);
  return (
    <ConfirmDialog
      isOpen={located !== undefined}
      title={`Turn “${located?.clip.name ?? ""}” into code?`}
      description="The clip becomes a code clip with the Strudel code it writes today. You can then edit that code freely, but it can't go back to the grid editor."
      confirmLabel="Convert to code"
      onConfirm={() => {
        if (pendingClipId !== null) convertToCode(pendingClipId);
      }}
      onCancel={cancelConversion}
    />
  );
}
