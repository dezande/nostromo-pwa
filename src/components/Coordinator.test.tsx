jest.mock("../audio/audio", () => require("../test/audioMock"));

import { render } from "preact";
import { act } from "preact/test-utils";
import { PROTOCOLS } from "../data/protocols";
import * as game from "../state/game";
import { Coordinator } from "./Coordinator";

let root: HTMLElement;
beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
  game.newGame();
});
afterEach(() => { render(null, root); root.remove(); });

const $ = (sel: string) => root.querySelector(sel) as HTMLElement;

test("affiche l'état de la partie et la fiche A.I.P. cachée", () => {
  act(() => { render(<Coordinator />, root); });
  expect($("#status").textContent).toBe("Choisissez un protocole.");
  expect(($("#closeBtn") as HTMLButtonElement).disabled).toBe(true);

  act(() => { game.startGame(PROTOCOLS[1]); game.touchRoom("cockpit"); });
  expect($("#status").textContent).toContain("Agent en Cockpit");
  expect($("#protoName").textContent).toBe("N°2");
  expect(root.querySelectorAll("#aip li")).toHaveLength(8);
  expect($("#aip li span").textContent).toBe("▒▒▒▒▒▒▒▒");
  expect(($("#closeBtn") as HTMLButtonElement).disabled).toBe(false);
});

test("« Afficher » révèle l'ordre de fermeture", () => {
  act(() => { render(<Coordinator />, root); game.startGame(PROTOCOLS[1]); });
  act(() => { $("#peekBtn").click(); });
  expect($("#aip li span").textContent).toBe("Cuisine");
  expect($("#peekBtn").textContent).toBe("Masquer");
});

test("« Nouvelle partie » demande confirmation pendant une partie", () => {
  act(() => { render(<Coordinator />, root); game.startGame(PROTOCOLS[0]); game.touchRoom("cockpit"); });
  act(() => { $("#resetBtn").click(); });
  expect($("#resetLbl").textContent).toBe("Confirmer ?");
  expect(game.phase.value).toBe("move");
  act(() => { $("#resetBtn").click(); });
  expect(game.phase.value).toBe("pick");
});
