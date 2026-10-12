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

test("bienvenue puis protocole, retour possible, puis la partie commence", () => {
  expect(shown("welcome")).toBe(true);
  expect($("#welcome").textContent).toContain("BIENVENUE À BORD, AGENT.");
  act(() => { $("#welcomeNext").click(); });
  expect(shown("welcome")).toBe(false);
  expect(shown("briefing")).toBe(true);
  expect($("#briefing").textContent).toContain("Seul le Coordinateur en connaît l'ordre de fermeture.");
  expect(root.querySelectorAll("#briefing .briefing-steps li")).toHaveLength(4);
  act(() => { $("#briefingBack").click(); });
  expect(shown("welcome")).toBe(true);
  act(() => { $("#welcomeNext").click(); });
  act(() => { $("#briefingNext").click(); });
  expect(shown("briefing")).toBe(false);
  expect(game.phase.value).toBe("place");
});

test("pas de choix de protocole ni d'avertissement sur les salles contaminées", () => {
  expect(root.textContent).not.toMatch(/PROTOCOLE [1-4]|contamin/i);
});
