import { gcd } from "@/lib/math";

/** Un évènement de mini-notation, en pas depuis le début du cycle. */
export interface MiniEvent {
  readonly start: number;
  readonly duration: number;
  readonly token: string;
}

export interface MiniOptions {
  /** Les sons de batterie n'ont pas de durée : chaque coup occupe une case de la grille réduite. */
  readonly ignoreDurations: boolean;
}

const REST = "~";
/** Au-delà de ce nombre de silences consécutifs, on écrit « ~@n » plutôt que « ~ ~ ~ ~ ~ ». */
const MAX_REPEATED_RESTS = 4;

interface Slot {
  readonly token: string;
  readonly weight: number;
}

/** Plus grande unité de temps qui tombe juste sur tous les débuts (et fins) d'évènements. */
function gridUnit(events: readonly MiniEvent[], length: number, options: MiniOptions): number {
  const boundaries = events.flatMap((event) =>
    options.ignoreDurations ? [event.start] : [event.start, event.start + event.duration],
  );
  return boundaries.reduce((unit, boundary) => gcd(unit, boundary), length);
}

function toSlots(events: readonly MiniEvent[], length: number, options: MiniOptions): Slot[] {
  const unit = gridUnit(events, length, options);
  const slots: Slot[] = [];
  let position = 0;
  for (const event of [...events].sort((a, b) => a.start - b.start)) {
    pushRests(slots, (event.start - position) / unit);
    const weight = options.ignoreDurations ? 1 : event.duration / unit;
    slots.push({ token: event.token, weight });
    position = event.start + weight * unit;
  }
  pushRests(slots, (length - position) / unit);
  return slots;
}

function pushRests(slots: Slot[], count: number): void {
  if (count <= 0) return;
  if (count > MAX_REPEATED_RESTS) {
    slots.push({ token: REST, weight: count });
    return;
  }
  for (let index = 0; index < count; index += 1) slots.push({ token: REST, weight: 1 });
}

function renderSlot(slot: Slot): string {
  return slot.weight === 1 ? slot.token : `${slot.token}@${slot.weight}`;
}

/** Un jeton qui porte déjà un opérateur (« hh*2 », « hh?0.5 ») se lirait mal répété : « hh?0.5*4 ». */
function hasOperator(token: string): boolean {
  return token.includes("*") || token.includes("?");
}

/** « bd bd bd bd » devient « bd*4 ». */
function isRepetition(slots: readonly Slot[]): boolean {
  const [first] = slots;
  return (
    first !== undefined &&
    slots.length > 1 &&
    first.token !== REST &&
    !hasOperator(first.token) &&
    slots.every((slot) => slot.weight === 1 && slot.token === first.token)
  );
}

/** Une voix monophonique sur un cycle. */
export function voiceToMini(
  events: readonly MiniEvent[],
  length: number,
  options: MiniOptions,
): string {
  if (events.length === 0) return REST;
  const slots = toSlots(events, length, options);
  const [first] = slots;
  if (first && isRepetition(slots)) return `${first.token}*${slots.length}`;
  return slots.map(renderSlot).join(" ");
}

function needsBrackets(sequence: string): boolean {
  return sequence.includes(" ") || sequence.includes(",");
}

/** Un motif de plusieurs cycles : identique, il s'écrit une fois ; sinon « <cycle1 cycle2> ». */
export function alternateCycles(cycles: readonly string[]): string {
  const [first] = cycles;
  if (first === undefined) return REST;
  if (cycles.every((cycle) => cycle === first)) return first;
  const elements = cycles.map((cycle) => (needsBrackets(cycle) ? `[${cycle}]` : cycle));
  return `<${elements.join(" ")}>`;
}

/** Évènements d'un cycle donné, ramenés au début de ce cycle et coupés à sa fin. */
export function eventsInCycle<T extends { readonly start: number; readonly duration: number }>(
  events: readonly T[],
  cycle: number,
  cycleLength: number,
): T[] {
  const cycleStart = cycle * cycleLength;
  return events
    .filter((event) => event.start >= cycleStart && event.start < cycleStart + cycleLength)
    .map((event) => ({
      ...event,
      start: event.start - cycleStart,
      duration: Math.min(event.duration, cycleStart + cycleLength - event.start),
    }));
}
