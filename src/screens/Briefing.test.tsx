import { act } from "preact/test-utils";
import * as game from "../state/game";
import { briefing } from "../state/ui";
import { $, $$, mount } from "../test/render";
import { resetState } from "../test/state";
import { Briefing } from "./Briefing";

let root: HTMLElement;
beforeEach(() => {
  resetState();
  briefing.value = "welcome";
  root = mount(<Briefing />);
});

const shown = (id: string) => $(`#${id}`).classList.contains("show");

test("bienvenue, puis une règle par panneau (1/4 à 4/4), retours possibles, puis la partie commence", () => {
  expect(shown("welcome")).toBe(true);
  expect($("#welcome").textContent).toContain("BIENVENUE À BORD, AGENTS.");
  // Une convocation qui valide la candidature, sans annoncer de risque
  expect($("#welcome").textContent).toContain("valide chaque candidature");
  expect($("#welcome").textContent).not.toMatch(/risque|spécimen/i);
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
    expect($$(".rule-scene")).toHaveLength(1);
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

test("aucun avertissement sur les salles contaminées dans les panneaux", () => {
  expect(root.textContent).not.toMatch(/contamin/i);
});
