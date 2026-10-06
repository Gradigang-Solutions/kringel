import { describe, expect, it } from "vitest";
import {
  addNote,
  deleteNote,
  moveNote,
  resizeNote,
  setNotesCycles,
  setScale,
  setSound,
  soundsForSource,
} from "@/model/notes";
import { makeIds, makeNote, makeNotesClip } from "@/test/builders";

const clip = makeNotesClip({ notes: [makeNote(60, 0, 4)] });

describe("addNote", () => {
  it("ajoute une note à la vélocité par défaut", () => {
    const added = addNote(clip, { pitch: 63, start: 4, duration: 2 }, makeIds("n"));
    expect(added.notes[1]).toEqual({ id: "n-1", pitch: 63, start: 4, duration: 2, velocity: 1 });
  });

  it("garde la note dans le clip", () => {
    const added = addNote(clip, { pitch: 200, start: 15, duration: 8 }, makeIds("n"));
    expect(added.notes[1]).toMatchObject({ pitch: 95, start: 15, duration: 1 });
  });

  it("refuse une note identique au même endroit", () => {
    expect(addNote(clip, { pitch: 60, start: 0, duration: 1 }, makeIds())).toBe(clip);
  });
});

describe("moveNote et resizeNote", () => {
  it("déplace une note en gardant sa durée", () => {
    expect(moveNote(clip, "note-60-0", 8, 67).notes[0]).toMatchObject({
      pitch: 67,
      start: 8,
      duration: 4,
    });
  });

  it("raccourcit la note si elle dépasse la fin du clip", () => {
    expect(moveNote(clip, "note-60-0", 14, 60).notes[0]).toMatchObject({ start: 14, duration: 2 });
  });

  it("redimensionne une note avec une durée minimale d'un pas", () => {
    expect(resizeNote(clip, "note-60-0", 0).notes[0]!.duration).toBe(1);
    expect(resizeNote(clip, "note-60-0", 6).notes[0]!.duration).toBe(6);
  });
});

describe("deleteNote", () => {
  it("supprime une note", () => {
    expect(deleteNote(clip, "note-60-0").notes).toEqual([]);
  });
});

describe("setScale", () => {
  it("change la tonique et le mode", () => {
    expect(setScale(clip, 2, "dorian")).toMatchObject({ root: 2, scale: "dorian" });
  });
});

describe("setSound", () => {
  it("change le son dans la même source", () => {
    expect(setSound(clip, "synth", "square")).toMatchObject({
      soundSource: "synth",
      sound: "square",
    });
  });

  it("prend le premier son de la nouvelle source si le son n'y existe pas", () => {
    expect(setSound(clip, "sample", "square")).toMatchObject({
      soundSource: "sample",
      sound: "piano",
    });
  });

  it("liste les sons de chaque source", () => {
    expect(soundsForSource("synth")).toContain("triangle");
    expect(soundsForSource("sample")).toContain("piano");
  });
});

describe("setNotesCycles", () => {
  it("retire les notes au-delà de la fin et raccourcit celles qui dépassent", () => {
    const long = makeNotesClip({ cycles: 2, notes: [makeNote(60, 12, 8), makeNote(62, 20, 2)] });
    const short = setNotesCycles(long, 1);
    expect(short.notes).toEqual([makeNote(60, 12, 4)]);
  });
});
