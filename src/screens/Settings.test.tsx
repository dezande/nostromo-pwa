// pwa.ts utilise import.meta (Vite) : on le remplace par des valeurs fixes.
jest.mock("../state/pwa", () => ({
  BUILD: { version: "1.0.0", number: "42", commit: "abc1234", date: "2026-10-12" },
  offline: { value: "ready" },
}));

import { act } from "preact/test-utils";
import { audio } from "../audio/audio";
import { SCENARIOS } from "../data/scenarios";
import { settings } from "../state/settings";
import { lang } from "../i18n";
import { homeOpen, settingsOpen } from "../state/ui";
import * as game from "../state/game";
import { $, $$, mount } from "../test/render";
import { resetState } from "../test/state";
import { Settings } from "./Settings";

beforeEach(() => {
  resetState();
  settings.settingsTab.value = "display";
  settings.scenario.value = "training";
  settingsOpen.value = true;
  mount(<Settings />);
});

const tabs = () => $$('[role="tab"]').map(t => t.textContent);

/** Une partie commence : salle de départ validée, accueil fermé. */
const play = () => act(() => { game.startGame(); game.touchRoom("cockpit"); game.confirmStart(); homeOpen.value = false; });

test("quatre onglets, un seul panneau visible à la fois", () => {
  expect(tabs()).toEqual(["AFFICHAGE", "AUDIO", "ALERTE", "SYSTÈME"]);
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
  expect($$(".alert-card strong").map(e => e.textContent)).toEqual(["Sirène", "Klaxon", "Détecteur"]);
  act(() => { $("#alert-klaxon").click(); });
  expect(settings.alertVariant.value).toBe("klaxon");
  expect($("#alert-klaxon").getAttribute("aria-checked")).toBe("true");
  act(() => { $("#alertPreview").click(); });
  expect(audio.previewAlert).toHaveBeenCalledWith("klaxon");
});

test("onglet Affichage : choix du format Tablette / Téléphone", () => {
  expect($("#layout-tablet").parentElement!.getAttribute("role")).toBe("radiogroup");
  expect($$('[id^="layout-"]').map(e => e.textContent)).toEqual(["Tablette", "Téléphone"]);
  act(() => { $("#layout-phone").click(); });
  expect(settings.layout.value).toBe("phone");
  expect($("#layout-phone").getAttribute("aria-checked")).toBe("true");
  expect($("#layout-tablet").getAttribute("aria-checked")).toBe("false");
  act(() => { $("#layout-tablet").click(); });
  expect(settings.layout.value).toBe("tablet");
});

test("flèches du clavier pour changer d'onglet", () => {
  const arrow = (tab: string, key: string) => act(() => { $(`#tab-${tab}`).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); });
  arrow("display", "ArrowRight");
  expect(settings.settingsTab.value).toBe("audio");
  arrow("audio", "ArrowLeft");
  arrow("display", "ArrowLeft");
  expect(settings.settingsTab.value).toBe("system");
  arrow("system", "ArrowRight");
  expect(settings.settingsTab.value).toBe("display");
});

test("« Retour à l'accueil » seulement pendant une partie, avec confirmation Oui / Non", () => {
  (window as unknown as { speechSynthesis: { cancel: jest.Mock } }).speechSynthesis = { cancel: jest.fn() };
  expect($("#homeReturnBtn")).toBeNull();
  play();
  act(() => { $("#homeReturnBtn").click(); });
  expect($("#homeReturnQ").textContent).toBe("Abandonner l'entraînement en cours ?");
  // Seulement Oui / Non pendant la confirmation
  expect($("#setClose")).toBeNull();
  expect($$(".settings-footer button")).toHaveLength(2);
  act(() => { $("#homeReturnNo").click(); });
  expect($("#homeReturnQ")).toBeNull();
  expect($("#setClose")).not.toBeNull();
  expect(settingsOpen.value).toBe(true);
  expect(game.inGame.value).toBe(true);
  act(() => { $("#homeReturnBtn").click(); });
  act(() => { $("#homeReturnYes").click(); });
  expect(homeOpen.value).toBe(true);
  expect(settingsOpen.value).toBe(false);
  expect(game.inGame.value).toBe(false);
  expect((window as unknown as { speechSynthesis: { cancel: jest.Mock } }).speechSynthesis.cancel).toHaveBeenCalled();
});

test("onglet Affichage : choix de la langue, l'écran passe aussitôt en anglais, et revient en français", () => {
  expect($("#setLang-fr").getAttribute("aria-checked")).toBe("true");
  act(() => { $("#setLang-en").click(); });
  expect(lang.value).toBe("en");
  expect(localStorage.getItem("nostromo-lang")).toBe("en");
  expect(document.documentElement.lang).toBe("en");
  expect($("h2").textContent).toBe("SETTINGS");
  expect(tabs()).toEqual(["DISPLAY", "AUDIO", "ALERT", "SYSTEM"]);
  act(() => { $("#setLang-fr").click(); });
  expect($("h2").textContent).toBe("RÉGLAGES");
  expect(tabs()).toEqual(["AFFICHAGE", "AUDIO", "ALERTE", "SYSTÈME"]);
});

test("en anglais : formats, fonds sonores, boutons et question d'abandon traduits", () => {
  act(() => { lang.value = "en"; });
  expect($$('[id^="layout-"]').map(e => e.textContent)).toEqual(["Tablet", "Phone"]);
  expect($("#setClose").getAttribute("aria-label")).toBe("Close");
  expect($$(".theme").map(t => t.textContent)).toContain("Nostromo (original)");
  act(() => { $("#tab-alert").click(); });
  expect($$(".alert-card strong").map(e => e.textContent)).toEqual(["Siren", "Klaxon", "Detector"]);
  expect($("#alertPreview").getAttribute("aria-label")).toBe("Listen");
  play();
  expect($("#homeReturnBtn").getAttribute("aria-label")).toBe("Home");
  act(() => { $("#homeReturnBtn").click(); });
  expect($("#homeReturnQ").textContent).toBe(SCENARIOS.en.training.quitQuestion);
  expect($("#homeReturnYes").getAttribute("aria-label")).toBe("Yes");
  expect($("#homeReturnNo").getAttribute("aria-label")).toBe("No");
});
