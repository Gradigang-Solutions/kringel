import {
  checkSource,
  getCyclePosition,
  isEngineReady,
  play,
  setCode,
  stop,
  waitForCycle,
} from "@/engine";
import { recordCodeCheck } from "@/store/actions/code";
import { launchClip, launchScene } from "@/store/actions/clips";
import { showNotice } from "@/store/actions/project";
import { commitQueued, setPlaying } from "@/store/actions/transport";
import { getPlayback, usePlaybackStore } from "@/store/playbackStore";
import { getProject, useProjectStore } from "@/store/projectStore";
import { getGeneratedCode } from "@/store/selectors";
import { getUi, updateUi } from "@/store/uiStore";

/** Les évaluations s'enchaînent dans l'ordre, sans se chevaucher. */
let evaluationQueue: Promise<void> = Promise.resolve();

const ENGINE_START_ERROR = "Couldn't start the audio engine. Check your connection and try again.";

export async function startPlayback(): Promise<void> {
  if (getUi().isAudioStarting) return;
  const isFirstStart = !isEngineReady();
  if (isFirstStart) updateUi({ isAudioStarting: true });
  try {
    const error = await play(getGeneratedCode().text);
    // Stop pressé pendant le démarrage : la lecture ne doit pas partir quand même.
    if (isFirstStart && !getUi().isAudioStarting) {
      stop();
      return;
    }
    setPlaying(true);
    showNotice(error);
  } catch {
    showNotice(ENGINE_START_ERROR);
  } finally {
    updateUi({ isAudioStarting: false });
  }
}

export function stopPlayback(): void {
  stop();
  setPlaying(false);
  updateUi({ isAudioStarting: false });
}

export function togglePlayback(): void {
  if (getPlayback().isPlaying) stopPlayback();
  else void startPlayback();
}

/** Lancer un clip à l'arrêt démarre aussi la lecture, comme dans la vue Session d'un DAW. */
export function launchClipAndPlay(trackId: string, clipId: string): void {
  launchClip(trackId, clipId);
  if (!getPlayback().isPlaying) void startPlayback();
}

export function launchSceneAndPlay(sceneIndex: number): void {
  launchScene(sceneIndex);
  if (!getPlayback().isPlaying) void startPlayback();
}

function hasQueuedChanges(): boolean {
  return Object.keys(getPlayback().queuedClipIds).length > 0;
}

function commitAt(cycle: number | null): void {
  if (!hasQueuedChanges()) return;
  void waitForCycle(cycle ?? Math.ceil(getCyclePosition())).then(commitQueued);
}

function syncEngine(): void {
  if (!getPlayback().isPlaying) return;
  const code = getGeneratedCode().text;
  evaluationQueue = evaluationQueue.then(async () => {
    const update = await setCode(code);
    if (update.error !== null) showNotice(update.error);
    commitAt(update.appliesAtCycle);
  });
}

/** Réévalue le code à chaque changement du projet ou de la lecture ; renvoie la fonction de désabonnement. */
export function startEngineSync(): () => void {
  const unsubscribeProject = useProjectStore.subscribe(syncEngine);
  const unsubscribePlayback = usePlaybackStore.subscribe(syncEngine);
  return () => {
    unsubscribeProject();
    unsubscribePlayback();
  };
}

/** Vérifie les clips de code d'un projet chargé, pour savoir lesquels peuvent jouer. */
export async function checkAllCodeClips(): Promise<void> {
  const codeClips = getProject()
    .tracks.flatMap((track) => track.clips)
    .filter((clip) => clip?.kind === "code");
  for (const clip of codeClips) {
    recordCodeCheck(clip.id, clip.source, await checkSource(clip.source), false);
  }
}
