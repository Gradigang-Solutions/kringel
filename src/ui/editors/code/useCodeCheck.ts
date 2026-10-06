import { useCallback, useEffect, useRef } from "react";
import { checkSource } from "@/engine";
import { recordCodeCheck } from "@/store/actions/code";
import { useUiStore } from "@/store/uiStore";

const CHECK_DELAY_MS = 400;

/**
 * Vérifie la source d'un clip de code : après une pause de frappe si « Run as I type » est actif,
 * ou à la demande. Seul le résultat de la dernière vérification lancée est retenu.
 */
export function useCodeCheck(clipId: string, source: string): () => void {
  const isRunAsYouType = useUiStore((state) => state.isRunAsYouType);
  const latestRun = useRef(0);

  const run = useCallback(
    (sourceToCheck: string) => {
      latestRun.current += 1;
      const runId = latestRun.current;
      void checkSource(sourceToCheck).then((error) => {
        if (runId === latestRun.current) recordCodeCheck(clipId, sourceToCheck, error);
      });
    },
    [clipId],
  );

  useEffect(() => {
    if (!isRunAsYouType) return;
    const timer = setTimeout(() => run(source), CHECK_DELAY_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [source, isRunAsYouType, run]);

  return () => run(source);
}
