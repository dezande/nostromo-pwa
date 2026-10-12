// Minuteur de l'entraînement : 5 minutes à partir de la validation de la salle de départ.
// À zéro, une alarme retentit, mais la partie continue.
import { signal } from "@preact/signals";
import { audio } from "../audio/audio";

export const TRAINING_SECONDS = 5 * 60;

/** Secondes restantes, ou null quand le minuteur ne tourne pas. */
export const remaining = signal<number | null>(null);
/** Les 5 minutes sont écoulées. */
export const expired = signal(false);

let endAt = 0;
let interval: ReturnType<typeof setInterval> | undefined;

function tick() {
  const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  if (left !== remaining.value) remaining.value = left;
  if (left === 0 && !expired.value) {
    expired.value = true;
    clearInterval(interval);
    audio.alarm();
  }
}

export function startTimer() {
  clearInterval(interval);
  endAt = Date.now() + TRAINING_SECONDS * 1000;
  expired.value = false;
  remaining.value = TRAINING_SECONDS;
  interval = setInterval(tick, 250);
}

export function stopTimer() {
  clearInterval(interval);
  remaining.value = null;
  expired.value = false;
}

/** « 04:59 » */
export const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
