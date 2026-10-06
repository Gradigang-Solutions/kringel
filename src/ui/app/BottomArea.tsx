import { useHasAnyClip } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { DemoProjects } from "@/ui/demos/DemoProjects";
import { EditorPanel } from "@/ui/editors/EditorPanel";
import { Mixer } from "@/ui/mixer/Mixer";

/** Sous la grille : l'éditeur du clip ouvert, sinon le mixer, ou les démos tant que le projet est vide. */
export function BottomArea() {
  const hasEditor = useUiStore((state) => state.editorClipId !== null);
  const hasAnyClip = useHasAnyClip();
  if (hasEditor) return <EditorPanel />;
  return hasAnyClip ? <Mixer /> : <DemoProjects />;
}
