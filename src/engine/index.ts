import { repl, stack, type Hap, type Pattern, type Repl, type Scheduler } from "@strudel/core";
import { transpiler } from "@strudel/transpiler";
import { getAudioContext, initAudio, webaudioOutput } from "@strudel/webaudio";
import { evaluatePattern } from "@/engine/evaluatePattern";
import { loadSounds } from "@/engine/samples";
import { ensureScope } from "@/engine/scope";
import { clearSoundEvents, withSoundEvents } from "@/engine/soundEvents";

export { checkSource, previewNotes } from "@/engine/check";
export { readMasterLevels } from "@/engine/meter";
export {
  isRecording,
  MAX_RECORDING_SECONDS,
  startRecording,
  stopRecording,
  type RecordedAudio,
} from "@/engine/recorder";
export { strudelReplUrl } from "@/engine/replUrl";
export { drainSoundEvents } from "@/engine/soundEvents";
export { readMasterBands } from "@/engine/spectrum";
export type { PreviewNote, SoundEvent, SpectrumBands, StereoLevels } from "@/engine/types";

export interface CodeUpdate {
  /** Cycle à partir duquel le nouveau code joue ; null si rien ne joue encore. */
  readonly appliesAtCycle: number | null;
  readonly error: string | null;
}

/** Lancement en attente : ce qui joue déjà continue jusqu'à `boundary`, le nouveau code prend le relais. */
interface PendingSwitch {
  readonly boundary: number;
  readonly before: Pattern;
}

interface EvaluatedCode {
  readonly code: string;
  readonly playingCode: string;
}

const MS_PER_SECOND = 1000;
const MIN_WAIT_MS = 10;
const NO_UPDATE: CodeUpdate = { appliesAtCycle: null, error: null };

let ready: Promise<Repl> | null = null;
let instance: Repl | null = null;
let evaluated: EvaluatedCode | null = null;
let pendingSwitch: PendingSwitch | null = null;
let lastEvalError: string | null = null;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function hapBegin(hap: Hap): number {
  return (hap.whole ?? hap.part).begin.valueOf();
}

/** Appelé par Strudel à chaque évaluation : sans lancement en attente, le nouveau code joue tout de suite. */
function applyPendingSwitch(next: Pattern): Pattern {
  if (pendingSwitch === null) return next;
  const { boundary, before } = pendingSwitch;
  return stack(
    before.filterHaps((hap) => hapBegin(hap) < boundary),
    next.filterHaps((hap) => hapBegin(hap) >= boundary),
  );
}

async function createRepl(): Promise<Repl> {
  await ensureScope();
  const context = getAudioContext();
  const created = repl({
    defaultOutput: withSoundEvents(webaudioOutput),
    getTime: () => context.currentTime,
    transpiler,
    editPattern: applyPendingSwitch,
    onEvalError: (error) => {
      lastEvalError = errorMessage(error);
    },
  });
  await Promise.all([initAudio(), loadSounds()]);
  return created;
}

/** À appeler depuis un geste de l'utilisateur : les navigateurs bloquent l'audio avant. */
export async function initEngine(): Promise<void> {
  ready ??= createRepl().catch((error: unknown) => {
    // Sans cette remise à zéro, une seule panne réseau bloquerait l'audio jusqu'au rechargement.
    ready = null;
    throw error;
  });
  instance = await ready;
  await getAudioContext().resume();
}

export function isEngineReady(): boolean {
  return instance !== null;
}

async function evaluate(engine: Repl, code: string, autostart: boolean): Promise<string | null> {
  lastEvalError = null;
  await engine.evaluate(code, autostart);
  return lastEvalError;
}

/** La frontière est déjà programmée : le lancement s'entend, l'interface ne l'a juste pas encore validé. */
function isSwitchScheduled(scheduler: Scheduler): boolean {
  return pendingSwitch !== null && pendingSwitch.boundary <= scheduler.lastEnd;
}

/**
 * Lancement quantifié : tant que des clips attendent le cycle suivant, le code de ce qui joue déjà
 * (`playingCode`) continue jusqu'à la frontière. Renvoie une erreur d'évaluation éventuelle.
 */
async function planSwitch(
  scheduler: Scheduler,
  code: string,
  playingCode: string,
): Promise<string | null> {
  if (code === playingCode) {
    pendingSwitch = null;
    return null;
  }
  if (isSwitchScheduled(scheduler)) return null;
  const boundary = pendingSwitch?.boundary ?? Math.ceil(scheduler.lastEnd);
  try {
    pendingSwitch = { boundary, before: await evaluatePattern(playingCode) };
    return null;
  } catch (error) {
    // Sans le motif de ce qui joue, le lancement part tout de suite plutôt qu'au cycle suivant.
    pendingSwitch = null;
    return errorMessage(error);
  }
}

/**
 * Applique le code pendant la lecture. Les modifications jouent tout de suite ; les clips lancés
 * (présents dans `code` mais pas dans `playingCode`) attendent le cycle suivant.
 * Ne réévalue que si le code a changé, pour éviter les coupures audio.
 */
export async function setCode(code: string, playingCode: string): Promise<CodeUpdate> {
  if (instance === null || !instance.scheduler.started) return NO_UPDATE;
  if (code === evaluated?.code && playingCode === evaluated.playingCode) return NO_UPDATE;
  const isCodeUnchanged = code === evaluated?.code;
  const switchError = await planSwitch(instance.scheduler, code, playingCode);
  evaluated = { code, playingCode };
  // Lancement validé : le motif en cours joue déjà ce code depuis la frontière.
  if (isCodeUnchanged && pendingSwitch === null) {
    return { appliesAtCycle: null, error: switchError };
  }
  const error = await evaluate(instance, code, false);
  return { appliesAtCycle: pendingSwitch?.boundary ?? null, error: switchError ?? error };
}

export async function play(code: string): Promise<string | null> {
  await initEngine();
  if (instance === null) return "Audio engine unavailable";
  pendingSwitch = null;
  const error = await evaluate(instance, code, true);
  evaluated = { code, playingCode: code };
  return error;
}

export function stop(): void {
  instance?.stop();
  pendingSwitch = null;
  clearSoundEvents();
}

/** Position de lecture en cycles (0 à l'arrêt). */
export function getCyclePosition(): number {
  const scheduler = instance?.scheduler;
  if (!scheduler?.started) return 0;
  return Math.max(0, scheduler.now());
}

/** Résout quand la lecture atteint le cycle donné, ou tout de suite si elle s'arrête. */
export function waitForCycle(cycle: number): Promise<void> {
  return new Promise((resolve) => {
    const check = (): void => {
      const scheduler = instance?.scheduler;
      if (!scheduler?.started || scheduler.now() >= cycle) {
        resolve();
        return;
      }
      const remainingMs = ((cycle - scheduler.now()) / scheduler.cps) * MS_PER_SECOND;
      setTimeout(check, Math.max(MIN_WAIT_MS, remainingMs));
    };
    check();
  });
}
