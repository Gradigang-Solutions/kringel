import { getAudioContext } from "@strudel/webaudio";
import { masterOutput } from "@/engine/masterTap";
import type { SpectrumBands } from "@/engine/types";

const FFT_SIZE = 1024;
/** Lissage propre à l'analyseur : les bandes bougent sans scintiller d'une image à l'autre. */
const SMOOTHING = 0.7;
const MAX_BYTE = 255;
/** Fréquences de coupure entre graves, médiums et aigus (Hz). */
const LOW_MID_HZ = 150;
const MID_HIGH_HZ = 2000;
const HIGH_LIMIT_HZ = 12000;
const SILENCE: SpectrumBands = { low: 0, mid: 0, high: 0 };

interface SpectrumTap {
  readonly source: AudioNode;
  readonly analyser: AnalyserNode;
  readonly buffer: Uint8Array<ArrayBuffer>;
}

let tap: SpectrumTap | null = null;

/** Branche un analyseur sur la sortie de Strudel, en parallèle du son ; rebranche si elle a changé. */
function ensureTap(): SpectrumTap | null {
  const source = masterOutput();
  if (source === null) return null;
  if (tap?.source === source) return tap;
  const analyser = getAudioContext().createAnalyser();
  analyser.fftSize = FFT_SIZE;
  analyser.smoothingTimeConstant = SMOOTHING;
  source.connect(analyser);
  tap = { source, analyser, buffer: new Uint8Array(analyser.frequencyBinCount) };
  return tap;
}

function bandLevel(buffer: Uint8Array, binHz: number, fromHz: number, toHz: number): number {
  const first = Math.max(1, Math.floor(fromHz / binHz));
  const last = Math.min(buffer.length, Math.ceil(toHz / binHz));
  if (last <= first) return 0;
  let sum = 0;
  for (let bin = first; bin < last; bin++) sum += buffer[bin] ?? 0;
  return sum / (last - first) / MAX_BYTE;
}

/** Énergie du master dans trois bandes (graves, médiums, aigus), entre 0 et 1. */
export function readMasterBands(): SpectrumBands {
  const current = ensureTap();
  if (current === null) return SILENCE;
  const { analyser, buffer } = current;
  analyser.getByteFrequencyData(buffer);
  const binHz = analyser.context.sampleRate / analyser.fftSize;
  return {
    low: bandLevel(buffer, binHz, 0, LOW_MID_HZ),
    mid: bandLevel(buffer, binHz, LOW_MID_HZ, MID_HIGH_HZ),
    high: bandLevel(buffer, binHz, MID_HIGH_HZ, HIGH_LIMIT_HZ),
  };
}
