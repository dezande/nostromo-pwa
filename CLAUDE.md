# Nostromo II – partie fusée (PWA)

Application web installable qui accompagne l'effet de magie *Nostromo II* : plan du vaisseau sur deux ponts,
le Psychic Agent se déplace, le Coordinateur ferme les salles. Création de fan, bilingue français / anglais.
Le README décrit ce que fait l'app et l'organisation des dossiers : le lire avant de toucher au code.

## Langue et ton

- Tout est en français : commentaires, noms de tests, messages de commit, descriptions de PR, réponses à l'auteur.
  Les identifiants du code restent en anglais (`closeRooms`, `settings`), sauf les identifiants HTML et les
  noms d'icônes qui suivent l'interface (`#closeBtn`, `pasArriere`, `#rule1Next`).
- Les commentaires expliquent le pourquoi (règle du jeu, contrainte du navigateur, décision), pas le quoi.
  Un fichier commence par un ou deux commentaires qui disent son rôle.
- Typographie française dans les textes affichés : espaces insécables avant `:` `;` `!` `?`, guillemets « ».
  La version anglaise suit la typographie anglaise.

## Bilingue

- Les textes sont côte à côte : `tr("Valider", "Confirm")` dans les composants, `{ fr: …, en: … }` ou une
  constante `*_EN` jumelle dans `src/data/`. Lire `lang.value` pendant le rendu suffit pour changer de langue.
- Tout texte visible existe dans les deux langues, y compris les documents de `fiches/` (pages `*-en.html`,
  PDF aux noms anglais). Un test de parité FR/EN existe pour les scénarios : le garder vert.
- `src/i18n.ts` doit rester le premier import de `src/main.tsx` : la langue du premier lancement se décide
  avant que `state/settings` enregistre les réglages.

## Code

- Preact 11 + `@preact/signals` : l'état est dans `src/state/`, un signal par donnée, les actions sont des
  fonctions exportées. Les écrans sont des calques (`Overlay`) superposés au plan, pas un routeur.
- `src/data/` ne contient que des données et des textes, sans code d'affichage.
- Tout ce qui se touche dans l'interface a un `id` stable et un nom accessible (`aria-label`) : les tests
  Playwright et Jest s'en servent. Ne pas renommer un `id` sans mettre les tests à jour.
- Audio généré par Web Audio, sans fichier son. Les tests remplacent `src/audio/audio.ts` par
  `src/test/audioMock.ts` : une nouvelle méthode audio s'ajoute aux deux.
- Un export doit servir hors de son fichier ; sinon on ne l'exporte pas, pour que `noUnusedLocals` signale
  le code mort.
- `build.target` dans `vite.config.ts` est volontairement ancien (tablettes anciennes) : ne pas le remonter sans décision.

## Tests

- Jest (`src/**/*.test.ts(x)`, jsdom) pour les données, la logique et les composants ; Playwright (`tests/`)
  pour les parcours dans le navigateur, sur le build, en formats ordinateur et téléphone.
- En local, lancer seulement les tests liés à la modification : `npx jest <fichier>` et
  `npx playwright test tests/<fichier>.spec.ts --project=ordinateur`. La suite complète tourne en CI.
- En cas de doute entre le Chrome installé et la CI, la CI avec le Chromium de Playwright fait foi
  (`CI=1 npx playwright test …` l'utilise aussi en local).
- Chaque nouveau comportement arrive avec son test, au même niveau que le code qu'il vérifie.
  Voir le skill `tests` pour les conventions (helpers, horloge simulée, fixture d'erreurs).

## Git et PR

- Une branche par tâche à partir de `main`, une PR vers `main`, jamais de push direct sur `main`, jamais de
  PR empilées. Avant la PR, mettre la branche à jour avec `main` et relancer typecheck, Jest et le build.
- Message de commit : une ligne de titre en français, puis les raisons. Description de PR en français.
- La CI (`.github/workflows/tests.yml`) lance typecheck, Jest et Playwright en trois lots ; GitHub Pages
  publie `main` automatiquement.

## Commandes

```sh
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npx jest             # tests unitaires
npm run test:coverage # tests unitaires avec la couverture (coverage/)
npm run build        # tsc puis vite build (PWA)
npm run lighthouse   # audit Lighthouse du build (lighthouserc.cjs, rapports dans rapports-lighthouse/)
npm run fiches       # regénère les PDF de public/fiches/ (voir le skill fiches)
```

## Skills du projet

`revue-code` (revue complète, dépendances, code mort), `fiches` (documents imprimables),
`nouveau-scenario` (ajouter un scénario), `tests` (écrire ou corriger des tests).
