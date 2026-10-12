// @ts-check
const { test, expect } = require("@playwright/test");

// Partie rapide : compte à rebours minimal et pas d'annonce vocale.
const FAST = { countdown: 3, voice: false, wake: false, transitions: false };

async function open(page, settings = FAST) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(s => localStorage.setItem("nostromo-settings", JSON.stringify(s)), settings);
  await page.clock.install();
  await page.goto("/");
  // Écran « touchez pour commencer » si le navigateur bloque le son au chargement.
  await page.clock.runFor(500);
  if (await page.locator("#press").evaluate(e => e.classList.contains("show"))) await page.locator("#press").click();
  await expect(page.locator("#press")).not.toHaveClass(/show/);
  return errors;
}

async function startSimulation(page) {
  await page.locator("#startBtn").click();
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  await expect(page.locator("#pick")).toHaveClass(/show/);
}

const clickRoom = (page, k) => page.locator(`[data-room="${k}"]`).dispatchEvent("click");

async function closeRoom(page) {
  await page.locator("#closeBtn").click();
  await page.clock.runFor(15_000);
  await expect(page.locator("#count")).not.toHaveClass(/show/);
}

test("l'écran d'accueil s'affiche et mène au choix du protocole", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("#home")).toHaveClass(/show/);
  await expect(page.locator("#home h2")).toHaveText("NOSTROMO II");
  await expect(page.locator("#pick")).not.toHaveClass(/show/);

  await startSimulation(page);
  await expect(page.locator("#protos .proto")).toHaveCount(4);

  await page.locator("#pickMenuBtn").click();
  await expect(page.locator("#home")).toHaveClass(/show/);
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#settings")).toHaveClass(/show/);
  await page.locator("#setClose").click();
  await expect(page.locator("#settings")).not.toHaveClass(/show/);
  expect(errors).toEqual([]);
});

for (const id of [0, 1, 2, 3]) {
  test(`protocole n°${id + 1} : l'agent resté dans la dernière salle survit`, async ({ page }) => {
    const errors = await open(page);
    // Salle jamais fermée par ce protocole (hors salles toxiques).
    const survivor = await page.evaluate(i => {
      const closed = new Set(PROTOCOLS[i].steps.flat());
      return Object.keys(ROOMS).find(k => !ROOMS[k].toxic && !closed.has(k));
    }, id);
    expect(survivor).toBeTruthy();

    await startSimulation(page);
    await page.locator("#protos .proto").nth(id).click();
    await clickRoom(page, survivor);
    await expect(page.locator("#status")).toContainText("Agent en");

    for (let step = 1; step <= 8; step++) {
      await closeRoom(page);
      await expect(page.locator("#step")).toHaveText(`${step}/8`);
    }
    await page.clock.runFor(2_000);
    await expect(page.locator("#end")).toHaveClass(/show/);
    await expect(page.locator("#endTitle")).toHaveText("AGENT SURVIVANT");
    expect(errors).toEqual([]);
  });
}

test("l'agent dans une salle qui ferme est éliminé", async ({ page }) => {
  const errors = await open(page);
  const first = await page.evaluate(() => PROTOCOLS[0].steps[0][0]);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await clickRoom(page, first);
  await closeRoom(page);
  await page.clock.runFor(2_000);
  await expect(page.locator("#endTitle")).toHaveText("AGENT ÉLIMINÉ");
  expect(errors).toEqual([]);
});

test("déplacement vers une salle voisine puis annulation", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await clickRoom(page, "cockpit");
  await clickRoom(page, "vie");
  await expect(page.locator("#moves")).toHaveText("1");
  await expect(page.locator("#status")).toContainText("Salle de vie");
  // Une salle non reliée ne compte pas comme déplacement.
  const far = await page.evaluate(() => Object.keys(ROOMS).find(k => k !== "vie" && !ADJ.vie.has(k)));
  await clickRoom(page, far);
  await expect(page.locator("#moves")).toHaveText("1");
  await page.locator("#undoBtn").click();
  await expect(page.locator("#status")).toContainText("Cockpit");
  await expect(page.locator("#moves")).toHaveText("0");
});

test("le bouton Menu est sans effet pendant le compte à rebours", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await clickRoom(page, "cockpit");
  await page.locator("#closeBtn").click();
  await page.clock.runFor(500);
  await expect(page.locator("#count")).toHaveClass(/show/);
  await page.evaluate(() => document.getElementById("menuBtn").click());
  await expect(page.locator("#home")).not.toHaveClass(/show/);
});

test("chaque style d'écran s'applique et reste mémorisé", async ({ page }) => {
  const errors = await open(page);
  await page.locator("#homeSetBtn").click();
  const themes = page.locator("#themes .theme");
  const count = await themes.count();
  expect(count).toBe(15);
  for (let i = 0; i < count; i++) {
    await themes.nth(i).click();
    await expect(themes.nth(i)).toHaveAttribute("aria-pressed", "true");
    const [bg, expected] = await page.evaluate(i => [
      getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
      THEMES[i][3] || "#07090a",
    ], i);
    expect(bg).toBe(expected);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")).theme);
    expect(saved).toBe(i);
  }
  expect(errors).toEqual([]);
});

test("la musique démarre à l'ouverture et se règle dans les réglages", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("#home")).toHaveClass(/show/);
  expect(await page.evaluate(() => Audio.playing)).toBe(true);
  await expect.poll(() => page.evaluate(() => Audio.state)).toBe("running");
  await expect(page.locator("#musicBtn")).toHaveCount(0);

  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#musicChk")).toBeChecked();
  await page.locator("#musicChk").uncheck();
  expect(await page.evaluate(() => Audio.playing)).toBe(false);
  await page.locator("#sfxRange").fill("40");
  await expect(page.locator("#sfxVal")).toHaveText("40 %");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")));
  expect(saved.music).toBe(false);
  expect(saved.sfx).toBe(0.4);
  expect(errors).toEqual([]);
});

test("musique coupée : pas d'écran « touchez pour commencer »", async ({ page }) => {
  await open(page, { ...FAST, music: false });
  await expect(page.locator("#press")).not.toHaveClass(/show/);
  expect(await page.evaluate(() => Audio.playing)).toBe(false);
});

test("faux écrans de transition au démarrage et au choix du protocole", async ({ page }) => {
  const errors = await open(page, { ...FAST, transitions: true });
  await page.locator("#startBtn").click();
  await expect(page.locator("#trans")).toHaveClass(/show/);
  await expect(page.locator("#transHd")).toHaveText("INITIALISATION DE LA SIMULATION");
  await page.clock.runFor(10_000);
  await expect(page.locator("#trans")).not.toHaveClass(/show/);
  await expect(page.locator("#pick")).toHaveClass(/show/);
  await expect(page.locator("#transLines")).toContainText("CONNEXION AU VAISSEAU-BASE");

  await page.locator("#protos .proto").nth(1).click();
  await expect(page.locator("#trans")).toHaveClass(/show/);
  // Toucher l'écran passe la transition.
  await page.locator("#trans").click();
  await expect(page.locator("#trans")).not.toHaveClass(/show/);
  await expect(page.locator("#status")).toContainText("pose son pion");
  await expect(page.locator("#transLines")).toContainText("PROTOCOLE N°2");
  expect(errors).toEqual([]);
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
