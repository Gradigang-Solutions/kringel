import { clipPattern } from "@/codegen/clip";
import { endsWithLineComment } from "@/codegen/code";
import { clipControl, mixerControl, type CodeControl } from "@/codegen/controls";
import { mixerCalls } from "@/codegen/mixer";
import { CHAIN_INDENT } from "@/codegen/pattern";
import { call, plainString } from "@/codegen/format";
import { BEATS_PER_CYCLE, KRINGEL_SAMPLES_URL } from "@/model/constants";
import { usesKringelSamples } from "@/model/kits";
import { effectiveClipId, playedSource, type PlaybackState } from "@/model/playback";
import { hasAnyClip } from "@/model/project";
import type { Clip, Project, Track } from "@/model/types";

export type BlockStatus = "playing" | "queued" | "error";

export interface CodeLineInfo {
  readonly trackId: string | null;
  readonly clipId: string | null;
  readonly status: BlockStatus | null;
  /** Contrôle de l'interface qui écrit cette ligne, pour relier le code et l'interface. */
  readonly control: CodeControl | null;
}

export interface GeneratedCode {
  readonly text: string;
  readonly lines: readonly CodeLineInfo[];
}

interface Line {
  readonly text: string;
  readonly info: CodeLineInfo;
}

const BLOCK_INDENT = "  ";
const NO_INFO: CodeLineInfo = { trackId: null, clipId: null, status: null, control: null };

const EMPTY_PROJECT_INTRO = [
  "// Nothing here yet.",
  "// Every click in the grid writes",
  "// Strudel code in this panel.",
];
const NOTHING_PLAYING = "// Launch a clip to hear it here.";

function plain(text: string): Line {
  return { text, info: NO_INFO };
}

/** Charge la banque Kringel dans le code, pour qu'il sonne pareil collé dans strudel.cc. */
function samplesLines(project: Project): Line[] {
  return usesKringelSamples(project)
    ? [plain(call("samples", plainString(KRINGEL_SAMPLES_URL)))]
    : [];
}

function tempoLine(bpm: number): string {
  return `setcpm(${bpm}/${BEATS_PER_CYCLE})`;
}

function isAudible(track: Track, hasSolo: boolean): boolean {
  return !track.mixer.isMuted && (!hasSolo || track.mixer.isSoloed);
}

function blockStatus(clip: Clip, track: Track, playback: PlaybackState): BlockStatus {
  if (clip.kind === "code" && playback.codeChecks[clip.id]?.status === "invalid") return "error";
  const isQueued = playback.queuedClipIds[track.id] === clip.id;
  return isQueued && playback.playingClipIds[track.id] !== clip.id ? "queued" : "playing";
}

/** Source jouée par un clip de code : la dernière version vérifiée, ou la source brute si jamais vérifiée. */
function codeSourceFor(clip: Clip, playback: PlaybackState): string {
  if (clip.kind !== "code") return "";
  if (playback.codeChecks[clip.id] === undefined) return clip.source;
  return playedSource(playback, clip.id) ?? "";
}

function trackBlock(track: Track, playback: PlaybackState): Line[] | null {
  const clipId = effectiveClipId(playback, track.id);
  const clip = track.clips.find((candidate) => candidate?.id === clipId);
  if (!clip) return null;
  const pattern = clipPattern(clip, codeSourceFor(clip, playback));
  if (!pattern) return null;
  const info: CodeLineInfo = {
    trackId: track.id,
    clipId: clip.id,
    status: blockStatus(clip, track, playback),
    control: null,
  };
  const line = (text: string, control: CodeControl | null = null): Line => ({
    text: `${BLOCK_INDENT}${text}`,
    info: { ...info, control },
  });
  return [
    line(`// ${track.name} · ${clip.name.replace(/\s+/g, " ")}`),
    ...pattern.source.map((text) => line(text)),
    ...pattern.calls.map((methodCall) =>
      line(
        `${CHAIN_INDENT}${methodCall.code}`,
        methodCall.setting === null ? null : clipControl(methodCall.setting),
      ),
    ),
    ...mixerCalls(track.mixer).map((methodCall) =>
      line(`${CHAIN_INDENT}${methodCall.code}`, mixerControl(methodCall.param)),
    ),
  ];
}

/** Sépare les blocs du stack par des virgules, sans la placer dans un commentaire de fin de ligne. */
function joinBlocks(blocks: readonly Line[][]): Line[] {
  return blocks.flatMap((block, index) => {
    const last = block.at(-1);
    if (index === blocks.length - 1 || last === undefined) return block;
    const head = block.slice(0, -1);
    if (endsWithLineComment(last.text)) {
      return [...head, last, { text: `${BLOCK_INDENT},`, info: { ...last.info, control: null } }];
    }
    return [...head, { text: `${last.text},`, info: last.info }];
  });
}

function emptyProjectLines(bpm: number): Line[] {
  return [...EMPTY_PROJECT_INTRO, "", tempoLine(bpm), "", "stack(", ")"].map(plain);
}

function projectLines(project: Project, playback: PlaybackState): Line[] {
  if (!hasAnyClip(project)) return emptyProjectLines(project.bpm);
  const hasSolo = project.tracks.some((track) => track.mixer.isSoloed);
  const blocks = project.tracks
    .filter((track) => isAudible(track, hasSolo))
    .map((track) => trackBlock(track, playback))
    .filter((block): block is Line[] => block !== null);
  const body =
    blocks.length > 0 ? joinBlocks(blocks) : [plain(`${BLOCK_INDENT}${NOTHING_PLAYING}`)];
  return [
    ...samplesLines(project),
    plain(tempoLine(project.bpm)),
    plain(""),
    plain("stack("),
    ...body,
    plain(")"),
  ];
}

/** Génère le code Strudel du projet : celui qu'on évalue et celui qu'on affiche. */
export function generateCode(project: Project, playback: PlaybackState): GeneratedCode {
  const lines = projectLines(project, playback);
  return { text: lines.map((line) => line.text).join("\n"), lines: lines.map((line) => line.info) };
}
