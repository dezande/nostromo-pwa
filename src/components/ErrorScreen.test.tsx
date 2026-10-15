// pwa.ts utilise import.meta (Vite) : on le remplace par des valeurs fixes.
jest.mock("../state/pwa", () => ({
  BUILD: { version: "1.0.0", number: "42", commit: "abc1234", date: "2026-10-12" },
  offline: { value: "ready" },
}));
jest.mock("../state/ui", () => ({ returnHome: jest.fn() }));

import { render } from "preact";
import { act } from "preact/test-utils";
import { returnHome } from "../state/ui";
import { lang } from "../i18n";
import { ErrorBoundary, crash, describeError, report } from "./ErrorScreen";

let root: HTMLElement;
beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
  lang.value = "fr";
  crash.value = null;
  // Preact et l'écran de secours écrivent l'erreur dans la console : inutile dans les tests.
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { render(null, root); root.remove(); });

const $ = (sel: string) => root.querySelector(sel) as HTMLElement;

function Bomb({ explode }: { explode: boolean }): null {
  if (explode) throw new TypeError("réacteur en surchauffe");
  return null;
}

test("erreur pendant l'affichage : écran de secours avec le message, la pile, le build et les deux boutons", () => {
  act(() => { render(<ErrorBoundary><p id="app">Jeu</p><Bomb explode /></ErrorBoundary>, root); });
  expect($("#app")).toBeNull();
  expect($("#crash h2").textContent).toBe("DÉFAILLANCE SYSTÈME");
  expect($("#crashDetails").textContent).toContain("TypeError: réacteur en surchauffe");
  expect($("#crashDetails").textContent).toContain("Bomb"); // la pile nomme le composant fautif
  expect($("#crashBuild").textContent).toBe("NOSTROMO II · v1.0.0 · BUILD 42 (abc1234)");
  expect($("#crashReload").textContent).toBe("Recharger");
  expect($("#crashHome").textContent).toBe("Retour à l'accueil");
  expect(console.error).toHaveBeenCalled();
});

test("sans erreur, l'app s'affiche normalement", () => {
  act(() => { render(<ErrorBoundary><p id="app">Jeu</p><Bomb explode={false} /></ErrorBoundary>, root); });
  expect($("#app").textContent).toBe("Jeu");
  expect($("#crash")).toBeNull();
});

test("erreur hors affichage (report) : écran de secours, puis « Retour à l'accueil » le ferme et force le retour", () => {
  act(() => { render(<ErrorBoundary><p id="app">Jeu</p></ErrorBoundary>, root); });
  act(() => { report(new Error("minuteur perdu")); });
  expect($("#app")).toBeNull();
  expect($("#crashDetails").textContent).toContain("Error: minuteur perdu");

  act(() => { $("#crashHome").click(); });
  expect(returnHome).toHaveBeenCalledWith(true);
  expect(crash.value).toBeNull();
  expect($("#crash")).toBeNull();
  expect($("#app").textContent).toBe("Jeu");
});

test("écran en anglais", () => {
  lang.value = "en";
  act(() => { render(<ErrorBoundary><Bomb explode /></ErrorBoundary>, root); });
  expect($("#crash h2").textContent).toBe("SYSTEM FAILURE");
  expect($("#crashReload").textContent).toBe("Reload");
  expect($("#crashHome").textContent).toBe("Back to home");
});

test("describeError : Error avec ou sans message en tête de pile, texte, valeur vide", () => {
  const err = new RangeError("trop loin");
  err.stack = "RangeError: trop loin\n    at f (a.js:1:2)";
  expect(describeError(err)).toEqual({ message: "RangeError: trop loin", stack: "at f (a.js:1:2)" });
  err.stack = "f@a.js:1:2"; // Firefox et Safari ne répètent pas le message
  expect(describeError(err)).toEqual({ message: "RangeError: trop loin", stack: "f@a.js:1:2" });
  expect(describeError("texte brut")).toEqual({ message: "texte brut", stack: "" });
  report(undefined);
  expect(describeError(crash.value).message).toBe("Erreur inconnue / Unknown error");
});
