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
  expect(settings.countdown.value).toBe(10);
});

test("reprend les réglages enregistrés", () => {
  const { settings } = loadWith({ countdown: 5, theme: 3 });
  expect(settings.countdown.value).toBe(5);
  expect(settings.theme.value).toBe(3);
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
  expect(mod.settings.countdown.value).toBe(10);
});

test("enregistre chaque changement", () => {
  const { settings } = loadWith(null);
  settings.countdown.value = 7;
  expect(JSON.parse(localStorage.getItem(KEY)!).countdown).toBe(7);
});

test("applique le style d'écran, la taille du texte et les lignes à la page", () => {
  const { settings } = loadWith(null);
  const root = document.documentElement;
  settings.theme.value = 1; // Default Amber
  expect(root.style.getPropertyValue("--accent")).toBe("#ff8100");
  expect(root.classList.contains("retro-font")).toBe(true);
  settings.textSize.value = 150;
  expect(root.style.getPropertyValue("--fs")).toBe("1.5");
  settings.scanlines.value = false;
  expect(root.classList.contains("no-scan")).toBe(true);
  settings.theme.value = 0;
  expect(root.style.getPropertyValue("--accent")).toBe("");
  expect(root.classList.contains("retro-font")).toBe(false);
});

test("la musique suit la case Musique", () => {
  const { settings, audio } = loadWith({ music: true });
  expect(audio.startMusic).toHaveBeenCalled();
  settings.music.value = false;
  expect(audio.stopMusic).toHaveBeenCalled();
});
