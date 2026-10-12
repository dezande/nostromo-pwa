// Annonces vocales pendant les 5 minutes de l'entraînement.

export interface AnnouncementOptions {
  /** annonce toutes les 30 secondes */
  every30s: boolean;
  /** décompte des 10 dernières secondes */
  finalCountdown: boolean;
}

/** « 4 minutes 30 secondes », « 1 minute », « 30 secondes » */
export function durationText(seconds: number): string {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  const parts = [];
  if (m) parts.push(`${m} minute${m > 1 ? "s" : ""}`);
  if (s) parts.push(`${s} seconde${s > 1 ? "s" : ""}`);
  return parts.join(" ");
}

/** Texte à dire quand il reste `remaining` secondes, ou null s'il n'y a rien à dire. */
export function announcementFor(remaining: number, total: number, options: AnnouncementOptions): string | null {
  if (remaining === 0) return "Temps écoulé. Fin de l'entraînement.";
  if (options.every30s && remaining === total) return `Alerte. Entraînement en cours. Il reste ${durationText(remaining)}.`;
  if (options.every30s && remaining % 30 === 0) return `Il reste ${durationText(remaining)}.`;
  if (options.finalCountdown && remaining <= 10) return String(remaining);
  return null;
}
