import { Play } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Les attributs HTML supplémentaires viennent du déclencheur du menu contextuel (Radix asChild). */
export interface SceneLaunchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly name: string;
  readonly number: number;
  readonly isActive: boolean;
  readonly isDisabled: boolean;
  readonly isCompact: boolean;
  readonly onLaunch: () => void;
}

export function SceneLaunchButton({
  name,
  number,
  isActive,
  isDisabled,
  isCompact,
  onLaunch,
  ...triggerProps
}: SceneLaunchButtonProps) {
  return (
    <button
      {...triggerProps}
      type="button"
      aria-label={`Launch scene ${name}`}
      onClick={onLaunch}
      className={cn(
        "flex items-center gap-2.25 rounded-6 border bg-gray-185 px-2.5 text-left hover:bg-gray-205",
        isCompact ? "h-9.5" : "h-18",
        isActive ? "border-gray-450" : "border-gray-235",
      )}
    >
      <Play
        size={10}
        fill="currentColor"
        strokeWidth={0}
        aria-hidden
        className={cn(
          "shrink-0",
          isDisabled ? "text-gray-330" : isActive ? "text-fg-1" : "text-fg-2",
        )}
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn("truncate text-small font-medium", isDisabled ? "text-fg-3" : "text-fg-1")}
        >
          {name}
        </span>
        {isCompact ? null : <span className="font-mono text-tiny text-fg-3">Scene {number}</span>}
      </span>
    </button>
  );
}
