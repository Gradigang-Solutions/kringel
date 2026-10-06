import { useState } from "react";

const COPIED_FEEDBACK_MS = 1500;
const TEXT_MIME = "text/plain";

/**
 * Safari exige que l'écriture dans le presse-papiers démarre pendant le clic : un texte calculé
 * de façon asynchrone passe par un ClipboardItem qui attend la promesse.
 */
async function writeToClipboard(text: string | Promise<string>): Promise<void> {
  if (typeof text === "string") {
    await navigator.clipboard.writeText(text);
    return;
  }
  const blob = text.then((value) => new Blob([value], { type: TEXT_MIME }));
  await navigator.clipboard.write([new ClipboardItem({ [TEXT_MIME]: blob })]);
}

export interface CopyToClipboard {
  /** Vrai pendant un court instant après une copie réussie, pour l'afficher sur le bouton. */
  readonly isCopied: boolean;
  /** Renvoie false si le navigateur a refusé la copie. */
  readonly copy: (text: string | Promise<string>) => Promise<boolean>;
}

export function useCopyToClipboard(): CopyToClipboard {
  const [isCopied, setIsCopied] = useState(false);
  const copy = async (text: string | Promise<string>) => {
    try {
      await writeToClipboard(text);
    } catch {
      // Copie refusée (permission, contexte non sécurisé) : l'appelant affiche le message adapté.
      return false;
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    return true;
  };
  return { isCopied, copy };
}
