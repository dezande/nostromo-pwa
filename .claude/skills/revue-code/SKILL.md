---
name: revue-code
description: Revue complète du dépôt nostromo-pwa — bugs et fails, code mort (TypeScript et SCSS), dépendances npm en retard, versions de Node, npm et des actions GitHub — avec un rapport puis, si demandé, une PR vers main. À utiliser dès que l'utilisateur demande de « critiquer le code », « chercher le code mort », « vérifier que npm est à jour », « voir si on peut monter Node », « faire le ménage » ou « un audit », même s'il ne dit pas « revue ».
---

# Revue de code du dépôt

Le but est un rapport fiable : chaque point avancé a été vérifié par une commande ou une lecture, jamais déduit.
L'utilisateur lit le rapport en français, puis décide ce qui part en PR. Les mémoires du projet s'appliquent :
PR toujours vers `main`, jamais de push direct, et localement on ne lance que les tests concernés (la CI fait le reste).

## 1. Préparer

- Dans un worktree, `node_modules` peut dater d'une autre branche : commencer par `npm ci`.
- Lire `package.json`, `tsconfig.json`, `vite.config.ts`, `jest.config.js`, `playwright.config.ts`, `.github/workflows/*.yml`
  et le README (section « Démarrer » : la version de Node promise aux utilisateurs).
- Lancer la base, qui doit être verte avant toute critique :

```bash
npm run typecheck && npx jest && npm run build
```

## 2. Dépendances, Node, npm, actions

```bash
npm outdated --long          # sort avec le code 1 quand il y a du retard : normal
npm audit --json | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{for(const [n,v] of Object.entries(JSON.parse(d).vulnerabilities)){const w=v.via.filter(x=>typeof x==="object");if(w.length)console.log(n,v.range,w.map(x=>x.title+" "+x.severity).join(" | "))}})'
npm view <paquet> engines peerDependencies --json   # pour chaque montée majeure envisagée
curl -s https://nodejs.org/dist/index.json | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const s={};for(const r of JSON.parse(d)){const m=r.version.split(".")[0];if(!s[m])s[m]=r}for(const m of Object.keys(s).sort((a,b)=>b.slice(1)-a.slice(1)).slice(0,5)){const r=s[m];console.log(r.version,"lts:",r.lts,"npm:",r.npm,r.date)}})'
npm view npm version
for a in actions/checkout actions/setup-node actions/cache actions/upload-artifact actions/configure-pages actions/upload-pages-artifact actions/deploy-pages; do printf "%-32s %s\n" "$a" "$(gh api repos/$a/releases/latest --jq .tag_name)"; done
```

Ce qu'il faut en tirer :
- La version de Node de la CI (`node-version:` dans les deux workflows) doit être la LTS active, pas celle en maintenance.
  Local, README, `.nvmrc` et `engines` doivent raconter la même histoire ; `engines` suit le minimum exigé par `sass` et `vite`.
- Pour chaque dépendance en retard, vérifier `engines` et `peerDependencies` de la nouvelle version avant de conclure
  (exemple : `@babel/core` reste en 7 tant que `@preact/preset-vite` exige `7.x`).
- `npm audit` remonte souvent une seule vulnérabilité répétée par la chaîne de Jest (couverture) sans version corrigée :
  le dire en une ligne, ne pas la gonfler.
- Une montée majeure se **teste** dans le worktree, elle ne se recommande pas sur la foi du changelog :
  `npm install --save-exact -D …`, puis typecheck, Jest, build, et deux ou trois fichiers Playwright qui exercent
  le build (`tests/langue.spec.ts`, `tests/retour.spec.ts`, `tests/partie.spec.ts`), avec `--workers=1` si un résultat
  semble instable. Un test qui échoue différemment d'une exécution à l'autre est une instabilité à bissecter
  (retirer une seule modification à la fois : `git commit -m WIP`, `git checkout HEAD~1 -- src tests`, relancer,
  puis restaurer), pas un échec à ignorer. Connu : en local avec le Chrome installé (`channel: "chrome"`),
  `tests/partie.spec.ts` échoue par intermittence après « Lancer » même sur `main` ; la CI, avec le Chromium de
  Playwright, fait foi (`gh run list --branch main --limit 5`).
- Vite : depuis la 7, la cible par défaut est « baseline-widely-available » (Chrome 107, Safari 16). L'app vise des
  tablettes anciennes (voir README et `src/state/viewport.ts`) : `build.target` doit rester explicite dans `vite.config.ts`.

## 3. Code mort

Trois sources, à croiser, car chacune a ses faux positifs :

1. `npx --yes knip@latest --no-progress` : fichiers, exports et types inutilisés.
   Faux positifs connus : `fiches/pretire.js` (chargé par les pages HTML de `fiches/`), et tout ce que les tests
   chargent par `jest.mock(..., () => require(...))` ou `jest.isolateModules` (`DEFAULTS`, `defaultLayout`, `audioMock`).
   Un export signalé mais utilisé dans son propre fichier n'est pas mort : on retire seulement le `export`, pour que
   `noUnusedLocals` prenne le relais la prochaine fois.
2. Classes, ids, `@keyframes`, variables et mixins SCSS : extraire les sélecteurs de `src/styles/*.scss` et chercher
   chaque nom dans `src/**/*.tsx`, `src/**/*.ts`, `index.html` et `fiches/*.html` (la liseuse `.doc-text` stylise les
   pages de `fiches/`). Faux positifs : classes construites (`die-${s}`, `show-deck-${n}`, `rule${i + 1}`), couleurs
   hexadécimales prises pour des ids, `w3` de `w3.org` dans une URL de fond.
3. Lecture des modules : `src/audio/audio.ts` exporte un objet, donc knip n'y voit rien ; chercher chaque méthode
   avec `grep -rn "\.nom(" src tests`. Même chose pour les getters (`audio.xxx`) utilisés par les tests Playwright
   via `window.nostromo`.

Pièges de shell : sous zsh, quoter les motifs (`--include='*.ts'`, `'\.duck\('`), sinon le glob échoue en silence.

Chercher aussi les commentaires périmés (`grep -rn "plus tard\|TODO\|FIXME" src`, mentions de fichiers renommés) et les
entrées de `tsconfig.json` sans effet (un `.js` dans `include` sans `allowJs`).

## 4. Fails et bugs

Lire les modules d'état (`src/state/*.ts`), `src/i18n.ts`, `src/main.tsx` et les écrans, en se posant à chaque fois :
- **Ordre d'évaluation des modules** : un `effect()` de `@preact/signals` tourne dès l'import. Ce qu'un module lit dans
  `localStorage` au chargement dépend de l'ordre des `import` dans `main.tsx`. C'est ainsi qu'un navigateur anglais
  s'ouvrait en français : les réglages étaient enregistrés avant que la langue soit décidée.
- **Ce que les tests ne voient pas** : `tests/helpers.ts` impose des réglages (`FAST`) et la langue ; un comportement
  « premier lancement » n'est couvert que par un test qui n'appelle pas `open()`.
- Chemins absolus dans `index.html` sous `BASE_PATH` : construire avec `BASE_PATH=/nostromo-pwa/ npx vite build --outDir <scratch>`
  et relire `index.html`, `manifest.webmanifest`, `sw.js`.
- Minuteurs non annulés, `await` suivi d'un état partagé (`keepAwake`), promesses sans `catch`.

Pour un soupçon, écrire la preuve : un script Playwright de quelques lignes dans le scratchpad (lancer
`npx vite preview --port 4199`, ouvrir la page avec `locale` choisie, lire `document.documentElement.lang`…), chargé
via `createRequire(<worktree>/package.json)` car le scratchpad ne voit pas `node_modules`.

## 5. Rapport

Dans la réponse, en français, dans cet ordre : verdict en deux phrases, **Fails** (chaque bug avec fichier:ligne, la
preuve, la correction proposée), **Code mort** (groupé par fichier, lignes précises), **Dépendances, Node et npm**
(tableau actuel → dernier → note, résultat de la montée testée, points d'attention), actions GitHub en retard.
Les remarques « qualité sans bug » tiennent en un paragraphe. Terminer par la question : commiter la montée et les
corrections dans une PR, ou seulement l'une des deux.

## 6. Si l'utilisateur dit oui : la PR

Dans l'ordre : CI (Node, actions, `.nvmrc`, `engines`, README), `build.target`, corrections de bugs **avec un test
unitaire et un test Playwright de non-régression**, code mort, puis typecheck, Jest, build, Playwright ciblé.
Message de commit en français, PR vers `main` (`gh pr create --base main`), avec le résumé du rapport dans la description.
