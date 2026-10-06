import { cn } from "@/lib/cn";
import { tokenizeLine, type TokenKind } from "@/ui/shared/tokenize";

export const TOKEN_CLASSES: Readonly<Record<TokenKind, string>> = {
  comment: "text-fg-3 italic",
  string: "text-syntax-string",
  number: "text-syntax-number",
  call: "font-semibold text-fg-1",
  punctuation: "text-fg-3",
  plain: "text-fg-1",
};

export interface CodeSnippetProps {
  readonly code: string;
  readonly className?: string;
}

/** Extrait de code coloré sur une ligne (cartes de démarrage, démos). */
export function CodeSnippet({ code, className }: CodeSnippetProps) {
  return (
    <code className={cn("block overflow-hidden font-mono text-ellipsis whitespace-pre", className)}>
      {tokenizeLine(code).map((token, index) => (
        <span key={index} className={TOKEN_CLASSES[token.kind]}>
          {token.text}
        </span>
      ))}
    </code>
  );
}
