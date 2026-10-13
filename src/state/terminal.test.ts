jest.mock("../audio/audio", () => require("../test/audioMock"));

import { settings } from "./settings";
import { runTerminal, skipTerminal, terminal, terminalOpen } from "./terminal";

const script = {
  title: "TEST",
  lines: [{ text: "CONNEXION" }, { text: "CLOISONS", result: "OK" }, { text: "ALIEN", result: "DÉTECTÉ", warn: true }],
};

beforeEach(() => { jest.useFakeTimers(); settings.transitions.value = true; });
afterEach(() => jest.useRealTimers());

test("affiche les lignes une à une puis se ferme", async () => {
  const done = runTerminal(script);
  expect(terminalOpen.value).toBe(true);
  expect(terminal.value.title).toBe("TEST");
  await jest.advanceTimersByTimeAsync(10_000);
  await done;
  expect(terminalOpen.value).toBe(false);
  // Le contenu reste affiché (pour l'animation de sortie et les tests).
  expect(terminal.value.lines.map(l => l.typed)).toEqual(["CONNEXION", "CLOISONS", "ALIEN"]);
  expect(terminal.value.lines[2]).toMatchObject({ result: "DÉTECTÉ", warn: true, showResult: true, done: true });
  expect(terminal.value.progress).toBe(1);
});

test("toucher l'écran passe la transition", async () => {
  const done = runTerminal(script);
  await jest.advanceTimersByTimeAsync(20);
  skipTerminal();
  await done;
  expect(terminalOpen.value).toBe(false);
  expect(terminal.value.lines[0].typed).toBe("CONNEXION");
});

test("rien ne s'affiche si les transitions sont désactivées", async () => {
  settings.transitions.value = false;
  await runTerminal(script);
  expect(terminalOpen.value).toBe(false);
});
