import { getAudioContext } from "@strudel/webaudio";
import { masterOutput } from "@/engine/masterTap";
import type { StereoLevels } from "@/engine/types";

const FFT_SIZE = 1024;
const SILENCE: StereoLevels = { left: 0, right: 0 };

interface MeterTap {
  readonly source: AudioNode;
  readonly analysers: readonly [AnalyserNode, AnalyserNode];
  readonly buffer: Float32Array<ArrayBuffer>;
}

let tap: MeterTap | null = null;

/** Branche deux analyseurs (gauche, droite) sur la sortie de Strudel ; rebranche si la sortie a changé. */
function ensureTap(): MeterTap | null {
  const source = masterOutput();
  if (source === null) return null;
  if (tap?.source === source) return tap;
  const context = getAudioContext();
  const splitter = context.createChannelSplitter(2);
  const left = context.createAnalyser();
  const right = context.createAnalyser();
  left.fftSize = FFT_SIZE;
  right.fftSize = FFT_SIZE;
  source.connect(splitter);
  splitter.connect(left, 0);
  splitter.connect(right, 1);
  tap = { source, analysers: [left, right], buffer: new Float32Array(FFT_SIZE) };
  return tap;
}

function peak(analyser: AnalyserNode, buffer: Float32Array<ArrayBuffer>): number {
  analyser.getFloatTimeDomainData(buffer);
  return buffer.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0);
}

/** Crête de chaque canal du master, entre 0 et 1 (ou plus en cas de saturation). */
export function readMasterLevels(): StereoLevels {
  const current = ensureTap();
  if (current === null) return SILENCE;
  const [left, right] = current.analysers;
  return { left: peak(left, current.buffer), right: peak(right, current.buffer) };
}
