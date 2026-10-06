import type { ReactNode } from "react";

export interface EditorToolbarProps {
  readonly children: ReactNode;
}

/** Barre de réglages sous l'en-tête d'un éditeur ; passe à la ligne sur téléphone. */
export function EditorToolbar({ children }: EditorToolbarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-5.5 border-b border-gray-225 px-4 max-md:h-auto max-md:flex-wrap max-md:gap-x-4 max-md:gap-y-2 max-md:py-2">
      {children}
    </div>
  );
}
