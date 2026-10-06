import { describe, expect, it } from "vitest";
import { isShareHash, parseShareHash, shareHash } from "@/storage/shareLink";
import {
  makeCodeClip,
  makeNote,
  makeNotesClip,
  makeProject,
  makeStepsClip,
  withClip,
} from "@/test/builders";

const project = withClip(
  withClip(
    withClip(makeProject({ name: "Café · Nuit" }), 0, 0, makeStepsClip()),
    1,
    1,
    makeNotesClip({ notes: [makeNote(36, 0, 4)] }),
  ),
  3,
  2,
  makeCodeClip(),
);

describe("lien de partage", () => {
  it("redonne un projet identique", async () => {
    const hash = await shareHash(project);
    expect(isShareHash(hash)).toBe(true);
    expect(hash).toMatch(/^#project=[A-Za-z0-9_-]+$/);
    expect(await parseShareHash(hash)).toEqual({ isOk: true, project });
  });

  it("refuse un lien tronqué ou modifié", async () => {
    const hash = await shareHash(project);
    const broken = { isOk: false, error: "This share link is broken." };
    expect(await parseShareHash(hash.slice(0, hash.length / 2))).toEqual(broken);
    expect(await parseShareHash("#project=pas+valide")).toEqual(broken);
    expect(await parseShareHash("#autre=1")).toEqual(broken);
  });
});
