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

test("bienvenue, puis une règle par panneau (1/4 à 4/4), retours possibles, puis la partie commence", () => {
  expect(shown("welcome")).toBe(true);
  expect($("#welcome").textContent).toContain("BIENVENUE À BORD, AGENTS.");
  act(() => { $("#welcomeNext").click(); });
  const titles = ["POSITION DE DÉPART", "DÉPLACEMENTS", "FERMETURE", "FIN DE L'ENTRAÎNEMENT"];
  titles.forEach((title, i) => {
    const n = i + 1;
    expect(shown(`rule${n}`)).toBe(true);
    expect($(`#rule${n} .rule-count`).textContent).toBe(`${n}/4`);
    expect($(`#rule${n} .rule-title`).textContent).toBe(title);
    // Scène animée tirée du vrai plan : des salles et le pion
    expect($(`#rule${n} .rule-scene .room`)).not.toBeNull();
    expect($(`#rule${n} .rule-scene .pawn`)).not.toBeNull();
    // seules les scènes affichées tournent
    expect(root.querySelectorAll(".rule-scene")).toHaveLength(1);
    if (n < 4) act(() => { $(`#rule${n}Next`).click(); });
  });
  expect($("#rule1").textContent).toContain("Seul le Coordinateur en connaît l'ordre de fermeture.");
  expect($("#rule4").textContent).toContain("Fiez-vous à votre instinct, Agents.");
  act(() => { $("#rule4Back").click(); });
  expect(shown("rule3")).toBe(true);
  act(() => { $("#rule3Back").click(); $("#rule2Back").click(); });
  act(() => { $("#rule1Back").click(); });
  expect(shown("welcome")).toBe(true);
  act(() => { $("#welcomeNext").click(); });
  for (const n of [1, 2, 3, 4]) act(() => { $(`#rule${n}Next`).click(); });
  expect(shown("rule4")).toBe(false);
  expect(game.phase.value).toBe("place");
});

test("pas de choix de protocole, ni de minuteur, ni d'avertissement sur les salles contaminées", () => {
  expect(root.textContent).not.toMatch(/PROTOCOLE [1-4]|contamin|5 minutes/i);
});
