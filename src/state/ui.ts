// Écrans affichés par-dessus le jeu : écran titre, menu, réglages.
import { batch, signal } from "@preact/signals";
import { busy, inGame, showIntro } from "./game";
import { terminalOpen } from "./terminal";

export const homeOpen = signal(true);       // menu d'accueil (aussi utilisé comme menu pause)
export const settingsOpen = signal(false);
export const pressToStart = signal(false);  // « touchez l'écran pour commencer »
/**
 * Panneaux d'accueil après « Démarrer la simulation » : bienvenue, puis une règle par panneau (1 à 4).
 * Scénario « Recrutement » : panneau du RH et contrat à signer à la place du panneau de bienvenue.
 */
export type BriefingPanel = "welcome" | "hr" | "contract" | 1 | 2 | 3 | 4;
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
