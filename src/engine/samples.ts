import { registerSynthSounds, samples } from "@strudel/webaudio";
import { KRINGEL_SAMPLES_URL } from "@/model/constants";

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

/**
 * Enregistre les synthés et les banques de samples ; les fichiers audio sont chargés à la première lecture.
 * La banque Kringel est aussi chargée par le code généré, mais la précharger évite d'attendre son
 * catalogue au premier lancement d'un de ses kits.
 */
export async function loadSounds(): Promise<void> {
  await Promise.all([
    registerSynthSounds(),
    ...SAMPLE_BANKS.map((bank) => samples(bank.map, bank.base, { prebake: true })),
    samples(KRINGEL_SAMPLES_URL, undefined, { prebake: true }),
  ]);
}
