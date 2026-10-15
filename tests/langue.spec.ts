// Version anglaise de l'app.
import { test, expect } from "@playwright/test";
import { open } from "./helpers";

test("version anglaise : choix à l'accueil, retenu au rechargement, documents et PDF en anglais", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.locator("#lang-en").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#home .blink")).toHaveText("ACCESS GRANTED · LEVEL 5");
  await page.locator("#startBtn").click();
  await expect(page.locator("#scenario-recruitment strong")).toHaveText("A Mere Formality");
  await expect(page.locator("#trainingPdf")).toHaveAttribute("href", "fiches/nostromo-sheet-psychic-agent-male.pdf");
  await expect(page.locator("#rolesPdf")).toHaveAttribute("href", "fiches/nostromo-role-cards.pdf");
  await page.locator("#trainingGuidePdfRead").click();
  await expect(page.locator("#docText")).toContainText("Supervisor");
  await page.locator("#docClose").click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/scenario");
  // Le rechargement garde l'écran (son adresse) et la langue
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#scenario-recruitment strong")).toHaveText("A Mere Formality");
  await page.locator("#scenarioBack").click();
  await expect(page.locator("#lang-en")).toHaveAttribute("aria-checked", "true");
  expect(errors).toEqual([]);
});

// Sans réglage enregistré (premier lancement) : la langue du navigateur. Ne passe pas par open(), qui enregistre des réglages.
test.describe("premier lancement", () => {
  test.use({ locale: "en-US" });
  test("navigateur en anglais : l'app s'ouvre en anglais", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#home .blink")).toHaveText("ACCESS GRANTED · LEVEL 5");
    await expect(page.locator("#lang-en")).toHaveAttribute("aria-checked", "true");
  });
});
