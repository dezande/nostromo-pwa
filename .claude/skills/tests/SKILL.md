---
name: tests
description: Écrire, corriger ou faire passer les tests de nostromo-pwa, Jest (src/**/*.test.ts(x), jsdom, signaux Preact) comme Playwright (tests/*.spec.ts, build réel, formats ordinateur et téléphone). À utiliser pour tout ajout de test, test qui échoue, test instable, question sur la couverture, ou nouvelle fonctionnalité qui doit arriver avec son test, même si l'utilisateur ne parle que de « vérifier que ça marche ».
---

# Tests du projet

Deux niveaux, chacun avec son rôle. Un comportement se teste au niveau le plus bas qui peut l'observer :
la logique et les données dans Jest, ce qui a besoin d'un vrai navigateur (mise en page, historique,
service worker, audio réel, PDF) dans Playwright. Dupliquer un test aux deux niveaux coûte du temps de CI
sans rien prouver de plus.

## Ce qu'on lance en local

Seulement les tests concernés par la modification ; la suite complète tourne en CI à chaque PR.

```bash
npx jest src/state/game.test.ts
npx playwright test tests/partie.spec.ts --project=ordinateur     # ou --project=telephone
```

Playwright construit l'app (`vite build`) puis la sert sur le port 4173 ; un serveur déjà là fait échouer
le lancement (`reuseExistingServer: false`). En local il utilise le Chrome installé ; en CI, le Chromium de
Playwright, réparti en trois lots. Connu : `tests/partie.spec.ts` échoue par intermittence en local après
« Lancer », y compris sur `main` ; ne pas chercher la cause dans la modification en cours, regarder la CI.

## Jest

- Config dans `jest.config.js` : jsdom, `@swc/jest`, `__BUILD__` fixé, feuilles de style remplacées,
  `src/test/setup.ts` met la langue en français avant chaque fichier.
- L'audio Web Audio n'existe pas dans jsdom : les tests remplacent `src/audio/audio.ts` par
  `src/test/audioMock.ts` (chaque méthode est un `jest.fn()`). Une méthode ajoutée à `audio` s'ajoute au mock.
- Les signaux (`src/state/*`, `lang`) sont des globaux de module : Jest isole les fichiers de test entre eux,
  pas les tests d'un même fichier. Remettre l'état en place dans un `beforeEach` (`game.showIntro()`,
  `lang.value = "fr"`, signaux d'écran à `false`), pas dans un `finally` par test.
- Composants : rendre dans un conteneur attaché à `document.body` (les `click()` et le focus en dépendent),
  envelopper rendu et actions dans `act()` de `preact/test-utils`, démonter avec `render(null, root)`.
  Interroger le DOM par `id` ou par attribut (`[data-room="vie"]`), jamais par texte de classe CSS seul.
- Temps : `jest.useFakeTimers()` et `advanceTimersByTimeAsync` pour la fermeture des salles, la machine à
  écrire, le rapport de fin. Ne pas attendre en temps réel.
- Pour tester un module avec un autre état enregistré (réglages, langue) : `localStorage` puis
  `jest.isolateModules(() => require("./module"))`, comme dans `settings.test.ts` et `i18n.test.ts`.
- Données : préférer les invariants aux valeurs recopiées (« toutes les salles accessibles sont reliées »,
  « la croix reste dans le polygone », « mêmes scènes en FR et en EN ») ; ils survivent aux changements de
  contenu et attrapent les vraies erreurs.

## Playwright

- `tests/helpers.ts` : `open(page, settings?, adresse?)` ouvre l'app avec des réglages imposés (`FAST` :
  sans voix, sans transitions, sans musique, sans verrou d'écran), installe l'horloge simulée
  (`page.clock`), neutralise la synthèse vocale et passe l'écran « touchez pour commencer ». `launch`,
  `startSimulation`, `placeAgent`, `closeRoom`, `clickRoom`, `reachableRooms` enchaînent les étapes
  habituelles. Partir de ces helpers plutôt que de recoder les clics.
- Un comportement « premier lancement » (langue du navigateur, format d'écran par défaut) ne passe pas par
  `open()`, qui enregistre des réglages : faire `page.goto("/")` directement, comme dans `langue.spec.ts`
  et `format.spec.ts`.
- Horloge : `page.clock.runFor(ms)` avance les minuteurs de l'app (fermeture, machine à écrire, rapport).
  Les attentes Playwright (`expect(locator).toHaveText`) patientent en temps réel ; ne pas empiler des
  `runFor` par précaution, avancer juste ce que le code attend.
- Cibler par `id` et par rôle accessible (`getByRole("button", { name: "Valider" })`) : les libellés sont
  en français par défaut. Un nouvel élément interactif reçoit un `id` stable dans le code.
- Vérifier les erreurs de page : `open()` renvoie la liste des `pageerror` ; la vérifier (`toEqual([])`)
  à la fin de chaque test, ou via la fixture commune si elle existe (`tests/fixtures.ts`).
- Mise en page : un test par format vérifie l'absence de défilement et la présence des éléments dans la
  fenêtre (`format.spec.ts`, `ecrans.spec.ts`) ; un nouveau panneau ou onglet s'ajoute à ces listes.
- Fichiers : un spec par thème (`partie`, `ecrans`, `scenarios`, `reglages`, `audio`, `format`, `retour`,
  `langue`, `pdf-links`) ; la CI répartit les fichiers entre trois machines, un fichier reste donc de taille
  raisonnable.

## Ce qu'un bon test de ce projet ne fait pas

- Vérifier l'absence d'une fonctionnalité supprimée (`#count`, « plus de minuteur ») : l'assertion passe
  toujours et ne protège rien ; on la retire avec la fonctionnalité.
- Lire un fichier source par expression régulière : importer le module (`src/data/ship`, `src/data/sheets`)
  fonctionne depuis `tests/`.
- Dépendre d'un mot d'un texte de scénario susceptible d'être réécrit, quand un `id` ou une structure
  (`#endTitle`, `.rule-count`) dit la même chose.
- Dormir en temps réel (`waitForTimeout`) ou désactiver un test (`.skip`, `.only`) pour le faire passer.

## Diagnostiquer un échec Playwright

`test-results/<test>/error-context.md` donne l'arbre d'accessibilité au moment de l'échec ;
`trace.zip` (gardée sur échec) s'ouvre avec `npx playwright show-trace`. Pour un test instable, le relancer
seul avec `--workers=1 --repeat-each=3` avant de conclure, puis comparer avec `gh run list --branch main`.
