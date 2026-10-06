import { describe, expect, it } from "vitest";
import { generateCode } from "@/codegen/generate";
import type { Project } from "@/model/types";
import {
  makeCodeClip,
  makeNote,
  makeNotesClip,
  makePlayback,
  makeProject,
  makeRow,
  makeStepsClip,
  trackIdAt,
  withClip,
  withMixer,
} from "@/test/builders";
import type { PlaybackState } from "@/model/playback";

const fourOnTheFloor = makeStepsClip({
  id: "drums",
  rows: [
    makeRow("bd", [0, 4, 8, 12]),
    makeRow("sd", [4, 12]),
    makeRow("hh", [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
});

const rootWalk = makeNotesClip({
  id: "bass",
  root: 0,
  scale: "major",
  sound: "sawtooth",
  notes: [makeNote(36, 0, 4), makeNote(39, 8, 4), makeNote(43, 12, 4)],
});

const arpUp = makeNotesClip({
  id: "lead",
  name: "Arp up",
  sound: "triangle",
  notes: [makeNote(60, 0, 2), makeNote(63, 2, 2), makeNote(67, 4, 2), makeNote(70, 6, 2)],
});

const chords = makeCodeClip({ id: "pad" });

function playing(project: Project, clipsByTrack: Record<number, string>): PlaybackState {
  const playingClipIds = Object.fromEntries(
    Object.entries(clipsByTrack).map(([trackIndex, clipId]) => [
      trackIdAt(project, Number(trackIndex)),
      clipId,
    ]),
  );
  return makePlayback({ isPlaying: true, playingClipIds });
}

function code(project: Project, playback: PlaybackState): string {
  return generateCode(project, playback).text;
}

describe("projet vide", () => {
  it("invite à créer un premier clip", () => {
    expect(code(makeProject(), makePlayback())).toMatchInlineSnapshot(`
      "// Nothing here yet.
      // Every click in the grid writes
      // Strudel code in this panel.

      setcpm(120/4)

      stack(
      )"
    `);
  });

  it("indique quand aucun clip ne joue", () => {
    const project = withClip(makeProject({ bpm: 124 }), 0, 0, fourOnTheFloor);
    expect(code(project, makePlayback())).toMatchInlineSnapshot(`
      "setcpm(124/4)

      stack(
        // Launch a clip to hear it here.
      )"
    `);
  });
});

describe("exemple du brief", () => {
  it("reproduit le code attendu", () => {
    let project = withClip(makeProject(), 0, 0, fourOnTheFloor);
    project = withClip(project, 1, 0, rootWalk);
    project = withMixer(project, 0, { gain: 0.8 });
    project = withMixer(project, 1, { lpf: 800, room: 0.3 });
    expect(code(project, playing(project, { 0: "drums", 1: "bass" }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("bd*4, ~ sd ~ sd, hh*8")
          .bank("RolandTR909")
          .gain(0.8),
        // Bass · Root walk
        note("c2 ~ eb2 g2")
          .s("sawtooth")
          .lpf(800)
          .room(0.3)
      )"
    `);
  });
});

describe("clip de pas", () => {
  const render = (clip: Parameters<typeof withClip>[3]) => {
    const project = withClip(makeProject(), 0, 0, clip);
    return code(project, playing(project, { 0: clip.id }));
  };

  it("omet les lignes muettes et vides", () => {
    const clip = makeStepsClip({
      rows: [makeRow("bd", [0, 8]), makeRow("cp", [12], { isMuted: true }), makeRow("hh", [])],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("bd*2")
          .bank("RolandTR909")
      )"
    `);
  });

  it("sépare une ligne aux vélocités variables", () => {
    const clip = makeStepsClip({
      rows: [
        makeRow("bd", [0, 4, 8, 12]),
        makeRow("hh", [], {
          velocities: [1, 0, 0.55, 0, 1, 0, 0.55, 0, 1, 0, 0.55, 0, 1, 0, 0.55, 0],
        }),
      ],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        stack(
          s("bd*4"),
          s("hh*8").velocity("1 0.55 1 0.55 1 0.55 1 0.55")
        )
          .bank("RolandTR909")
      )"
    `);
  });

  it("écrit une vélocité uniforme comme une valeur", () => {
    const clip = makeStepsClip({
      rows: [makeRow("hh", [0, 2, 4, 6, 8, 10, 12, 14], { velocity: 0.6 })],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("hh*8").velocity(0.6)
          .bank("RolandTR909")
      )"
    `);
  });

  it("alterne les cycles d'un clip de deux cycles", () => {
    const clip = makeStepsClip({
      cycles: 2,
      rows: [
        makeRow("bd", [0, 4, 8, 12, 16, 22, 26], { length: 32 }),
        makeRow("sd", [4, 12, 20, 28], { length: 32 }),
      ],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("<bd*4 [bd ~ ~ bd ~ bd ~ ~]>, ~ sd ~ sd")
          .bank("RolandTR909")
      )"
    `);
  });

  it("écrit la probabilité d'un pas avec ?", () => {
    const chances = Array.from({ length: 16 }, (_, step) => (step === 2 ? 0.7 : 1));
    const clip = makeStepsClip({
      rows: [makeRow("bd", [0, 4, 8, 12]), makeRow("hh", [2, 6, 10, 14], { chances })],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("bd*4, ~ hh?0.3 ~ hh ~ hh ~ hh")
          .bank("RolandTR909")
      )"
    `);
  });

  it("écrit un ratchet dans son pas, sans réduire la grille", () => {
    const ratchets = Array.from({ length: 16 }, (_, step) => (step === 12 ? 2 : 1));
    const clip = makeStepsClip({ rows: [makeRow("sd", [4, 12], { ratchets })] });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("~ ~ ~ ~ sd ~@7 sd*2 ~ ~ ~")
          .bank("RolandTR909")
      )"
    `);
  });

  it("combine ratchet, probabilité et vélocité sur le même rythme", () => {
    const ratchets = Array.from({ length: 16 }, (_, step) => (step === 0 ? 3 : 1));
    const chances = Array.from({ length: 16 }, (_, step) => (step === 0 ? 0.5 : 1));
    const clip = makeStepsClip({
      rows: [makeRow("hh", [0, 8], { velocity: 0.6, ratchets, chances })],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("hh*3?0.5 ~@7 hh ~@7").velocity(0.6)
          .bank("RolandTR909")
      )"
    `);
  });

  it("ne répète pas avec * des pas qui portent une probabilité", () => {
    const clip = makeStepsClip({
      rows: [makeRow("hh", [0, 4, 8, 12], { chances: Array.from({ length: 16 }, () => 0.5) })],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("hh?0.5 hh?0.5 hh?0.5 hh?0.5")
          .bank("RolandTR909")
      )"
    `);
  });

  it("ajoute le swing au clip", () => {
    expect(render(makeStepsClip({ swing: 0.33 }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Four on the floor
        s("bd*4")
          .bank("RolandTR909")
          .swingBy(0.33, 8)
      )"
    `);
  });

  it("n'écrit rien pour un clip sans pas", () => {
    expect(render(makeStepsClip({ rows: [makeRow("bd", [])] }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Launch a clip to hear it here.
      )"
    `);
  });
});

describe("clip de notes", () => {
  const render = (clip: Parameters<typeof withClip>[3]) => {
    const project = withClip(makeProject(), 2, 0, clip);
    return code(project, playing(project, { 2: clip.id }));
  };

  it("écrit des degrés de gamme quand toutes les notes sont dans la gamme", () => {
    expect(render(arpUp)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Lead · Arp up
        n("0 2 4 6 ~ ~ ~ ~")
          .scale("C4:minor")
          .s("triangle")
      )"
    `);
  });

  it("écrit des noms de notes dès qu'une note sort de la gamme", () => {
    const clip = makeNotesClip({ notes: [makeNote(60, 0, 8), makeNote(64, 8, 8)] });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Lead · Root walk
        note("c4 e4")
          .s("sawtooth")
      )"
    `);
  });

  it("écrit les accords et les voix qui se chevauchent", () => {
    const clip = makeNotesClip({
      sound: "piano",
      soundSource: "sample",
      notes: [makeNote(60, 0, 8), makeNote(63, 0, 8), makeNote(67, 0, 8), makeNote(72, 4, 8)],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Lead · Root walk
        n("[0,2,4] ~, ~ 7@2 ~")
          .scale("C4:minor")
          .s("piano")
      )"
    `);
  });

  it("alterne les cycles et écrit les vélocités", () => {
    const clip = makeNotesClip({
      cycles: 2,
      notes: [makeNote(60, 0, 16, 0.5), makeNote(67, 16, 16)],
    });
    expect(render(clip)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Lead · Root walk
        n("<0 4>")
          .velocity("<0.5 1>")
          .scale("C4:minor")
          .s("sawtooth")
      )"
    `);
  });

  it("écrit une vélocité uniforme comme une valeur", () => {
    const clip = makeNotesClip({ notes: [makeNote(60, 0, 8, 0.7), makeNote(63, 8, 8, 0.7)] });
    expect(render(clip)).toContain(".velocity(0.7)");
  });

  it("n'écrit rien pour un clip sans note", () => {
    expect(render(makeNotesClip())).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Launch a clip to hear it here.
      )"
    `);
  });
});

describe("clip de code", () => {
  const project = withClip(makeProject(), 3, 0, chords);
  const trackId = trackIdAt(project, 3);

  it("insère la source telle quelle", () => {
    expect(code(project, playing(project, { 3: "pad" }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Pad · Chords
        chord("<Cm Ab Bb Gm>").voicing()
      )"
    `);
  });

  it("joue la dernière version valide en cas d'erreur", () => {
    const playback = makePlayback({
      isPlaying: true,
      playingClipIds: { [trackId]: "pad" },
      codeChecks: {
        pad: {
          status: "invalid",
          error: { line: 1, column: 6, message: "Unexpected token" },
          lastValidSource: 'chord("<Cm Ab>").voicing()',
        },
      },
    });
    const generated = generateCode(project, playback);
    expect(generated.text).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Pad · Chords
        chord("<Cm Ab>").voicing()
      )"
    `);
    expect(generated.lines.find((line) => line.clipId === "pad")?.status).toBe("error");
  });

  it("n'écrit rien sans version valide", () => {
    const playback = makePlayback({
      playingClipIds: { [trackId]: "pad" },
      codeChecks: {
        pad: {
          status: "invalid",
          error: { line: 1, column: 1, message: "x" },
          lastValidSource: null,
        },
      },
    });
    expect(code(project, playback)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Launch a clip to hear it here.
      )"
    `);
  });

  it("place la virgule après un commentaire de fin de ligne sur sa propre ligne", () => {
    const commented = withClip(
      project,
      0,
      0,
      makeCodeClip({ id: "first", source: 's("bd*4") // kick' }),
    );
    expect(code(commented, playing(commented, { 0: "first", 3: "pad" }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Chords
        s("bd*4") // kick
        ,
        // Pad · Chords
        chord("<Cm Ab Bb Gm>").voicing()
      )"
    `);
  });
});

describe("mixer", () => {
  it("écrit seulement les réglages différents des valeurs par défaut", () => {
    let project = withClip(makeProject(), 2, 0, arpUp);
    project = withMixer(project, 2, { gain: 0.6, pan: 0.6, lpf: 2400, room: 0.25 });
    expect(code(project, playing(project, { 2: "lead" }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Lead · Arp up
        n("0 2 4 6 ~ ~ ~ ~")
          .scale("C4:minor")
          .s("triangle")
          .lpf(2400)
          .room(0.25)
          .pan(0.6)
          .gain(0.6)
      )"
    `);
  });

  it("écrit les effets dans l'ordre : filtres, distorsion, écho, reverb", () => {
    let project = withClip(makeProject(), 2, 0, arpUp);
    project = withMixer(project, 2, { hpf: 300, lpf: 2400, distort: 1.5, delay: 0.4, room: 0.25 });
    expect(code(project, playing(project, { 2: "lead" }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Lead · Arp up
        n("0 2 4 6 ~ ~ ~ ~")
          .scale("C4:minor")
          .s("triangle")
          .hpf(300)
          .lpf(2400)
          .distort(1.5)
          .delay(0.4)
          .room(0.25)
      )"
    `);
  });

  it("omet les pistes muettes", () => {
    let project = withClip(makeProject(), 0, 0, fourOnTheFloor);
    project = withClip(project, 1, 0, rootWalk);
    project = withMixer(project, 0, { isMuted: true });
    expect(code(project, playing(project, { 0: "drums", 1: "bass" }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Bass · Root walk
        note("c2 ~ eb2 g2")
          .s("sawtooth")
      )"
    `);
  });

  it("ne garde que les pistes en solo", () => {
    let project = withClip(makeProject(), 0, 0, fourOnTheFloor);
    project = withClip(project, 1, 0, rootWalk);
    project = withMixer(project, 1, { isSoloed: true });
    expect(code(project, playing(project, { 0: "drums", 1: "bass" }))).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Bass · Root walk
        note("c2 ~ eb2 g2")
          .s("sawtooth")
      )"
    `);
  });
});

describe("lancement quantifié", () => {
  it("écrit le clip en attente et le marque comme tel", () => {
    let project = withClip(makeProject(), 0, 0, fourOnTheFloor);
    project = withClip(
      project,
      0,
      1,
      makeStepsClip({ id: "fill", name: "Fill", rows: [makeRow("sd", [8, 10, 12, 13, 14, 15])] }),
    );
    const trackId = trackIdAt(project, 0);
    const playback = makePlayback({
      isPlaying: true,
      playingClipIds: { [trackId]: "drums" },
      queuedClipIds: { [trackId]: "fill" },
    });
    const generated = generateCode(project, playback);
    expect(generated.text).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Drums · Fill
        s("~@8 sd ~ sd ~ sd sd sd sd")
          .bank("RolandTR909")
      )"
    `);
    expect(new Set(generated.lines.map((line) => line.status))).toEqual(new Set([null, "queued"]));
  });

  it("retire une piste qui s'arrête au cycle suivant", () => {
    const project = withClip(makeProject(), 0, 0, fourOnTheFloor);
    const trackId = trackIdAt(project, 0);
    const playback = makePlayback({
      isPlaying: true,
      playingClipIds: { [trackId]: "drums" },
      queuedClipIds: { [trackId]: null },
    });
    expect(code(project, playback)).toMatchInlineSnapshot(`
      "setcpm(120/4)

      stack(
        // Launch a clip to hear it here.
      )"
    `);
  });
});

describe("informations par ligne", () => {
  it("associe chaque ligne d'un bloc à sa piste et à son clip", () => {
    const project = withClip(makeProject(), 0, 0, fourOnTheFloor);
    const generated = generateCode(project, playing(project, { 0: "drums" }));
    expect(generated.lines).toHaveLength(generated.text.split("\n").length);
    const drumLines = generated.lines.filter((line) => line.clipId === "drums");
    expect(drumLines).toHaveLength(3);
    expect(
      drumLines.every(
        (line) => line.trackId === trackIdAt(project, 0) && line.status === "playing",
      ),
    ).toBe(true);
  });
});
