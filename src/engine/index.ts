import { repl, stack, type Hap, type Pattern, type Repl } from "@strudel/core";
import { transpiler } from "@strudel/transpiler";
import { getAudioContext, initAudio, webaudioOutput } from "@strudel/webaudio";
import { loadSounds } from "@/engine/samples";
import { ensureScope } from "@/engine/scope";

export { checkSource, previewNotes } from "@/engine/check";
export { readMasterLevels } from "@/engine/meter";
export type { PreviewNote, StereoLevels } from "@/engine/types";

export interface CodeUpdate {
  /** Cycle à partir duquel le nouveau code joue ; null si rien ne joue encore. */
  readonly appliesAtCycle: number | null;
  readonly error: string | null;
}

interface PendingSwitch {
  readonly boundary: number;
  readonly before: Pattern;
}

const MS_PER_SECOND = 1000;
const MIN_WAIT_MS = 10;

let ready: Promise<Repl> | null = null;
let instance: Repl | null = null;
let evaluatedCode: string | null = null;
let activePattern: Pattern | null = null;
let pendingSwitch: PendingSwitch | null = null;
let lastEvalError: string | null = null;

function hapBegin(hap: Hap): number {
  return (hap.whole ?? hap.part).begin.valueOf();
}

/**
 * Lancement quantifié : l'ancien motif joue jusqu'au prochain début de cycle encore non programmé,
 * le nouveau prend le relais exactement à ce cycle.
 */
function switchAtNextCycle(next: Pattern): Pattern {
  const scheduler = instance?.scheduler;
  if (!scheduler?.started || activePattern === null) {
    activePattern = next;
    pendingSwitch = null;
    return next;
  }
  const boundary = Math.ceil(scheduler.lastEnd);
  const isPendingAhead = pendingSwitch !== null && pendingSwitch.boundary > scheduler.lastEnd;
  const before = isPendingAhead && pendingSwitch ? pendingSwitch.before : activePattern;
  pendingSwitch = { boundary, before };
  activePattern = next;
  return stack(
    before.filterHaps((hap) => hapBegin(hap) < boundary),
    next.filterHaps((hap) => hapBegin(hap) >= boundary),
  );
}

async function createRepl(): Promise<Repl> {
  await ensureScope();
  const context = getAudioContext();
  const created = repl({
    defaultOutput: webaudioOutput,
    getTime: () => context.currentTime,
    transpiler,
    editPattern: switchAtNextCycle,
    onEvalError: (error) => {
      lastEvalError = error instanceof Error ? error.message : String(error);
    },
  });
  await Promise.all([initAudio(), loadSounds()]);
  return created;
}

/** À appeler depuis un geste de l'utilisateur : les navigateurs bloquent l'audio avant. */
export async function initEngine(): Promise<void> {
  ready ??= createRepl();
  instance = await ready;
  await getAudioContext().resume();
}

export function isEngineReady(): boolean {
  return instance !== null;
}

async function evaluate(engine: Repl, code: string, autostart: boolean): Promise<string | null> {
  lastEvalError = null;
  await engine.evaluate(code, autostart);
  evaluatedCode = code;
  return lastEvalError;
}

/** Réévalue le code seulement s'il a changé, pour éviter les coupures audio. */
export async function setCode(code: string): Promise<CodeUpdate> {
  if (instance === null || code === evaluatedCode) return { appliesAtCycle: null, error: null };
  const error = await evaluate(instance, code, false);
  const appliesAtCycle = instance.scheduler.started ? (pendingSwitch?.boundary ?? null) : null;
  return { appliesAtCycle, error };
}

export async function play(code: string): Promise<string | null> {
  await initEngine();
  if (instance === null) return "Audio engine unavailable";
  evaluatedCode = null;
  activePattern = null;
  return evaluate(instance, code, true);
}

export function stop(): void {
  instance?.stop();
  pendingSwitch = null;
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
