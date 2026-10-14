// Fonctions du navigateur : garder l'écran allumé, annonce vocale.
import { settings } from "./settings";
import { lang } from "../i18n";

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
    u.lang = lang.value === "en" ? "en-US" : "fr-FR";
    u.rate = 0.9;
    u.pitch = 0.7;
    const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith(lang.value));
    if (voice) u.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch { /* synthèse vocale indisponible */ }
}

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
