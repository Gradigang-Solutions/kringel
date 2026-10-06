import { codeClip, demoIds, demoProject, notesClip } from "@/demos/build";

const id = demoIds("demo-ambient");
const DORIAN = { root: 2, scale: "dorian" } as const;

export const slowTide = demoProject(id, "Slow tide", 70, [
  { clips: [] },
  {
    mixer: { lpf: 500 },
    clips: [
      null,
      null,
      notesClip(id, "Ground", { ...DORIAN, sound: "sine", cycles: 2 }, [
        [38, 0, 16],
        [36, 16, 16],
      ]),
      notesClip(id, "Ground", { ...DORIAN, sound: "sine", cycles: 2 }, [
        [38, 0, 16],
        [36, 16, 16],
      ]),
      null,
      null,
    ],
  },
  {
    mixer: { room: 0.7, gain: 0.6, pan: 0.6 },
    clips: [
      null,
      notesClip(id, "Drops", { ...DORIAN, sound: "triangle" }, [
        [62, 0, 2],
        [65, 4, 2],
        [69, 8, 2],
        [74, 12, 4],
      ]),
      notesClip(id, "Drops", { ...DORIAN, sound: "triangle" }, [
        [62, 0, 2],
        [65, 4, 2],
        [69, 8, 2],
        [74, 12, 4],
      ]),
      null,
      notesClip(id, "Glints", { ...DORIAN, soundSource: "sample", sound: "harp" }, [
        [74, 0, 2],
        [72, 3, 2],
        [69, 6, 2],
        [65, 10, 6],
      ]),
      null,
    ],
  },
  {
    mixer: { room: 0.8, gain: 0.5 },
    clips: Array.from({ length: 6 }, () =>
      codeClip(
        id,
        "Tide",
        'n("0 2 4 7").scale("D:dorian")\n  .s("supersaw")\n  .attack(1).release(2)\n  .slow(2)',
      ),
    ),
  },
]);
