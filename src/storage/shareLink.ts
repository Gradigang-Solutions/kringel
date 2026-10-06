import { base64UrlToBytes, bytesToBase64Url } from "@/lib/base64url";
import type { Project } from "@/model/types";
import { parseProjectFile, projectEnvelope, type ImportResult } from "@/storage/exportImport";

/** Le projet voyage dans le fragment de l'URL (#project=…), qui n'est jamais envoyé au serveur. */
const SHARE_HASH_PREFIX = "#project=";
const COMPRESSION = "deflate-raw";
const BROKEN_LINK: ImportResult = { isOk: false, error: "This share link is broken." };

async function pipeBytes(
  bytes: Uint8Array,
  transform: TransformStream<BufferSource, Uint8Array>,
): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(bytes)]).stream().pipeThrough(transform);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Fragment d'URL contenant le projet compressé, à placer après l'adresse de l'app. */
export async function shareHash(project: Project): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(projectEnvelope(project)));
  const compressed = await pipeBytes(json, new CompressionStream(COMPRESSION));
  return `${SHARE_HASH_PREFIX}${bytesToBase64Url(compressed)}`;
}

export function isShareHash(hash: string): boolean {
  return hash.startsWith(SHARE_HASH_PREFIX);
}

async function decompress(data: string): Promise<string | null> {
  const bytes = base64UrlToBytes(data);
  if (bytes === null) return null;
  try {
    const json = await pipeBytes(bytes, new DecompressionStream(COMPRESSION));
    return new TextDecoder().decode(json);
  } catch {
    // Données tronquées ou modifiées : l'appelant signale un lien abîmé.
    return null;
  }
}

/** Lit le projet d'un fragment #project=…, validé comme un fichier importé. */
export async function parseShareHash(hash: string): Promise<ImportResult> {
  if (!isShareHash(hash)) return BROKEN_LINK;
  const text = await decompress(hash.slice(SHARE_HASH_PREFIX.length));
  return text === null ? BROKEN_LINK : parseProjectFile(text);
}
