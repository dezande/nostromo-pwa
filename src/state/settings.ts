// Réglages du joueur : un signal par réglage, enregistrés dans le navigateur (localStorage).
import { signal, effect, type Signal } from "@preact/signals";
import { audio, type AlertVariant } from "../audio/audio";
import { THEMES, findTheme, themeName, themeVars, DEFAULT_BG } from "../data/themes";

const STORAGE_KEY = "nostromo-settings";

export interface Settings {
  music: boolean;
  musicVolume: number;
  sfxVolume: number;
  voice: boolean;
  theme: string;
  textSize: number;
  scanlines: boolean;
  transitions: boolean;
  wakeLock: boolean;
  alertVariant: AlertVariant;   // musique 2 pendant la partie
  settingsTab: SettingsTab;     // dernier onglet ouvert dans les Réglages
  markerDot: boolean;           // repère discret sur le plan
  layout: Layout;               // format de l'écran de jeu : tablette ou téléphone
}

export type Layout = "tablet" | "phone";

/** Format proposé au premier lancement : téléphone si l'écran est étroit (< 600 px) et en portrait. */
export function defaultLayout(width = window.innerWidth, height = window.innerHeight): Layout {
  return width < 600 && height > width ? "phone" : "tablet";
}

export type SettingsTab = "display" | "audio" | "alert" | "system";

export const DEFAULTS: Settings = {
  music: false,       // musique (coupée par défaut, à activer dans les Réglages)
  musicVolume: 0.6,   // 0 → 1
  sfxVolume: 1,       // 0 → 1
  voice: true,        // annonce vocale du nom de la salle
  theme: THEMES[0].name, // nom du style d'écran
  textSize: 120,      // en %
  scanlines: true,    // lignes horizontales
  transitions: true,  // faux écrans de transition
  wakeLock: true,     // écran toujours allumé
  alertVariant: "siren",
  settingsTab: "display",
  markerDot: true,
  layout: defaultLayout(),
};

// Anciens noms des réglages (version avant Preact), pour ne pas perdre les choix du joueur.
const RENAMED: Record<string, keyof Settings> = { vol: "musicVolume", sfx: "sfxVolume", fs: "textSize", scan: "scanlines", wake: "wakeLock" };

export function loadSettings(): Settings {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    for (const [old, name] of Object.entries(RENAMED)) {
      if (old in stored && !(name in stored)) stored[name] = stored[old];
      delete stored[old];
    }
    if ("theme" in stored) stored.theme = themeName(stored.theme);
    return { ...DEFAULTS, ...stored };
  } catch {
    return { ...DEFAULTS };
  }
}

const saved = loadSettings();
type SettingSignals = { [K in keyof Settings]: Signal<Settings[K]> };
export const settings = Object.fromEntries(
  (Object.keys(DEFAULTS) as (keyof Settings)[]).map(k => [k, signal(saved[k])]),
) as SettingSignals;

// Enregistre à chaque changement.
effect(() => {
  const values = Object.fromEntries(Object.entries(settings).map(([k, s]) => [k, s.value]));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch { /* navigation privée */ }
});

// Applique le style d'écran, la taille du texte et les lignes horizontales à la page.
effect(() => {
  const root = document.documentElement;
  const theme = findTheme(settings.theme.value);
  root.removeAttribute("style");
  for (const [name, value] of Object.entries(themeVars(theme))) root.style.setProperty(name, String(value));
  root.style.setProperty("--fs", String(settings.textSize.value / 100));
  root.classList.toggle("retro-font", !!theme.font);
  root.classList.toggle("no-scan", !settings.scanlines.value);
  root.classList.toggle("layout-phone", settings.layout.value === "phone");
  root.classList.toggle("layout-tablet", settings.layout.value !== "phone");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.font ? theme.bg : DEFAULT_BG);
});

// Volumes et musique.
effect(() => audio.setMusicVolume(settings.musicVolume.value));
effect(() => audio.setSfxVolume(settings.sfxVolume.value));
effect(() => (settings.music.value ? audio.startMusic() : audio.stopMusic()));
