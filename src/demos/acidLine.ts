import { codeClip, demoIds, demoProject, notesClip, stepsClip } from "@/demos/build";
import { roundTo } from "@/lib/math";
import { withFreshIds } from "@/model/clips";
import type { CodeClip } from "@/model/types";

const id = demoIds("demo-acid");
const KIT = "RolandTR909";
const TEXTURES = "KringelTextures";
const SWING = 0.08;
const C_MINOR = { root: 0, scale: "minor" } as const;
const STABS = { ...C_MINOR, sound: "supersaw", lpf: 2400, release: 0.1 } as const;

/** Le kick écrase la piste Rumble (orbite 2) à chaque coup : c'est le pompage du sidechain. */
const KICK = `s("bd*4").bank("RolandTR909")
  .duckorbit(2).duckattack(0.2).duckdepth(0.8)`;

const KICK_SKIP = `s("bd*4, ~ ~ ~ [~ bd?]").bank("RolandTR909")
  .duckorbit(2).duckattack(0.2).duckdepth(0.8)`;

const RUMBLE = `note("c1*16").s("sine")
  .decay(0.12).sustain(0.5)
  .orbit(2)`;

/** La ligne 303 : 16 doubles-croches, l'enveloppe du filtre fait claquer chaque note. */
const ACID_LINE = 'note("c2 c2 c3 c2 eb2 c2 bb2 c2 c2 g1 c2 c3 g2 c2 eb3 c2")';
const ACID_SPARSE = 'note("c2 ~ c3 ~ eb2 ~ ~ c2 ~ g1 ~ c3 ~ ~ eb3 ~")';
const ACID_VOICE = `.s("sawtooth")
  .decay(0.15).sustain(0.3)`;

function acid(name: string, line: string, filter: string): CodeClip {
  return codeClip(id, name, `${line}\n  ${ACID_VOICE}\n  ${filter}`);
}

/** Do mineur, la bémol, si bémol : trois accords de la gamme, sur des contretemps. */
const stabs = notesClip(id, "Stabs", { ...STABS, cycles: 2 }, [
  [60, 3, 1],
  [63, 3, 1],
  [67, 3, 1],
  [60, 6, 2, 0.7],
  [63, 6, 2, 0.7],
  [67, 6, 2, 0.7],
  [60, 11, 1, 0.8],
  [63, 11, 1, 0.8],
  [67, 11, 1, 0.8],
  [56, 19, 1],
  [60, 19, 1],
  [63, 19, 1],
  [56, 22, 2, 0.7],
  [60, 22, 2, 0.7],
  [63, 22, 2, 0.7],
  [58, 27, 1, 0.8],
  [62, 27, 1, 0.8],
  [65, 27, 1, 0.8],
  [58, 30, 2, 0.6],
  [62, 30, 2, 0.6],
  [65, 30, 2, 0.6],
]);

/** Accord de do mineur répété de plus en plus vite et de plus en plus fort. */
const RISER_STEPS = [2, 6, 10, 14, 16, 18, 20, 22, 24, 25, 26, 27, 28, 29, 30, 31];
const RISER_START_VELOCITY = 0.25;
const VELOCITY_DECIMALS = 2;
const riser = notesClip(
  id,
  "Riser",
  { ...STABS, cycles: 2 },
  RISER_STEPS.flatMap((step, index) => {
    const progress = index / (RISER_STEPS.length - 1);
    const velocity = roundTo(
      RISER_START_VELOCITY + (1 - RISER_START_VELOCITY) * progress,
      VELOCITY_DECIMALS,
    );
    return [60, 63, 67].map((pitch) => [pitch, step, 1, velocity] as const);
  }),
);

/** Cm9 sur deux cycles, puis la bémol majeur 7 : la seule respiration du morceau. */
const pad = notesClip(
  id,
  "Cm9 → Ab",
  { ...C_MINOR, sound: "supersaw", cycles: 4, attack: 1.5, release: 2.5, lpf: 1800 },
  [
    ...[48, 51, 55, 58, 62].map((pitch) => [pitch, 0, 32] as const),
    ...[44, 48, 51, 55, 60].map((pitch) => [pitch, 32, 32] as const),
  ],
);

const HATS_16 = "o?x+ o?x+ o?x+ o?x+";

export const acidLine = demoProject(id, "Acid line", 136, [
  {
    name: "Kick",
    clips: [
      codeClip(id, "Pump", KICK),
      codeClip(id, "Pump", KICK),
      codeClip(id, "Pump", KICK),
      null,
      codeClip(id, "Skip", KICK_SKIP),
      codeClip(id, "Pump", KICK),
    ],
  },
  {
    name: "Drums",
    mixer: { gain: 0.8, room: 0.1 },
    clips: [
      stepsClip(id, "Hats", KIT, { hh: "..x? ..x. ..x? ..xo" }, { swing: SWING }),
      stepsClip(id, "Groove", KIT, { cp: "....x.......x...", hh: HATS_16 }, { swing: SWING }),
      stepsClip(
        id,
        "Roll",
        KIT,
        {
          hh: `${HATS_16} ${HATS_16}`,
          sd: "o.o. o.o. +.+. +.+. ++++ ++++ 2222 3344",
          cp: "....x.......x... ................",
        },
        { cycles: 2, swing: SWING },
      ),
      stepsClip(id, "Ride", KIT, { rd: "x.+. x.+. x.+. x.+.", cp: "............?..." }),
      stepsClip(
        id,
        "Peak",
        KIT,
        {
          cr: "x............... ................",
          cp: "....x.......x... ....x.......x...",
          hh: "o?.+ o?.+ o?.+ o?.+ o?.+ o?.+ o?.+ 3?.+",
          oh: "..x. ..x. ..x. ..x. ..x. ..x. ..x. ..x.",
          rim: "...x ..x. .... ..x. ...x ..x. ..x. .x..",
        },
        { cycles: 2, swing: SWING },
      ),
      stepsClip(id, "Hats", KIT, { cp: "....x.......x...", hh: "..x? ..x. ..x? ..xo" }),
    ],
  },
  {
    name: "Acid",
    mixer: { distort: 1.5, gain: 0.55 },
    clips: [
      acid("Closed", ACID_LINE, ".lpf(400).lpq(14).lpenv(2).lpdecay(0.1)"),
      acid("Sweep", ACID_LINE, ".lpf(sine.range(400, 1600).slow(8)).lpq(14).lpenv(3).lpdecay(0.1)"),
      acid("Rise", ACID_LINE, ".lpf(saw.range(300, 3000).slow(4)).lpq(18).lpenv(4).lpdecay(0.12)"),
      acid(
        "Echo",
        ACID_SPARSE,
        ".lpf(sine.range(300, 900).slow(4)).lpq(20).lpenv(2)\n  .delay(0.5).delayfeedback(0.6)",
      ),
      acid(
        "Squelch",
        ACID_LINE,
        ".lpf(sine.range(800, 3500).slow(4)).lpq(16).lpenv(4).lpdecay(0.12)\n  .off(3/16, (x) => x.transpose(12).velocity(0.5))",
      ),
      acid("Closed", ACID_LINE, ".lpf(sine.range(300, 800).slow(8)).lpq(14).lpenv(2)"),
    ],
  },
  {
    name: "Rumble",
    mixer: { lpf: 250, distort: 0.8, gain: 0.9 },
    clips: [
      null,
      codeClip(id, "Sub", RUMBLE),
      codeClip(id, "Sub", RUMBLE),
      null,
      codeClip(id, "Sub", RUMBLE),
      null,
    ],
  },
  {
    name: "Stabs",
    mixer: { hpf: 300, delay: 0.35, room: 0.35, gain: 0.5 },
    clips: [null, null, riser, null, stabs, null],
  },
  {
    name: "Pad",
    mixer: { hpf: 150, room: 0.7, gain: 0.4 },
    clips: [null, null, null, pad, null, withFreshIds(pad, id)],
  },
  {
    name: "FX",
    mixer: { room: 0.5, gain: 0.6 },
    clips: [
      null,
      null,
      stepsClip(
        id,
        "Swoosh",
        TEXTURES,
        {
          swoosh: "................ x...............",
          glitch: "..........?..?.. ................",
        },
        { cycles: 2 },
      ),
      stepsClip(id, "Drone", TEXTURES, { drone: "x...............", glass: "........+......." }),
      stepsClip(id, "Glitch", TEXTURES, { glitch: "...?...?..?....?" }),
      null,
    ],
  },
]);
