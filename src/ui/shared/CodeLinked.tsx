import type { ReactNode } from "react";
import type { CodeControl } from "@/codegen/controls";
import { cn } from "@/lib/cn";
import { clearHighlight, highlightControls } from "@/store/actions/codeLinks";
import { useIsControlHighlighted } from "@/store/selectors";

export interface CodeLinkedProps {
  readonly trackId: string;
  /** Contrôles réglés ici : un seul curseur, ou tous ceux d'un panneau qu'ouvre un bouton. */
  readonly controls: readonly CodeControl[];
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Relie un contrôle à ses lignes de code : le survoler (ou lui donner le focus) met les lignes en
 * évidence, et survoler une de ces lignes dans le panneau de code encadre le contrôle.
 */
export function CodeLinked({ trackId, controls, className, children }: CodeLinkedProps) {
  const isHighlighted = useIsControlHighlighted(trackId, controls);
  const highlight = () => highlightControls({ trackId, controls }, "interface");
  const clear = () => clearHighlight("interface");
  return (
    <div
      data-highlighted={isHighlighted || undefined}
      className={cn(
        "-m-1 rounded-6 p-1 ring-1 ring-transparent transition-shadow data-highlighted:ring-track",
        className,
      )}
      onPointerEnter={highlight}
      onPointerLeave={clear}
      onFocus={highlight}
      onBlur={clear}
    >
      {children}
    </div>
  );
}
