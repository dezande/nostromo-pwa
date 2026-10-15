// Langue de l'app : français ou anglais. Choisie à l'accueil ou dans les Réglages, sinon celle du navigateur.
// Les textes sont écrits côte à côte : tr("Valider", "Confirm"), ou { fr: …, en: … } pour les données.
// Lire `lang.value` pendant l'affichage suffit pour que l'écran change de langue aussitôt.
import { effect, signal } from "@preact/signals";

export type Lang = "fr" | "en";
export const LANGS: Lang[] = ["fr", "en"];

const STORAGE_KEY = "nostromo-lang";

/**
 * Langue du premier lancement : français si le navigateur est en français, sinon anglais.
 * Un joueur qui avait déjà des réglages (app d'avant la version anglaise) reste en français :
 * ce module doit donc être évalué avant state/settings, qui enregistre les réglages dès le chargement (voir main.tsx).
 */
export function defaultLang(languages: readonly string[] = typeof navigator === "undefined" ? [] : navigator.languages?.length ? navigator.languages : [navigator.language]): Lang {
  try { if (localStorage.getItem("nostromo-settings")) return "fr"; } catch { /* navigation privée */ }
  return (languages[0] || "").toLowerCase().startsWith("fr") ? "fr" : "en";
}

function loadLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") return stored;
  } catch { /* navigation privée */ }
  return defaultLang();
}

export const lang = signal<Lang>(loadLang());

effect(() => {
  try { localStorage.setItem(STORAGE_KEY, lang.value); } catch { /* navigation privée */ }
  // Hors navigateur (tests Playwright qui lisent le plan du vaisseau) : pas de page à mettre à jour.
  if (typeof document !== "undefined") document.documentElement.lang = lang.value;
});

/** Texte dans la langue choisie. */
export const tr = (fr: string, en: string): string => (lang.value === "en" ? en : fr);

/** Données dans la langue choisie : byLang({ fr: …, en: … }). */
export const byLang = <T>(texts: Record<Lang, T>): T => texts[lang.value];
