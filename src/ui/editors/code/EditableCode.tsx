import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { useEffect, useRef } from "react";
import type { CodeError } from "@/model/playback";
import { errorDecorations, setCodeError } from "@/ui/editors/code/errorDecorations";
import { strudelLanguage } from "@/ui/shared/codemirror/strudelTheme";

export interface EditableCodeProps {
  readonly source: string;
  readonly error: CodeError | null;
  readonly onChange: (source: string) => void;
  readonly onRun: () => void;
}

/** Éditeur Strudel d'un clip de code (CodeMirror), avec ⌘↵ pour lancer. */
export function EditableCode({ source, error, onChange, onRun }: EditableCodeProps) {
  const container = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const handlers = useRef({ onChange, onRun });

  useEffect(() => {
    handlers.current = { onChange, onRun };
  });

  useEffect(() => {
    if (!container.current) return;
    const created = new EditorView({
      parent: container.current,
      state: EditorState.create({
        doc: source,
        extensions: [
          lineNumbers(),
          history(),
          keymap.of([
            { key: "Mod-Enter", run: () => (handlers.current.onRun(), true) },
            indentWithTab,
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          strudelLanguage(),
          errorDecorations(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) handlers.current.onChange(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = created;
    created.focus();
    return () => {
      created.destroy();
      view.current = null;
    };
    // L'éditeur est créé une fois par clip (le parent change de clé) ; il garde ensuite son propre état.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    view.current?.dispatch({ effects: setCodeError.of(error) });
  }, [error]);

  return (
    <div ref={container} aria-label="Code editor" className="h-full min-h-0 text-title leading-6" />
  );
}
