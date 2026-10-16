import { act } from "preact/test-utils";
import { ROOM_IDS } from "../data/ship";
import { lang } from "../i18n";
import * as game from "../state/game";
import { $, $$, mount } from "../test/render";
import { resetState } from "../test/state";
import { ShipMap } from "./ShipMap";

beforeEach(() => {
  resetState();
  mount(<ShipMap />);
  act(() => { game.startGame(); });
});

const roomEl = (id: string) => $(`[data-room="${id}"]`) as unknown as SVGGElement;

test("dessine les 16 salles sur les deux ponts", () => {
  expect($$("#deck1 .room")).toHaveLength(11);
  expect($$("#deck2 .room")).toHaveLength(5);
  for (const id of ROOM_IDS) expect(roomEl(id)).not.toBeNull();
});

test("pendant le placement, les salles de départ possibles clignotent", () => {
  expect(roomEl("cockpit").classList.contains("pulse")).toBe(true);
  expect(roomEl("labo").classList.contains("pulse")).toBe(false);
  act(() => { game.touchRoom("cockpit"); });
  expect(roomEl("entrepot4").classList.contains("pulse")).toBe(true); // on peut encore changer
  act(() => { game.confirmStart(); });
  expect($$(".room.pulse")).toHaveLength(0);
});

test("les salles toxiques sont marquées", () => {
  expect(roomEl("labo").classList.contains("toxic")).toBe(true);
  expect(roomEl("labo").classList.contains("reach")).toBe(false);
});

test("toucher une salle pose le pion ; après validation, les salles voisines sont mises en avant", () => {
  act(() => { roomEl("cockpit").dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  act(() => { game.confirmStart(); });
  expect(game.position.value).toBe("cockpit");
  expect($("#pawn").getAttribute("visibility")).toBe("visible");
  expect($("#pawn2").getAttribute("visibility")).toBe("hidden");
  const reach = $$(".room.reach").map(el => el.getAttribute("data-room")).sort();
  expect(reach).toEqual(["infirmerie", "reunion", "vie"]);
});

test("trace le chemin du pion, avec l'ascenseur entre les ponts", () => {
  act(() => { game.touchRoom("cockpit"); game.confirmStart(); });
  expect($$(".path-line")).toHaveLength(0);
  act(() => { game.touchRoom("vie"); game.touchRoom("serre"); });
  expect($$("#deck1 .path-line")).toHaveLength(2); // cockpit → vie, vie → ascenseur
  expect($$("#deck2 .path-line")).toHaveLength(1); // ascenseur → serre
  expect($$(".path-step text").map(t => t.textContent)).toEqual(["1", "2"]);
  act(() => { game.undo(); });
  expect($$("#deck2 .path-line")).toHaveLength(0);
});

test("les conduits d'aération sont dessinés et mis en avant quand on peut les emprunter", () => {
  const left = $('[data-vent="dortoir1-entrepot1"]');
  expect(left).not.toBeNull();
  expect($('[data-vent="dortoir2-entrepot2"]')).not.toBeNull();
  expect([...left.querySelectorAll("tspan")].map(t => t.textContent)).toEqual(["PASSAGE", "VENTILATION"]);
  act(() => { game.touchRoom("cockpit"); game.confirmStart(); });
  expect(left.classList.contains("open")).toBe(false);
  act(() => { game.touchRoom("reunion"); game.touchRoom("dortoir1"); });
  expect(left.classList.contains("open")).toBe(true);
  act(() => { game.touchRoom("entrepot1"); });
  expect(left.classList.contains("open")).toBe(true); // on peut revenir par le même conduit
  expect($$("#deck1 .path-line")).toHaveLength(5); // 2 pas + 3 traits par le conduit
});

test("le repère discret s'efface au deuxième déplacement et ne revient plus", () => {
  expect($$(".marker-dot")).toHaveLength(7);
  act(() => { game.touchRoom("cockpit"); game.confirmStart(); });
  expect($$(".marker-dot")).toHaveLength(7); // juste avant le premier déplacement
  act(() => { game.touchRoom("vie"); });
  expect($$(".marker-dot")).toHaveLength(7);
  act(() => { game.touchRoom("serre"); });
  expect($$(".marker-dot")).toHaveLength(0);
  act(() => { game.undo(); });
  expect($$(".marker-dot")).toHaveLength(7); // « Annuler » revient avant le deuxième déplacement
  act(() => { game.touchRoom("serre"); game.validate(); });
  expect($$(".marker-dot")).toHaveLength(0); // fermeture
  act(() => { game.step.value = 1; game.phase.value = "move"; });
  expect($$(".marker-dot")).toHaveLength(0); // manches suivantes
});

test("une salle fermée porte la croix rouge, comme les salles contaminées", () => {
  expect(roomEl("cuisine").querySelectorAll(".toxic-cross")).toHaveLength(0);
  expect(roomEl("labo").querySelectorAll(".toxic-cross")).toHaveLength(2);
  act(() => { game.closed.value = new Set(["cuisine", "cockpit"]); });
  expect(roomEl("cuisine").querySelectorAll(".toxic-cross")).toHaveLength(2);
  expect(roomEl("cockpit").querySelectorAll(".toxic-cross")).toHaveLength(2); // salle en polygone
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
  expect($$(".room.selected")).toHaveLength(1);
});

test("en anglais : titres des ponts, plans, ascenseurs et conduits traduits", () => {
  expect($$(".deck-head h2").map(h => h.textContent)).toEqual(["PONT 1", "PONT 2"]);
  act(() => { lang.value = "en"; });
  expect($$(".deck-head h2").map(h => h.textContent)).toEqual(["DECK 1", "DECK 2"]);
  expect($("#deck1").getAttribute("aria-label")).toBe("Deck 1 map");
  expect($("#deck2").getAttribute("aria-label")).toBe("Deck 2 map");
  expect([...$('[data-vent="dortoir1-entrepot1"]').querySelectorAll("tspan")].map(t => t.textContent)).toEqual(["VENT", "PASSAGE"]);
  expect($$(".vent-label").map(t => t.textContent)).toContain("LIFTS");
  expect($$(".vent-label").map(t => t.textContent)).not.toContain("ASCENSEURS");
});
