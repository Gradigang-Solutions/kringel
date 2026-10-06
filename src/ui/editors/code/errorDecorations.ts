import { StateEffect, StateField, type Extension } from "@codemirror/state";
import { Decoration, EditorView, WidgetType, type DecorationSet } from "@codemirror/view";
import type { CodeError } from "@/model/playback";

class ErrorTagWidget extends WidgetType {
  constructor(private readonly message: string) {
    super();
  }

  override eq(other: ErrorTagWidget): boolean {
    return other.message === this.message;
  }

  toDOM(): HTMLElement {
    const element = document.createElement("span");
    element.className = "cm-error-tag";
    element.textContent = this.message;
    return element;
  }
}

export const setCodeError = StateEffect.define<CodeError | null>();

function buildErrorDecorations(state: EditorView["state"], error: CodeError | null): DecorationSet {
  if (error === null || error.line < 1 || error.line > state.doc.lines) return Decoration.none;
  const line = state.doc.line(error.line);
  const from = Math.min(line.from + error.column, line.to);
  const ranges = [Decoration.line({ class: "cm-error-line" }).range(line.from)];
  if (from < line.to) ranges.push(Decoration.mark({ class: "cm-error-mark" }).range(from, line.to));
  ranges.push(
    Decoration.widget({ widget: new ErrorTagWidget(error.message), side: 1 }).range(line.to),
  );
  return Decoration.set(ranges, true);
}

const errorField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, transaction) {
    const effect = transaction.effects.find((candidate) => candidate.is(setCodeError));
    if (effect?.is(setCodeError)) return buildErrorDecorations(transaction.state, effect.value);
    return decorations.map(transaction.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});

const errorTheme = EditorView.theme({
  ".cm-error-line": { backgroundColor: "color-mix(in oklch, var(--color-error) 7%, transparent)" },
  ".cm-error-mark": {
    textDecoration: "underline wavy var(--color-error)",
    textUnderlineOffset: "4px",
  },
  ".cm-error-tag": {
    marginLeft: "14px",
    padding: "0 7px",
    borderRadius: "4px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-label)",
    fontWeight: "500",
    lineHeight: "20px",
    color: "var(--color-error-fg)",
    backgroundColor: "color-mix(in oklch, var(--color-error) 14%, transparent)",
  },
});

/** Ligne en erreur surlignée, soulignement ondulé et message en fin de ligne. */
export function errorDecorations(): Extension {
  return [errorField, errorTheme];
}
