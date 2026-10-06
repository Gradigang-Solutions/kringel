// Déclarations minimales des paquets Strudel (JavaScript non typé), limitées à ce qu'utilise le moteur.

declare module "@strudel/core" {
  export interface Fraction {
    valueOf(): number;
  }
  export interface TimeSpan {
    readonly begin: Fraction;
    readonly end: Fraction;
  }
  export interface Hap {
    readonly whole: TimeSpan | undefined;
    readonly part: TimeSpan;
    readonly value: unknown;
    hasOnset(): boolean;
  }
  export class Pattern {
    queryArc(begin: number, end: number): Hap[];
    filterHaps(test: (hap: Hap) => boolean): Pattern;
  }
  export interface Scheduler {
    readonly started: boolean;
    readonly cps: number;
    readonly lastEnd: number;
    now(): number;
  }
  export interface ReplOptions {
    readonly defaultOutput: unknown;
    readonly getTime: () => number;
    readonly transpiler: unknown;
    readonly editPattern?: (pattern: Pattern) => Pattern;
    readonly onEvalError?: (error: unknown) => void;
  }
  export interface Repl {
    readonly scheduler: Scheduler;
    evaluate(code: string, autostart?: boolean): Promise<Pattern | undefined>;
    start(): Promise<void>;
    stop(): void;
  }
  export function repl(options: ReplOptions): Repl;
  export function evalScope(...modules: Promise<unknown>[]): Promise<unknown[]>;
  export function evaluate(code: string, transpiler: unknown): Promise<{ pattern: unknown }>;
  export function stack(...patterns: Pattern[]): Pattern;
  export function isPattern(value: unknown): value is Pattern;
  export function valueToMidi(value: object, fallback?: number): number;
  export function code2hash(code: string): string;
  export function hash2code(hash: string): string;
}

declare module "@strudel/mini" {}
declare module "@strudel/tonal" {}

declare module "@strudel/transpiler" {
  export function transpiler(code: string, options?: object): { output: string };
}

declare module "@strudel/webaudio" {
  export const webaudioOutput: unknown;
  export function getAudioContext(): AudioContext;
  export function initAudio(options?: object): Promise<void>;
  export function registerSynthSounds(): Promise<void> | void;
  export function samples(source: string, baseUrl?: string, options?: object): Promise<void>;
  export function getSuperdoughAudioController(): {
    readonly output: { readonly destinationGain: AudioNode | null };
  };
}
