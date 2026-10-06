import { describe, expect, it } from "vitest";
import {
  clipPlayStatus,
  commitQueued,
  effectiveClipId,
  forgetClip,
  forgetMissingClips,
  isSceneActive,
  launchClip,
  launchScene,
  playedSource,
  recordCodeCheck,
  setPlaying,
  stopTrack,
} from "@/model/playback";
import {
  makeCodeClip,
  makePlayback,
  makeProject,
  makeStepsClip,
  trackIdAt,
  withClip,
} from "@/test/builders";

const error = { line: 1, column: 2, message: "Unexpected token" };

describe("launchClip", () => {
  it("lance immédiatement quand le transport est à l'arrêt", () => {
    const state = launchClip(makePlayback(), "t", "c");
    expect(state.playingClipIds).toEqual({ t: "c" });
    expect(clipPlayStatus(state, "t", "c")).toBe("playing");
  });

  it("met en attente pendant la lecture", () => {
    const state = launchClip(
      makePlayback({ isPlaying: true, playingClipIds: { t: "a" } }),
      "t",
      "b",
    );
    expect(clipPlayStatus(state, "t", "b")).toBe("queued");
    expect(clipPlayStatus(state, "t", "a")).toBe("stopping");
    expect(effectiveClipId(state, "t")).toBe("b");
  });

  it("annule l'attente si on relance le clip qui joue", () => {
    const queued = launchClip(
      makePlayback({ isPlaying: true, playingClipIds: { t: "a" } }),
      "t",
      "b",
    );
    expect(launchClip(queued, "t", "a").queuedClipIds).toEqual({});
  });
});

describe("stopTrack", () => {
  it("arrête au cycle suivant pendant la lecture", () => {
    const state = stopTrack(makePlayback({ isPlaying: true, playingClipIds: { t: "a" } }), "t");
    expect(effectiveClipId(state, "t")).toBeNull();
    expect(commitQueued(state).playingClipIds).toEqual({});
  });

  it("arrête immédiatement à l'arrêt", () => {
    expect(stopTrack(makePlayback({ playingClipIds: { t: "a" } }), "t").playingClipIds).toEqual({});
  });

  it("annule un lancement en attente sur une piste muette", () => {
    const state = makePlayback({ isPlaying: true, queuedClipIds: { t: "a" } });
    expect(stopTrack(state, "t").queuedClipIds).toEqual({});
  });
});

describe("launchScene", () => {
  it("lance les clips de la scène et arrête les pistes vides", () => {
    let project = withClip(makeProject(), 0, 1, makeStepsClip({ id: "drums" }));
    project = withClip(project, 1, 0, makeCodeClip({ id: "bass" }));
    const bassTrack = trackIdAt(project, 1);
    const state = launchScene(
      makePlayback({ isPlaying: true, playingClipIds: { [bassTrack]: "bass" } }),
      project,
      1,
    );
    expect(state.queuedClipIds).toEqual({ [trackIdAt(project, 0)]: "drums", [bassTrack]: null });
  });
});

describe("setPlaying", () => {
  it("applique les changements en attente à l'arrêt", () => {
    const state = makePlayback({ isPlaying: true, queuedClipIds: { t: "b" } });
    expect(setPlaying(state, false)).toMatchObject({
      isPlaying: false,
      playingClipIds: { t: "b" },
    });
    expect(setPlaying(makePlayback(), true).isPlaying).toBe(true);
  });
});

describe("forgetClip", () => {
  it("retire le clip de la lecture et des vérifications", () => {
    const state = makePlayback({
      playingClipIds: { t: "a", u: "b" },
      queuedClipIds: { v: "a" },
      codeChecks: { a: { status: "valid", source: "x" } },
    });
    expect(forgetClip(state, "a")).toMatchObject({
      playingClipIds: { u: "b" },
      queuedClipIds: {},
      codeChecks: {},
    });
  });
});

describe("forgetMissingClips", () => {
  it("retire les clips absents du projet et garde les arrêts en attente", () => {
    const project = withClip(makeProject(), 0, 0, makeStepsClip({ id: "kept" }));
    const drums = trackIdAt(project, 0);
    const bass = trackIdAt(project, 1);
    const lead = trackIdAt(project, 2);
    const pad = trackIdAt(project, 3);
    const state = makePlayback({
      playingClipIds: { [drums]: "kept", [bass]: "gone" },
      queuedClipIds: { [lead]: "gone", [pad]: null },
      codeChecks: { gone: { status: "valid", source: "x" } },
    });
    expect(forgetMissingClips(state, project)).toMatchObject({
      playingClipIds: { [drums]: "kept" },
      queuedClipIds: { [pad]: null },
      codeChecks: {},
    });
  });

  it("retire les pistes absentes du projet, même pour un arrêt en attente", () => {
    const state = makePlayback({ queuedClipIds: { "deleted-track": null } });
    expect(forgetMissingClips(state, makeProject()).queuedClipIds).toEqual({});
  });
});

describe("vérification du code", () => {
  it("retient la source valide qui joue", () => {
    const state = recordCodeCheck(makePlayback(), "c", 's("bd")', null);
    expect(playedSource(state, "c")).toBe('s("bd")');
  });

  it("garde la dernière version valide après une erreur", () => {
    const valid = recordCodeCheck(makePlayback(), "c", 's("bd")', null);
    const invalid = recordCodeCheck(valid, "c", 's("bd"', error);
    const stillInvalid = recordCodeCheck(invalid, "c", "s(", error);
    expect(stillInvalid.codeChecks.c).toEqual({
      status: "invalid",
      error,
      lastValidSource: 's("bd")',
    });
    expect(playedSource(stillInvalid, "c")).toBe('s("bd")');
  });

  it("n'a pas de version valide si le clip n'a jamais été valide", () => {
    const state = recordCodeCheck(makePlayback(), "c", "s(", error);
    expect(playedSource(state, "c")).toBeNull();
    expect(playedSource(makePlayback(), "c")).toBeNull();
  });
});

describe("isSceneActive", () => {
  it("est vraie quand tous les clips de la scène jouent", () => {
    let project = withClip(makeProject(), 0, 1, makeStepsClip({ id: "a" }));
    project = withClip(project, 2, 1, makeCodeClip({ id: "b" }));
    const both = makePlayback({
      playingClipIds: { [trackIdAt(project, 0)]: "a", [trackIdAt(project, 2)]: "b" },
    });
    const one = makePlayback({ playingClipIds: { [trackIdAt(project, 0)]: "a" } });
    expect(isSceneActive(both, project, 1)).toBe(true);
    expect(isSceneActive(one, project, 1)).toBe(false);
    expect(isSceneActive(both, project, 0)).toBe(false);
  });
});
