---
name: nouveau-scenario
description: Ajouter, retirer ou remanier un scénario de nostromo-pwa (textes d'introduction, règles sur les moniteurs, rapports de fin, documents associés, adresse des panneaux), dans les deux langues et avec les tests. À utiliser dès que l'utilisateur veut « un nouveau scénario », « une autre histoire », changer les panneaux de bienvenue ou le rapport de fin d'un scénario, ajouter un panneau d'introduction, ou touche à src/data/scenarios.ts, même pour « juste changer un texte ».
---

# Scénarios

La partie est la même pour tous les scénarios ; un scénario ne change que l'habillage : panneaux
d'introduction, quatre règles sur les moniteurs, question d'abandon, rapports de fin, documents imprimables.
Quatre existent : `training` (Sixième sens, par défaut), `recruitment` (Une simple formalité : RH et contrat),
`infiltrated` (Session disciplinaire : e-mail intercepté), `free` (sans scénario : aucun panneau).

## Tout ce qu'un scénario touche

Parcourir la liste entière ; un oubli se voit surtout en anglais ou dans un test de parité.

1. **`src/state/settings.ts`** : le type `Scenario` (union d'identifiants). Le dernier scénario choisi est
   mémorisé dans les réglages ; un identifiant supprimé doit être ramené à `training` au chargement
   (voir le traitement des anciens réglages dans `loadSettings`).
2. **`src/data/scenarios.ts`** : un objet `ScenarioText` en français et son jumeau `_EN`, ajoutés tous deux à
   `SCENARIOS`. L'ordre des clés de `SCENARIOS.fr` est l'ordre des cartes au lancement. Champs à ne pas
   oublier : `firstPanel` et `lastPanel` (panneau après « Lancer » et panneau où revient « Retour » depuis la
   règle 1 ; `null` pour commencer la partie tout de suite), `name`, `homeLine`, `description`, `level`,
   `duration`, `rulesHeader`, `rulesIntro`, quatre `rules` (chacune avec une `scene` parmi `start`, `moves`,
   `close`, `end`), `rulesSign`, `quitQuestion`, `win` et `dead` (chaque rapport contient `{room}`).
   `[[…]]` dans un texte affiche un passage censuré sans mettre le texte caché dans la page.
3. **Panneaux d'introduction propres au scénario** : le type `BriefingPanel` dans `src/state/ui.ts`, le slug
   d'adresse dans `PANELS` de `src/state/routes.ts` (`/intro/<slug>`), et un écran dans `src/screens/`
   rendu par `App.tsx` (modèles : `Recruitment.tsx` pour une suite de deux panneaux dont un avec interaction,
   `Infiltrated.tsx` pour un panneau de texte). Le bouton « Continuer » du dernier panneau pose
   `briefing.value = 1` ; le « Retour » de la règle 1 revient à `lastPanel`. Le panneau `welcome` est partagé
   (`Briefing.tsx`).
4. **`src/data/sheets.ts`** : les documents du scénario (prétiré homme et femme, aide, guide), avec leurs
   pages HTML et PDF dans les deux langues. Les fichiers eux-mêmes se créent avec le skill `fiches`.
   Un scénario sans document (`[]`) masque le bloc des documents comme `free`.
5. **Textes bilingues hors `scenarios.ts`** : un contrat (`src/data/contract.ts`), un e-mail (dans l'écran),
   la question d'abandon, les faux numéros de documents (`src/data/documents.ts`) si le scénario en montre.
6. **README** : la liste des scénarios (niveau, durée, résumé) et les documents à imprimer.
7. **Tests** :
   - `src/data/scenarios.test.ts` : l'ordre des identifiants, « 4 règles et deux rapports avec {room} »,
     la parité FR/EN (mêmes panneaux, mêmes scènes, noms différents), les niveaux et durées ;
   - `src/state/routes` (si un panneau s'ajoute) et `tests/retour.spec.ts` : adresse du panneau,
     retour du navigateur ;
   - `tests/scenarios.spec.ts` : un parcours complet du scénario (choix, panneaux, partie, titre du rapport)
     et, s'il y a des documents, leur lecture dans l'app et les attributs `download` des PDF ;
   - `tests/pdf-links.spec.ts` vérifie seul que les PDF déclarés existent.

## Conventions des textes

- Les règles sont projetées sur des moniteurs : titres courts en capitales, deux ou trois puces par règle,
  la voix reste au Superviseur. Un panneau doit tenir dans l'écran sans défilement sur un téléphone
  (`tests/ecrans.spec.ts` le vérifie pour les panneaux partagés ; ajouter le nouveau panneau à sa liste).
- Chaque scénario a son ton de rapport (en-tête, titre, tampon) ; `status` et `note` sont facultatifs.
- Niveau et durée indicative apparaissent sur la carte de choix et dans le guide du Superviseur : les garder
  identiques aux deux endroits.
- Aucun texte ne doit révéler le mécanisme de l'effet (ordre de fermeture, « parité ») :
  `scenarios.test.ts` l'interdit par un test.

## Vérification

`npm run typecheck`, `npx jest src/data src/state`, puis
`npx playwright test tests/scenarios.spec.ts tests/retour.spec.ts --project=ordinateur`, et un passage à la
main dans `npm run dev` en français et en anglais, en format téléphone.
