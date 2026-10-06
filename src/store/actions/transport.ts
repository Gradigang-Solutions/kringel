import { commitQueued as commitQueuedModel, setPlaying as setPlayingModel } from "@/model/playback";
import { updatePlayback } from "@/store/playbackStore";

export function setPlaying(isPlaying: boolean): void {
  updatePlayback((playback) => setPlayingModel(playback, isPlaying));
}

export function commitQueued(): void {
  updatePlayback(commitQueuedModel);
}
