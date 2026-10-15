// Outils communs aux tests de bout en bout (Playwright) : ouverture de l'app, lancement d'une partie, plan.
import { expect, type Page } from "@playwright/test";
import type { RoomId } from "../src/data/ship";
import type { Settings } from "../src/state/settings";

// Partie rapide : compte à rebours minimal et pas d'annonce vocale.
// Musique coupée par défaut : les tests vont plus vite (sauf ceux qui testent la musique).
export const FAST: Partial<Settings> = { voice: false, wakeLock: false, transitions: false, music: false };
export const audioState = (page: Page) => page.evaluate(() => ({ playing: window.nostromo!.audio.playing, state: window.nostromo!.audio.state }));

/** Aucune voix réelle pendant les tests : la synthèse vocale de macOS passerait outre le mode muet. */
export async function silence(page: Page) {
  await page.addInitScript(() => {
    const fake = { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices: () => [], speaking: false, pending: false, paused: false, addEventListener() {}, removeEventListener() {} };
    Object.defineProperty(window, "speechSynthesis", { value: fake, configurable: true });
  });
}

/** Ouvre l'app (à l'accueil, ou à une adresse donnée : /scenario, /tutoriel/3…). */
export async function open(page: Page, settings = FAST, address = "/") {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(s => localStorage.setItem("nostromo-settings", JSON.stringify(s)), settings);
  await silence(page);
  await page.clock.install();
  await page.goto(address);
  // Écran « touchez pour commencer » si le navigateur bloque le son au chargement.
  await page.clock.runFor(500);
  if (await page.locator("#press").evaluate(e => e.classList.contains("show"))) await page.locator("#press").click();
  await expect(page.locator("#press")).not.toHaveClass(/show/);
  return errors;
}

/** « Démarrer », puis « Lancer » avec le scénario proposé (le dernier choisi, Sixième sens par défaut). */
export async function launch(page: Page) {
  await page.locator("#startBtn").click();
  await page.locator("#launchBtn").click();
}

/** « Démarrer la simulation », puis les panneaux Bienvenue et Protocole : la partie commence. */
export async function startSimulation(page: Page) {
  await launch(page);
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await page.locator("#welcomeNext").click();
  for (const n of [1, 2, 3, 4]) await page.locator(`#rule${n}Next`).click();
  await expect(page.locator("#rule4")).not.toHaveClass(/show/);
}

/** Salles mises en avant (accessibles) sur le plan. */
export const reachableRooms = (page: Page) => page.locator(".room.reach").evaluateAll(els => els.map(e => e.getAttribute("data-room")).sort());

export const clickRoom = (page: Page, k: RoomId) => page.locator(`[data-room="${k}"]`).dispatchEvent("click");

/** Choisit la salle de départ puis la confirme avec « Valider ». */
export async function placeAgent(page: Page, k: RoomId) {
  await clickRoom(page, k);
  await page.locator("#closeBtn").click();
}

/** Fin des déplacements, le Coordinateur touche la ou les salles à fermer, puis « Valider ». */
export async function closeRoom(page: Page, ...rooms: RoomId[]) {
  await page.locator("#closeBtn").click();
  for (const k of rooms) await clickRoom(page, k);
  await page.locator("#closeBtn").click();
  await page.clock.runFor(3_000); // claquement et cri du xénomorphe
  await expect(page.getByRole("button", { name: "Valider" })).toBeVisible();
}
