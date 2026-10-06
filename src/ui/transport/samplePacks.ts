/** Origine et licence d'un ensemble de sons joués par l'application. */
export interface SamplePack {
  readonly name: string;
  readonly author: string;
  readonly license: string;
  readonly url: string;
  /** Ce que l'application en utilise, ou une réserve sur la licence. */
  readonly note: string;
}

export const SAMPLE_PACKS: readonly SamplePack[] = [
  {
    name: "Kringel samples",
    author: "Michael Fischer (TR-808), Sonic Pi contributors, sfzinstruments",
    license: "CC0 1.0",
    url: "https://github.com/Gradigang-Solutions/kringel-samples",
    note: "Fischer808, SonicPiAcoustic, SonicPiElectro, KringelPercussion and KringelTextures kits.",
  },
  {
    name: "Salamander Grand Piano",
    author: "Alexander Holm",
    license: "CC BY 3.0",
    url: "https://github.com/felixroos/dough-samples",
    note: "The piano sound, served by strudel.cc.",
  },
  {
    name: "Versilian Community Sample Library",
    author: "Versilian Studios",
    license: "CC0 1.0",
    url: "https://github.com/sgossner/VCSL",
    note: "Harp, sax, organ and ocarina, served by strudel.cc.",
  },
  {
    name: "tidal-drum-machines",
    author: "Tidal and Strudel community",
    license: "No license stated",
    url: "https://github.com/geikha/tidal-drum-machines",
    note: "Roland and Linn kits, recorded from commercial drum machines and served by strudel.cc.",
  },
];
