import { Button } from "@/ui/primitives/Button";
import { Dialog } from "@/ui/primitives/Dialog";
import { CREATOR_NAME, CREATOR_URL, LICENSE_NAME, SOURCE_URL } from "@/ui/shared/creator";
import { ExternalLink } from "@/ui/shared/ExternalLink";
import { SAMPLE_PACKS } from "@/ui/transport/samplePacks";

export interface AboutDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function MadeBy() {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-8 border border-gray-265 bg-gray-215 px-3 py-2.5">
      <span className="text-emphasis">
        Made by{" "}
        <ExternalLink href={CREATOR_URL} className="font-medium">
          {CREATOR_NAME}
        </ExternalLink>
      </span>
      <ExternalLink href={SOURCE_URL} className="shrink-0 font-mono text-caption text-fg-2">
        Source · {LICENSE_NAME}
      </ExternalLink>
    </div>
  );
}

function SoundCredits() {
  return (
    <section aria-label="Sound credits" className="flex flex-col gap-3">
      <h3 className="text-caption font-semibold tracking-caps text-fg-3 uppercase">
        Sound credits
      </h3>
      <ul className="flex flex-col gap-3">
        {SAMPLE_PACKS.map((pack) => (
          <li key={pack.name} className="flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-3">
              <ExternalLink href={pack.url} className="text-emphasis font-medium">
                {pack.name}
              </ExternalLink>
              <span className="shrink-0 font-mono text-caption text-fg-2">{pack.license}</span>
            </div>
            <span className="text-label text-fg-2">{pack.author}</span>
            <span className="text-label text-fg-3">{pack.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Auteur de l'application, lien vers le code source, origine et licence des sons joués. */
export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title="About Kringel"
      description="A clip launcher on top of Strudel that shows the code your clicks write."
      onClose={onClose}
      className="w-130"
    >
      <MadeBy />
      <SoundCredits />
      <div className="flex justify-end">
        <Button variant="quiet" size="md" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}
