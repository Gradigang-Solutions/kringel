import { showNotice } from "@/store/actions/project";
import { Button } from "@/ui/primitives/Button";
import { useCopyToClipboard } from "@/ui/shared/useCopyToClipboard";

export interface CopyButtonProps {
  readonly text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const onClick = async () => {
    if (!(await copy(text))) {
      showNotice("Couldn't copy the code. Select it in the panel and copy it by hand.");
    }
  };
  return (
    <Button variant="quiet" onClick={() => void onClick()}>
      {isCopied ? "Copied" : "Copy"}
    </Button>
  );
}
