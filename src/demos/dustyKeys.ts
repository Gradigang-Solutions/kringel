import { codeClip, demoIds, demoProject, notesClip, stepsClip } from "@/demos/build";

const id = demoIds("demo-lofi");
const KIT = "LinnDrum";
const BASS = { root: 0, scale: "dorian", sound: "triangle" } as const;
const KEYS = { root: 0, scale: "dorian", soundSource: "sample", sound: "piano" } as const;

export const dustyKeys = demoProject(id, "Dusty keys", 84, [
  {
    mixer: { lpf: 4000, gain: 0.8 },
    clips: [
      stepsClip(
        id,
        "Lazy",
        KIT,
        { bd: [0, 10], sd: [4, 12], hh: [0, 2, 4, 6, 8, 10, 12, 14] },
        { velocities: { hh: 0.5 } },
      ),
      stepsClip(
        id,
        "Lazy",
        KIT,
        { bd: [0, 10], sd: [4, 12], hh: [0, 2, 4, 6, 8, 10, 12, 14] },
        { velocities: { hh: 0.5 } },
      ),
      null,
      stepsClip(id, "Skip", KIT, { bd: [0, 7, 10], sd: [4, 12], rim: [14] }),
      stepsClip(
        id,
        "Lazy",
        KIT,
        { bd: [0, 10], sd: [4, 12], hh: [0, 2, 4, 6, 8, 10, 12, 14] },
        { velocities: { hh: 0.5 } },
      ),
      null,
    ],
  },
  {
    mixer: { lpf: 700 },
    clips: [
      null,
      notesClip(id, "Walk", { ...BASS, cycles: 2 }, [
        [36, 0, 6],
        [43, 6, 2],
        [41, 8, 8],
        [41, 16, 6],
        [36, 22, 2],
        [38, 24, 8],
      ]),
      notesClip(id, "Walk", { ...BASS, cycles: 2 }, [
        [36, 0, 6],
        [43, 6, 2],
        [41, 8, 8],
        [41, 16, 6],
        [36, 22, 2],
        [38, 24, 8],
      ]),
      null,
      notesClip(id, "Walk", { ...BASS, cycles: 2 }, [
        [36, 0, 6],
        [43, 6, 2],
        [41, 8, 8],
        [41, 16, 6],
        [36, 22, 2],
        [38, 24, 8],
      ]),
      null,
    ],
  },
  {
    mixer: { room: 0.4, gain: 0.7 },
    clips: [
      null,
      null,
      notesClip(id, "Noodle", KEYS, [
        [72, 0, 2],
        [70, 3, 1],
        [67, 4, 4],
        [65, 10, 2],
        [67, 12, 4],
      ]),
      null,
      notesClip(id, "Noodle", KEYS, [
        [72, 0, 2],
        [70, 3, 1],
        [67, 4, 4],
        [65, 10, 2],
        [67, 12, 4],
      ]),
      notesClip(id, "Last note", KEYS, [[67, 0, 16]]),
    ],
  },
  {
    mixer: { room: 0.6, gain: 0.6 },
    clips: Array.from({ length: 6 }, () =>
      codeClip(id, "Chords", 'chord("<Cm7 Fm7>").voicing()\n  .s("piano")\n  .attack(0.05)'),
    ),
  },
]);
