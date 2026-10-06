import { codeClip, demoIds, demoProject, notesClip, stepsClip, type NoteSpec } from "@/demos/build";
import { withFreshIds } from "@/model/clips";
import { STEPS_PER_BEAT } from "@/model/constants";
import type { CodeClip } from "@/model/types";

const id = demoIds("demo-warehouse");
const KIT = "RolandTR909";
const TEXTURES = "KringelTextures";
const F_MINOR = { root: 5, scale: "minor" } as const;

/** Le kick écrase la piste Pad (orbite 2) à chaque coup : sans kick, au Break, le pad respire enfin. */
const KICK = `s("bd*4").bank("RolandTR909")
  .duckorbit(2).duckattack(0.15).duckdepth(0.7)`;

const F1 = 29;
const F2 = 41;
const AB1 = 32;
const G1 = 31;
const ROLL_GHOST = 0.7;
const ROLL_PUSH = 0.85;

/**
 * Basse roulante : trois doubles-croches après chaque kick. Elle se glisse entre les coups au lieu
 * d'être compressée par eux, d'où ce grondement continu propre à la techno.
 */
function rollingBeat(
  beat: number,
  [first, second, third]: readonly [number, number, number],
): NoteSpec[] {
  const start = beat * STEPS_PER_BEAT;
  return [
    [first, start + 1, 1],
    [second, start + 2, 1, ROLL_GHOST],
    [third, start + 3, 1, ROLL_PUSH],
  ];
}

const BASS = { ...F_MINOR, sound: "sawtooth" } as const;
const ROOT_BEAT = [F1, F1, F1] as const;
/** Un temps sur deux, la note du milieu saute à l'octave : la basse rebondit. */
const BOUNCE_BEAT = [F1, F2, F1] as const;

const roll = notesClip(
  id,
  "Roll",
  BASS,
  [0, 1, 2, 3].flatMap((beat) => rollingBeat(beat, ROOT_BEAT)),
);

/** Huit temps qui rebondissent, et le dernier descend vers la bémol puis sol pour relancer la boucle. */
const drive = notesClip(id, "Drive", { ...BASS, cycles: 2 }, [
  ...[0, 1, 2, 3, 4, 5, 6].flatMap((beat) =>
    rollingBeat(beat, beat % 2 === 0 ? ROOT_BEAT : BOUNCE_BEAT),
  ),
  ...rollingBeat(7, [AB1, AB1, G1]),
]);

/** Accord de fa mineur 7 frappé en 3 + 3 + 4 + 3 + 3 : le rythme bancal qui hypnotise. */
const FM7 = "[f3,ab3,c4,eb4]";
const DROP_CHORDS = `<${FM7} ${FM7} [db3,f3,ab3,c4] [eb3,g3,bb3,db4]>`;
const STAB_RHYTHM = "x ~ ~ x ~ ~ x ~ ~ ~ x ~ ~ x ~ ~";
const STAB_ECHO_RHYTHM = "x ~ ~ ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~";
const STAB_VOICE = `.s("sawtooth").decay(0.15).sustain(0)`;

function stab(name: string, chords: string, rhythm: string, filter: string): CodeClip {
  return codeClip(id, name, `note("${chords}").struct("${rhythm}")\n  ${STAB_VOICE}\n  ${filter}`);
}

/** Le riff du drop, tout en haut : une question sur do, une réponse qui grimpe jusqu'au mi bémol. */
const ANTHEM: readonly NoteSpec[] = [
  [77, 0, 2],
  [77, 3, 1, 0.7],
  [80, 6, 2],
  [84, 8, 3],
  [82, 11, 1, 0.7],
  [80, 12, 2],
  [79, 14, 2, 0.8],
  [77, 16, 2],
  [77, 19, 1, 0.7],
  [80, 22, 2],
  [87, 24, 3],
  [84, 27, 1, 0.7],
  [82, 28, 2],
  [84, 30, 2, 0.8],
];
const LEAD = { ...F_MINOR, sound: "supersaw", cycles: 2, release: 0.1 } as const;
/** Au Lift, le même riff étouffé : on l'entend arriver sans qu'il éclate encore. */
const TEASE_CUTOFF = 900;

/** Fa mineur 9 tenu deux cycles, puis ré bémol et mi bémol pour remonter vers la tonique. */
const PAD = `chord("<Fm9 Fm9 DbM7 Eb>").voicing()
  .s("supersaw").attack(1).release(2).lpf(1600)
  .orbit(2)`;

const HATS_16 = "o+.+ o+.+ o+.+ o+.?";
const OPEN_HATS = "..x. ..x. ..x. ..x.";
const CLAPS = "....x.......x...";
/** Rim tous les trois pas contre le kick tous les quatre : la boucle semble tourner sur elle-même. */
const RIMS = "x..+..x..+..x..o";

const hats = stepsClip(id, "Hats", KIT, { hh: "..x. ..x. ..x. ..xo" });
const tribal = stepsClip(id, "Tribal", KIT, {
  rim: RIMS,
  lt: "......o.......?.",
  mt: "..o.......?.....",
});

export const warehouse = demoProject(id, "Warehouse", 132, [
  {
    name: "Kick",
    mixer: { distort: 1 },
    clips: [
      codeClip(id, "Pump", KICK),
      codeClip(id, "Pump", KICK),
      codeClip(id, "Pump", KICK),
      null,
      codeClip(id, "Pump", KICK),
      codeClip(id, "Pump", KICK),
    ],
  },
  {
    name: "Bass",
    mixer: { lpf: 900, distort: 1, gain: 0.75 },
    clips: [null, roll, withFreshIds(roll, id), null, drive, withFreshIds(roll, id)],
  },
  {
    name: "Drums",
    mixer: { room: 0.1, gain: 0.75 },
    clips: [
      hats,
      stepsClip(id, "Groove", KIT, { cp: CLAPS, hh: HATS_16, oh: OPEN_HATS }),
      stepsClip(
        id,
        "Roll",
        KIT,
        {
          hh: HATS_16.repeat(4),
          cp: `${CLAPS.repeat(2)}${".".repeat(32)}`,
          // Caisse claire en crescendo : noires, croches, doubles-croches, puis coups répétés.
          sd: "o... o... o... o... o.o. o.o. +.+. +.+. ++++ ++++ xxxx xxxx 2222 3333 4444 4444",
        },
        { cycles: 4 },
      ),
      stepsClip(id, "Ride", KIT, { rd: "+... +... +... +.o.", hh: "..o. ..o. ..o. ..o." }),
      stepsClip(
        id,
        "Peak",
        KIT,
        {
          cr: "x............... ................",
          cp: `${CLAPS} ....x.......x.2.`,
          hh: HATS_16.repeat(2),
          oh: OPEN_HATS.repeat(2),
          sd: "...o .... ..o. ...o ...o .... ..o. ..oo",
        },
        { cycles: 2 },
      ),
      stepsClip(id, "Hats", KIT, { cp: CLAPS, hh: "..x. ..x. ..x. ..xo" }),
    ],
  },
  {
    name: "Perc",
    mixer: { delay: 0.25, pan: 0.65, gain: 0.6 },
    clips: [
      stepsClip(id, "Rim", KIT, { rim: RIMS }),
      tribal,
      withFreshIds(tribal, id),
      null,
      withFreshIds(tribal, id),
      stepsClip(id, "Rim", KIT, { rim: RIMS }),
    ],
  },
  {
    name: "Stab",
    mixer: { hpf: 200, delay: 0.4, room: 0.3, gain: 0.5 },
    clips: [
      null,
      stab("Dub", FM7, STAB_RHYTHM, ".lpf(800).lpq(6)"),
      stab("Open", FM7, STAB_RHYTHM, ".lpf(saw.range(500, 4000).slow(4)).lpq(8)"),
      stab("Echo", FM7, STAB_ECHO_RHYTHM, ".lpf(sine.range(400, 1500).slow(8)).lpq(10)"),
      stab("Open", DROP_CHORDS, STAB_RHYTHM, ".lpf(sine.range(1500, 5000).slow(8)).lpq(6)"),
      null,
    ],
  },
  {
    name: "Lead",
    mixer: { hpf: 300, delay: 0.3, room: 0.4, gain: 0.45 },
    clips: [
      null,
      null,
      notesClip(id, "Tease", { ...LEAD, lpf: TEASE_CUTOFF }, ANTHEM),
      null,
      notesClip(id, "Anthem", LEAD, ANTHEM),
      null,
    ],
  },
  {
    name: "Pad",
    mixer: { hpf: 200, room: 0.6, gain: 0.4 },
    clips: [null, null, null, codeClip(id, "Swell", PAD), codeClip(id, "Pump", PAD), null],
  },
  {
    name: "FX",
    mixer: { room: 0.5, gain: 0.6 },
    clips: [
      stepsClip(id, "Drone", TEXTURES, { drone: "x...............", glass: "........?......." }),
      null,
      stepsClip(
        id,
        "Swoosh",
        TEXTURES,
        {
          swoosh: `${".".repeat(48)}x${".".repeat(15)}`,
          glitch: `${".".repeat(32)}..?...?...?..?.?${".".repeat(16)}`,
        },
        { cycles: 4 },
      ),
      stepsClip(id, "Space", TEXTURES, {
        drone: "x...............",
        choir: "........x.......",
        glass: "....+...........",
      }),
      stepsClip(id, "Glitch", TEXTURES, { glitch: "...?...?..?....?", robot: "............?..." }),
      null,
    ],
  },
]);
