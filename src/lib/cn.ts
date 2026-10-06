import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge doit connaître les tokens de theme.css : sans cela, il prend « text-body » (une taille)
 * pour une couleur et le fusionne avec « text-fg-1 ».
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "micro",
        "tiny",
        "caption",
        "label",
        "small",
        "body",
        "emphasis",
        "title",
        "brand",
        "heading",
        "value",
        "display",
      ],
      radius: ["1", "2", "3", "4", "5", "6", "7", "8", "12"],
      tracking: ["caps", "wide", "tag", "tight"],
      shadow: ["overlay"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
