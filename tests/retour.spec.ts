// Une adresse par écran, et le bouton « retour » du navigateur revient en arrière dans l'app au lieu de la quitter.
import type { Page } from "@playwright/test";
import { test, expect, open, placeAgent, closeRoom } from "./helpers";

const path = (page: Page) => new URL(page.url()).pathname;
const back = async (page: Page) => { await page.goBack({ waitUntil: "commit" }); await page.clock.runFor(100); };

test("adresses des panneaux d'introduction, et retour du navigateur jusqu'à l'accueil", async ({ page }) => {
  await open(page);
  expect(path(page)).toBe("/");
  await page.locator("#startBtn").click();
  await expect.poll(() => path(page)).toBe("/scenario");
  await page.locator("#launchBtn").click();
  await expect.poll(() => path(page)).toBe("/intro/bienvenue");
  await page.locator("#welcomeNext").click();
  await page.locator("#rule1Next").click();
  await expect.poll(() => path(page)).toBe("/intro/regle-2");
  // Le bouton « Retour » de l'app revient à l'entrée précédente : l'historique ne s'allonge pas
  await page.locator("#rule2Back").click();
  await expect.poll(() => path(page)).toBe("/intro/regle-1");
  await back(page);
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await expect.poll(() => path(page)).toBe("/intro/bienvenue");
  await back(page);
  await expect(page.locator("#launchBtn")).toBeVisible();
  await back(page);
  await expect(page.locator("#startBtn")).toBeVisible();
  expect(path(page)).toBe("/");
});

test("en partie : « retour » ouvre et ferme le menu pause sans quitter la partie ; après le rapport, retour à l'accueil", async ({ page }) => {
  await open(page);
  await page.locator("#startBtn").click();
  await page.locator("#scenario-free").click();
  await page.locator("#launchBtn").click();
  await expect.poll(() => path(page)).toBe("/partie");
  await placeAgent(page, "cockpit");
  await back(page);
  await expect(page.locator("#settings")).toHaveClass(/show/);
  await expect.poll(() => path(page)).toBe("/partie/reglages");
  await back(page);
  await expect(page.locator("#settings")).not.toHaveClass(/show/);
  await expect.poll(() => path(page)).toBe("/partie");
  // Pendant la question « Abandonner la partie ? », « retour » répond non et ferme le menu
  await page.locator("#setBtn").click();
  await page.locator("#homeReturnBtn").click();
  await expect(page.locator("#homeReturnQ")).toBeVisible();
  await back(page);
  await expect(page.locator("#settings")).not.toHaveClass(/show/);
  await expect(page.locator("#closeBtn")).toBeVisible();
  await closeRoom(page, "cockpit"); // l'agent est éliminé
  await page.clock.runFor(2_000);
  await expect(page.locator("#end")).toHaveClass(/show/);
  await expect.poll(() => path(page)).toBe("/fin");
  await back(page);
  await expect(page.locator("#startBtn")).toBeVisible();
  await expect.poll(() => path(page)).toBe("/");
});

test("adresse ouverte directement : document du scénario, puis retour au choix et à l'accueil", async ({ page }) => {
  await open(page, undefined, "/scenario/document/trainingGuidePdf");
  await expect(page.locator("#docViewer")).toHaveClass(/show/);
  await expect(page.locator("#docText")).toContainText("Sixième sens");
  // Les liens relatifs (fiches/…) restent justes depuis cette adresse
  await expect(page.locator("#docPdf")).toHaveAttribute("href", /fiches\/nostromo-guide-superviseur-entrainement\.pdf$/);
  await back(page);
  await expect(page.locator("#docViewer")).not.toHaveClass(/show/);
  await expect(page.locator("#startBtn")).toBeVisible();
  expect(path(page)).toBe("/");
});

test("adresses directes : tutoriel à la bonne page ; partie ou rapport sans partie en cours → accueil", async ({ page }) => {
  await open(page, undefined, "/tutoriel/3");
  await expect(page.locator("#tutorial")).toHaveClass(/show/);
  await expect(page.locator("#tutorial")).toContainText("03/");
  await page.locator("#tutoClose").click();
  await expect.poll(() => path(page)).toBe("/");
  for (const address of ["/partie", "/fin", "/nimporte/quoi"]) {
    await page.goto(address);
    await page.clock.runFor(500);
    await expect.poll(() => path(page), address).toBe("/");
    await expect(page.locator("#startBtn")).toBeVisible();
  }
});
