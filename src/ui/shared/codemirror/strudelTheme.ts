import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

/** Coloration de la maquette : appels en gras, chaînes en jaune, nombres en cyan, commentaires en italique. */
const strudelHighlight = HighlightStyle.define([
  { tag: tags.comment, color: "var(--color-fg-3)", fontStyle: "italic" },
  { tag: tags.string, color: "var(--color-syntax-string)" },
  { tag: tags.number, color: "var(--color-syntax-number)" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], fontWeight: "600" },
  {
    tag: [
      tags.punctuation,
      tags.paren,
      tags.bracket,
      tags.separator,
      tags.derefOperator,
      tags.operator,
    ],
    color: "var(--color-fg-3)",
  },
]);

const baseTheme = EditorView.theme(
  {
    "&": { color: "var(--color-fg-1)", backgroundColor: "transparent", height: "100%" },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": { fontFamily: "var(--font-mono)", overflow: "auto" },
    ".cm-content": { padding: "10px 0", caretColor: "var(--color-fg-1)" },
    ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "var(--color-fg-4)" },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 0", minWidth: "26px" },
    ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "transparent" },
    ".cm-cursor": { borderLeftColor: "var(--color-fg-1)", borderLeftWidth: "2px" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "var(--color-gray-280)",
    },
  },
  { dark: true },
);

export function strudelLanguage(): Extension {
  return [javascript(), syntaxHighlighting(strudelHighlight), baseTheme];
}
