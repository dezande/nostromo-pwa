// Réglages du joueur : un signal par réglage, enregistrés dans le navigateur (localStorage).
import { signal, effect, type Signal } from "@preact/signals";
import { audio } from "../audio/audio";
import { THEMES, themeVars, DEFAULT_BG } from "../data/themes";

const STORAGE_KEY = "nostromo-settings";

export interface Settings {
  music: boolean;
  musicVolume: number;
  sfxVolume: number;
  voice: boolean;
  theme: number;
  textSize: number;
  scanlines: boolean;
  transitions: boolean;
  countdown: number;
  wakeLock: boolean;
}

export const DEFAULTS: Settings = {
  music: true,        // musique d'ambiance
  musicVolume: 0.6,   // 0 → 1
  sfxVolume: 1,       // 0 → 1
  voice: true,        // annonce vocale du nom de la salle
  theme: 0,           // index dans THEMES
  textSize: 120,      // en %
  scanlines: true,    // lignes horizontales
  transitions: true,  // faux écrans de transition
  countdown: 10,      // secondes
  wakeLock: true,     // écran toujours allumé
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
  const theme = THEMES[settings.theme.value] || THEMES[0];
  root.removeAttribute("style");
  for (const [name, value] of Object.entries(themeVars(theme))) root.style.setProperty(name, String(value));
  root.style.setProperty("--fs", String(settings.textSize.value / 100));
  root.classList.toggle("retro-font", !!theme.font);
  root.classList.toggle("no-scan", !settings.scanlines.value);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.font ? theme.bg : DEFAULT_BG);
});

// Volumes et musique.
effect(() => audio.setMusicVolume(settings.musicVolume.value));
effect(() => audio.setSfxVolume(settings.sfxVolume.value));
effect(() => (settings.music.value ? audio.startMusic() : audio.stopMusic()));
