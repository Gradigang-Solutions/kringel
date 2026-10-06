/** Taille des tranches passées à String.fromCharCode, sous la limite d'arguments des moteurs JS. */
const CHUNK_SIZE = 0x8000;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]*$/;

/** Encode des octets en base64url (sans « + », « / » ni « = »), utilisable tel quel dans une URL. */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let start = 0; start < bytes.length; start += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(start, start + CHUNK_SIZE));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Décode du base64url ; null si le texte n'en est pas. */
export function base64UrlToBytes(text: string): Uint8Array | null {
  if (!BASE64URL_PATTERN.test(text) || text.length % 4 === 1) return null;
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
