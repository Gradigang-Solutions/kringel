import { RangeSetBuilder, StateEffect, StateField, type Extension } from "@codemirror/state";
import { Decoration, EditorView, WidgetType, type DecorationSet } from "@codemirror/view";
import type { LineStyle, LineTag } from "@/ui/code/lineStyles";

class TagWidget extends WidgetType {
  constructor(private readonly tag: LineTag) {
    super();
  }

  override eq(other: TagWidget): boolean {
    return other.tag.text === this.tag.text && other.tag.tone === this.tag.tone;
  }

  toDOM(): HTMLElement {
    const element = document.createElement("span");
    element.textContent = this.tag.text;
    element.className = `cm-line-tag cm-line-tag-${this.tag.tone}`;
    return element;
  }
}

export const setLineStyles = StateEffect.define<readonly LineStyle[]>();

function buildDecorations(view: EditorView["state"], styles: readonly LineStyle[]): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const style of styles) {
    if (style.line > view.doc.lines) continue;
    const line = view.doc.line(style.line);
    const classes = [
      "cm-track-line",
      style.isSelected ? "cm-track-line-selected" : "",
      style.isDimmed ? "cm-track-line-dimmed" : "",
    ];
    builder.add(
      line.from,
      line.from,
      Decoration.line({
        class: classes.join(" ").trim(),
        attributes: { style: `--track-color: ${style.trackColor}` },
      }),
    );
    if (style.tag)
      builder.add(
        line.to,
        line.to,
        Decoration.widget({ widget: new TagWidget(style.tag), side: 1 }),
      );
  }
  return builder.finish();
}

const lineStyleField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, transaction) {
    const effect = transaction.effects.find((candidate) => candidate.is(setLineStyles));
    if (effect?.is(setLineStyles)) return buildDecorations(transaction.state, effect.value);
    return decorations.map(transaction.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});

const trackLineTheme = EditorView.theme({
  ".cm-line": { paddingLeft: "12px" },
  ".cm-track-line": {
    boxShadow: "inset 3px 0 0 color-mix(in oklch, var(--track-color) 45%, transparent)",
  },
  ".cm-track-line-selected": {
    boxShadow: "inset 3px 0 0 var(--track-color)",
    backgroundColor: "color-mix(in oklch, var(--track-color) 11%, transparent)",
  },
  ".cm-track-line-dimmed": { opacity: "0.42" },
  ".cm-line-tag": {
    marginLeft: "12px",
    padding: "0 5px",
    border: "1px solid currentColor",
    borderRadius: "3px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-micro)",
    fontWeight: "600",
    letterSpacing: "var(--tracking-tag)",
    lineHeight: "15px",
  },
  ".cm-line-tag-track": { color: "var(--track-color)" },
  ".cm-line-tag-error": { color: "var(--color-error-fg)" },
});

/** Marques de couleur de piste, surlignage du clip sélectionné et étiquettes d'état. */
export function trackLineDecorations(): Extension {
  return [lineStyleField, trackLineTheme];
}
