// Sources et crédits, affichés dans l'écran « Sources » (bouton de l'accueil).
// Une adresse avec `qr` est aussi montrée en QR code, pour l'ouvrir depuis un téléphone.

export interface Source {
  name: string;
  /** Auteur, éditeur ou licence. */
  by: string;
  /** Ce que l'app en reprend. */
  use: string;
  url?: string;
  qr?: boolean;
}

export interface SourceGroup {
  title: string;
  items: Source[];
}

export const SOURCES: SourceGroup[] = [
  {
    title: "Cette app",
    items: [
      { name: "Nostromo II · partie fusée", by: "Création de fan", use: "L'app en ligne, à installer sur l'écran d'accueil",
        url: "https://dezande.github.io/nostromo-pwa/", qr: true },
      { name: "Code source", by: "GitHub · dezande/nostromo-pwa", use: "Le code de l'app et des fiches",
        url: "https://github.com/dezande/nostromo-pwa", qr: true },
      { name: "Claude Code", by: "Anthropic", use: "Assistant IA qui a écrit le code, les textes et les fiches avec l'auteur",
        url: "https://claude.com/claude-code", qr: true },
    ],
  },
  {
    title: "Inspirations",
    items: [
      { name: "Nostromo II", by: "Fred Darevil · Marchand de Trucs", use: "L'effet que l'app accompagne : plan, protocoles et cartes",
        url: "https://www.marchanddetrucs.com/magasin-de-magie/nos-produits/nostromo-ii.html", qr: true },
      { name: "3D6 Système", by: "François Cedelle · licence ORC", use: "Système de jeu des fiches, des guides du MJ et du tutoriel",
        url: "https://3d6.ovh/", qr: true },
      { name: "cool-retro-term", by: "Swordfish90", use: "Profils des styles d'écran et effets cathodiques",
        url: "https://github.com/Swordfish90/cool-retro-term", qr: true },
      { name: "Alien", by: "Marques de leurs ayants droit", use: "Weyland-Yutani, Nostromo et les noms associés, sans lien avec l'app" },
    ],
  },
  {
    title: "Outils",
    items: [
      { name: "Preact", by: "Licence MIT", use: "Composants de l'interface", url: "https://preactjs.com" },
      { name: "Vite", by: "Licence MIT", use: "Compilation et mode hors ligne", url: "https://vite.dev" },
      { name: "TypeScript", by: "Licence Apache 2.0", use: "Langage du code", url: "https://www.typescriptlang.org" },
      { name: "Sass", by: "Licence MIT", use: "Styles", url: "https://sass-lang.com" },
      { name: "uqr", by: "Licence MIT", use: "QR codes de cette page", url: "https://github.com/unjs/uqr" },
      { name: "Polices", by: "Google Fonts · Fontsource", use: "IBM Plex Mono, JetBrains Mono, Fira Code, Questrial", url: "https://fonts.google.com" },
    ],
  },
];

// Version anglaise.
export const SOURCES_EN: SourceGroup[] = [
  {
    title: "This app",
    items: [
      { name: "Nostromo II · rocket game", by: "Fan creation", use: "The online app, to install on your home screen",
        url: "https://dezande.github.io/nostromo-pwa/", qr: true },
      { name: "Source code", by: "GitHub · dezande/nostromo-pwa", use: "The code of the app and the sheets",
        url: "https://github.com/dezande/nostromo-pwa", qr: true },
      { name: "Claude Code", by: "Anthropic", use: "AI assistant that wrote the code, the texts and the sheets with the author",
        url: "https://claude.com/claude-code", qr: true },
    ],
  },
  {
    title: "Inspirations",
    items: [
      { name: "Nostromo II", by: "Fred Darevil · Marchand de Trucs", use: "The effect the app accompanies: map, protocols and cards",
        url: "https://www.marchanddetrucs.com/magasin-de-magie/nos-produits/nostromo-ii.html", qr: true },
      { name: "3D6 Système", by: "François Cedelle · ORC licence", use: "Game system of the sheets, the GM guides and the tutorial",
        url: "https://3d6.ovh/", qr: true },
      { name: "cool-retro-term", by: "Swordfish90", use: "Screen style profiles and CRT effects",
        url: "https://github.com/Swordfish90/cool-retro-term", qr: true },
      { name: "Alien", by: "Trademarks of their rights holders", use: "Weyland-Yutani, Nostromo and related names, not affiliated with the app" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Preact", by: "MIT licence", use: "Interface components", url: "https://preactjs.com" },
      { name: "Vite", by: "MIT licence", use: "Build and offline mode", url: "https://vite.dev" },
      { name: "TypeScript", by: "Apache 2.0 licence", use: "Language of the code", url: "https://www.typescriptlang.org" },
      { name: "Sass", by: "MIT licence", use: "Styles", url: "https://sass-lang.com" },
      { name: "uqr", by: "MIT licence", use: "QR codes on this page", url: "https://github.com/unjs/uqr" },
      { name: "Fonts", by: "Google Fonts · Fontsource", use: "IBM Plex Mono, JetBrains Mono, Fira Code, Questrial", url: "https://fonts.google.com" },
    ],
  },
];
