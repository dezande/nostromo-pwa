// Fonctions du navigateur : garder l'écran allumé, annonce vocale.
import { settings } from "./settings";

let wakeLock: WakeLockSentinel | null = null;

export async function keepAwake() {
  if (!settings.wakeLock.value || !("wakeLock" in navigator) || wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => { wakeLock = null; });
  } catch { /* refusé par le navigateur */ }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") keepAwake();
});

export function say(text: string) {
  if (!settings.voice.value || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.9;
    u.pitch = 0.7;
    const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith("fr"));
    if (voice) u.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch { /* synthèse vocale indisponible */ }
}

/** Voix de l'alerte (français, un peu grave), avec des rappels au début et à la fin de la phrase. */
export function speakAlert(text: string, onStart: () => void, onEnd: () => void) {
  if (!("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.95;
    u.pitch = 0.8;
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === "fr-FR") || voices.find(v => v.lang?.startsWith("fr"));
    if (voice) u.voice = voice;
    u.onstart = onStart;
    u.onend = onEnd;
    u.onerror = onEnd;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch { /* synthèse vocale indisponible */ }
}

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
