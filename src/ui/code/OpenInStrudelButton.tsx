import { ExternalLink } from "lucide-react";
import { strudelReplUrl } from "@/engine";
import { getGeneratedCode } from "@/store/selectors";
import { Button } from "@/ui/primitives/Button";

/** Ouvre le code affiché dans le REPL de strudel.cc, pour continuer en code pur. */
export function OpenInStrudelButton() {
  const open = () => {
    window.open(strudelReplUrl(getGeneratedCode().text), "_blank", "noopener");
  };
  return (
    // Libellé court : l'en-tête du panneau de code est étroit.
    <Button
      variant="quiet"
      onClick={open}
      aria-label="Open in Strudel"
      title="Open in Strudel"
      className="gap-1.5"
    >
      Strudel
      <ExternalLink size={12} aria-hidden />
    </Button>
  );
}
