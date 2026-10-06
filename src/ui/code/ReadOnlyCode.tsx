import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { useEffect, useRef } from "react";
import type { LineStyle } from "@/ui/code/lineStyles";
import { setLineStyles, trackLineDecorations } from "@/ui/code/trackLineDecorations";
import { strudelLanguage } from "@/ui/shared/codemirror/strudelTheme";

export interface ReadOnlyCodeProps {
  readonly text: string;
  readonly styles: readonly LineStyle[];
}

/** Code généré en lecture seule (CodeMirror), mis à jour à chaque geste. */
export function ReadOnlyCode({ text, styles }: ReadOnlyCodeProps) {
  const container = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);

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

  return <div ref={container} className="h-full min-h-0 text-body leading-5" />;
}
