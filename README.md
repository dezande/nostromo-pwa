# Nostromo II – partie fusée (PWA)

Application web installable qui accompagne l'effet *Nostromo II* (Fred Darevil, Marchand de Trucs) :
plan du vaisseau-base sur deux ponts, les 4 protocoles A.I.P., compte à rebours avant chaque
fermeture de salle, annonce vocale, musique d'ambiance et bruitages.

La musique et les bruitages sont générés par le navigateur (Web Audio) : aucun fichier audio.

## Tester sur ton ordinateur

Il faut un petit serveur local (le service worker ne marche pas en ouvrant le fichier directement).
Depuis ce dossier, une de ces commandes suffit :

```sh
python3 -m http.server 8000
# ou
npx serve .
```

Puis ouvre <http://localhost:8000> dans Chrome, Edge ou Firefox. Clique sur « ♫ Musique » pour lancer l'ambiance.
Dans Chrome ou Edge, l'icône « Installer » dans la barre d'adresse installe l'app sur l'ordinateur.

## Installer sur un téléphone

Héberge le dossier en HTTPS (GitHub Pages, Netlify…), ouvre l'adresse sur le téléphone, puis
« Ajouter à l'écran d'accueil ». L'app fonctionne ensuite hors ligne.

## Tests

Tests automatiques avec [Playwright](https://playwright.dev) : écran d'accueil, partie complète avec chacun des
4 protocoles, élimination de l'agent, déplacements, styles d'écran et réglages, sur ordinateur et téléphone.

```sh
npm install
npm test
```

En local, les tests utilisent le Chrome installé. Sur GitHub, ils se lancent à chaque pull request et à chaque
push sur `main` (`.github/workflows/tests.yml`).

## Fichiers

- `index.html` : toute l'application (plan, règles, audio). Les salles, liaisons et protocoles sont dans `ROOMS`, `LINKS` et `PROTOCOLS`.
- `manifest.webmanifest`, `sw.js`, `icons/` : partie PWA (installation, hors ligne).
- `tests/`, `playwright.config.js`, `package.json` : tests automatiques.

- `version.js` : numéro de build et date, affichés en bas des Réglages.

À chaque modification de l'app, incrémente `build` dans `version.js` (et mets la date) : le cache hors ligne (`sw.js`) en dépend, l'app installée se met donc à jour, et tu vois dans Réglages quel build tu utilises.
