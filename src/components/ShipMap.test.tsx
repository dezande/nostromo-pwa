jest.mock("../audio/audio", () => require("../test/audioMock"));

import { render } from "preact";
import { act } from "preact/test-utils";
import { ROOM_IDS } from "../data/ship";
import * as game from "../state/game";
import { ShipMap } from "./ShipMap";

let root: HTMLElement;
beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
  act(() => { render(<ShipMap />, root); game.startGame(); });
});
afterEach(() => { render(null, root); root.remove(); });

const roomEl = (id: string) => root.querySelector(`[data-room="${id}"]`) as SVGGElement;

test("dessine les 16 salles sur les deux ponts", () => {
  expect(root.querySelectorAll("#deck1 .room")).toHaveLength(11);
  expect(root.querySelectorAll("#deck2 .room")).toHaveLength(5);
  for (const id of ROOM_IDS) expect(roomEl(id)).not.toBeNull();
});

test("pendant le placement, les salles de départ possibles clignotent", () => {
  expect(roomEl("cockpit").classList.contains("pulse")).toBe(true);
  expect(roomEl("labo").classList.contains("pulse")).toBe(false);
  act(() => { game.touchRoom("cockpit"); });
  expect(roomEl("entrepot4").classList.contains("pulse")).toBe(true); // on peut encore changer
  act(() => { game.confirmStart(); });
  expect(root.querySelectorAll(".room.pulse")).toHaveLength(0);
});

test("les salles toxiques sont marquées", () => {
  expect(roomEl("labo").classList.contains("toxic")).toBe(true);
  expect(roomEl("labo").classList.contains("reach")).toBe(false);
});

test("toucher une salle pose le pion ; après validation, les salles voisines sont mises en avant", () => {
  act(() => { roomEl("cockpit").dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  act(() => { game.confirmStart(); });
  expect(game.position.value).toBe("cockpit");
  expect(root.querySelector("#pawn")!.getAttribute("visibility")).toBe("visible");
  expect(root.querySelector("#pawn2")!.getAttribute("visibility")).toBe("hidden");
  const reach = [...root.querySelectorAll(".room.reach")].map(el => el.getAttribute("data-room")).sort();
  expect(reach).toEqual(["infirmerie", "reunion", "vie"]);
});

test("trace le chemin du pion, avec l'ascenseur entre les ponts", () => {
  act(() => { game.touchRoom("cockpit"); game.confirmStart(); });
  expect(root.querySelectorAll(".path-line")).toHaveLength(0);
  act(() => { game.touchRoom("vie"); game.touchRoom("serre"); });
  expect(root.querySelectorAll("#deck1 .path-line")).toHaveLength(2); // cockpit → vie, vie → ascenseur
  expect(root.querySelectorAll("#deck2 .path-line")).toHaveLength(1); // ascenseur → serre
  expect([...root.querySelectorAll(".path-step text")].map(t => t.textContent)).toEqual(["1", "2"]);
  act(() => { game.undo(); });
  expect(root.querySelectorAll("#deck2 .path-line")).toHaveLength(0);
});

test("les conduits d'aération sont dessinés et mis en avant quand on peut les emprunter", () => {
  const left = root.querySelector('[data-vent="dortoir1-entrepot1"]')!;
  expect(left).not.toBeNull();
  expect(root.querySelector('[data-vent="dortoir2-entrepot2"]')).not.toBeNull();
  expect([...left.querySelectorAll("tspan")].map(t => t.textContent)).toEqual(["PASSAGE", "VENTILATION"]);
  act(() => { game.touchRoom("cockpit"); game.confirmStart(); });
  expect(left.classList.contains("open")).toBe(false);
  act(() => { game.touchRoom("reunion"); game.touchRoom("dortoir1"); });
  expect(left.classList.contains("open")).toBe(true);
  act(() => { game.touchRoom("entrepot1"); });
  expect(left.classList.contains("open")).toBe(true); // on peut revenir par le même conduit
  expect(root.querySelectorAll("#deck1 .path-line")).toHaveLength(5); // 2 pas + 3 traits par le conduit
});

test("les salles fermées sont hachurées", () => {
  act(() => { game.closed.value = new Set(["atelier"]); });
  expect(roomEl("atelier").classList.contains("closed")).toBe(true);
});

test("choix du Coordinateur : salles possibles encadrées, salle choisie en rouge", () => {
  act(() => { game.touchRoom("cockpit"); game.confirmStart(); game.validate(); });
  expect(roomEl("cuisine").classList.contains("target")).toBe(true);
  expect(roomEl("labo").classList.contains("target")).toBe(false);
  act(() => { roomEl("cuisine").dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  expect(roomEl("cuisine").classList.contains("selected")).toBe(true);
  expect(root.querySelectorAll(".room.selected")).toHaveLength(1);
});
