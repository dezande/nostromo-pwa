// Musique, alerte et bouton Son / Muet.
import { test, expect, FAST, audioState, silence, open, startSimulation, placeAgent } from "./helpers";

test("la musique démarre à l'ouverture et se règle dans les réglages", async ({ page }) => {
  await open(page, { ...FAST, music: true });
  await expect(page.locator("#home")).toHaveClass(/show/);
  expect((await audioState(page)).playing).toBe(true);
  await expect.poll(async () => (await audioState(page)).state).toBe("running");

  await page.locator("#homeSetBtn").click();
  await page.locator("#tab-audio").click();
  await expect(page.locator("#musicChk")).toBeChecked();
  await page.locator("#musicChk").uncheck();
  expect((await audioState(page)).playing).toBe(false);
  await page.locator("#sfxRange").fill("40");
  await expect(page.locator("#sfxVal")).toHaveText("40 %");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!));
  expect(saved.music).toBe(false);
  expect(saved.sfxVolume).toBe(0.4);
});

test("musique coupée : pas d'écran « touchez pour commencer »", async ({ page }) => {
  await open(page, { ...FAST, music: false });
  await expect(page.locator("#press")).not.toHaveClass(/show/);
  expect((await audioState(page)).playing).toBe(false);
});

test("musique d'alerte pendant toute la partie (si la musique est activée)", async ({ page }) => {
  await open(page, { ...FAST, music: true });
  await startSimulation(page);
  expect(await page.evaluate(() => window.nostromo!.audio.alertPlaying)).toBe(false);
  await placeAgent(page, "vie");
  await expect.poll(() => page.evaluate(() => window.nostromo!.audio.alertPlaying)).toBe(true);
  await page.clock.runFor(400_000); // longtemps après : rien ne s'arrête
  expect(await page.evaluate(() => window.nostromo!.audio.alertPlaying)).toBe(true);
  await expect(page.locator("#closeBtn")).toBeEnabled();
});

test("musique coupée par défaut au premier lancement", async ({ page }) => {
  await silence(page);
  await page.clock.install();
  await page.goto("/");
  await page.clock.runFor(500);
  expect(await page.evaluate(() => window.nostromo!.audio.playing)).toBe(false);
  await expect(page.locator("#press")).not.toHaveClass(/show/);
  await page.locator("#homeSetBtn").click();
  await page.locator("#tab-audio").click();
  await expect(page.locator("#musicChk")).not.toBeChecked();
});

test("bouton Son / Muet dans l'en-tête : coupe ou remet la musique (aria-pressed)", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  const sound = page.locator("#soundBtn");
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await expect(sound).toHaveAccessibleName("Musique coupée");
  await expect(sound).toHaveAttribute("title", "Muet");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await expect(sound).toHaveAccessibleName("Musique activée");
  await expect(sound).toHaveAttribute("title", "Son");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!).music)).toBe(true);
  // Même réglage que dans l'onglet Audio
  await page.locator("#setBtn").click();
  await page.locator("#tab-audio").click();
  await expect(page.locator("#musicChk")).toBeChecked();
  await page.locator("#setClose").click();
  await sound.click(); // on recoupe la musique : tests silencieux
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.nostromo!.audio.playing)).toBe(false);
});
