import type { Hap } from "@strudel/core";
import { getAudioContext } from "@strudel/webaudio";
import { hapPitch } from "@/engine/pitch";
import type { SoundEvent } from "@/engine/types";

/** Strudel programme les sons environ 100 ms à l'avance : quelques centaines suffisent largement. */
const MAX_PENDING_EVENTS = 256;

interface PendingEvent {
  readonly time: number;
  readonly event: SoundEvent;
}

type Output = (hap: Hap, deadline: number, duration: number, cps: number, time: number) => unknown;

let pending: PendingEvent[] = [];

function readNumber(value: object, key: string): number | null {
  const field: unknown = Reflect.get(value, key);
  return typeof field === "number" && Number.isFinite(field) ? field : null;
}

function readString(value: object, key: string): string | null {
  const field: unknown = Reflect.get(value, key);
  return typeof field === "string" ? field : null;
}

function toSoundEvent(value: unknown, duration: number): SoundEvent | null {
  if (typeof value !== "object" || value === null) return null;
  const power = (readNumber(value, "gain") ?? 1) * (readNumber(value, "velocity") ?? 1);
  return { sound: readString(value, "s") ?? "", midi: hapPitch(value), power, duration };
}

function record(hap: Hap, duration: number, time: number): void {
  const event = toSoundEvent(hap.value, duration);
  if (event === null) return;
  if (pending.length >= MAX_PENDING_EVENTS) pending.shift();
  pending.push({ time, event });
}

/** Enveloppe la sortie audio de Strudel pour noter chaque son, sans rien changer à ce qui est joué. */
export function withSoundEvents(output: Output): Output {
  return (hap, deadline, duration, cps, time) => {
    record(hap, duration, time);
    return output(hap, deadline, duration, cps, time);
  };
}

/** Sons dont l'heure de sortie est atteinte : un visuel les montre au moment où on les entend. */
export function drainSoundEvents(): readonly SoundEvent[] {
  if (pending.length === 0) return [];
  const now = getAudioContext().currentTime;
  const due = pending.filter((entry) => entry.time <= now);
  if (due.length === 0) return [];
  pending = pending.filter((entry) => entry.time > now);
  return due.map((entry) => entry.event);
}

export function clearSoundEvents(): void {
  pending = [];
}
