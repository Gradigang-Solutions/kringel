# Kringel — Brief produit

> Nom de travail. Domaine et marque non vérifiés.

## En une phrase

Une web app musicale qui offre une interface graphique par-dessus [Strudel](https://strudel.cc) : on compose avec des clips en boucle, et l'app affiche en permanence le code Strudel que nos gestes produisent.

## Pourquoi

Strudel est puissant et sonne bien, mais sa syntaxe arrête beaucoup de curieux. Les DAW classiques, eux, cachent toute la logique musicale derrière l'interface. Kringel se place entre les deux : aussi accessible qu'une grille de clips, aussi transparent que du code.

Ce n'est pas un concurrent de FL Studio ou d'Ableton. Pas d'enregistrement audio, pas de VST, pas de mastering.

## Pour qui

**Cible principale** : des gens attirés par Strudel ou la musique électronique, qui ne veulent pas (encore) coder.

**Cible secondaire** : des utilisateurs de Strudel qui veulent esquisser vite une structure, puis repartir avec le code.

Les live coders aguerris ne sont pas la cible : le REPL de Strudel leur convient déjà.

## Principes de conception

1. **Le modèle graphique est la source de vérité.** Le code Strudel est généré à partir du projet, jamais l'inverse. On ne tente pas de relire du code arbitraire pour le transformer en interface.
2. **Le code est toujours visible.** Panneau latéral en lecture seule, mis à jour à chaque geste. C'est la passerelle d'apprentissage et ce qui distingue le produit.
3. **Des boucles, pas une timeline.** Grille de clips façon vue Session, qui colle au modèle cyclique de Strudel.
4. **Une échappatoire en code.** Un type de clip « code libre » permet d'écrire du Strudel directement quand l'interface ne suffit pas.
5. **Une couleur par piste**, reprise sur ses clips, son mixer et sa portion de code : c'est le lien visuel entre le graphique et le texte.

## Périmètre du prototype (v0)

L'objectif du prototype est de répondre à une question : est-ce amusant à utiliser avec seulement ça ?

**Inclus**

- 4 pistes (Drums, Bass, Lead, Pad), 6 scènes
- Grille de clips : créer, sélectionner, lancer, arrêter, dupliquer, supprimer
- Lancement quantifié : un clip démarre au début du cycle suivant
- Lancement d'une scène entière
- Clip **step sequencer** : 16 pas, plusieurs sons, vélocité par pas, choix du kit
- Clip **piano roll** : notes, choix de gamme, choix du son, longueur en cycles
- Clip **code libre** : éditeur Strudel + visualisation en lecture seule
- Mixer par piste : volume, pan, filtre passe-bas, reverb, mute, solo
- Transport : play/stop, BPM, position dans le cycle
- Panneau de code généré, avec surlignage du clip sélectionné
- Sauvegarde locale automatique, export/import JSON
- Quelques projets de démonstration

**Exclu de la v0**

- Timeline linéaire et arrangement
- Comptes utilisateurs, projets en ligne, collaboration
- Enregistrement audio, pistes audio, import de samples personnels
- Export audio (WAV/MP3)
- MIDI entrant ou sortant
- Automation des paramètres
- Mobile et tablette (desktop d'abord, 1440×900 comme référence)
- Édition du code généré

## Écrans

1. **Vue principale** — barre de transport, grille de clips, mixer sous chaque piste, panneau de code à droite (rétractable).
2. **Éditeur step sequencer** — panneau bas, la grille reste visible au-dessus.
3. **Éditeur piano roll** — même panneau bas.
4. **Éditeur code libre** — même panneau bas, code à gauche, visualisation à droite, état d'erreur.
5. **Projet vide** — premier lancement, invitation à créer un clip, projets de démonstration.

États d'un slot de la grille : vide, rempli, en lecture, en attente de lancement, sélectionné.

Direction visuelle : thème sombre, plat, sans skeuomorphisme, dense mais lisible. Libellés en anglais (conventions des DAW).

## Modèle de données (esquisse)

```ts
type Project = {
  id: string;
  name: string;
  bpm: number;
  tracks: Track[]; // colonnes
  sceneCount: number; // lignes
};

type Track = {
  id: string;
  name: string;
  color: string;
  mixer: { gain: number; pan: number; lpf: number; room: number; mute: boolean; solo: boolean };
  clips: (Clip | null)[]; // un slot par scène
};

type Clip =
  | { kind: "steps"; id: string; kit: string; steps: number; rows: StepRow[] }
  | { kind: "notes"; id: string; sound: string; scale: string; cycles: number; notes: Note[] }
  | { kind: "code"; id: string; source: string };

type StepRow = { sound: string; velocities: number[] }; // 0 = pas éteint
type Note = { pitch: number; start: number; duration: number; velocity: number };
```

L'état de lecture (clips actifs, clips en attente) est séparé du projet : il n'est pas sauvegardé.

## Du modèle au son

```
Projet + état de lecture ──► générateur (fonctions pures) ──► code Strudel ──► moteur Strudel ──► audio
                                                                   │
                                                                   └──► panneau de code
```

Exemple de sortie attendue :

```js
stack(
  s("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR909").gain(0.8),
  note("c2 ~ eb2 g2").s("sawtooth").lpf(800).room(0.3),
);
```

À chaque modification, le code est régénéré et réévalué. Le générateur doit produire du code lisible par un humain, pas seulement valide : c'est ce code que l'utilisateur lit pour apprendre.

## Stack

| Besoin                     | Choix                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Base                       | Vite + React + TypeScript                                                                                                        |
| Moteur audio               | Paquets Strudel (`@strudel/core`, `@strudel/mini`, `@strudel/webaudio`, `@strudel/transpiler`, `@strudel/tonal` pour les gammes) |
| État                       | Zustand                                                                                                                          |
| Génération de code         | Module TypeScript maison, fonctions pures                                                                                        |
| Grilles                    | Canvas 2D                                                                                                                        |
| Panneau et éditeur de code | CodeMirror 6                                                                                                                     |
| Style                      | Tailwind CSS                                                                                                                     |
| Composants d'interface     | Radix Primitives (sans style) habillés selon la maquette Claude Design, icônes lucide-react                                      |
| Sauvegarde                 | IndexedDB (Dexie) + export/import JSON                                                                                           |
| Tests                      | Vitest                                                                                                                           |
| Hébergement                | Coolify (site statique, HTTPS)                                                                                                   |

Pas de backend pour la v0.

## Licence

AGPL-3.0, imposée par l'utilisation de Strudel. Le code source de l'app doit être public, y compris pour une version seulement hébergée en ligne.

## Risques

| Risque                                     | Parade                                                             |
| ------------------------------------------ | ------------------------------------------------------------------ |
| L'API des paquets Strudel change           | Isoler Strudel derrière un seul module, épingler les versions      |
| Coupures audio à la réévaluation du code   | Tester tôt ; ne réévaluer qu'aux changements réels                 |
| Code généré illisible                      | Tests de snapshot sur le générateur, relecture humaine des sorties |
| Dérive du périmètre vers un « vrai DAW »   | S'en tenir à la liste v0 ci-dessus                                 |
| Dépendance aux banques de samples externes | Héberger les samples sur Coolify à terme                           |

## Après la v0 (non engagé)

1. Partage d'un projet par URL
2. Export audio
3. Timeline d'arrangement à partir des scènes
4. Comptes et projets en ligne (PocketBase ou Supabase sur Coolify)
5. Rendre le code généré éditable pour les cas simples

## Questions ouvertes

- Nom définitif, domaine, marque
- Kits et sons fournis par défaut
- Le clip « code libre » a-t-il accès à tout Strudel ou à un sous-ensemble ?
- Longueur des clips : fixe à un cycle ou variable dès la v0 pour le step sequencer ?
