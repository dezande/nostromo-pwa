jest.mock("../audio/audio", () => require("../test/audioMock"));

const KEY = "nostromo-settings";

/** Recharge le module de réglages avec ce qui est enregistré dans le navigateur. */
function loadWith(stored: object | null) {
  localStorage.clear();
  if (stored) localStorage.setItem(KEY, JSON.stringify(stored));
  let mod!: typeof import("./settings") & { audio: typeof import("../test/audioMock").audio };
  jest.isolateModules(() => { mod = { ...require("./settings"), audio: require("../audio/audio").audio }; });
  return mod;
}

test("valeurs par défaut", () => {
  const { settings, DEFAULTS } = loadWith(null);
  expect(settings.music.value).toBe(DEFAULTS.music);
  expect(settings.textSize.value).toBe(120);
  expect(settings.alertVariant.value).toBe("siren");
});

test("reprend les réglages enregistrés", () => {
  const { settings } = loadWith({ textSize: 140, theme: "Neon Cyan" });
  expect(settings.textSize.value).toBe(140);
  expect(settings.theme.value).toBe("Neon Cyan");
});

test("style d'écran : ancien numéro converti, style supprimé ramené au style d'origine", () => {
  expect(loadWith({ theme: 10 }).settings.theme.value).toBe("Neon Cyan");
  expect(loadWith({ theme: 1 }).settings.theme.value).toBe("Nostromo (origine)");        // Default Amber, supprimé
  expect(loadWith({ theme: "Commodore 64" }).settings.theme.value).toBe("Nostromo (origine)");
});

test("convertit les anciens noms de réglages", () => {
  const { settings } = loadWith({ vol: 0.3, sfx: 0.5, fs: 140, scan: false, wake: false });
  expect(settings.musicVolume.value).toBe(0.3);
  expect(settings.sfxVolume.value).toBe(0.5);
  expect(settings.textSize.value).toBe(140);
  expect(settings.scanlines.value).toBe(false);
  expect(settings.wakeLock.value).toBe(false);
});

test("ignore un enregistrement illisible", () => {
  localStorage.setItem(KEY, "{pas du json");
  let mod!: typeof import("./settings");
  jest.isolateModules(() => { mod = require("./settings"); });
  expect(mod.settings.textSize.value).toBe(120);
});

test("enregistre chaque changement", () => {
  const { settings } = loadWith(null);
  settings.alertVariant.value = "klaxon";
  expect(JSON.parse(localStorage.getItem(KEY)!).alertVariant).toBe("klaxon");
});

test("applique le style d'écran, la taille du texte et les lignes à la page", () => {
  const { settings } = loadWith(null);
  const root = document.documentElement;
  settings.theme.value = "IBM 3278 Reborn";
  expect(root.style.getPropertyValue("--accent")).toBe("#3cff7a");
  expect(root.classList.contains("retro-font")).toBe(true);
  settings.textSize.value = 150;
  expect(root.style.getPropertyValue("--fs")).toBe("1.5");
  settings.scanlines.value = false;
  expect(root.classList.contains("no-scan")).toBe(true);
  settings.theme.value = "Nostromo (origine)";
  expect(root.style.getPropertyValue("--accent")).toBe("");
  expect(root.classList.contains("retro-font")).toBe(false);
});

test("la musique suit la case Musique", () => {
  const { settings, audio } = loadWith({ music: true });
  expect(audio.startMusic).toHaveBeenCalled();
  settings.music.value = false;
  expect(audio.stopMusic).toHaveBeenCalled();
});

test("format par défaut : téléphone si l'écran est étroit et en portrait, sinon tablette", () => {
  const { defaultLayout } = loadWith(null);
  expect(defaultLayout(390, 844)).toBe("phone");
  expect(defaultLayout(360, 780)).toBe("phone");
  expect(defaultLayout(599, 900)).toBe("phone");
  expect(defaultLayout(600, 1000)).toBe("tablet");   // assez large : tablette
  expect(defaultLayout(500, 400)).toBe("tablet");    // paysage
  expect(defaultLayout(1024, 768)).toBe("tablet");
  expect(defaultLayout(768, 1024)).toBe("tablet");
});

test("le format choisi est appliqué à la page et mémorisé", () => {
  const { settings } = loadWith({ layout: "phone" });
  const root = document.documentElement;
  expect(settings.layout.value).toBe("phone");
  expect(root.classList.contains("layout-phone")).toBe(true);
  settings.layout.value = "tablet";
  expect(root.classList.contains("layout-tablet")).toBe(true);
  expect(root.classList.contains("layout-phone")).toBe(false);
  expect(JSON.parse(localStorage.getItem(KEY)!).layout).toBe("tablet");
});

test("premier lancement : le format dépend de la taille de l'écran", () => {
  const size = { w: window.innerWidth, h: window.innerHeight };
  Object.assign(window, { innerWidth: 390, innerHeight: 844 });
  try {
    expect(loadWith(null).settings.layout.value).toBe("phone");
  } finally {
    Object.assign(window, { innerWidth: size.w, innerHeight: size.h });
  }
  expect(loadWith(null).settings.layout.value).toBe("tablet");
});
