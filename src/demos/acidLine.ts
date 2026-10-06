import { demoIds, demoProject, notesClip, stepsClip } from "@/demos/build";

const id = demoIds("demo-acid");
const KIT = "RolandTR808";
const ACID = { root: 0, scale: "minor", sound: "sawtooth" } as const;
const FOUR = [0, 4, 8, 12];

const line = notesClip(id, "Acid line", ACID, [
  [36, 0, 1],
  [36, 2, 1],
  [48, 3, 1],
  [36, 5, 1],
  [51, 6, 2],
  [36, 9, 1],
  [43, 10, 1],
  [36, 12, 1],
  [55, 13, 1],
  [39, 15, 1],
]);

export const acidLine = demoProject(id, "Acid line", 132, [
  {
    clips: [
      stepsClip(id, "Pulse", KIT, { bd: FOUR }),
      stepsClip(id, "Pulse", KIT, { bd: FOUR, hh: [2, 6, 10, 14] }),
      stepsClip(id, "Drive", KIT, { bd: FOUR, cp: [4, 12], hh: [2, 6, 10, 14] }),
      stepsClip(id, "Drive", KIT, { bd: FOUR, cp: [4, 12], hh: [2, 6, 10, 14] }),
      stepsClip(id, "Peak", KIT, {
        bd: FOUR,
        cp: [4, 12],
        hh: [0, 2, 4, 6, 8, 10, 12, 14],
        oh: [2, 10],
      }),
      null,
    ],
  },
  {
    mixer: { lpf: 1200, room: 0.2 },
    clips: [
      line,
      { ...line, id: id(), name: "Acid line" },
      notesClip(id, "Climb", ACID, [
        [36, 0, 1],
        [39, 2, 1],
        [43, 4, 1],
        [46, 6, 1],
        [48, 8, 1],
        [51, 10, 1],
        [55, 12, 1],
        [58, 14, 1],
      ]),
      { ...line, id: id(), name: "Acid line" },
      notesClip(id, "Squelch", ACID, [
        [36, 0, 1],
        [48, 1, 1],
        [36, 2, 1],
        [51, 3, 1],
        [36, 4, 1],
        [55, 5, 1],
        [36, 6, 1],
        [58, 7, 1],
        [36, 8, 2],
        [60, 10, 2],
        [36, 12, 4],
      ]),
      { ...line, id: id(), name: "Acid line" },
    ],
  },
]);
