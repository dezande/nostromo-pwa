# Changelog

Ce que l'utilisateur voit changer dans l'app, du plus récent au plus ancien, une ligne par changement avec
le lien vers sa pull request GitHub. Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
en plus simple : l'app n'a pas de versions numérotées, chaque fusion sur `main` est publiée aussitôt sur
GitHub Pages et le numéro de build affiché dans *Réglages → Système* suit le nombre de commits. Les sections
sont donc datées par jour de fusion.

Toute PR ajoute sa ligne dans la section « Non publié » ; la ligne descend dans une section datée à la fusion.

## Non publié

- Ce changelog, avec un lien « Nouveautés » dans *Réglages → Système* et dans l'écran Sources ([#67]).

## 17 octobre 2026

### Documents imprimables

- Guides du Superviseur relus et alignés sur l'app : les fins de partie sont complétées (note sous le rapport
  gagnant, deux issues pour la Session disciplinaire, événements à tours fixes), une seule année (2184) dans
  la convocation, le contrat et les fiches ([#66]).
- « Livret complet » par scénario : le guide, les deux prétirés et l'aide en un seul PDF A5 à imprimer recto
  verso, lien sur l'écran Scénario ([#65]).

## 16 octobre 2026

### Réglages et fenêtres

- *Réglages → Audio* : une case par bruitage ; un accord de défaite joue quand le pion est éliminé ([#64]).
- Toutes les fenêtres (réglages, sources, tutoriel, choix du scénario, panneaux, rapport de fin) ont le même
  gabarit, boutons au pied, et tiennent sur un téléphone bas ([#64]).

### Scénarios

- Sixième sens : le panneau de bienvenue est une simple convocation, sans un mot sur le danger ; Session
  disciplinaire : le bandeau de la direction identifie l'expéditeur de l'e-mail ([#64]).
- Écran Scénario : cartes dans l'ordre du plus simple au plus complexe, chacune avec son icône ([#58]).

### Plan

- Le repère discret s'efface dès la première fermeture et ne revient plus ([#63]).

### Documents imprimables

- Une bande « Scènes clés » dessinée en page 2 de chaque guide du Superviseur, dans le PDF ([#61]) et dans la
  liseuse de l'app ([#62]).
- À côté de chaque bouton PDF, un lien « Livret » (guide) ou « A5 » (prétirés, aide) pour imprimer en A4
  paysage recto verso ([#59]) ; le réglage « PDF en A5 » disparaît au profit de ces liens ([#60]).

## 15 octobre 2026

### Documents imprimables

- Les PDF portent le titre de leur scénario en préfixe, pour se ranger ensemble une fois téléchargés ([#57]).
- Texte du Superviseur en miroir (réglage, bouton dans la liseuse, PDF miroir), pour lire la tablette posée
  face aux joueurs ([#56]).
- Aide du Superviseur : une page « Répliques des PNJ » et le script complet du Coordinateur ([#48]).

### Scénarios et navigation

- Mode « Sans scénario » : « Lancer » ouvre directement le plan ; documents en grille avec icônes ([#45]).
- En paysage, la ligne niveau · durée ne déborde plus de sa carte ([#46]).
- Une adresse par écran : le bouton « retour » du navigateur revient à l'écran précédent au lieu de quitter
  l'app, et recharger la page garde l'écran ([#47]).
- Un clic très rapide sur « Lancer » après « Démarrer » ne ramène plus à l'accueil ([#54]).

### Fiabilité

- Écran de secours « Défaillance système » en cas de plantage, avec « Recharger » et « Retour à
  l'accueil » ([#51]).
- Au premier lancement, un navigateur en anglais ouvre bien l'app en anglais ([#49]).

### Coulisses, sans changement visible

- Dépendances à jour (Vite 8, TypeScript 7, Node 24) et code mort retiré ([#49]) ; conventions du dépôt et
  skills Claude Code ([#50]) ; tests consolidés ([#52]) ; couverture des tests et audit Lighthouse en
  CI ([#53]) ; vérifications automatiques avant chaque commit ([#55]).

## 14 octobre 2026

### Bilingue

- App bilingue français / anglais : sélecteur FR · EN sur l'accueil, interface, scénarios, plan, annonce
  vocale et documents imprimables traduits ([#43]).

### Scénarios

- Nouveaux titres (« Sixième sens », « Une simple formalité », « Session disciplinaire »), niveau du joueur et
  durée sur chaque carte, caractéristiques lisibles dans la liseuse ([#41]).
- Choix du scénario au lancement, sur son propre écran, à la place de l'onglet des réglages ([#33]).
- Écran Scénario : plus de bouton rogné ni de saut au clic ([#39]).
- Session disciplinaire : l'e-mail montré est celui du Lieutenant D.R. à la C.R.F., intercepté par la
  direction ([#32]).

### Documents imprimables

- Cartes des petits rôles des spectateurs, au format poker ([#42]).
- Prétirés refaits recto verso, lisibles en A5, en versions homme et femme, avec l'aide du MJ à part ([#36]).
- La ligne SALAIRE, sans effet en jeu, disparaît des prétirés ([#40]).

### Accueil

- Tutoriel du 3D6 Système depuis l'accueil ([#34]).
- Écran Sources avec QR codes ([#37]), page Marchand de Trucs et crédits complets dans le README ([#38]).

### Affichage

- Galaxy Tab 4 : l'app ne passe plus sous la barre du bas du navigateur ([#35]).
- Passage à Preact 11, sans changement visible ([#44]).

## 13 octobre 2026

### Scénarios

- Scénario Recrutement (jeu de rôle) : RH, contrat signé par empreinte, examen ([#25]).
- Scénario Infiltré : le Lieutenant D.R., démasqué par la direction ([#26]).
- Salle de briefing B-7 : introductions sur des moniteurs muraux, rapport de fin imprimé ligne à ligne puis
  tamponné, un seul bouton « Continuer » ([#30]).
- Faux numéros de documents sur les panneaux ([#24]) ; fenêtres de fin de partie dans le ton du panneau de
  bienvenue ([#22]).
- Une règle par panneau, avec des scènes animées tirées du vrai plan ; plus de minuteur ; musique coupée par
  défaut ([#16]).

### Documents imprimables

- Fiches et guide du MJ au 3D6 Système, fiche du Lieutenant D.R. ([#27]) ; PDF des trois scénarios et liens
  corrigés ([#29]).

### Jeu

- Limites silencieuses : 5 déplacements, 1 ou 2 salles par fermeture ([#18]).
- Logo Weyland Corp en filigrane sur le chargement, la bienvenue et le jeu ([#17]).

### Interface et réglages

- Format Tablette / Téléphone : écran de jeu sans défilement ([#20]).
- Boutons à icône seule partout, bouton Son / Muet dans l'en-tête ([#19]).
- Réglages : boutons sur une seule rangée ([#21]) ; retour à l'accueil confirmé par Oui / Non
  seulement ([#31]).
- Six styles d'écran, sombres et sans courbure, au lieu de quinze ([#23]).
- README refait ([#28]).
- Tout le travail des PR 2 à 14 arrive sur `main`, avec en plus la musique d'alerte au choix (Sirène, Klaxon,
  Détecteur), les réglages en onglets, la fermeture immédiate avec croix rouge, le cri du xénomorphe et le
  repère discret ([#15]).

## 12 octobre 2026

Les PR 2 à 14 étaient empilées l'une sur l'autre ; elles n'ont atteint `main` que par la PR [#15].

- Première version : plan du vaisseau sur deux ponts, protocoles, compte à rebours et musique.
- Menu d'accueil, styles d'écran rétro, texte plus grand et tests automatiques ([#1]).
- Musique gérée dans les réglages et lancée dès l'ouverture ([#2]).
- Écrans de transition façon terminal du vaisseau ([#3]).
- Numéro de build dans les réglages ([#4]).
- Icônes plus grandes et bouton Menu cohérent ([#5]) ; icônes SVG centrées avec le texte ([#6]).
- Réécriture en Preact + Sass, publiable sur GitHub Pages ([#7]) ; TypeScript et tests unitaires ([#8]).
- Écran de jeu réduit aux deux ponts ([#9]) ; fenêtre du protocole au-dessus du pont 2 ([#10]) ; tracé du
  chemin du pion ([#11]) ; conduits d'aération dessinés comme de vrais couloirs ([#12]).
- Panneaux d'accueil et fermetures choisies par le Coordinateur, sans protocole dans l'app ([#13]).
- Minuteur de 5 minutes, protocole en deux panneaux animés ([#14]).

[#67]: https://github.com/dezande/nostromo-pwa/pull/67
[#66]: https://github.com/dezande/nostromo-pwa/pull/66
[#65]: https://github.com/dezande/nostromo-pwa/pull/65
[#64]: https://github.com/dezande/nostromo-pwa/pull/64
[#63]: https://github.com/dezande/nostromo-pwa/pull/63
[#62]: https://github.com/dezande/nostromo-pwa/pull/62
[#61]: https://github.com/dezande/nostromo-pwa/pull/61
[#60]: https://github.com/dezande/nostromo-pwa/pull/60
[#59]: https://github.com/dezande/nostromo-pwa/pull/59
[#58]: https://github.com/dezande/nostromo-pwa/pull/58
[#57]: https://github.com/dezande/nostromo-pwa/pull/57
[#56]: https://github.com/dezande/nostromo-pwa/pull/56
[#55]: https://github.com/dezande/nostromo-pwa/pull/55
[#54]: https://github.com/dezande/nostromo-pwa/pull/54
[#53]: https://github.com/dezande/nostromo-pwa/pull/53
[#52]: https://github.com/dezande/nostromo-pwa/pull/52
[#51]: https://github.com/dezande/nostromo-pwa/pull/51
[#50]: https://github.com/dezande/nostromo-pwa/pull/50
[#49]: https://github.com/dezande/nostromo-pwa/pull/49
[#48]: https://github.com/dezande/nostromo-pwa/pull/48
[#47]: https://github.com/dezande/nostromo-pwa/pull/47
[#46]: https://github.com/dezande/nostromo-pwa/pull/46
[#45]: https://github.com/dezande/nostromo-pwa/pull/45
[#44]: https://github.com/dezande/nostromo-pwa/pull/44
[#43]: https://github.com/dezande/nostromo-pwa/pull/43
[#42]: https://github.com/dezande/nostromo-pwa/pull/42
[#41]: https://github.com/dezande/nostromo-pwa/pull/41
[#40]: https://github.com/dezande/nostromo-pwa/pull/40
[#39]: https://github.com/dezande/nostromo-pwa/pull/39
[#38]: https://github.com/dezande/nostromo-pwa/pull/38
[#37]: https://github.com/dezande/nostromo-pwa/pull/37
[#36]: https://github.com/dezande/nostromo-pwa/pull/36
[#35]: https://github.com/dezande/nostromo-pwa/pull/35
[#34]: https://github.com/dezande/nostromo-pwa/pull/34
[#33]: https://github.com/dezande/nostromo-pwa/pull/33
[#32]: https://github.com/dezande/nostromo-pwa/pull/32
[#31]: https://github.com/dezande/nostromo-pwa/pull/31
[#30]: https://github.com/dezande/nostromo-pwa/pull/30
[#29]: https://github.com/dezande/nostromo-pwa/pull/29
[#28]: https://github.com/dezande/nostromo-pwa/pull/28
[#27]: https://github.com/dezande/nostromo-pwa/pull/27
[#26]: https://github.com/dezande/nostromo-pwa/pull/26
[#25]: https://github.com/dezande/nostromo-pwa/pull/25
[#24]: https://github.com/dezande/nostromo-pwa/pull/24
[#23]: https://github.com/dezande/nostromo-pwa/pull/23
[#22]: https://github.com/dezande/nostromo-pwa/pull/22
[#21]: https://github.com/dezande/nostromo-pwa/pull/21
[#20]: https://github.com/dezande/nostromo-pwa/pull/20
[#19]: https://github.com/dezande/nostromo-pwa/pull/19
[#18]: https://github.com/dezande/nostromo-pwa/pull/18
[#17]: https://github.com/dezande/nostromo-pwa/pull/17
[#16]: https://github.com/dezande/nostromo-pwa/pull/16
[#15]: https://github.com/dezande/nostromo-pwa/pull/15
[#14]: https://github.com/dezande/nostromo-pwa/pull/14
[#13]: https://github.com/dezande/nostromo-pwa/pull/13
[#12]: https://github.com/dezande/nostromo-pwa/pull/12
[#11]: https://github.com/dezande/nostromo-pwa/pull/11
[#10]: https://github.com/dezande/nostromo-pwa/pull/10
[#9]: https://github.com/dezande/nostromo-pwa/pull/9
[#8]: https://github.com/dezande/nostromo-pwa/pull/8
[#7]: https://github.com/dezande/nostromo-pwa/pull/7
[#6]: https://github.com/dezande/nostromo-pwa/pull/6
[#5]: https://github.com/dezande/nostromo-pwa/pull/5
[#4]: https://github.com/dezande/nostromo-pwa/pull/4
[#3]: https://github.com/dezande/nostromo-pwa/pull/3
[#2]: https://github.com/dezande/nostromo-pwa/pull/2
[#1]: https://github.com/dezande/nostromo-pwa/pull/1
