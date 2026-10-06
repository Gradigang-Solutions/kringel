import { create } from "zustand";
import { INITIAL_PLAYBACK, type PlaybackState } from "@/model/playback";

interface PlaybackStore {
  readonly playback: PlaybackState;
}

export const usePlaybackStore = create<PlaybackStore>()(() => ({ playback: INITIAL_PLAYBACK }));

export function getPlayback(): PlaybackState {
  return usePlaybackStore.getState().playback;
}

export function updatePlayback(update: (playback: PlaybackState) => PlaybackState): void {
  usePlaybackStore.setState((state) => {
    const playback = update(state.playback);
    return playback === state.playback ? state : { playback };
  });
}
