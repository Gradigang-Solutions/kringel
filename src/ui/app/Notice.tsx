import { X } from "lucide-react";
import { showNotice } from "@/store/actions/project";
import { useUiStore } from "@/store/uiStore";
import { IconButton } from "@/ui/primitives/IconButton";

/** Message d'erreur ou d'information non bloquant, en bas de l'écran (en haut sur téléphone, loin des onglets). */
export function Notice() {
  const notice = useUiStore((state) => state.notice);
  if (notice === null) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 flex max-w-150 -translate-x-1/2 items-center gap-3 rounded-8 border border-error/35 bg-gray-195 py-2 pr-2 pl-4 text-body text-error-title shadow-overlay max-md:inset-x-3 max-md:top-14 max-md:bottom-auto max-md:translate-x-0"
    >
      <span>{notice}</span>
      <IconButton label="Dismiss" size="sm" variant="ghost" onClick={() => showNotice(null)}>
        <X size={14} aria-hidden />
      </IconButton>
    </div>
  );
}
