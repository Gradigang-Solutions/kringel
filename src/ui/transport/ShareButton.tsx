import { Check, Link } from "lucide-react";
import { showNotice } from "@/store/actions/project";
import { getProject } from "@/store/projectStore";
import { shareHash } from "@/storage/shareLink";
import { Button } from "@/ui/primitives/Button";
import { useCopyToClipboard } from "@/ui/shared/useCopyToClipboard";

async function shareUrl(): Promise<string> {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${await shareHash(getProject())}`;
}

/** Copie un lien qui contient tout le projet : l'ouvrir recrée le projet, sans serveur. */
export function ShareButton() {
  const { isCopied, copy } = useCopyToClipboard();
  const onClick = async () => {
    if (!(await copy(shareUrl()))) {
      showNotice("Couldn't copy the share link. Your browser blocked the clipboard.");
    }
  };
  const label = isCopied ? "Link copied" : "Share";
  return (
    <Button
      variant="primary"
      size="md"
      aria-label={label}
      onClick={() => void onClick()}
      className="gap-1.5 max-md:px-2.5"
    >
      {isCopied ? <Check size={13} aria-hidden /> : <Link size={13} aria-hidden />}
      <span className="max-md:hidden">{label}</span>
    </Button>
  );
}
