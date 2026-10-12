# Nostromo II – partie fusée (PWA)

Application web installable qui accompagne l'effet *Nostromo II* (Fred Darevil, Marchand de Trucs) :
plan du vaisseau-base sur deux ponts, les 4 protocoles A.I.P., compte à rebours avant chaque
fermeture de salle, annonce vocale, musique d'ambiance et bruitages, styles d'écran rétro.

La musique et les bruitages sont générés par le navigateur (Web Audio) : aucun fichier audio.

## Démarrer

Il faut [Node.js](https://nodejs.org) (version 20 ou plus).

```sh
npm install      # une seule fois
npm run dev      # serveur de développement : http://localhost:5173 (se recharge à chaque modification)
npm run build    # version finale dans dist/
npm run preview  # sert dist/ pour la tester (avec le mode hors ligne)
npm test         # tous les tests (Jest puis Playwright)
npm run typecheck # vérification TypeScript
```

## Organisation du code

Le projet est écrit en [TypeScript](https://www.typescriptlang.org) et utilise [Vite](https://vite.dev), [Preact](https://preactjs.com) (composants),
[@preact/signals](https://preactjs.com/guide/v10/signals/) (état) et [Sass](https://sass-lang.com) (styles).

```
src/
  main.tsx              point d'entrée
  App.tsx               assemblage de l'écran
  data/                 données, sans code d'affichage
    ship.ts             salles, liaisons, positions sur le plan
    protocols.ts        les 4 protocoles A.I.P.
    themes.ts           styles d'écran (cool-retro-term)
    terminal.ts         textes des écrans de transition
  state/                état et actions
    game.ts             partie : pion, déplacements, fermetures, fin
    settings.ts         réglages enregistrés dans le navigateur
    ui.ts               écrans ouverts (menu, réglages…)
    terminal.ts         déroulement des écrans de transition
    device.ts           écran allumé, annonce vocale
    pwa.ts              mode hors ligne et numéro de build
  audio/audio.ts        musique et bruitages
  components/           morceaux d'interface (plan, en-tête, coordinateur, icônes…)
  screens/              écrans superposés (accueil, protocoles, compte à rebours, fin, réglages…)
  styles/               Sass : un fichier par partie, réunis dans main.scss
  **/*.test.ts(x)       tests unitaires Jest, à côté du code testé
tests/                  tests de bout en bout Playwright
public/icons/           icônes de l'app
```

Pour changer un protocole ou une salle, il suffit de modifier `src/data/`.

## Version

Le numéro de build est calculé automatiquement au moment du `build` : nombre de commits Git et
identifiant du commit. Il s'affiche en bas des Réglages, avec l'état du mode hors ligne.
La version (`1.0.0`) se change dans `package.json`.

## Tests

- **Jest** (`npm run test:unit`, fichiers `src/**/*.test.ts(x)`) : tests unitaires rapides des données
  (plan, liaisons, protocoles, styles), de la logique de jeu (pose du pion, déplacements, fermetures,
  victoire, élimination), des réglages enregistrés, des transitions et de composants Preact.
- **Playwright** (`npm run test:e2e`, dossier `tests/`) : parcours complets dans un vrai navigateur, sur la
  version compilée, sur ordinateur et téléphone. En local, ils utilisent le Chrome installé.

Sur GitHub, la vérification TypeScript et les deux séries de tests se lancent à chaque pull request
(`.github/workflows/tests.yml`).

## Publication sur GitHub Pages

`.github/workflows/pages.yml` publie le site à chaque fusion sur `main`, à l'adresse
`https://<compte>.github.io/nostromo-pwa/`.

À faire une seule fois sur GitHub : dépôt public (GitHub Pages n'est pas disponible pour un dépôt
privé avec un compte gratuit), puis **Settings → Pages → Source : GitHub Actions**.

Sur un téléphone, ouvre l'adresse puis « Ajouter à l'écran d'accueil » : l'app fonctionne ensuite hors ligne.
