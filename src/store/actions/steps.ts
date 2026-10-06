import { quote } from "@/codegen/format";
import { assertNever } from "@/lib/assertNever";
import { stepRowMini, swingCall } from "@/codegen/steps";
import { DRUM_SOUND_NAMES } from "@/model/constants";
import { findClip, isClipOfKind, updateClipOfKind } from "@/model/project";
import {
  addStepRow as addStepRowModel,
  isStepOn,
  removeStepRow as removeStepRowModel,
  setKit as setKitModel,
  setStepChance as setStepChanceModel,
  setStepRatchet as setStepRatchetModel,
  setStepVelocity as setStepVelocityModel,
  setStepsCycles,
  setSwing as setSwingModel,
  type StepLane,
  toggleRowMute as toggleRowMuteModel,
  toggleStep as toggleStepModel,
} from "@/model/steps";
import type { ClipCycles, StepRow, StepsClip } from "@/model/types";
import { logChange, logValueChange } from "@/store/changeLog";
import { nextId } from "@/store/ids";
import { getProject, updateProject } from "@/store/projectStore";
import { updateUi } from "@/store/uiStore";

export function soundName(sound: string): string {
  return DRUM_SOUND_NAMES[sound] ?? sound;
}

function updateSteps(
  clipId: string,
  update: (clip: StepsClip) => StepsClip,
  historyKey: string | null = null,
): void {
  updateProject((project) => updateClipOfKind(project, clipId, "steps", update), historyKey);
}

function stepsContext(
  clipId: string,
  rowId: string,
): { trackId: string; clip: StepsClip; row: StepRow } | null {
  const located = findClip(getProject(), clipId);
  if (!located || !isClipOfKind(located.clip, "steps")) return null;
  const row = located.clip.rows.find((candidate) => candidate.id === rowId);
  return row ? { trackId: located.track.id, clip: located.clip, row } : null;
}

export function toggleStep(clipId: string, rowId: string, step: number): void {
  updateSteps(clipId, (clip) => toggleStepModel(clip, rowId, step));
  updateUi({ selectedRowId: rowId });
  const context = stepsContext(clipId, rowId);
  if (!context) return;
  const state = isStepOn(context.row, step) ? "on" : "off";
  logChange({
    key: `step:${rowId}:${step}`,
    trackId: context.trackId,
    text: `${soundName(context.row.sound)} step ${step + 1} ${state}`,
    code: quote(stepRowMini(context.row, context.clip.cycles)),
  });
}

const PERCENT = 100;

/** Valeur d'un réglage par pas, telle qu'affichée : « 0.55 », « 70% », « ×3 ». */
export function formatStepValue(lane: StepLane, value: number): string {
  switch (lane) {
    case "velocities":
      return value.toFixed(2);
    case "chances":
      return `${Math.round(value * PERCENT)}%`;
    case "ratchets":
      return `×${value}`;
    default:
      return assertNever(lane);
  }
}

type StepValueSetter = (clip: StepsClip, rowId: string, step: number, value: number) => StepsClip;

const STEP_VALUE_SETTERS: Readonly<Record<StepLane, StepValueSetter>> = {
  velocities: setStepVelocityModel,
  chances: setStepChanceModel,
  ratchets: setStepRatchetModel,
};

const STEP_VALUE_LABELS: Readonly<Record<StepLane, string>> = {
  velocities: "velocity",
  chances: "chance",
  ratchets: "ratchet",
};

/** La vélocité a son appel ; probabilité et ratchet s'écrivent dans la mini-notation de la ligne. */
function stepValueCode(lane: StepLane, row: StepRow, cycles: number): string {
  return lane === "velocities" ? ".velocity(…)" : quote(stepRowMini(row, cycles));
}

/** Règle la vélocité, la probabilité ou le ratchet d'un pas. */
export function setStepValue(
  lane: StepLane,
  clipId: string,
  rowId: string,
  step: number,
  value: number,
): void {
  const before = stepsContext(clipId, rowId)?.row[lane][step] ?? 0;
  // Une clé par clip et par réglage : un tracé sur plusieurs pas s'annule en une fois.
  updateSteps(
    clipId,
    (clip) => STEP_VALUE_SETTERS[lane](clip, rowId, step, value),
    `${lane}:${clipId}`,
  );
  const context = stepsContext(clipId, rowId);
  if (!context) return;
  const after = context.row[lane][step] ?? 0;
  logValueChange({
    key: `${lane}:${rowId}:${step}`,
    trackId: context.trackId,
    label: `${soundName(context.row.sound)} step ${step + 1} ${STEP_VALUE_LABELS[lane]}`,
    from: formatStepValue(lane, before),
    to: formatStepValue(lane, after),
    code: stepValueCode(lane, context.row, context.clip.cycles),
  });
}

export function addStepRow(clipId: string, sound: string): void {
  updateSteps(clipId, (clip) => addStepRowModel(clip, sound, nextId));
  const located = findClip(getProject(), clipId);
  if (!located) return;
  logChange({
    key: `add-row:${clipId}:${sound}`,
    trackId: located.track.id,
    text: `Added ${soundName(sound)}`,
    code: quote(sound),
  });
}

export function removeStepRow(clipId: string, rowId: string): void {
  const context = stepsContext(clipId, rowId);
  updateSteps(clipId, (clip) => removeStepRowModel(clip, rowId));
  if (!context) return;
  logChange({
    key: `remove-row:${rowId}`,
    trackId: context.trackId,
    text: `Removed ${soundName(context.row.sound)}`,
    code: `${context.row.sound} removed`,
  });
}

export function toggleRowMute(clipId: string, rowId: string): void {
  updateSteps(clipId, (clip) => toggleRowMuteModel(clip, rowId));
  const context = stepsContext(clipId, rowId);
  if (!context) return;
  logChange({
    key: `mute-row:${rowId}`,
    trackId: context.trackId,
    text: `${context.row.isMuted ? "Muted" : "Unmuted"} ${soundName(context.row.sound).toLowerCase()}`,
    code: context.row.isMuted
      ? `${context.row.sound} removed`
      : quote(stepRowMini(context.row, context.clip.cycles)),
  });
}

export function selectRow(rowId: string): void {
  updateUi({ selectedRowId: rowId });
}

export function setKit(clipId: string, kit: string): void {
  const located = findClip(getProject(), clipId);
  updateSteps(clipId, (clip) => setKitModel(clip, kit));
  if (!located) return;
  logChange({
    key: `kit:${clipId}`,
    trackId: located.track.id,
    text: `Kit → ${kit}`,
    code: `.bank(${quote(kit)})`,
  });
}

export function setStepsLength(clipId: string, cycles: ClipCycles): void {
  updateSteps(clipId, (clip) => setStepsCycles(clip, cycles));
}

export function setSwing(clipId: string, swing: number): void {
  const located = findClip(getProject(), clipId);
  const before = located && isClipOfKind(located.clip, "steps") ? located.clip.swing : 0;
  updateSteps(clipId, (clip) => setSwingModel(clip, swing), `swing:${clipId}`);
  const after = findClip(getProject(), clipId);
  if (!after || !isClipOfKind(after.clip, "steps")) return;
  logValueChange({
    key: `swing:${clipId}`,
    trackId: after.track.id,
    label: "Swing",
    from: formatSwing(before),
    to: formatSwing(after.clip.swing),
    code: swingCall(after.clip.swing) ?? "no swing",
  });
}

/** Retard du contretemps en pourcentage d'un pas. */
export function formatSwing(swing: number): string {
  return `${Math.round(swing * PERCENT)}%`;
}
