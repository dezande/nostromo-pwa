// Musique d'alerte (musique 2) pendant la partie : de la validation de la salle de départ
// jusqu'à la fin de l'entraînement. La musique d'ambiance (musique 1) joue partout ailleurs.
import { effect } from "@preact/signals";
import { audio } from "../audio/audio";
import { phase } from "./game";
import { settings } from "./settings";

let playingVariant: string | null = null;

effect(() => {
  const inPlay = phase.value === "move" || phase.value === "close";
  const variant = settings.alertVariant.value;
  // Musique coupée : pas de musique d'alerte non plus.
  if (!inPlay || !settings.music.value) {
    if (playingVariant) audio.stopAlert();
    playingVariant = null;
  } else if (playingVariant !== variant) {
    audio.startAlert(variant);
    playingVariant = variant;
  }
});
