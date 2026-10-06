import { Button } from "@/ui/primitives/Button";
import { Dialog } from "@/ui/primitives/Dialog";
import { SAMPLE_PACKS } from "@/ui/transport/samplePacks";

export interface CreditsDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/** Origine et licence des sons joués par l'application. */
export function CreditsDialog({ isOpen, onClose }: CreditsDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      title="Sound credits"
      description="Where the sounds come from, and under which license."
      onClose={onClose}
      className="w-130"
    >
      <ul className="flex flex-col gap-3">
        {SAMPLE_PACKS.map((pack) => (
          <li key={pack.name} className="flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-3">
              <a
                href={pack.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emphasis font-medium underline-offset-2 hover:underline"
              >
                {pack.name}
              </a>
              <span className="shrink-0 font-mono text-caption text-fg-2">{pack.license}</span>
            </div>
            <span className="text-label text-fg-2">{pack.author}</span>
            <span className="text-label text-fg-3">{pack.note}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <Button variant="quiet" size="md" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}
