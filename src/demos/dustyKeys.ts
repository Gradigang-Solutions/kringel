import { codeClip, demoIds, demoProject, notesClip, stepsClip } from "@/demos/build";
import { withFreshIds } from "@/model/clips";

const id = demoIds("demo-lofi");
const KIT = "SonicPiAcoustic";
const PERCUSSION = "KringelPercussion";
const TEXTURES = "KringelTextures";
/** Un swing marqué : les doubles-croches à contretemps traînent, comme jouées en retard. */
const SWING = 0.2;
const F_MINOR = { root: 5, scale: "minor" } as const;

/** i – iv – VI – V7 en fa mineur, un accord par cycle, partagé par le clavier et la basse. */
const CHORDS = 'chord("<Fm9 Bbm9 DbM9 C7b9>").voicing()';

const boomBap = stepsClip(
  id,
  "Boom bap",
  KIT,
  {
    bd: "x... ...o ..x. .... x... .... ..x. .x..",
    sd: "...? x..? ..?. x.?. ...? x..? ..?. x...",
    hh: "x.+o x.+. x.+o x.+. x.+o x.+. x.+o x+2.",
  },
  { cycles: 2, swing: SWING },
);

/** Ligne de basse sur les fondamentales Fa, Si bémol, Ré bémol, Do, avec une note d'approche. */
const walk = notesClip(
  id,
  "Walk",
  { ...F_MINOR, sound: "triangle", cycles: 4, release: 0.2, lpf: 900 },
  [
    [41, 0, 6],
    [41, 7, 1, 0.5],
    [48, 10, 4, 0.8],
    [44, 14, 2, 0.7],
    [46, 16, 6],
    [46, 23, 1, 0.5],
    [41, 26, 4, 0.8],
    [44, 30, 2, 0.7],
    [37, 32, 6],
    [37, 39, 1, 0.5],
    [44, 42, 4, 0.8],
    [37, 46, 2, 0.7],
    [36, 48, 6],
    [36, 55, 1, 0.5],
    [43, 58, 4, 0.8],
    [43, 62, 2, 0.7],
  ],
);

/** Phrase en pentatonique mineure : question sur les deux premiers accords, réponse sur les deux suivants. */
const CALL = [
  [72, 4, 2, 0.8],
  [75, 6, 2, 0.7],
  [77, 8, 4],
  [75, 13, 1, 0.6],
  [72, 14, 2, 0.8],
  [70, 16, 4],
  [68, 20, 2, 0.7],
  [70, 22, 2, 0.8],
  [65, 24, 6, 0.9],
] as const;

const RESPONSE = [
  [68, 36, 2, 0.7],
  [70, 38, 2, 0.8],
  [72, 40, 4],
  [77, 44, 2, 0.9],
  [75, 46, 2, 0.7],
  [72, 48, 6],
  [70, 54, 2, 0.7],
  [68, 56, 4, 0.8],
  [67, 60, 4, 0.9],
] as const;

const SAX = { ...F_MINOR, soundSource: "sample", sound: "sax", release: 0.3 } as const;
const hook = notesClip(id, "Hook", { ...SAX, cycles: 4 }, [...CALL, ...RESPONSE]);

const KEYS_HAZE = `${CHORDS}
  .s("piano")
  .lpf(sine.range(600, 1500).slow(8))`;

const KEYS_COMP = `${CHORDS}
  .struct("x ~ ~ x ~ ~ x ~")
  .s("piano")
  .velocity(perlin.range(0.5, 0.8))
  .lpf(3000)`;

const KEYS_ARP = `${CHORDS}
  .arp("0 1 2 3 4 3 2 1")
  .s("piano")
  .velocity(perlin.range(0.4, 0.7))
  .delay(0.4).delayfeedback(0.5)`;

const KEYS_FULL = `${CHORDS}
  .struct("x ~ ~ x ~ x x ~")
  .s("piano")
  .velocity(perlin.range(0.6, 0.9))`;

const HISS = "+...............";

export const dustyKeys = demoProject(id, "Dusty keys", 86, [
  {
    name: "Keys",
    mixer: { room: 0.4, gain: 0.7 },
    clips: [
      codeClip(id, "Haze", KEYS_HAZE),
      codeClip(id, "Comp", KEYS_COMP),
      codeClip(id, "Comp", KEYS_COMP),
      codeClip(id, "Arp", KEYS_ARP),
      codeClip(id, "Full", KEYS_FULL),
      codeClip(id, "Haze", KEYS_HAZE),
    ],
  },
  {
    name: "Drums",
    mixer: { gain: 0.85, lpf: 6000 },
    clips: [
      null,
      boomBap,
      withFreshIds(boomBap, id),
      null,
      stepsClip(
        id,
        "Boom bap+",
        KIT,
        {
          bd: "x..o ...x ..x. .... x... ..o. ..x. .x.x",
          sd: "...? x..? ..?. x.?. ...? x..? ..?. x.33",
          hh: "x.+o x.+o x.+o x.+o x.+o x.+o x.+o x+2.",
          oh: "................ ..............x.",
        },
        { cycles: 2, swing: SWING },
      ),
      null,
    ],
  },
  {
    name: "Perc",
    mixer: { hpf: 200, room: 0.2, pan: 0.65, gain: 0.6 },
    clips: [
      null,
      null,
      stepsClip(
        id,
        "Snaps",
        PERCUSSION,
        { snap: "....x.......x...", ke: "..?...?...?..?.?" },
        { swing: SWING },
      ),
      null,
      stepsClip(
        id,
        "Tabla",
        PERCUSSION,
        {
          snap: "....x.......x...",
          na: "+.......+.+.....",
          ke: "..?...?...?..?.?",
          te: ".?.....?.?....?.",
        },
        { swing: SWING },
      ),
      null,
    ],
  },
  {
    name: "Bass",
    mixer: { gain: 0.9 },
    clips: [null, walk, withFreshIds(walk, id), null, withFreshIds(walk, id), null],
  },
  {
    name: "Sax",
    mixer: { delay: 0.25, room: 0.4, pan: 0.4, gain: 0.6 },
    clips: [
      null,
      null,
      notesClip(id, "Call", { ...SAX, cycles: 2 }, CALL),
      hook,
      withFreshIds(hook, id),
      null,
    ],
  },
  {
    name: "Dust",
    mixer: { hpf: 300, gain: 0.5 },
    clips: [
      stepsClip(id, "Hiss", TEXTURES, { hiss: HISS }),
      stepsClip(id, "Hiss", TEXTURES, { hiss: HISS }),
      stepsClip(id, "Scratch", TEXTURES, { hiss: HISS, scratch: "............x..." }),
      stepsClip(
        id,
        "Rewind",
        TEXTURES,
        { hiss: HISS.repeat(4), rewind: `x${".".repeat(63)}` },
        { cycles: 4 },
      ),
      stepsClip(id, "Scratch", TEXTURES, { hiss: HISS, scratch: "..........?....?" }),
      stepsClip(id, "Hiss", TEXTURES, { hiss: HISS }),
    ],
  },
  {
    name: "Atmos",
    mixer: { lpf: 4000, room: 0.6, gain: 0.5 },
    clips: [
      stepsClip(id, "Choir", TEXTURES, { choir: "x...............", pad: "........+......." }),
      null,
      null,
      stepsClip(id, "Glass", TEXTURES, { choir: "x...............", glass: "........x......." }),
      null,
      stepsClip(id, "Pad", TEXTURES, { pad: "x...............", glass: "........+......." }),
    ],
  },
]);
