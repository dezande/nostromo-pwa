// Faux numéros de documents de la compagnie, pour donner aux panneaux l'air de vraies pièces officielles.
// Ils ne disent rien de la partie : le matricule et les numéros de rapport sont tirés au hasard.
import { tr } from "../i18n";

const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
const digits = (n: number) => Array.from({ length: n }, () => pick("0123456789")).join("");

/** Matricule du Psychic Agent : tiré au hasard à chaque lancement (format 7A-2093). */
export const AGENT_ID = `${pick("123456789")}${pick("ABCDEFGHJKLMNPRSTUVWXYZ")}-${digits(4)}`;

/** Numéro de rapport de fin d'entraînement : nouveau à chaque fin de partie (format ENT-884-K / INC-884-K). */
export const reportNumber = (win: boolean) => `${win ? "ENT" : "INC"}-${digits(3)}-${pick("ABCDEFGHJKLMNPRSTUVWXYZ")}`;

export const DOC_REFS = {
  get welcome() {
    return tr(`RÉF. WY-NOS2-TR/0417 · DOSSIER AGENT N° ${AGENT_ID} · DATE STELLAIRE 2184.06.03`,
      `REF. WY-NOS2-TR/0417 · AGENT FILE NO. ${AGENT_ID} · STARDATE 2184.06.03`);
  },
  /** Fiche de règle n (1 à 4) du protocole. */
  rule: (n: number) => tr(`RÉF. WY-NOS2-AIP/113-0${n} · CLASSIFICATION : INTERNE`, `REF. WY-NOS2-AIP/113-0${n} · CLASSIFICATION: INTERNAL`),
  report: (win: boolean, number: string) => tr(
    `RAPPORT N° ${number} · DOSSIER AGENT N° ${AGENT_ID} · ${win ? "APTITUDE VALIDÉE" : "DOSSIER CLOS"}`,
    `REPORT NO. ${number} · AGENT FILE NO. ${AGENT_ID} · ${win ? "APTITUDE CONFIRMED" : "FILE CLOSED"}`),
};
