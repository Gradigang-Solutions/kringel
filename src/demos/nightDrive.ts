import { codeClip, demoIds, demoProject, notesClip, stepsClip, type NoteSpec } from "@/demos/build";
import { withFreshIds } from "@/model/clips";
import { BEATS_PER_CYCLE, STEPS_PER_BEAT, STEPS_PER_CYCLE } from "@/model/constants";

const id = demoIds("demo-synthwave");
const KIT = "LinnDrum";
const TEXTURES = "KringelTextures";
const A_MINOR = { root: 9, scale: "minor" } as const;

/**
 * La progression reine de la synthwave, i – VI – III – VII en la mineur : un accord par cycle,
 * partagé par l'arpège, le pad, la basse et le lead.
 */
const CHORDS = 'chord("<Am7 FM7 C G>").voicing()';

/** Le kick creuse la piste Pad (orbite 2) à chaque temps : le pompage qui fait rouler la synthwave. */
const KICK = `s("bd*4").bank("${KIT}")
  .duckorbit(2).duckattack(0.2).duckdepth(0.8)`;

/** Arpège montant puis descendant en doubles-croches, joué par un synthé carré très court. */
function arp(filter: string): string {
  return `${CHORDS}
  .arp("[0 1 2 3 4 3 2 1]*2")
  .s("square").decay(0.12).sustain(0)
  ${filter}`;
}

function pad(envelope: string): string {
  return `${CHORDS}
  .s("supersaw")${envelope}
  .orbit(2)`;
}

/** Au Break, sans kick, le pad monte lentement et s'ouvre. */
const PAD_HAZE = pad(".attack(1).release(2).lpf(1200)");
/** Attaque courte : le pad repart net après chaque coup de kick qui l'a écrasé. */
const PAD_PUMP = pad(".attack(0.2).release(1).lpf(2400)");

const A1 = 33;
const F1 = 29;
const C2 = 36;
const G1 = 31;
const OCTAVE = 12;
const BASS_ROOTS = [A1, F1, C2, G1] as const;
const EIGHTH = STEPS_PER_BEAT / 2;
const BASS_GHOST = 0.6;
const BASS_PUSH = 0.8;

/** Croches qui sautent de la fondamentale à l'octave : la basse italo-disco des années 80. */
function octaveBar(cycle: number, root: number): NoteSpec[] {
  const start = cycle * STEPS_PER_CYCLE;
  return Array.from({ length: STEPS_PER_CYCLE / EIGHTH }, (_, eighth) =>
    eighth % 2 === 0
      ? [root, start + eighth * EIGHTH, 1]
      : [root + OCTAVE, start + eighth * EIGHTH, 1, BASS_PUSH],
  );
}

/** Au Drop, la basse galope en doubles-croches, avec l'octave sur la troisième de chaque temps. */
function gallopBar(cycle: number, root: number): NoteSpec[] {
  return Array.from({ length: BEATS_PER_CYCLE }, (_, beat): NoteSpec[] => {
    const start = cycle * STEPS_PER_CYCLE + beat * STEPS_PER_BEAT;
    return [
      [root, start, 1],
      [root, start + 1, 1, BASS_GHOST],
      [root + OCTAVE, start + 2, 1, BASS_PUSH],
      [root, start + 3, 1, BASS_GHOST],
    ];
  }).flat();
}

const BASS = { ...A_MINOR, sound: "sawtooth", cycles: 4 } as const;
const octaves = notesClip(
  id,
  "Octaves",
  BASS,
  BASS_ROOTS.flatMap((root, cycle) => octaveBar(cycle, root)),
);
const gallop = notesClip(
  id,
  "Gallop",
  BASS,
  BASS_ROOTS.flatMap((root, cycle) => gallopBar(cycle, root)),
);

/**
 * Le hook : une question qui chante sur Am et F, une réponse qui grimpe sur C puis se suspend sur G.
 * Le Fa final, septième de G, redescend sur le Mi qui ouvre la boucle.
 */
const QUESTION: readonly NoteSpec[] = [
  [76, 0, 4],
  [74, 4, 2, 0.8],
  [72, 6, 2, 0.8],
  [76, 8, 6],
  [79, 14, 2, 0.8],
  [81, 16, 6],
  [79, 22, 2, 0.8],
  [77, 24, 4],
  [76, 28, 4, 0.9],
];

const ANSWER: readonly NoteSpec[] = [
  [72, 32, 4],
  [74, 36, 2, 0.8],
  [76, 38, 2, 0.8],
  [79, 40, 6],
  [76, 46, 2, 0.8],
  [74, 48, 6],
  [71, 54, 2, 0.8],
  [74, 56, 2, 0.8],
  [79, 58, 2],
  [77, 60, 4, 0.9],
];

const HOOK = [...QUESTION, ...ANSWER];
const LEAD = { ...A_MINOR, cycles: 4, release: 0.2 } as const;
/** Au Lift, le hook étouffé : on l'entend arriver sans qu'il éclate encore. */
const TEASE_CUTOFF = 1000;
const CALL_CUTOFF = 1600;

/** Caisse claire et clap ensemble sur 2 et 4, noyés de reverb : la grosse caisse claire des années 80. */
const BACKBEAT = "....x.......x...";
const HATS = "x..o x..o x..o x.+o";
const OFFBEATS = "..+. ..+. ..+. ..+.";

/** Les trois premiers cycles restent vides : seul le dernier joue la descente de toms. */
function lastBar(bar: string): string {
  return `${".".repeat(3 * STEPS_PER_CYCLE)}${bar}`;
}

const hats = stepsClip(id, "Hats", KIT, { hh: HATS });

export const nightDrive = demoProject(id, "Night drive", 110, [
  {
    name: "Kick",
    mixer: { gain: 0.95 },
    clips: [
      null,
      codeClip(id, "Pump", KICK),
      codeClip(id, "Pump", KICK),
      null,
      codeClip(id, "Pump", KICK),
      null,
    ],
  },
  {
    name: "Snare",
    mixer: { hpf: 150, room: 0.6, gain: 0.8 },
    clips: [
      null,
      stepsClip(id, "Backbeat", KIT, { sd: BACKBEAT, cp: BACKBEAT }),
      stepsClip(
        id,
        "Build",
        KIT,
        {
          // Deux mesures de backbeat, puis croches, doubles-croches et coups répétés jusqu'au Drop.
          sd: `${BACKBEAT.repeat(2)} x.x. x.x. x.x. x.x. ++++ xxxx 2222 4444`,
          cp: `${BACKBEAT.repeat(2)}${".".repeat(2 * STEPS_PER_CYCLE)}`,
        },
        { cycles: 4 },
      ),
      null,
      stepsClip(id, "Backbeat+", KIT, { sd: BACKBEAT, cp: "....x.......x..o" }),
      null,
    ],
  },
  {
    name: "Drums",
    mixer: { room: 0.15, pan: 0.55, gain: 0.6 },
    clips: [
      null,
      stepsClip(id, "Groove", KIT, { hh: HATS, sh: OFFBEATS }),
      stepsClip(
        id,
        "Fill",
        KIT,
        {
          hh: `${HATS.repeat(3)}${".".repeat(STEPS_PER_CYCLE)}`,
          ht: lastBar("x+x+............"),
          mt: lastBar("....x+x+........"),
          lt: lastBar("........x+x+x+xx"),
        },
        { cycles: 4 },
      ),
      null,
      stepsClip(
        id,
        "Drive",
        KIT,
        {
          cr: `x${".".repeat(2 * STEPS_PER_CYCLE - 1)}`,
          hh: HATS.repeat(2),
          oh: OFFBEATS.repeat(2),
          mt: `${".".repeat(2 * STEPS_PER_CYCLE - 4)}x+..`,
          lt: `${".".repeat(2 * STEPS_PER_CYCLE - 4)}..xx`,
        },
        { cycles: 2 },
      ),
      hats,
    ],
  },
  {
    name: "Bass",
    mixer: { lpf: 900, distort: 1, gain: 0.75 },
    clips: [null, octaves, withFreshIds(octaves, id), null, gallop, null],
  },
  {
    name: "Arp",
    mixer: { delay: 0.35, pan: 0.35, gain: 0.5 },
    clips: [
      codeClip(id, "Dim", arp(".lpf(sine.range(400, 1200).slow(8))")),
      codeClip(id, "Pluck", arp(".lpf(2000)")),
      codeClip(id, "Rise", arp(".lpf(saw.range(600, 6000).slow(4))")),
      codeClip(id, "Open", arp(".lpf(4000)")),
      codeClip(id, "Pluck", arp(".lpf(5000)")),
      codeClip(id, "Dim", arp(".lpf(sine.range(400, 1200).slow(8))")),
    ],
  },
  {
    name: "Lead",
    mixer: { hpf: 250, delay: 0.3, room: 0.5, pan: 0.6, gain: 0.5 },
    clips: [
      null,
      null,
      notesClip(id, "Tease", { ...LEAD, sound: "sawtooth", lpf: TEASE_CUTOFF }, HOOK),
      notesClip(id, "Call", { ...LEAD, sound: "square", cycles: 2, lpf: CALL_CUTOFF }, QUESTION),
      notesClip(id, "Hook", { ...LEAD, sound: "supersaw" }, HOOK),
      null,
    ],
  },
  {
    name: "Pad",
    mixer: { hpf: 200, room: 0.6, gain: 0.4 },
    clips: [
      codeClip(id, "Haze", PAD_HAZE),
      codeClip(id, "Pump", PAD_PUMP),
      codeClip(id, "Pump", PAD_PUMP),
      codeClip(id, "Haze", PAD_HAZE),
      codeClip(id, "Pump", PAD_PUMP),
      codeClip(id, "Haze", PAD_HAZE),
    ],
  },
  {
    name: "FX",
    mixer: { room: 0.5, gain: 0.55 },
    clips: [
      stepsClip(
        id,
        "Swoosh",
        TEXTURES,
        { swoosh: `x${".".repeat(4 * STEPS_PER_CYCLE - 1)}` },
        { cycles: 4 },
      ),
      null,
      stepsClip(
        id,
        "Riser",
        TEXTURES,
        {
          swoosh: lastBar("x..............."),
          glitch: lastBar("..?...?...?..?.?"),
        },
        { cycles: 4 },
      ),
      null,
      stepsClip(
        id,
        "Glitch",
        TEXTURES,
        { glitch: "..............?. ......?.......?." },
        { cycles: 2 },
      ),
      null,
    ],
  },
]);
