jest.mock("../audio/audio", () => require("../test/audioMock"));

import { render } from "preact";
import { act } from "preact/test-utils";
import * as game from "../state/game";
import { ProtocolWindow } from "./ProtocolWindow";

let root: HTMLElement;
beforeEach(() => {
  jest.useFakeTimers();
  root = document.createElement("div");
  document.body.append(root);
  game.showIntro();
});
afterEach(() => { render(null, root); root.remove(); jest.useRealTimers(); });

const text = () => root.querySelector("#infoPanel")!.textContent;

test("titre du protocole, en attente tant que la partie n'a pas commencé", () => {
  act(() => { render(<ProtocolWindow />, root); });
  expect(root.querySelector("h2")!.textContent).toBe("PROTOCOLE A.I.P.");
  expect(text()).toContain("EN ATTENTE DE DONNÉES");
});

test("demande la salle de départ, tapée lettre par lettre", () => {
  act(() => { render(<ProtocolWindow />, root); game.startGame(); });
  act(() => { jest.advanceTimersByTime(35 * 5); });
  expect(text()).not.toContain("AGENT, CHOISISSEZ VOTRE SALLE DE DÉPART");
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("AGENT, CHOISISSEZ VOTRE SALLE DE DÉPART");
});

test("salle choisie, modifiable, puis position enregistrée après validation", () => {
  act(() => { render(<ProtocolWindow />, root); game.startGame(); });
  act(() => { game.touchRoom("cockpit"); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("SALLE DE DÉPART : COCKPIT");
  act(() => { game.touchRoom("infirmerie"); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("SALLE DE DÉPART : INFIRMERIE");
  act(() => { game.confirmStart(); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("POSITION ENREGISTRÉE : INFIRMERIE");
});

test("pendant les déplacements : aucune indication du nombre de pas", () => {
  act(() => { render(<ProtocolWindow />, root); game.startGame(); game.touchRoom("vie"); game.confirmStart(); });
  act(() => { game.touchRoom("dortoir1"); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("DÉPLACEMENTS EN COURS");
  expect(text()).not.toMatch(/\d/);
  act(() => { game.touchRoom("reunion"); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("DÉPLACEMENTS EN COURS");
  expect(text()).not.toMatch(/\d/);
  act(() => { game.undo(); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("DÉPLACEMENTS EN COURS");
  expect(text()).not.toMatch(/\d/);
});

test("guide le Coordinateur pour choisir la salle à fermer", () => {
  act(() => { render(<ProtocolWindow />, root); game.startGame(); game.touchRoom("vie"); game.confirmStart(); });
  act(() => { game.validate(); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("COORDINATEUR : TOUCHEZ LA SALLE À FERMER");
  act(() => { game.touchRoom("cuisine"); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(text()).toContain("SALLE À FERMER : CUISINE — VALIDEZ POUR LANCER LA FERMETURE");
});
