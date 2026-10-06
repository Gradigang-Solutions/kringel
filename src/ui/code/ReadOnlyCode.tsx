import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { useEffect, useRef } from "react";
import type { LineStyle } from "@/ui/code/lineStyles";
import { setLineStyles, trackLineDecorations } from "@/ui/code/trackLineDecorations";
import { strudelDocsTooltip } from "@/ui/shared/codemirror/strudelDocsTooltip";
import { strudelLanguage } from "@/ui/shared/codemirror/strudelTheme";

export interface ReadOnlyCodeProps {
  readonly text: string;
  readonly styles: readonly LineStyle[];
  /** Ligne survolée (index à partir de 0), ou null quand le pointeur quitte le code. */
  readonly onLineHover: (index: number | null) => void;
  readonly onLineClick: (index: number) => void;
}

/** Index (à partir de 0) de la ligne à la hauteur du pointeur, même à droite de son texte ; null hors du document. */
function lineIndexAt(view: EditorView, event: PointerEvent): number | null {
  const height = event.clientY - view.documentTop;
  if (height < 0 || height > view.contentHeight) return null;
  return view.state.doc.lineAt(view.lineBlockAtHeight(height).from).number - 1;
}

/** Code généré en lecture seule (CodeMirror), mis à jour à chaque geste. */
export function ReadOnlyCode({ text, styles, onLineHover, onLineClick }: ReadOnlyCodeProps) {
  const container = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  // L'éditeur est créé une fois : ses gestionnaires lisent les derniers rappels via cette référence.
  const handlers = useRef({ onLineHover, onLineClick });
  useEffect(() => {
    handlers.current = { onLineHover, onLineClick };
  }, [onLineHover, onLineClick]);

  useEffect(() => {
    if (!container.current) return;
    const created = new EditorView({
      parent: container.current,
      state: EditorState.create({
        extensions: [
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
          lineNumbers(),
          strudelLanguage(),
          trackLineDecorations(),
          strudelDocsTooltip(),
          // Événements « pointer » : ils précèdent les événements « mouse », et un pointerenter sur un
          // contrôle de l'interface ne doit pas être effacé par le mouseleave tardif du code.
          EditorView.domEventHandlers({
            pointermove: (event, editor) =>
              handlers.current.onLineHover(lineIndexAt(editor, event)),
            pointerleave: () => handlers.current.onLineHover(null),
            click: (event, editor) => {
              const index = lineIndexAt(editor, event);
              if (index !== null) handlers.current.onLineClick(index);
            },
          }),
        ],
      }),
    });
    view.current = created;
    return () => {
      created.destroy();
      view.current = null;
    };
  }, []);

  useEffect(() => {
    const current = view.current;
    if (!current) return;
    const isSameText = current.state.doc.toString() === text;
    current.dispatch({
      changes: isSameText ? undefined : { from: 0, to: current.state.doc.length, insert: text },
      effects: setLineStyles.of(styles),
    });
  }, [text, styles]);

  return <div ref={container} className="h-full min-h-0 cursor-default text-body leading-5" />;
}
