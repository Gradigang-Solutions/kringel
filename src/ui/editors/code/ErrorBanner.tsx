import type { ErrorExplanation } from "@/model/codeErrors";

/** Explication de l'erreur en langage simple, sous l'éditeur. */
export function ErrorBanner({ explanation }: { readonly explanation: ErrorExplanation }) {
  return (
    <div
      role="alert"
      className="flex shrink-0 items-start gap-2.5 border-t border-error/35 bg-error/10 px-4 py-2.5"
    >
      <span aria-hidden className="mt-1 size-2 shrink-0 rounded-full bg-error" />
      <div className="flex min-w-0 flex-col gap-0.75">
        <span className="text-body font-semibold text-error-title">{explanation.title}</span>
        {explanation.detail ? (
          <span className="font-mono text-small leading-normal text-fg-2">
            {explanation.detail}
          </span>
        ) : null}
      </div>
    </div>
  );
}
