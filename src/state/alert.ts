// Musique 2 et annonces vocales pendant les 5 minutes de l'entraînement.
// La musique 1 (ambiance) joue partout ailleurs.
import { effect } from "@preact/signals";
import { audio } from "../audio/audio";
import { announcementFor } from "../data/announcements";
import { speakAlert } from "./device";
import { settings } from "./settings";
import { remaining, TRAINING_SECONDS } from "./timer";

let playingVariant: string | null = null;

// Démarre / arrête / change la musique d'alerte selon le minuteur et le réglage choisi.
effect(() => {
  const left = remaining.value;
  const variant = settings.alertVariant.value;
  // Musique coupée : pas de musique d'alerte du tout (et rien ne tourne pour rien).
  if (left === null || !settings.music.value) {
    if (playingVariant) audio.stopAlert();
    playingVariant = null;
  } else if (left > 0 && playingVariant !== variant) {
    audio.startAlert(variant);
    playingVariant = variant;
  }
});

// Annonces vocales ; à zéro, quatre bips puis fin de la musique d'alerte.
let lastSpoken: number | null = null;
effect(() => {
  const left = remaining.value;
  if (left === null || left === lastSpoken) return;
  lastSpoken = left;
  const text = announcementFor(left, TRAINING_SECONDS, {
    every30s: settings.alertVoice.peek(),
    finalCountdown: settings.alertCountdown.peek(),
  });
  if (text) speakAlert(text, () => audio.alertDuck(true), () => audio.alertDuck(false));
  if (left === 0) {
    audio.alarm();
    setTimeout(() => { audio.stopAlert(); playingVariant = null; }, 2400);
  }
});
