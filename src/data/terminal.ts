// Textes des faux écrans de transition (terminal MU/TH/UR 6000).
// Chaque ligne : { text, result?, warn? } — result s'affiche au bout de la ligne, en orange si warn.
import { PROTOCOLS, type Protocol } from "./protocols";

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
    { text: "CHARGEMENT DES PROTOCOLES A.I.P.", result: `${PROTOCOLS.length} TROUVÉS` },
    { text: "ORDRE SPÉCIAL 937", result: "ACCÈS REFUSÉ", warn: true },
  ],
};

// L'ordre de fermeture n'est jamais affiché ici : il doit rester secret.
export const protocolLoading = (p: Protocol): TerminalScript => ({
  title: "CHARGEMENT DU PROTOCOLE",
  lines: [
    { text: `PROTOCOLE N°${p.id} · ${p.date}` },
    { text: `INSTRUCTEUR : ${p.instructor.toUpperCase()}` },
    { text: `PARTICIPANTS : ${p.participants}` },
    { text: "DÉCRYPTAGE DE LA SÉQUENCE DE FERMETURE", result: "OK" },
    { text: "SCELLEMENT DES SALLES TOXIQUES", result: "OK" },
    { text: "SYNCHRONISATION DU PSYCHIC AGENT", result: "OK" },
    { text: "SPÉCIMEN XX121 · CONFINEMENT", result: "EN ATTENTE", warn: true },
  ],
});
