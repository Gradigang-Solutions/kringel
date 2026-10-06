import { syntaxTree } from "@codemirror/language";
import type { EditorState, Extension } from "@codemirror/state";
import { EditorView, hoverTooltip, type Tooltip } from "@codemirror/view";
import { docFor, MINI_NOTATION_DOC, type StrudelDoc } from "@/ui/shared/codemirror/strudelDocs";

type SyntaxNode = ReturnType<ReturnType<typeof syntaxTree>["resolveInner"]>;

/** Fonctions dont la chaîne en argument se lit en mini-notation. */
const MINI_NOTATION_CALLS: ReadonlySet<string> = new Set(["s", "sound", "n", "note", "velocity"]);

function textOf(state: EditorState, node: SyntaxNode): string {
  return state.sliceDoc(node.from, node.to);
}

/** Nom de la fonction appelée avec cette liste d'arguments : `s` pour `s("bd")`, `lpf` pour `.lpf(800)`. */
function calleeName(state: EditorState, argList: SyntaxNode): string | null {
  const callee = argList.parent?.firstChild;
  if (!callee) return null;
  if (callee.name === "VariableName") return textOf(state, callee);
  const property = callee.lastChild;
  return callee.name === "MemberExpression" && property?.name === "PropertyName"
    ? textOf(state, property)
    : null;
}

function docAtNode(state: EditorState, node: SyntaxNode): StrudelDoc | null {
  if (node.name === "VariableName" || node.name === "PropertyName")
    return docFor(textOf(state, node));
  if (node.name !== "String" || node.parent?.name !== "ArgList") return null;
  const callee = calleeName(state, node.parent);
  return callee !== null && MINI_NOTATION_CALLS.has(callee) ? MINI_NOTATION_DOC : null;
}

function renderDoc(doc: StrudelDoc): HTMLElement {
  const element = document.createElement("div");
  element.className = "cm-strudel-doc";
  const title = document.createElement("strong");
  title.textContent = doc.name;
  const summary = document.createElement("p");
  summary.textContent = doc.summary;
  const link = document.createElement("a");
  link.href = doc.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "strudel.cc docs ↗";
  element.append(title, summary, link);
  return element;
}

const docsTheme = EditorView.theme({
  ".cm-tooltip.cm-tooltip-hover": {
    backgroundColor: "var(--color-gray-195)",
    border: "1px solid var(--color-gray-280)",
    borderRadius: "6px",
    boxShadow: "var(--shadow-overlay)",
  },
  ".cm-strudel-doc": {
    maxWidth: "260px",
    padding: "8px 10px",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-small)",
    color: "var(--color-fg-2)",
  },
  ".cm-strudel-doc strong": { fontFamily: "var(--font-mono)", color: "var(--color-fg-1)" },
  ".cm-strudel-doc p": { margin: "4px 0 6px" },
  ".cm-strudel-doc a": { color: "var(--color-fg-1)", textDecoration: "underline" },
});

/** Au survol d'une fonction Strudel ou d'une chaîne de mini-notation, une explication et son lien. */
export function strudelDocsTooltip(): Extension {
  return [
    hoverTooltip((view, pos, side): Tooltip | null => {
      const node = syntaxTree(view.state).resolveInner(pos, side);
      const doc = docAtNode(view.state, node);
      if (doc === null) return null;
      return { pos: node.from, end: node.to, above: true, create: () => ({ dom: renderDoc(doc) }) };
    }),
    docsTheme,
  ];
}
