import { demoIds, demoProject, notesClip, stepsClip } from "@/demos/build";

const id = demoIds("demo-techno");
const KIT = "RolandTR909";
const FOUR = [0, 4, 8, 12];
const OFFBEAT_HATS = [2, 6, 10, 14];
const EIGHTHS = [0, 2, 4, 6, 8, 10, 12, 14];
const BASS = { root: 9, scale: "minor", sound: "sawtooth" } as const;
const PAD = { root: 9, scale: "minor", sound: "supersaw", cycles: 2 } as const;

export const firstTechno = demoProject(id, "First techno", 128, [
  {
    mixer: { gain: 0.9 },
    clips: [
      stepsClip(id, "Kick only", KIT, { bd: FOUR }),
      stepsClip(id, "Groove", KIT, { bd: FOUR, cp: [4, 12], hh: OFFBEAT_HATS }),
      stepsClip(id, "Full", KIT, { bd: FOUR, cp: [4, 12], hh: EIGHTHS, oh: OFFBEAT_HATS }),
      null,
      stepsClip(id, "Drop", KIT, { bd: FOUR, cp: [4, 12], hh: EIGHTHS, rim: [3, 7, 11, 15] }),
      stepsClip(id, "Outro", KIT, { bd: FOUR, hh: OFFBEAT_HATS }),
    ],
  },
  {
    mixer: { lpf: 900, gain: 0.8 },
    clips: [
      null,
      notesClip(id, "Offbeat", BASS, [
        [45, 2, 2],
        [45, 6, 2],
        [45, 10, 2],
        [45, 14, 2],
      ]),
      notesClip(id, "Rolling", BASS, [
        [45, 2, 1],
        [45, 3, 1],
        [57, 6, 1],
        [45, 10, 1],
        [45, 11, 1],
        [48, 14, 2],
      ]),
      notesClip(id, "Hold", BASS, [[45, 0, 16]]),
      notesClip(id, "Rolling", BASS, [
        [45, 2, 1],
        [45, 3, 1],
        [57, 6, 1],
        [45, 10, 1],
        [45, 11, 1],
        [48, 14, 2],
      ]),
      null,
    ],
  },
  { clips: [] },
  {
    mixer: { room: 0.5, gain: 0.5 },
    clips: [
      null,
      null,
      notesClip(id, "Stabs", PAD, [
        [57, 0, 2],
        [60, 0, 2],
        [64, 0, 2],
        [57, 6, 2],
        [60, 6, 2],
        [64, 6, 2],
        [55, 16, 2],
        [60, 16, 2],
        [64, 16, 2],
      ]),
      null,
      notesClip(id, "Swell", PAD, [
        [57, 0, 32],
        [60, 0, 32],
        [64, 0, 32],
      ]),
      null,
    ],
  },
]);
