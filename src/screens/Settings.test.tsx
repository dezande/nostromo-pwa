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
import { settingsOpen } from "../state/ui";
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
  expect([...root.querySelectorAll('[role="tab"]')].map(t => t.textContent)).toEqual(["AFFICHAGE", "AUDIO", "ALERTE", "SYSTÈME"]);
  expect($("#themes")).not.toBeNull();
  expect($("#musicChk")).toBeNull();
  act(() => { $("#tab-audio").click(); });
  expect($("#musicChk")).not.toBeNull();
  expect($("#themes")).toBeNull();
  expect(settings.settingsTab.value).toBe("audio");
  act(() => { $("#tab-system").click(); });
  expect($("#versionInfo").textContent).toContain("BUILD");
});

test("onglet Alerte : trois fonds sonores, voix, décompte, écoute", () => {
  act(() => { $("#tab-alert").click(); });
  expect([...root.querySelectorAll(".alert-card strong")].map(e => e.textContent)).toEqual(["Sirène", "Klaxon", "Détecteur"]);
  act(() => { $("#alert-klaxon").click(); });
  expect(settings.alertVariant.value).toBe("klaxon");
  expect($("#alert-klaxon").getAttribute("aria-checked")).toBe("true");
  act(() => { $("#alertPreview").click(); });
  expect(audio.previewAlert).toHaveBeenCalledWith("klaxon");
  act(() => { ($("#alertVoiceChk") as HTMLInputElement).click(); });
  expect(settings.alertVoice.value).toBe(false);
});

test("flèches du clavier pour changer d'onglet", () => {
  act(() => { $("#tab-display").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })); });
  expect(settings.settingsTab.value).toBe("system");
  act(() => { $("#tab-system").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); });
  expect(settings.settingsTab.value).toBe("display");
});
