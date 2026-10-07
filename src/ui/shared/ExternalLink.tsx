import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ExternalLinkProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/** Lien vers un autre site, ouvert dans un nouvel onglet. */
export function ExternalLink({ href, children, className }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("underline-offset-2 hover:underline", className)}
    >
      {children}
    </a>
  );
}
