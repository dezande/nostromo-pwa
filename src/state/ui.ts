// Écrans affichés par-dessus le jeu : écran titre, menu, réglages.
import { signal } from "@preact/signals";
import { busy, inGame } from "./game";
import { terminalOpen } from "./terminal";

export const homeOpen = signal(true);       // menu d'accueil (aussi utilisé comme menu pause)
export const settingsOpen = signal(false);
export const pressToStart = signal(false);  // « touchez l'écran pour commencer »
/** Panneaux d'accueil après « Démarrer la simulation » : bienvenue puis explication du protocole. */
export const briefing = signal<"welcome" | "protocol1" | "protocol2" | null>(null);

/** Ouvre le menu, sauf pendant un compte à rebours ou une transition. */
export function openMenu() {
  if (busy.value || terminalOpen.value) return;
  homeOpen.value = true;
}

export { inGame };
