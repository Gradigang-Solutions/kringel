import { getAudioContext } from "@strudel/webaudio";
import { masterOutput } from "@/engine/masterTap";
import { concatSamples } from "@/lib/wav";

/** Audio capturé sur la sortie master, un tableau d'échantillons par canal. */
export interface RecordedAudio {
  readonly channels: readonly Float32Array[];
  readonly sampleRate: number;
}

const PROCESSOR_NAME = "kringel-recorder";
const CHANNEL_COUNT = 2;
/** Cinq minutes en stéréo flottante tiennent dans environ 115 Mo : au-delà, l'enregistrement s'arrête. */
export const MAX_RECORDING_SECONDS = 300;

/** Processeur du thread audio : recopie chaque bloc reçu vers le thread principal. */
const PROCESSOR_SOURCE = `
class KringelRecorder extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) this.port.postMessage(input.map((channel) => channel.slice(0)));
    return true;
  }
}
registerProcessor("${PROCESSOR_NAME}", KringelRecorder);
`;

interface Session {
  readonly node: AudioWorkletNode;
  readonly sink: GainNode;
  readonly source: AudioNode;
  readonly chunks: Float32Array[][];
  frameCount: number;
}

let moduleLoaded: Promise<void> | null = null;
let session: Session | null = null;

function loadProcessor(context: AudioContext): Promise<void> {
  moduleLoaded ??= (() => {
    const url = URL.createObjectURL(new Blob([PROCESSOR_SOURCE], { type: "text/javascript" }));
    return context.audioWorklet.addModule(url).finally(() => {
      URL.revokeObjectURL(url);
    });
  })();
  return moduleLoaded;
}

function isChannelBlock(data: unknown): data is Float32Array[] {
  return Array.isArray(data) && data.every((channel) => channel instanceof Float32Array);
}

/**
 * Commence à capturer la sortie master. `onLimitReached` est appelé une fois la durée maximale
 * atteinte : l'appelant arrête alors l'enregistrement.
 */
export async function startRecording(onLimitReached: () => void): Promise<void> {
  if (session !== null) return;
  const context = getAudioContext();
  const source = masterOutput();
  if (source === null) throw new Error("Audio output not ready");
  await loadProcessor(context);
  const node = new AudioWorkletNode(context, PROCESSOR_NAME, {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    channelCount: CHANNEL_COUNT,
    channelCountMode: "explicit",
  });
  // Un nœud relié à la destination est traité à coup sûr ; le gain nul le rend muet.
  const sink = new GainNode(context, { gain: 0 });
  const current: Session = { node, sink, source, chunks: [], frameCount: 0 };
  const maxFrames = MAX_RECORDING_SECONDS * context.sampleRate;
  node.port.onmessage = (event: MessageEvent<unknown>) => {
    if (!isChannelBlock(event.data) || current.frameCount >= maxFrames) return;
    current.chunks.push(event.data);
    current.frameCount += event.data[0]?.length ?? 0;
    if (current.frameCount >= maxFrames) onLimitReached();
  };
  source.connect(node);
  node.connect(sink);
  sink.connect(context.destination);
  session = current;
}

export function isRecording(): boolean {
  return session !== null;
}

/** Arrête la capture et rend l'audio enregistré ; null si rien n'était enregistré. */
export function stopRecording(): RecordedAudio | null {
  const current = session;
  if (current === null) return null;
  session = null;
  current.node.port.onmessage = null;
  current.source.disconnect(current.node);
  current.node.disconnect();
  current.sink.disconnect();
  const channels = Array.from({ length: CHANNEL_COUNT }, (_, index) =>
    concatSamples(
      current.chunks.map((block) => block[index] ?? new Float32Array(block[0]?.length ?? 0)),
    ),
  );
  return { channels, sampleRate: getAudioContext().sampleRate };
}
