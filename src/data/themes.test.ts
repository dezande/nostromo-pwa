import { THEMES, fontStack, isLight, mix, themeVars } from "./themes";

describe("couleurs", () => {
  test("mix mélange deux couleurs", () => {
    expect(mix("#ffffff", "#000000", 1)).toBe("#ffffff");
    expect(mix("#ffffff", "#000000", 0)).toBe("#000000");
    expect(mix("#ff0000", "#0000ff", 0.5)).toBe("#800080");
  });

  test("isLight reconnaît les fonds clairs", () => {
    expect(isLight("#f2f2ec")).toBe(true);
    expect(isLight("#000000")).toBe(false);
    expect(isLight("#3b3b8f")).toBe(false);
  });

  test("fontStack ajoute des polices de secours", () => {
    expect(fontStack("VT323")).toBe('"VT323", ui-monospace, Menlo, Consolas, monospace');
  });
});

describe("styles d'écran", () => {
  test("15 styles : l'original puis les 14 de cool-retro-term", () => {
    expect(THEMES).toHaveLength(6);
    expect(THEMES[0].name).toBe("Nostromo (origine)");
    expect(new Set(THEMES.map(t => t.name)).size).toBe(6);
  });

  test("le style d'origine garde les couleurs de la feuille de style", () => {
    expect(themeVars(THEMES[0])).toEqual({});
  });

  test.each(THEMES.slice(1).map(t => [t.name, t] as const))("%s : palette complète et effets entre 0 et 1", (_name, theme) => {
    const vars = themeVars(theme);
    expect(theme.font).toBeTruthy();
    for (const name of ["--bg", "--accent", "--ink", "--dim", "--panel", "--line", "--room", "--font"]) expect(vars).toHaveProperty(name);
    for (const name of ["--flicker", "--noise", "--curve", "--bloom", "--rgb", "--ambient", "--scan"]) {
      expect(vars[name]).toBeGreaterThanOrEqual(0);
      expect(vars[name]).toBeLessThanOrEqual(1);
    }
  });

  test("tous les styles sont sombres et ne courbent pas l'écran", () => {
    const light = THEMES.filter(t => themeVars(t)["color-scheme"] === "light").map(t => t.name);
    expect(light).toEqual([]);
    expect(THEMES.filter(t => t.font && t.curve > 0).map(t => t.name)).toEqual([]);
  });
});
