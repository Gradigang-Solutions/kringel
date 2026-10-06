import { describe, expect, it } from "vitest";
import { base64UrlToBytes, bytesToBase64Url } from "@/lib/base64url";

describe("base64url", () => {
  it("encode sans caractère réservé des URL et redonne les mêmes octets", () => {
    const bytes = Uint8Array.from([251, 255, 191, 0, 62, 63]);
    const encoded = bytesToBase64Url(bytes);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(base64UrlToBytes(encoded)).toEqual(bytes);
  });

  it("gère les données plus longues qu'une tranche", () => {
    const bytes = Uint8Array.from({ length: 100_000 }, (_, index) => index % 256);
    expect(base64UrlToBytes(bytesToBase64Url(bytes))).toEqual(bytes);
  });

  it("refuse un texte qui n'est pas du base64url", () => {
    expect(base64UrlToBytes("abc+/")).toBeNull();
    expect(base64UrlToBytes("é")).toBeNull();
    expect(base64UrlToBytes("abcde")).toBeNull();
  });
});
