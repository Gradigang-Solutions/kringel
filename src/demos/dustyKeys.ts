import { codeClip, demoIds, demoProject, notesClip, stepsClip, type NoteSpec } from "@/demos/build";
import { withFreshIds } from "@/model/clips";
import { STEPS_PER_CYCLE, SWING_SLICES_PER_CYCLE } from "@/model/constants";
import type { CodeClip } from "@/model/types";

const id = demoIds("demo-lofi");
const KIT = "LinnDrum";
const PERCUSSION = "KringelPercussion";
const TEXTURES = "KringelTextures";
/** Un swing marqué : les doubles-croches à contretemps traînent, comme jouées en retard. */
const SWING = 0.2;
const D_MINOR = { root: 2, scale: "minor" } as const;

/**
 * ii – V – I en fa majeur, puis ré mineur : un accord par cycle, partagé par le piano, le pad,
 * la basse et le lead. Seuls le piano et les synthés jouent des hauteurs : ils sont accordés,
 * contrairement aux textures et aux tablas de la banque Kringel.
 */
const CHORDS = 'chord("<Gm9 C13 FM9 Dm9>").voicing()';
/** Au Drop, la dominante La 7 b9 coupe le dernier cycle en deux et relance la boucle. */
const DROP_CHORDS = 'chord("<Gm9 C13 FM9 [Dm9 A7b9]>").voicing()';

/** Le piano swingue comme la batterie, sinon ses contretemps tombent à côté des charleys. */
const KEYS_SWING = `.swingBy(${SWING}, ${SWING_SLICES_PER_CYCLE})`;

const KEYS_TAPE = `${CHORDS}
  .s("piano")
  .lpf(sine.range(700, 2000).slow(8))
  .crush(10)`;

const COMP_RHYTHM = "[x ~ ~ ~] [~ ~ x ~] [~ x ~ ~] [~ ~ x ~]";

const KEYS_COMP = `${CHORDS}
  .struct("${COMP_RHYTHM}")
  .s("piano")
  .velocity(perlin.range(0.5, 0.8))
  ${KEYS_SWING}`;

const KEYS_OPEN = `${KEYS_COMP}
  .lpf(saw.range(800, 5000).slow(4))`;

const KEYS_ARP = `${CHORDS}
  .arp("0 2 1 3 2 4 3 1")
  .s("piano")
  .velocity(perlin.range(0.4, 0.7))
  .delay(0.4).delayfeedback(0.5)`;

const KEYS_CHOPS = `${DROP_CHORDS}
  .struct("[x ~ ~ x] [~ ~ x ~] [~ x ~ ~] [x ~ x ~]")
  .s("piano")
  .velocity(perlin.range(0.6, 0.9))
  ${KEYS_SWING}
  .crush(10)`;

/** Le kick creuse la piste Pad (orbite 2) à chaque coup : le pad respire au rythme du boom-bap. */
function kick(name: string, pattern: string): CodeClip {
  return codeClip(
    id,
    name,
    `s("${pattern}").bank("${KIT}")
  .swingBy(${SWING}, ${SWING_SLICES_PER_CYCLE})
  .duckorbit(2).duckattack(0.2).duckdepth(0.6)`,
  );
}

/** Un coup sur le 1, un qui traîne avant le 2, un sur le « et » du 3 : le boom-bap. */
const BOOM = "[bd ~ ~ ~] [~ ~ ~ bd] [~ ~ bd ~] [~ ~ ~ ~]";
/** Au Drop, un coup de plus juste avant la mesure suivante pousse la boucle en avant. */
const KNOCK = "[bd ~ ~ ~] [~ ~ ~ bd] [~ ~ bd ~] [~ ~ ~ bd]";

const pad = (chords: string) => `${chords}
  .s("sawtooth").attack(0.5).release(1.5).lpf(900)
  .orbit(2)`;

const G2 = 43;
const C2 = 36;
const F2 = 41;
const D2 = 38;
const A1 = 33;
const A2 = 45;
const BB1 = 34;
const E2 = 40;
const OCTAVE = 12;
const BASS_GHOST = 0.6;
const BASS_PUSH = 0.8;

/** Fondamentale de chaque accord et note qui y mène depuis le dessous ou le dessus. */
const BASS_BARS = [
  { root: G2, approach: BB1 },
  { root: C2, approach: E2 },
  { root: F2, approach: C2 },
  { root: D2, approach: A2 },
] as const;

/** Une mesure qui rebondit : la fondamentale tenue, un ghost, l'octave, puis l'approche de l'accord suivant. */
function bounceBar(cycle: number, root: number, approach: number): NoteSpec[] {
  const start = cycle * STEPS_PER_CYCLE;
  return [
    [root, start, 6],
    [root, start + 7, 1, BASS_GHOST],
    [root + OCTAVE, start + 10, 2, BASS_PUSH],
    [approach, start + 14, 2, BASS_PUSH],
  ];
}

/** Au Drop, chaque demi-mesure reprend le rebond en doubles-croches ; la seconde peut changer d'accord. */
function driveBar(cycle: number, roots: readonly [number, number], approach: number): NoteSpec[] {
  const start = cycle * STEPS_PER_CYCLE;
  const [first, second] = roots;
  return [
    [first, start, 3],
    [first, start + 3, 1, BASS_GHOST],
    [first + OCTAVE, start + 6, 1, BASS_PUSH],
    [second, start + 8, 2],
    [second, start + 11, 1, BASS_GHOST],
    [second + OCTAVE, start + 12, 2, BASS_PUSH],
    [approach, start + 14, 2, BASS_PUSH],
  ];
}

const BASS = { ...D_MINOR, sound: "sine", cycles: 4, release: 0.15 } as const;

const bounce = notesClip(
  id,
  "Bounce",
  BASS,
  BASS_BARS.flatMap((bar, cycle) => bounceBar(cycle, bar.root, bar.approach)),
);

const drive = notesClip(id, "Drive", BASS, [
  ...BASS_BARS.slice(0, -1).flatMap((bar, cycle) =>
    driveBar(cycle, [bar.root, bar.root], bar.approach),
  ),
  // Ré mineur puis La 7 b9 : le La redescend sur le Sol du début de la boucle.
  ...driveBar(3, [D2, A1], A2),
]);

/**
 * Le hook, en pentatonique de ré mineur : une question qui monte sur Gm9 et C13, une réponse qui
 * redescend sur FM9 et Dm9. Le Mi final appartient à la fois à Dm9 et à La 7 b9.
 */
const QUESTION: readonly NoteSpec[] = [
  [74, 0, 2],
  [77, 2, 2, 0.8],
  [79, 4, 3],
  [77, 7, 1, 0.6],
  [74, 8, 4],
  [72, 12, 2, 0.7],
  [74, 14, 2, 0.8],
  [79, 16, 2],
  [81, 18, 2, 0.8],
  [79, 20, 3],
  [77, 23, 1, 0.6],
  [76, 24, 6],
  [74, 30, 2, 0.7],
];

const ANSWER: readonly NoteSpec[] = [
  [72, 32, 2, 0.8],
  [74, 34, 2, 0.8],
  [77, 36, 3],
  [81, 39, 1, 0.7],
  [79, 40, 4],
  [77, 44, 2, 0.8],
  [76, 46, 2, 0.7],
  [74, 48, 6],
  [72, 54, 2, 0.6],
  [69, 56, 4, 0.8],
  [76, 60, 4, 0.9],
];

const HOOK = [...QUESTION, ...ANSWER];
const LEAD = { ...D_MINOR, cycles: 4, release: 0.2 } as const;
/** Au Lift, le hook étouffé : on l'entend arriver sans qu'il éclate encore. */
const TEASE_CUTOFF = 1200;
const HOOK_CUTOFF = 2400;

const HATS = "x.+. x.+o x.+. x.+. x.+. x.+o x.+. x+2.";
const BACKBEAT = ".... x... .... x..? .... x..o ..?. x...";

const boomBap = stepsClip(
  id,
  "Boom bap",
  KIT,
  { sd: BACKBEAT, hh: HATS },
  { cycles: 2, swing: SWING },
);

const SHAKER = "o+o+ o+o+ o+o+ o+o?";
const shaker = stepsClip(id, "Shaker", KIT, { sh: SHAKER }, { swing: SWING });
const snaps = stepsClip(id, "Snaps", PERCUSSION, { snap: "....x.......x..." }, { swing: SWING });

const HISS = "+...............";
const hiss = stepsClip(id, "Hiss", TEXTURES, { hiss: HISS });

export const dustyKeys = demoProject(id, "Dusty keys", 90, [
  {
    name: "Keys",
    mixer: { room: 0.35, gain: 0.75 },
    clips: [
      codeClip(id, "Tape", KEYS_TAPE),
      codeClip(id, "Comp", KEYS_COMP),
      codeClip(id, "Open", KEYS_OPEN),
      codeClip(id, "Arp", KEYS_ARP),
      codeClip(id, "Chops", KEYS_CHOPS),
      codeClip(id, "Tape", KEYS_TAPE),
    ],
  },
  {
    name: "Kick",
    mixer: { gain: 0.95 },
    clips: [null, kick("Boom", BOOM), kick("Boom", BOOM), null, kick("Knock", KNOCK), null],
  },
  {
    name: "Drums",
    mixer: { lpf: 7000, gain: 0.8 },
    clips: [
      null,
      boomBap,
      stepsClip(
        id,
        "Build",
        KIT,
        {
          hh: HATS.repeat(2),
          // Caisse claire en crescendo : contretemps, croches, doubles-croches, puis coups répétés.
          sd: `${BACKBEAT} o.o. x.o. o.o. x.o. ++++ xxxx 2222 4444`,
        },
        { cycles: 4, swing: SWING },
      ),
      null,
      stepsClip(
        id,
        "Boom bap+",
        KIT,
        {
          sd: BACKBEAT,
          cp: ".... +... .... +... .... +... .... +...",
          hh: HATS,
          oh: "................ ..............x.",
        },
        { cycles: 2, swing: SWING },
      ),
      stepsClip(id, "Hats", KIT, { hh: "x.+. x.+o x.+. x.+." }, { swing: SWING }),
    ],
  },
  {
    name: "Bass",
    mixer: { distort: 1, lpf: 800, gain: 0.8 },
    clips: [null, bounce, withFreshIds(bounce, id), null, drive, null],
  },
  {
    name: "Lead",
    mixer: { delay: 0.3, room: 0.4, pan: 0.4, gain: 0.5 },
    clips: [
      null,
      null,
      notesClip(id, "Tease", { ...LEAD, sound: "triangle", lpf: TEASE_CUTOFF }, HOOK),
      notesClip(
        id,
        "Call",
        { ...D_MINOR, soundSource: "sample", sound: "piano", cycles: 2 },
        QUESTION,
      ),
      notesClip(id, "Hook", { ...LEAD, sound: "sawtooth", lpf: HOOK_CUTOFF }, HOOK),
      null,
    ],
  },
  {
    name: "Pad",
    mixer: { hpf: 250, room: 0.5, gain: 0.4 },
    clips: [
      codeClip(id, "Warm", pad(CHORDS)),
      null,
      codeClip(id, "Swell", pad(CHORDS)),
      codeClip(id, "Swell", pad(CHORDS)),
      codeClip(id, "Pump", pad(DROP_CHORDS)),
      codeClip(id, "Warm", pad(CHORDS)),
    ],
  },
  {
    name: "Perc",
    mixer: { hpf: 300, room: 0.2, pan: 0.65, gain: 0.55 },
    clips: [
      null,
      shaker,
      withFreshIds(shaker, id),
      snaps,
      stepsClip(id, "Shaker+", KIT, { sh: SHAKER, rim: "...o ...? ..o. ...?" }, { swing: SWING }),
      withFreshIds(snaps, id),
    ],
  },
  {
    name: "Dust",
    mixer: { hpf: 300, gain: 0.5 },
    clips: [
      hiss,
      withFreshIds(hiss, id),
      stepsClip(id, "Scratch", TEXTURES, { hiss: HISS, scratch: "............x..." }),
      stepsClip(
        id,
        "Rewind",
        TEXTURES,
        { hiss: HISS.repeat(4), rewind: `x${".".repeat(63)}` },
        { cycles: 4 },
      ),
      stepsClip(id, "Scratch", TEXTURES, { hiss: HISS, scratch: "..........?....?" }),
      withFreshIds(hiss, id),
    ],
  },
]);
