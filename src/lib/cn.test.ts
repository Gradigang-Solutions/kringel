import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("garde la taille et la couleur du texte, qui ne sont pas en conflit", () => {
    expect(cn("text-fg-inverse", "text-body")).toBe("text-fg-inverse text-body");
  });

  it("remplace une classe en conflit par la dernière", () => {
    expect(cn("text-small", "text-body")).toBe("text-body");
    expect(cn("rounded-4", "rounded-6")).toBe("rounded-6");
  });
});
