jest.mock("../audio/audio", () => require("../test/audioMock"));

import { render } from "preact";
import { act } from "preact/test-utils";
import * as game from "../state/game";
import { briefing } from "../state/ui";
import { Briefing } from "./Briefing";

let root: HTMLElement;
beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
  game.showIntro();
  briefing.value = "welcome";
  act(() => { render(<Briefing />, root); });
});
afterEach(() => { render(null, root); root.remove(); briefing.value = null; });

const $ = (sel: string) => root.querySelector(sel) as HTMLElement;
const shown = (id: string) => $(`#${id}`).classList.contains("show");

test("bienvenue, protocole 1/2, protocole 2/2, retours possibles, puis la partie commence", () => {
  expect(shown("welcome")).toBe(true);
  expect($("#welcome").textContent).toContain("BIENVENUE À BORD, AGENT.");
  expect($("#welcome").textContent).toContain("Votre future mission");
  act(() => { $("#welcomeNext").click(); });
  expect(shown("briefing")).toBe(true);
  expect($("#briefing").textContent).toContain("1/2");
  expect($("#briefing").textContent).toContain("Seul le Coordinateur en connaît l'ordre de fermeture.");
  expect([...root.querySelectorAll("#briefing h3")].map(h => h.textContent)).toEqual(["POSITION DE DÉPART", "DÉPLACEMENTS"]);
  act(() => { $("#briefingNext").click(); });
  expect(shown("briefing2")).toBe(true);
  expect([...root.querySelectorAll("#briefing2 h3")].map(h => h.textContent)).toEqual(["FERMETURE", "FIN DE L'ENTRAÎNEMENT"]);
  expect($("#briefing2").textContent).toContain("L'entraînement dure 5 minutes.");
  expect($("#briefing2").textContent).toContain("Fiez-vous à votre instinct, Agent.");
  // Un dessin animé par étape
  expect([...root.querySelectorAll(".step-anim")].map(e => e.getAttribute("class"))).toEqual([
    "step-anim step-start", "step-anim step-moves", "step-anim step-close", "step-anim step-end",
  ]);
  act(() => { $("#briefing2Back").click(); });
  expect(shown("briefing")).toBe(true);
  act(() => { $("#briefingBack").click(); });
  expect(shown("welcome")).toBe(true);
  act(() => { $("#welcomeNext").click(); });
  act(() => { $("#briefingNext").click(); });
  act(() => { $("#briefing2Next").click(); });
  expect(shown("briefing2")).toBe(false);
  expect(game.phase.value).toBe("place");
});

test("pas de choix de protocole ni d'avertissement sur les salles contaminées", () => {
  expect(root.textContent).not.toMatch(/PROTOCOLE [1-4]|contamin/i);
});
