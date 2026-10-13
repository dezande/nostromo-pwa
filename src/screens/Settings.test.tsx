jest.mock("../audio/audio", () => require("../test/audioMock"));
// pwa.ts utilise import.meta (Vite) : on le remplace par des valeurs fixes.
jest.mock("../state/pwa", () => ({
  BUILD: { version: "1.0.0", number: "42", commit: "abc1234", date: "2026-10-12" },
  offline: { value: "ready" },
}));

import { render } from "preact";
import { act } from "preact/test-utils";
import { audio } from "../audio/audio";
import { settings } from "../state/settings";
import { homeOpen, settingsOpen } from "../state/ui";
import * as game from "../state/game";
import { Settings } from "./Settings";

let root: HTMLElement;
beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
  settings.settingsTab.value = "display";
  settingsOpen.value = true;
  act(() => { render(<Settings />, root); });
});
afterEach(() => { render(null, root); root.remove(); });

const $ = (sel: string) => root.querySelector(sel) as HTMLElement;

test("quatre onglets, un seul panneau visible à la fois", () => {
  expect([...root.querySelectorAll('[role="tab"]')].map(t => t.textContent)).toEqual(["SCÉNARIO", "AFFICHAGE", "AUDIO", "ALERTE", "SYSTÈME"]);
  expect($("#themes")).not.toBeNull();
  expect($("#musicChk")).toBeNull();
  act(() => { $("#tab-audio").click(); });
  expect($("#musicChk")).not.toBeNull();
  expect($("#themes")).toBeNull();
  expect(settings.settingsTab.value).toBe("audio");
  act(() => { $("#tab-system").click(); });
  expect($("#versionInfo").textContent).toContain("BUILD");
});

test("onglet Alerte : trois fonds sonores et écoute", () => {
  act(() => { $("#tab-alert").click(); });
  expect([...root.querySelectorAll(".alert-card strong")].map(e => e.textContent)).toEqual(["Sirène", "Klaxon", "Détecteur"]);
  act(() => { $("#alert-klaxon").click(); });
  expect(settings.alertVariant.value).toBe("klaxon");
  expect($("#alert-klaxon").getAttribute("aria-checked")).toBe("true");
  act(() => { $("#alertPreview").click(); });
  expect(audio.previewAlert).toHaveBeenCalledWith("klaxon");
  expect($("#alertVoiceChk")).toBeNull(); // plus de voix ni de décompte (plus de minuteur)
});

test("onglet Affichage : choix du format Tablette / Téléphone", () => {
  expect($(".layouts").getAttribute("role")).toBe("radiogroup");
  expect([...root.querySelectorAll(".layout-card")].map(e => e.textContent)).toEqual(["Tablette", "Téléphone"]);
  act(() => { $("#layout-phone").click(); });
  expect(settings.layout.value).toBe("phone");
  expect($("#layout-phone").getAttribute("aria-checked")).toBe("true");
  expect($("#layout-tablet").getAttribute("aria-checked")).toBe("false");
  act(() => { $("#layout-tablet").click(); });
  expect(settings.layout.value).toBe("tablet");
});

test("flèches du clavier pour changer d'onglet", () => {
  act(() => { $("#tab-display").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })); });
  expect(settings.settingsTab.value).toBe("system");
  act(() => { $("#tab-system").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); });
  expect(settings.settingsTab.value).toBe("display");
});

test("« Retour à l'accueil » seulement pendant une partie, avec confirmation Oui / Non", () => {
  (window as unknown as { speechSynthesis: { cancel: jest.Mock } }).speechSynthesis = { cancel: jest.fn() };
  act(() => { game.showIntro(); });
  expect($("#homeReturnBtn")).toBeNull();
  act(() => { game.startGame(); game.touchRoom("cockpit"); game.confirmStart(); homeOpen.value = false; });
  act(() => { $("#homeReturnBtn").click(); });
  expect($("#homeReturnQ").textContent).toBe("Abandonner l'entraînement en cours ?");
  act(() => { $("#homeReturnNo").click(); });
  expect($("#homeReturnQ")).toBeNull();
  expect(game.inGame.value).toBe(true);
  act(() => { $("#homeReturnBtn").click(); });
  act(() => { $("#homeReturnYes").click(); });
  expect(homeOpen.value).toBe(true);
  expect(settingsOpen.value).toBe(false);
  expect(game.inGame.value).toBe(false);
  expect((window as unknown as { speechSynthesis: { cancel: jest.Mock } }).speechSynthesis.cancel).toHaveBeenCalled();
});
