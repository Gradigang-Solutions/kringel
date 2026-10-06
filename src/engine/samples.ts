import { registerSynthSounds, samples } from "@strudel/webaudio";

/** Banques de sons hébergées par le CDN de strudel.cc (voir prebake.mjs du site Strudel). */
const STRUDEL_CDN = "https://strudel.b-cdn.net";

const SAMPLE_BANKS = [
  {
    map: `${STRUDEL_CDN}/tidal-drum-machines.json`,
    base: `${STRUDEL_CDN}/tidal-drum-machines/machines/`,
  },
  { map: `${STRUDEL_CDN}/piano.json`, base: `${STRUDEL_CDN}/piano/` },
  { map: `${STRUDEL_CDN}/vcsl.json`, base: `${STRUDEL_CDN}/VCSL/` },
] as const;

/** Enregistre les synthés et les banques de samples ; les fichiers audio sont chargés à la première lecture. */
export async function loadSounds(): Promise<void> {
  await Promise.all([
    registerSynthSounds(),
    ...SAMPLE_BANKS.map((bank) => samples(bank.map, bank.base, { prebake: true })),
  ]);
}
