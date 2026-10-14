// Écrans affichés par-dessus le jeu : écran titre, menu, réglages.
import { batch, signal } from "@preact/signals";
import { busy, inGame, showIntro } from "./game";
import { terminalOpen } from "./terminal";

export const homeOpen = signal(true);       // menu d'accueil (aussi utilisé comme menu pause)
export const choosingScenario = signal(false); // accueil : choix du scénario avant le lancement
export const settingsOpen = signal(false);
/** Document d'un scénario (fiche ou guide du MJ) : page HTML lue dans l'app, et son PDF. */
export interface ScenarioDocument {
  name: string;
  html: string;
  file: string;
  /** Pages de la page HTML lues dans l'app (sélecteur CSS, par défaut toutes : « .page »). */
  pages?: string;
  /** Version femme d'un prétiré : textes au féminin donnés par data-f. */
  feminine?: boolean;
}
export const openDocument = signal<ScenarioDocument | null>(null);
export const pressToStart = signal(false);  // « touchez l'écran pour commencer »
/** Tutoriel du 3D6 Système ouvert depuis l'accueil : numéro de la page affichée (0…), ou null. */
export const tutorial = signal<number | null>(null);
/** Écran « Sources » (crédits, inspirations, outils) ouvert depuis l'accueil. */
export const sourcesOpen = signal(false);
/**
 * Panneaux d'accueil après « Démarrer la simulation » : bienvenue, puis une règle par panneau (1 à 4).
 * Scénario « Recrutement » : panneau du RH et contrat à signer à la place du panneau de bienvenue.
 * Scénario « Infiltré » : l'e-mail envoyé à la C.R.F., intercepté et annoté par la direction.
 */
export type BriefingPanel = "welcome" | "hr" | "contract" | "email" | 1 | 2 | 3 | 4;
export const briefing = signal<BriefingPanel | null>(null);

/**
 * Retour à l'accueil (depuis les Réglages, après confirmation) : la partie est abandonnée,
 * le minuteur, la musique d'alerte et la voix s'arrêtent ; la musique d'ambiance revient.
 */
export function returnHome() {
  if (busy.value || terminalOpen.value) return;
  try { if ("speechSynthesis" in window) speechSynthesis.cancel(); } catch { /* indisponible */ }
  showIntro(); // remet la partie à zéro et arrête le minuteur (donc la musique d'alerte)
  batch(() => {
    briefing.value = null;
    settingsOpen.value = false;
    homeOpen.value = true;
  });
}

export { inGame };
