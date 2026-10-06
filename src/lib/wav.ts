const HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;
const BITS_PER_SAMPLE = 16;
const PCM_FORMAT = 1;
const FMT_CHUNK_BYTES = 16;
const MAX_INT16 = 0x7fff;
const MIN_INT16 = -0x8000;

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1)
    view.setUint8(offset + index, text.charCodeAt(index));
}

/** Échantillon flottant (-1 → 1) en entier 16 bits, écrêté au-delà de ±1. */
export function toInt16(sample: number): number {
  const clipped = Math.max(-1, Math.min(1, sample));
  return clipped < 0 ? Math.round(clipped * -MIN_INT16) : Math.round(clipped * MAX_INT16);
}

/** Fichier WAV PCM 16 bits, canaux entrelacés. Les canaux doivent avoir la même longueur. */
export function encodeWav(channels: readonly Float32Array[], sampleRate: number): ArrayBuffer {
  const channelCount = channels.length;
  const frameCount = channels[0]?.length ?? 0;
  const dataBytes = frameCount * channelCount * BYTES_PER_SAMPLE;
  const buffer = new ArrayBuffer(HEADER_BYTES + dataBytes);
  const view = new DataView(buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, HEADER_BYTES - 8 + dataBytes, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, FMT_CHUNK_BYTES, true);
  view.setUint16(20, PCM_FORMAT, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * BYTES_PER_SAMPLE, true);
  view.setUint16(32, channelCount * BYTES_PER_SAMPLE, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataBytes, true);
  let offset = HEADER_BYTES;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (const channel of channels) {
      view.setInt16(offset, toInt16(channel[frame] ?? 0), true);
      offset += BYTES_PER_SAMPLE;
    }
  }
  return buffer;
}

/** Recolle des blocs d'échantillons reçus au fil de l'enregistrement. */
export function concatSamples(chunks: readonly Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const joined = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.length;
  }
  return joined;
}
