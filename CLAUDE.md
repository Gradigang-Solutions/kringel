# Kringle

Interface graphique web par-dessus Strudel : grille de clips en boucle, mixer, et panneau affichant le code Strudel généré. Le contexte produit complet et le périmètre sont dans `BRIEF.md` : le lire avant toute décision de conception.

## Règles d'architecture

Ces règles priment sur la commodité. En cas de doute, demander avant de les contourner.

1. **Le modèle de projet est la source de vérité.** Le code Strudel est toujours généré à partir du modèle. Ne jamais parser du code Strudel pour reconstruire l'état de l'interface.
2. **Le générateur de code est pur.** `(projet, état de lecture) → string`, sans effet de bord, sans accès au store, sans import de React ni de Strudel.
3. **Strudel est isolé derrière un seul module** (`src/engine/`). Aucun autre fichier n'importe `@strudel/*`. Si l'API de Strudel change, un seul endroit est à corriger.
4. **Le code généré doit être lisible par un humain** : indenté, une piste par ligne dans le `stack`, pas de valeurs par défaut inutiles (`.gain(1)`, `.pan(0.5)`), nombres arrondis. L'utilisateur lit ce code pour apprendre.
5. **L'état de lecture est séparé du projet** (clips actifs, en attente). Il n'est ni sauvegardé ni exporté.
6. **Pas de backend.** Tout tourne dans le navigateur.

## Structure

```
src/
  model/        Types du projet, constantes du domaine, fonctions de modification pures
  codegen/      Modèle → code Strudel (le cœur du projet)
  engine/       Seul point de contact avec Strudel : évaluer, play, stop, BPM
  store/        Stores Zustand (projet, lecture, interface) et sélecteurs
  ui/
    primitives/ Composants de base stylés selon le design (Button, Slider, Select, Dialog…)
    shared/     Composants et hooks réutilisés par plusieurs écrans (canvas, pastille de piste…)
    grid/       Grille de clips
    mixer/      Tranches de mixer
    editors/    Step sequencer, piano roll, code libre
    code/       Panneau de code généré (CodeMirror)
    transport/
    theme.css   Tokens de design (variables CSS)
  storage/      IndexedDB (Dexie), export/import JSON
  demos/        Projets de démonstration
  lib/          Utilitaires génériques sans notion de domaine (cn, clamp, assertNever…)
  test/         Builders de fixtures partagés par les tests
```

Sens des dépendances : `ui → store → model`, `ui → engine`, `store → codegen → model`. `model/`, `codegen/` et `lib/` n'importent ni React, ni Zustand, ni Strudel, ni Dexie.

## Stack

Vite, React, TypeScript strict, Zustand, Tailwind CSS, Radix Primitives, lucide-react, CodeMirror 6, Canvas 2D, Dexie, Vitest, ESLint, Prettier.

## Commandes

```
npm run dev        Serveur de développement
npm run build      Build de production dans dist/
npm run test       Tests Vitest
npm run lint       ESLint
npm run format     Prettier
npm run typecheck  tsc --noEmit
```

Avant de considérer une tâche terminée : `typecheck`, `lint` et `test` passent, et le code est formaté.

## Conventions

- TypeScript strict, pas de `any`. Les clips sont une union discriminée sur `kind` (`steps`, `notes`, `code`) ; traiter tous les cas avec un `switch` exhaustif terminé par `assertNever` (`lib/`).
- Modifications du projet par fonctions pures dans `model/`, appelées depuis le store. Pas de mutation directe : les types du modèle sont `readonly`.
- Les fonctions de `model/` restent pures et déterministes : les identifiants (et tout ce qui est aléatoire) sont passés en paramètre ou fournis par un générateur injecté, jamais créés à l'intérieur.
- Grilles du step sequencer et du piano roll en Canvas, pas en DOM. Le reste de l'interface en DOM.
- Les animations liées à la lecture (tête de lecture, vumètres) passent par `requestAnimationFrame` et lisent la position auprès du moteur, sans passer par l'état React.
- Libellés de l'interface en anglais. Identifiants du code en anglais. Commentaires et messages de commit en français.
- Chaque piste a une couleur, définie une seule fois dans le modèle et réutilisée partout.

## Clean code

- Une fonction fait une chose. Au-delà d'une quarantaine de lignes ou de deux niveaux d'imbrication, découper. Préférer les retours anticipés aux `if` imbriqués.
- Noms explicites, sans abréviations hormis les conventions du domaine (`bpm`, `lpf`, `pan`). Un booléen se lit comme une question (`isPlaying`, `hasSolo`).
- Pas de nombres magiques : constantes nommées. Les constantes du domaine (nombre de pas, de pistes, de scènes, bornes du mixer, gammes, kits) vivent dans `model/constants.ts`.
- Pas de `as` ni de `!` pour faire taire le compilateur. Les données externes (import JSON, IndexedDB) sont validées à la frontière par un schéma, puis typées.
- Pas de `catch` silencieux : une erreur est affichée, propagée ou explicitement ignorée avec un commentaire qui dit pourquoi.
- Pas de code mort, de code commenté, de `console.log` ni de `TODO` sans contexte dans le code livré.
- Les commentaires expliquent le pourquoi, pas le quoi. Si un bloc a besoin d'un commentaire pour être compris, d'abord essayer de l'extraire dans une fonction bien nommée.
- Exports nommés uniquement (pas d'`export default`, sauf si un outil l'impose). Imports via l'alias `@/`, pas de chemins relatifs qui remontent de plus d'un niveau.

## Composants React

- Composants en fonctions, un composant par fichier, fichier nommé comme le composant (`ClipSlot.tsx`). Props typées par un type `ClipSlotProps`.
- Un composant dépasse ~150 lignes ou gère plusieurs responsabilités : le découper en sous-composants.
- Séparer les **conteneurs** (lisent le store, appellent les actions) des **composants de présentation** (props uniquement, aucun import de store). La plupart des composants sont de présentation.
- Le JSX reste déclaratif : les calculs vont dans des fonctions pures ou des hooks (`useXxx`) colocalisés, testables sans React.
- Sélecteurs Zustand fins : ne jamais s'abonner au store entier. Les sélecteurs utilisés à plusieurs endroits sont définis dans `store/`.
- Pas de `useEffect` pour dériver un état : le calculer au rendu (ou `useMemo` si coûteux). `useEffect` sert uniquement à se synchroniser avec l'extérieur (moteur, canvas, IndexedDB).
- Pas de prop drilling au-delà de deux niveaux : le composant profond lit le store via un sélecteur.
- Composants Canvas : le dessin est dans des fonctions `drawXxx(ctx, data, viewport)` séparées du composant, et la conversion pointeur ↔ cellule/note dans des fonctions pures testées.
- Colocalisation : ce qui ne sert qu'à un écran reste dans son dossier. On le déplace dans `ui/shared/` au moment où un deuxième écran en a besoin.

## Design system

- **La maquette Claude Design est la référence visuelle** (https://claude.ai/design/p/92cf017c-b5e9-4e74-a543-2ce4b6466b15, fichiers `Kringle.dc.html` et `Workspace.dc.html`). En cas d'écart entre la maquette et une règle de cette section, signaler l'écart au lieu de trancher seul.
- **Radix Primitives** (sans style) pour le comportement des composants interactifs complexes : slider, toggle, select, menu, dialog, tooltip, tabs. Ils apportent le clavier, le focus et l'accessibilité ; le style vient entièrement du design. Pas de shadcn/ui ni d'autre bibliothèque de composants stylés.
- Chaque primitive (Radix habillé, ou composant simple comme `Button`) est écrite une fois dans `src/ui/primitives/`, puis réutilisée partout. Ne jamais restyler une primitive sur place : s'il manque une variante (taille compacte, style de piste), l'ajouter dans la primitive via `cva`.
- Icônes : celles prévues par le design ; à défaut, **lucide-react** uniquement.
- Les tokens (couleurs de surface, texte, bordures, accents, rayons, espacements, tailles de police) sont repris de la maquette et déclarés une seule fois en variables CSS dans `src/ui/theme.css`, exposés à Tailwind. Pas de couleur hexadécimale ni de valeur arbitraire (`w-[137px]`) dans les composants, sauf contrainte de layout justifiée par un commentaire.
- Thème sombre uniquement pour la v0, plat, dense : tailles compactes par défaut.
- La couleur d'une piste vient du modèle et est posée une fois en variable CSS (`--track-color`) sur le conteneur de la piste ; ses clips, son mixer et son code la lisent depuis cette variable. Le canvas et CodeMirror la reçoivent depuis le modèle, pas depuis une valeur recopiée.
- Composition de classes avec `cn()` (`lib/cn.ts`, clsx + tailwind-merge). Pas de concaténation manuelle de chaînes de classes.
- Accessibilité de base : tout est utilisable au clavier, chaque bouton icône a un `aria-label`.

## Pas de duplication

- Chaque connaissance a une seule source : constantes dans `model/constants.ts`, tokens dans `theme.css`, couleur de piste dans le modèle, formatage des nombres du code généré dans un seul helper de `codegen/`.
- Dériver les types au lieu de les redéclarer : `Clip["kind"]`, `Extract<Clip, { kind: "steps" }>`, `Pick`, `ReturnType`, types inférés des schémas de validation.
- Avant d'écrire une fonction ou un composant, chercher s'il existe déjà dans `lib/`, `model/`, `ui/primitives/` ou `ui/shared/`.
- Factoriser dès la deuxième occurrence d'une même logique. Exception : deux codes qui se ressemblent mais évolueront pour des raisons différentes restent séparés.
- Le step sequencer et le piano roll partagent leur infrastructure canvas (boucle `requestAnimationFrame`, gestion du `devicePixelRatio`, conversion pointeur → grille, tête de lecture) dans `ui/shared/`.
- Les tests partagent leurs données via les builders de `src/test/`, pas d'objets projet recopiés d'un test à l'autre.

## Tests

- **`codegen/` est la priorité** : tests de snapshot couvrant chaque type de clip, le mixer, mute/solo, les pistes vides et le projet vide. Utiliser des snapshots inline (`toMatchInlineSnapshot`) pour que le code attendu se lise dans le test.
- Relire chaque diff de snapshot comme du code : ne jamais mettre à jour les snapshots à l'aveugle (`-u`).
- Tout bug de génération de code donne lieu à un test avant le correctif.
- `model/` : tests unitaires de chaque fonction de modification, y compris les cas limites (bornes du mixer, slot vide, dernière scène). Viser la couverture complète des branches de `codegen/` et `model/`.
- `storage/` : aller-retour export → import identique, rejet d'un JSON invalide ou d'une version inconnue.
- Les fonctions pures extraites de l'interface (conversions canvas, quantification, sélecteurs) sont testées. Les composants React eux-mêmes n'ont pas besoin de tests unitaires pour la v0.
- Fichiers `xxx.test.ts` à côté du fichier testé. Un test vérifie un comportement, et son nom le décrit en français.
- Données construites avec les builders de `src/test/` (`makeProject`, `makeStepsClip`…), avec des valeurs par défaut surchargées au cas par cas.
- Tests déterministes : pas de vrais timers, pas d'aléatoire non injecté. Ne mocker que les frontières (`engine/`, IndexedDB via `fake-indexeddb`), jamais `model/` ni `codegen/`.

## Strudel

- Ne pas se fier à sa mémoire pour l'API de Strudel : vérifier dans la documentation (https://strudel.cc) ou dans les sources du paquet installé avant d'utiliser une fonction.
- Versions des paquets `@strudel/*` épinglées exactement dans `package.json`. Ne pas les mettre à jour sans demande.
- L'audio ne peut démarrer qu'après un geste de l'utilisateur (contrainte des navigateurs) : initialiser le contexte audio au premier clic sur play.
- Le lancement des clips est quantifié au cycle suivant.
- Ne réévaluer le code que s'il a réellement changé, pour éviter les coupures audio.

## Périmètre

La v0 est définie dans `BRIEF.md`. Ne pas ajouter ce qui en est exclu (timeline, comptes, export audio, MIDI, automation, mobile, édition du code généré) sans demande explicite. Si une tâche semble l'exiger, le signaler au lieu de l'implémenter.

## Déploiement

Site statique sur Coolify : build `npm run build`, sortie `dist/`, HTTPS requis pour le Web Audio.

## Licence

AGPL-3.0 (imposée par Strudel). Vérifier la compatibilité de licence avant d'ajouter une dépendance.
