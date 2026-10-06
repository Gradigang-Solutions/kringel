import { describe, expect, it } from "vitest";
import { docFor } from "@/ui/shared/codemirror/strudelDocs";

describe("docFor", () => {
  it("explique une fonction écrite par le générateur, avec son lien", () => {
    expect(docFor("lpf")).toMatchObject({
      name: "lpf()",
      url: "https://strudel.cc/learn/effects/#lpf",
    });
  });

  it("ignore les noms inconnus et les propriétés héritées des objets", () => {
    expect(docFor("unknownFunction")).toBeNull();
    expect(docFor("toString")).toBeNull();
  });
});
