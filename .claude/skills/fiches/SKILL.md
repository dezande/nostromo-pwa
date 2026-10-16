---
name: fiches
description: Modifier ou créer les documents imprimables de nostromo-pwa (fiches de personnage prétirées, aides et guides du Superviseur, cartes des petits rôles) dans fiches/, regénérer les PDF de public/fiches/ et garder la liseuse de l'app cohérente. À utiliser dès qu'il est question de fiche, prétiré, guide du Superviseur, aide, cartes des rôles, PDF, page A4, version femme, « npm run fiches », ou d'un texte des documents 3D6 Système, même si l'utilisateur ne parle que de « la fiche » ou du « guide ».
---

# Documents imprimables (fiches/)

Chaque document existe sous trois formes qui doivent rester d'accord :
1. la page HTML de `fiches/` (source, en français, et sa jumelle `*-en.html`) ;
2. le PDF de `public/fiches/`, généré par `npm run fiches` et publié avec l'app ;
3. le texte lu dans l'app par la liseuse (`src/screens/DocumentViewer.tsx`), tiré de la même page HTML.

Modifier le HTML seul ne suffit jamais : il faut regénérer les PDF et vérifier la liseuse.

## Les fichiers

| Document | FR | EN | PDF (FR / EN) |
|---|---|---|---|
| Prétiré Psychic Agent + aide (Sixième sens) | `psychic-agent.html` | `psychic-agent-en.html` | `nostromo-sixieme-sens-fiche-{homme,femme}.pdf`, `nostromo-sixieme-sens-aide-superviseur.pdf` / `nostromo-sixth-sense-sheet-{male,female}.pdf`, `nostromo-sixth-sense-supervisor-aid.pdf` |
| Prétiré Reyes + aide (Une simple formalité) | `fiches.html` | `fiches-en.html` | `nostromo-une-simple-formalite-…` / `nostromo-a-mere-formality-…` |
| Prétiré Lieutenant D.R. + aide (Session disciplinaire) | `infiltre.html` | `infiltre-en.html` | `nostromo-session-disciplinaire-…` / `nostromo-disciplinary-session-…` |
| Guides du Superviseur | `guide-superviseur{,-entrainement,-infiltre}.html` | `…-en.html` | `nostromo-<scénario>-guide-superviseur.pdf` / `nostromo-<scenario>-supervisor-guide.pdf` |
| Cartes des petits rôles | `roles.html` | `roles-en.html` | `nostromo-cartes-roles.pdf` / `nostromo-role-cards.pdf` |

Les PDF d'un scénario portent son titre en préfixe (`sixieme-sens`, `une-simple-formalite`, `session-disciplinaire` ;
`sixth-sense`, `a-mere-formality`, `disciplinary-session`). L'aide et le guide du Superviseur existent aussi en PDF miroir (`-miroir.pdf` / `-mirrored.pdf`, pages retournées
sur leur axe vertical par `fiches.mjs`) : le lien PDF de l'app les propose quand le réglage « miroir » est actif.
Tous les documents sauf les cartes existent aussi en A5, deux pages par feuille A4 paysage recto verso (second
lien « Livret » ou « A5 » à côté du PDF dans l'app) : le guide en livret (`-livret.pdf` / `-booklet.pdf`, pages imposées pour qu'une feuille pliée se lise
dans l'ordre : recto 4 | 1, verso 2 | 3), les prétirés et l'aide en deux exemplaires par feuille (`-a5.pdf`, chaque
page deux fois côte à côte, la feuille coupée donne deux fiches). Les documents du Superviseur cumulent les deux
(`-livret-miroir.pdf`, `-a5-mirrored.pdf`…). L'imposition est faite par `fiches.mjs` dans le navigateur (pages A4
réduites à 71 % dans des feuilles `.sheet`), sans toucher aux pages HTML : une page qui tient en A4 tient en A5.
La correspondance exacte (pages, titres des PDF) est dans `scripts/fiches.mjs` ; celle entre documents,
scénarios et boutons de l'app est dans `src/data/sheets.ts` (`SHEETS`, `ROLES`). Un nouveau document se
déclare aux deux endroits, et `tests/pdf-links.spec.ts` vérifie que chaque PDF déclaré existe dans le build.

Styles : `fiche.css` (guides), `pretire.css` (prétirés, lisibles en A4 comme en A5), `roles.css` (cartes
format poker, 9 par page). `pretire.js` dessine au chargement les icônes `<i class="ic" data-ic="nom">`,
les dés `.die`, les rangs `.rank`, les cases de PE `.track[data-n]`, les codes-barres et les illustrations ;
la liste des icônes est au début du fichier. `scenes.js` dessine de même la bande « Scènes clés » des guides
(`<div class="illu" data-illu="nom" data-label="…">` dans `.scenes`, page 2) : les mots d'un dessin (écran, tampon)
viennent de `data-label`, traduit dans la page `-en.html` ; `sheets.test.ts` vérifie que FR et EN ont les mêmes
dessins. Ce script est aussi importé par la liseuse de l'app (`fiches/scenes.d.ts` donne ses types) : une seule
source pour les dessins du PDF et de l'écran, où le CSS les repeint aux couleurs du style. `logo.svg` est le logo
Weyland Corp des en-têtes.

## Règles de mise en page

- Un document est une suite de `<main class="page">` de hauteur A4 fixe. **Un contenu qui dépasse fait échouer
  `npm run fiches`** (message : « la page N dépasse le format A4 de X px »), de même qu'une carte de rôle qui
  déborde de son `.frame`. C'est voulu : on raccourcit le texte ou on répartit autrement, on ne réduit pas la police.
- Prétirés : pages 1–2 = fiche joueur recto verso version homme, pages 3–4 = version femme (recopiées par
  `pretire.js` à partir des attributs `data-f="…"` qui donnent le texte au féminin), pages 5 et suivantes =
  aide du Superviseur. Seules les pages `.page.joueur` sont lues dans l'app pour un prétiré ; les autres pour
  l'aide (`pages` dans `sheets.ts`).
- Chaque texte visible a sa version anglaise dans la page `-en.html`, avec la même structure de classes :
  la liseuse et les tests comptent dessus.
- Le `<title>` de la page devient le titre du PDF (ou celui de la partie pour un prétiré, voir `fiches.mjs`).

## Ce que la liseuse de l'app fait du HTML

`documentText()` dans `src/screens/DocumentViewer.tsx` garde le contenu des pages choisies et :
- supprime ce qui ne sert qu'à l'impression (`PRINT_ONLY` : en-têtes, pieds de page, images, sommaire,
  icônes, illustrations des prétirés, codes-barres, `.notes`, `.symbol`, `.xeno-head`) ;
- dessine les scènes clés des guides avec `fiches/scenes.js`, les mêmes que dans le PDF (le CSS de `.scenes` les
  repeint : trait dans la couleur du texte, papier dans celle du panneau) ;
- remplace les symboles ♂/♀ par un SVG (emoji coloré sur iPad sinon) ;
- ajoute aux caractéristiques une aide et des jauges `.t-pips`, et les cases de PE ;
- retire les attributs `style` (tailles en mm) et les sous-titres « PAGE n ».

Les classes du HTML que l'app met en forme sont dans `src/styles/_home.scss` (bloc `.doc-text`). Une nouvelle
classe dans une fiche sans style dans ce bloc s'affiche brute ; une classe retirée des fiches laisse du CSS
mort. Vérifier dans l'app (`npm run dev`, choix du scénario, bouton « Lire ») sur téléphone et ordinateur.

## Procédure

1. Modifier la page FR et la page EN ensemble.
2. `npm run fiches` (il faut être en ligne pour la police ; Chromium de Playwright ou Chrome local).
   Option `-- --png <dossier>` pour enregistrer une capture de chaque page, et de chaque feuille A5 (livret, deux
   exemplaires), pour vérifier la mise en page à l'œil.
3. Lire le document dans l'app et dans la version anglaise.
4. Tests : `npx playwright test tests/pdf-links.spec.ts tests/scenarios.spec.ts --project=ordinateur`
   (les scénarios vérifient le contenu lu dans la liseuse), et `npx jest src/screens` si la liseuse a changé.
5. Commiter les HTML **et** les PDF regénérés (ils sont versionnés dans `public/fiches/`). Les PDF changent
   à chaque génération même sans modification visible : ne regénérer que ceux qui ont changé de contenu
   si le diff doit rester lisible, sinon tous.

Le README cite les documents et le système de jeu (3D6 Système de François Cedelle, licence ORC) : le mettre
à jour si un document apparaît ou change de nom.
