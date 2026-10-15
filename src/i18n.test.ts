// Langue de l'app : choix enregistré, sinon celle du navigateur (français si le navigateur est en français).
import { defaultLang } from "./i18n";

function loadWith(stored: Record<string, string>, languages: string[]) {
  localStorage.clear();
  for (const [k, v] of Object.entries(stored)) localStorage.setItem(k, v);
  Object.defineProperty(navigator, "languages", { value: languages, configurable: true });
  let mod!: typeof import("./i18n");
  jest.isolateModules(() => { mod = require("./i18n"); });
  return mod;
}

test("premier lancement : la langue du navigateur", () => {
  expect(defaultLang(["en-US", "fr"])).toBe("en");
  expect(defaultLang(["fr-FR"])).toBe("fr");
  expect(defaultLang(["de"])).toBe("en");
  expect(defaultLang([])).toBe("en");
  expect(loadWith({}, ["en-GB"]).lang.value).toBe("en");
  expect(loadWith({}, ["fr-CA"]).lang.value).toBe("fr");
});

test("joueur d'avant la version anglaise (réglages enregistrés, pas de langue) : français", () => {
  expect(loadWith({ "nostromo-settings": "{}" }, ["en-US"]).lang.value).toBe("fr");
});

test("langue choisie : enregistrée et reprise", () => {
  const { lang } = loadWith({ "nostromo-lang": "en" }, ["fr-FR"]);
  expect(lang.value).toBe("en");
  lang.value = "fr";
  expect(localStorage.getItem("nostromo-lang")).toBe("fr");
  expect(document.documentElement.lang).toBe("fr");
});
