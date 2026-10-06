import type { ClipKind, SlotAddress } from "@/model/types";
import {
  createClip,
  deleteClip,
  duplicateClip,
  openEditor,
  requestConversion,
  selectClip,
  stopTrack,
} from "@/store/actions/clips";
import { usePlaybackStore } from "@/store/playbackStore";
import { useProjectStore } from "@/store/projectStore";
import { useIsPlaying } from "@/store/selectors";
import { useUiStore } from "@/store/uiStore";
import { clipPlayStatus } from "@/model/playback";
import { launchClipAndPlay } from "@/ui/app/playbackController";
import { ClipSlotEmpty } from "@/ui/grid/ClipSlotEmpty";
import { ClipSlotFilled } from "@/ui/grid/ClipSlotFilled";
import { ContextMenuArea, type MenuItem } from "@/ui/primitives/Menu";
import { useIsPhone } from "@/ui/shared/useIsPhone";

const KIND_MENU_LABELS: Readonly<Record<ClipKind, string>> = {
  steps: "New step sequence",
  notes: "New piano roll",
  code: "New code clip",
};

export interface ClipSlotProps {
  readonly address: SlotAddress;
  /** Type du clip créé d'un clic : celui de la piste. */
  readonly defaultKind: ClipKind;
  readonly isCompact: boolean;
  readonly isInvite: boolean;
}

export function ClipSlot({ address, defaultKind, isCompact, isInvite }: ClipSlotProps) {
  const clip = useProjectStore(
    (state) =>
      state.project.tracks.find((track) => track.id === address.trackId)?.clips[
        address.sceneIndex
      ] ?? null,
  );
  const status = usePlaybackStore((state) =>
    clip ? clipPlayStatus(state.playback, address.trackId, clip.id) : "idle",
  );
  const isSelected = useUiStore((state) => clip !== null && state.selectedClipId === clip.id);
  const isTransportRunning = useIsPlaying();
  const isPhone = useIsPhone();

  if (!clip) {
    const createItems: MenuItem[] = (["steps", "notes", "code"] as const).map((kind) => ({
      label: KIND_MENU_LABELS[kind],
      onSelect: () => createClip(address, kind),
    }));
    return (
      <ContextMenuArea items={createItems}>
        <ClipSlotEmpty
          isInvite={isInvite}
          isCompact={isCompact}
          label="Create clip"
          onCreate={() => createClip(address, defaultKind)}
        />
      </ContextMenuArea>
    );
  }

  const items: MenuItem[] = [
    { label: "Edit", onSelect: () => openEditor(clip.id) },
    { label: "Duplicate", onSelect: () => duplicateClip(clip.id), shortcut: "⌘D" },
    {
      label: "Convert to code",
      onSelect: () => requestConversion(clip.id),
      isDisabled: clip.kind === "code",
    },
    { label: "Delete", onSelect: () => deleteClip(clip.id), shortcut: "⌫" },
  ];
  return (
    <ContextMenuArea items={items}>
      <ClipSlotFilled
        clip={clip}
        status={status}
        isTransportRunning={isTransportRunning}
        isSelected={isSelected}
        isCompact={isCompact}
        // Au doigt, le double-tap n'est pas fiable : un tap ouvre directement l'éditeur.
        onSelect={() => (isPhone ? openEditor(clip.id) : selectClip(clip.id))}
        onOpen={() => openEditor(clip.id)}
        onLaunch={() => launchClipAndPlay(address.trackId, clip.id)}
        onStop={() => stopTrack(address.trackId)}
      />
    </ContextMenuArea>
  );
}
