import { describe, expect, it } from "vitest";
import { concatSamples, encodeWav, toInt16 } from "@/lib/wav";

function ascii(view: DataView, offset: number, length: number): string {
  return String.fromCharCode(
    ...Array.from({ length }, (_, index) => view.getUint8(offset + index)),
  );
}

describe("encodeWav", () => {
  const left = new Float32Array([0, 0.5, -1]);
  const right = new Float32Array([1, -0.5, 0]);
  const view = new DataView(encodeWav([left, right], 48000));

  it("écrit un en-tête RIFF PCM 16 bits stéréo", () => {
    expect(ascii(view, 0, 4)).toBe("RIFF");
    expect(ascii(view, 8, 4)).toBe("WAVE");
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(24, true)).toBe(48000);
    expect(view.getUint32(28, true)).toBe(48000 * 4);
    expect(view.getUint16(34, true)).toBe(16);
    expect(ascii(view, 36, 4)).toBe("data");
  });

  it("donne les tailles du fichier et des données", () => {
    expect(view.byteLength).toBe(44 + 3 * 2 * 2);
    expect(view.getUint32(4, true)).toBe(36 + 12);
    expect(view.getUint32(40, true)).toBe(12);
  });

  it("entrelace les canaux, trame par trame", () => {
    const samples = Array.from({ length: 6 }, (_, index) => view.getInt16(44 + index * 2, true));
    expect(samples).toEqual([0, 32767, 16384, -16384, -32768, 0]);
  });
});

describe("toInt16", () => {
  it("écrête au-delà de ±1", () => {
    expect(toInt16(1.5)).toBe(32767);
    expect(toInt16(-2)).toBe(-32768);
  });
});

describe("concatSamples", () => {
  it("recolle les blocs dans l'ordre", () => {
    const joined = concatSamples([new Float32Array([1, 2]), new Float32Array([3])]);
    expect(Array.from(joined)).toEqual([1, 2, 3]);
  });
});
