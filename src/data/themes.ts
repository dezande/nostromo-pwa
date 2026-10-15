// Styles d'écran, repris des profils de cool-retro-term (https://github.com/Swordfish90/cool-retro-term).
// Les polices d'origine n'existent pas sur le web : on utilise des polices proches de Google Fonts.
// La gigue et la synchro horizontale ne sont pas utilisées : pas de déformation de l'image.
// Seuls les styles sombres et sans courbure de l'écran sont gardés.

/** Intensité des effets d'écran, de 0 à 1. */
interface CrtEffects {
  flicker: number;
  noise: number;
  curve: number;
  bloom: number;
  rgb: number;
  /** trame : 0 légère, 1 lignes marquées, 4 aucune */
  raster: 0 | 1 | 4;
  ambient: number;
}

export type Theme = { name: string } & ({ font?: undefined } | ({ font: string; fg: string; bg: string } & CrtEffects));

const crt = (name: string, font: string, fg: string, bg: string, fx: CrtEffects): Theme => ({ name, font, fg, bg, ...fx });

export const THEMES: Theme[] = [
  { name: "Nostromo (origine)" }, // couleurs par défaut de la feuille de style
  //   nom                  police             texte      fond       flicker noise curvature bloom rgbShift raster(0 légère, 1 lignes, 4 aucune) ambient
  crt("IBM 3278 Reborn",  "IBM Plex Mono",   "#3cff7a", "#000000", { flicker: 0,  noise: 0,  curve: 0,  bloom: .2, rgb: 0,  raster: 4, ambient: .2 }),
  crt("Neon Cyan",        "JetBrains Mono",  "#52f7ff", "#001018", { flicker: .1, noise: .1, curve: 0,  bloom: .3, rgb: 0,  raster: 4, ambient: .1 }),
  crt("Ghost Terminal",   "JetBrains Mono",  "#a6b3c0", "#0b1014", { flicker: 0,  noise: .1, curve: 0,  bloom: .3, rgb: 0,  raster: 4, ambient: .3 }),
  crt("Plasma",           "Fira Code",       "#ff9bd6", "#070014", { flicker: .1, noise: .1, curve: 0,  bloom: .3, rgb: 0,  raster: 4, ambient: .1 }),
  crt("Boring",           "JetBrains Mono",  "#ffffff", "#000000", { flicker: 0,  noise: 0,  curve: 0,  bloom: .2, rgb: 0,  raster: 4, ambient: .1 }),
];

/** Style enregistré par son nom ; un style supprimé (ou inconnu) revient au style d'origine. */
export const findTheme = (name: unknown): Theme => THEMES.find(t => t.name === name) || THEMES[0];

// Anciens styles, enregistrés par leur numéro dans l'ancienne liste.
const OLD_THEMES = ["Nostromo (origine)", "Default Amber", "Monochrome Green", "Deep Blue", "Commodore 64", "Commodore PET", "Apple ][", "Atari 400", "IBM VGA 8x16", "IBM 3278 Reborn", "Neon Cyan", "Ghost Terminal", "Plasma", "Boring", "E-Ink"];
/** Nom d'un style enregistré (ancien numéro ou nom), ramené au style d'origine s'il n'existe plus. */
export const themeName = (stored: unknown): string => findTheme(typeof stored === "number" ? OLD_THEMES[stored] : stored).name;

export const DEFAULT_BG = "#07090a";

const toRgb = (hex: string): number[] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
/** Mélange deux couleurs : t = 1 → a, t = 0 → b. */
export const mix = (a: string, b: string, t: number): string => "#" + toRgb(a).map((v, i) => Math.round(v * t + toRgb(b)[i] * (1 - t)).toString(16).padStart(2, "0")).join("");
export const isLight = (hex: string): boolean => { const [r, g, b] = toRgb(hex); return r * .3 + g * .59 + b * .11 > 140; };
export const fontStack = (font: string): string => `"${font}", ui-monospace, Menlo, Consolas, monospace`;

/**
 * Variables CSS d'un style : toute la palette est dérivée de la couleur du texte et du fond.
 * Renvoie {} pour le style d'origine (les valeurs par défaut de la feuille de style s'appliquent).
 */
export function themeVars(theme: Theme): Record<string, string | number> {
  if (!theme.font) return {};
  const { fg, bg } = theme;
  const pole = isLight(bg) ? "#000000" : "#ffffff";
  return {
    "--bg": bg, "--accent": fg, "--ink": mix(fg, pole, .55), "--dim": mix(fg, bg, .62),
    "--panel": mix(fg, bg, .06), "--line": mix(fg, bg, .16),
    "--room": mix(fg, bg, .08), "--room-hi": mix(fg, bg, .2), "--glow": mix(fg, bg, .12),
    "--wall": mix(fg, bg, .28), "--deco": mix(fg, bg, .04), "--room-stroke": mix(fg, bg, .4), "--vent": mix(fg, bg, .5),
    "--veil": bg + "e0", "--font": fontStack(theme.font),
    "--scan": theme.raster === 1 ? 1 : theme.raster === 0 ? .85 : .7,
    "--flicker": theme.flicker, "--noise": theme.noise, "--curve": theme.curve,
    "--bloom": theme.bloom, "--rgb": theme.rgb, "--ambient": theme.ambient,
    "color-scheme": isLight(bg) ? "light" : "dark",
  };
}
