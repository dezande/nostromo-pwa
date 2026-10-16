// Réglages : onglets, styles d'écran, texte, repère, numéro de build, retour à l'accueil.
import { THEMES, DEFAULT_BG } from "../src/data/themes";
import { test, expect, FAST, open, startSimulation, placeAgent } from "./helpers";

test("chaque style d'écran s'applique et reste mémorisé", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  const themes = page.locator("#themes .theme");
  const count = await themes.count();
  expect(count).toBe(THEMES.length);
  for (let i = 0; i < count; i++) {
    await themes.nth(i).click();
    await expect(themes.nth(i)).toHaveAttribute("aria-pressed", "true");
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
    const theme = THEMES[i];
    expect(bg).toBe(theme.font ? theme.bg : DEFAULT_BG);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!).theme);
    expect(saved).toBe(theme.name);
  }
});

test("réglages en onglets : Affichage, Audio, Alerte, Système ; dernier onglet mémorisé ; clavier", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#settings").getByRole("tab")).toHaveText(["AFFICHAGE", "AUDIO", "ALERTE", "SYSTÈME"]);
  await expect(page.locator("#tab-display")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#themes")).toBeVisible();
  // Clavier : flèche droite → Audio
  await page.locator("#tab-display").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-audio")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-audio")).toBeFocused();
  await expect(page.locator("#musicChk")).toBeVisible();
  await page.locator("#tab-alert").click();
  await expect(page.locator(".alert-card")).toHaveCount(3);
  await expect(page.locator(".alert-card strong")).toHaveText(["Sirène", "Klaxon", "Détecteur"]);
  await expect(page.locator("#alert-siren")).toHaveAttribute("aria-checked", "true");
  await page.locator("#alert-detector").click();
  await expect(page.locator("#alert-detector")).toHaveAttribute("aria-checked", "true");
  await page.locator("#alertPreview").click();
  await page.clock.runFor(5000);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!));
  expect(saved).toMatchObject({ alertVariant: "detector", settingsTab: "alert" });
  // Le dernier onglet est mémorisé (enregistré ci-dessus, et rouvert à la réouverture)
  await page.locator("#setClose").click();
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#tab-alert")).toHaveAttribute("aria-selected", "true");
});

test("chaque onglet des réglages tient dans l'écran sans défilement", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  for (const size of [{ width: 375, height: 667 }, { width: 390, height: 844 }, { width: 1280, height: 720 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(size);
    for (const tab of ["display", "audio", "alert", "system"]) {
      await page.locator(`#tab-${tab}`).click();
      const fits = await page.locator("#settings .panel").evaluate(el => el.scrollHeight <= el.clientHeight + 1 && el.getBoundingClientRect().bottom <= innerHeight + 1);
      expect(fits, `${tab} à ${size.width}×${size.height}`).toBe(true);
    }
  }
});

test("repère discret sur certaines salles, masquable dans les réglages", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await expect(page.locator(".marker-dot")).toHaveCount(7);
  await expect(page.locator('[data-room="vie"] .marker-dot')).toHaveCount(1);
  await expect(page.locator('[data-room="cockpit"] .marker-dot')).toHaveCount(0);
  await page.locator("#setBtn").click();
  await page.locator("#tab-display").click();
  await expect(page.locator("#markerChk")).toBeChecked();
  await page.locator("#markerChk").uncheck();
  await page.locator("#setClose").click();
  await expect(page.locator(".marker-dot")).toHaveCount(0);
});

test("une case par bruitage dans l'onglet Audio, mémorisée", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  await page.locator("#tab-audio").click();
  for (const id of ["beepChk", "tickChk", "slamChk", "xenoChk", "victoryChk", "defeatChk"]) await expect(page.locator(`#${id}`)).toBeChecked();
  await page.locator("#slamChk").uncheck();
  await page.locator("#xenoChk").uncheck();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!));
  expect(saved).toMatchObject({ soundSlam: false, soundXenomorph: false, soundBeep: true });
  // Les cases gardent leur état quand on rouvre les réglages
  await page.locator("#setClose").click();
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#slamChk")).not.toBeChecked();
  await expect(page.locator("#beepChk")).toBeChecked();
});

test("le numéro de build est affiché dans les réglages", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  await page.locator("#tab-system").click();
  await expect(page.locator("#versionInfo")).toHaveText(/v\d+\.\d+\.\d+ · BUILD \d+ \([0-9a-f]+\) DU \d{2}\/\d{2}\/\d{4}/);
});

test("retour à l'accueil par les Réglages, avec confirmation : alarme et voix s'arrêtent", async ({ page }) => {
  await open(page, { ...FAST, music: true });
  await startSimulation(page);
  await placeAgent(page, "cockpit");
  await expect.poll(() => page.evaluate(() => window.nostromo!.audio.alertPlaying)).toBe(true);

  // Pas de retour à l'accueil hors partie ; ici, partie en cours : le bouton est là.
  await page.locator("#setBtn").click();
  await page.locator("#homeReturnBtn").click();
  await expect(page.locator("#homeReturnQ")).toHaveText("Abandonner l'entraînement en cours ?");
  // « Non » : on reste dans la partie.
  await page.locator("#homeReturnNo").click();
  await expect(page.locator("#homeReturnBtn")).toBeVisible();
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  // « Oui » : retour à l'accueil, tout s'arrête.
  await page.locator("#homeReturnBtn").click();
  await page.evaluate(() => { (window as unknown as { cancelled: number }).cancelled = 0; window.speechSynthesis.cancel = () => { (window as unknown as { cancelled: number }).cancelled++; }; });
  await page.locator("#homeReturnYes").click();
  await expect(page.locator("#home")).toHaveClass(/show/);
  await expect(page.locator("#settings")).not.toHaveClass(/show/);
  expect(await page.evaluate(() => (window as unknown as { cancelled: number }).cancelled)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.nostromo!.audio.alertPlaying)).toBe(false);
  expect(await page.evaluate(() => window.nostromo!.audio.playing)).toBe(true); // musique 1
  // Hors partie, pas de bouton de retour dans les Réglages.
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#homeReturnBtn")).toHaveCount(0);
});

test("réglages : boutons du bas alignés sur une seule rangée, de même taille", async ({ page }) => {
  await open(page);
  // Toutes les positions sont lues au même instant (le panneau peut encore se redimensionner).
  const sameRow = async (...ids: string[]) => {
    await expect(page.locator(`#${ids[0]}`)).toBeVisible();
    const boxes = await page.evaluate(list => list.map(id => {
      const r = document.getElementById(id)!.getBoundingClientRect();
      return { y: r.y, width: r.width, height: r.height };
    }), ids);
    for (const b of boxes.slice(1)) {
      expect(Math.abs(b.y - boxes[0].y), ids.join(" / ")).toBeLessThanOrEqual(1);
      expect(Math.abs(b.width - boxes[0].width), ids.join(" / ")).toBeLessThanOrEqual(1);
      expect(Math.abs(b.height - boxes[0].height), ids.join(" / ")).toBeLessThanOrEqual(1);
    }
  };
  await startSimulation(page);
  await placeAgent(page, "cockpit");
  await page.locator("#setBtn").click();
  await page.locator("#tab-display").click();
  await sameRow("homeReturnBtn", "setClose");
  // Onglet Alerte : « Écouter » sur la même rangée
  await page.locator("#tab-alert").click();
  await sameRow("alertPreview", "homeReturnBtn", "setClose");
  // Confirmation : seulement Oui / Non, sur la même rangée (pas de Fermer en doublon)
  await page.locator("#homeReturnBtn").click();
  await sameRow("homeReturnYes", "homeReturnNo");
  await expect(page.locator("#setClose")).toHaveCount(0);
  await expect(page.locator("#settings .settings-footer button")).toHaveCount(2);
  await page.locator("#homeReturnNo").click();
  await page.locator("#setClose").click();
});

test("taille du texte et lignes horizontales", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  const fs = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--fs").trim());
  expect(await fs()).toBe("1.2");
  await page.locator("#fsRange").fill("150");
  expect(await fs()).toBe("1.5");
  await expect(page.locator("#fsVal")).toHaveText("150 %");

  await expect(page.locator("html")).not.toHaveClass(/no-scan/);
  await page.locator("#scanChk").uncheck();
  await expect(page.locator("html")).toHaveClass(/no-scan/);
});
