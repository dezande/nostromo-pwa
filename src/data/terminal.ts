// Textes des faux écrans de transition (terminal MU/TH/UR 6000).
// Chaque ligne : { text, result?, warn? } — result s'affiche au bout de la ligne, en orange si warn.

export interface TerminalLine { text: string; result?: string; warn?: boolean; }
export interface TerminalScript { title: string; lines: TerminalLine[]; }

export const BOOT: TerminalScript = {
  title: "INITIALISATION DE LA SIMULATION",
  lines: [
    { text: "WEYLAND-YUTANI CORP · MU/TH/UR 6000 · v2.1.7" },
    { text: "CONNEXION AU VAISSEAU-BASE NOSTROMO II", result: "OK" },
    { text: "CONTRÔLE DES CLOISONS ÉTANCHES", result: "OK" },
    { text: "LIAISONS PONT 1 / PONT 2 · ASCENSEURS", result: "OK" },
    { text: "CONDUITS D'AÉRATION", result: "OK" },
    { text: "ARMURERIE, LABO · ATMOSPHÈRE", result: "TOXIQUE", warn: true },
    { text: "PROTOCOLE A.I.P.", result: "SCELLÉ" },
    { text: "ORDRE SPÉCIAL 937", result: "ACCÈS REFUSÉ", warn: true },
  ],
};
