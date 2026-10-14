// Format Tablette / Téléphone : l'écran de jeu tient exactement dans la fenêtre.
import { test, expect, type Page } from "@playwright/test";
import { FAST, clickRoom, silence, open, startSimulation, placeAgent } from "./helpers";

// ---------- Format Tablette / Téléphone : l'écran de jeu tient exactement dans la fenêtre ----------
const FORMATS: [layout: "tablet" | "phone", width: number, height: number][] = [
  ["tablet", 1024, 768], ["tablet", 1366, 1024], ["tablet", 768, 1024],
  ["phone", 360, 780], ["phone", 390, 844], ["phone", 414, 896],
];

/** Aucun défilement : ni la page, ni la zone du plan. */
async function expectNoScroll(page: Page, label: string) {
  const size = await page.evaluate(() => {
    const root = document.documentElement;
    const main = document.getElementById("main")!;
    return {
      width: root.scrollWidth === innerWidth, height: root.scrollHeight === innerHeight,
      main: main.scrollHeight <= main.clientHeight + 1 && main.scrollWidth <= main.clientWidth + 1,
    };
  });
  expect(size, label).toEqual({ width: true, height: true, main: true });
}

/** L'élément est visible en entier dans la fenêtre. */
async function expectInside(page: Page, selector: string, label: string) {
  await expect(page.locator(selector), `${selector} ${label}`).toBeVisible();
  const box = (await page.locator(selector).boundingBox())!;
  const view = page.viewportSize()!;
  expect(box.x, `${selector} ${label}`).toBeGreaterThanOrEqual(-0.5);
  expect(box.y, `${selector} ${label}`).toBeGreaterThanOrEqual(-0.5);
  expect(box.x + box.width, `${selector} ${label}`).toBeLessThanOrEqual(view.width + 0.5);
  expect(box.y + box.height, `${selector} ${label}`).toBeLessThanOrEqual(view.height + 0.5);
  expect(box.width * box.height, `${selector} ${label}`).toBeGreaterThan(0);
}

for (const [layout, width, height] of FORMATS) {
  test(`format ${layout === "phone" ? "téléphone" : "tablette"} ${width}×${height} : écran de jeu sans défilement`, async ({ page }) => {
    const label = `${layout} ${width}×${height}`;
    await page.setViewportSize({ width, height });
    const errors = await open(page, { ...FAST, layout });
    await expect(page.locator("html")).toHaveClass(new RegExp(`layout-${layout}`));
    await startSimulation(page);
    await expectNoScroll(page, label);
    // Téléphone : un seul pont à la fois (onglets) ; Tablette : les deux ponts.
    const decks = layout === "phone" ? ["#deck1"] : ["#deck1", "#deck2"];
    for (const sel of [...decks, "#infoPanel", "#undoBtn", "#closeBtn", "#setBtn"]) await expectInside(page, sel, label);
    if (layout === "phone") {
      await expect(page.locator("#deck2")).toBeHidden();
      await page.locator("#deckTab2").click();
      await expectInside(page, "#deck2", label);
      await expect(page.locator("#deck1")).toBeHidden();
      await expectNoScroll(page, `${label} pont 2`);
      await page.locator("#deckTab1").click();
    }
    // Les ponts gardent leurs proportions (jamais déformés)
    const ratio = await page.evaluate(() => ["deck1", "deck2"].map(id => document.getElementById(id)!.getAttribute("preserveAspectRatio")));
    expect(ratio).toEqual(["xMidYMid meet", "xMidYMid meet"]);
    // Les panneaux décoratifs ne gênent pas : cachés aux lecteurs d'écran et jamais cliquables
    for (const deco of await page.locator(".sys-panel").all()) {
      await expect(deco).toHaveAttribute("aria-hidden", "true");
      expect(await deco.evaluate(el => getComputedStyle(el).pointerEvents)).toBe("none");
    }
    // Une salle se touche toujours : salle de départ, puis un vrai clic vers une salle voisine
    await placeAgent(page, "cockpit");
    await expect(page.locator("#pawn")).toHaveAttribute("visibility", "visible");
    await expect(page.locator("#pawn")).toBeVisible();
    await page.locator('[data-room="vie"]').click();
    await expect(page.locator("#deck1 .path-step")).toHaveText(["1"]);
    await page.clock.runFor(5000);
    await expectNoScroll(page, `${label} après déplacement`);
    for (const sel of [...decks, "#closeBtn"]) await expectInside(page, sel, label);
    expect(errors).toEqual([]);
  });
}

test("téléphone : un pont à la fois, bascule automatique quand le pion prend l'ascenseur", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await open(page, { ...FAST, layout: "phone" });
  await startSimulation(page);
  await expect(page.locator("#deckTab1")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#deck1")).toBeVisible();
  await expect(page.locator("#deck2")).toBeHidden();
  await placeAgent(page, "vie");
  await expect(page.locator("#deckTab1 .deck-tab-led")).toHaveCount(1);
  await clickRoom(page, "atelier"); // ascenseur vers le pont 2
  await expect(page.locator("#deckTab2")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#deck2")).toBeVisible();
  await expect(page.locator("#deck1")).toBeHidden();
  await expect(page.locator("#deckTab2 .deck-tab-led")).toHaveCount(1);
  // Bascule à la main : on peut regarder l'autre pont
  await page.locator("#deckTab1").click();
  await expect(page.locator("#deck1")).toBeVisible();
  await expect(page.locator("#deckTab2 .deck-tab-led")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("tablette : pas d'onglets de ponts, les deux ponts visibles", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await open(page, { ...FAST, layout: "tablet" });
  await startSimulation(page);
  await expect(page.locator(".deck-tabs")).toBeHidden();
  await expect(page.locator("#deck1")).toBeVisible();
  await expect(page.locator("#deck2")).toBeVisible();
});

test("format : choix Tablette / Téléphone dans les Réglages, appliqué et mémorisé", async ({ page }) => {
  const errors = await open(page, { ...FAST, layout: "tablet" });
  await page.locator("#homeSetBtn").click();
  await page.locator("#tab-display").click();
  await expect(page.locator('.layouts[aria-labelledby="layoutLbl"]')).toHaveAttribute("role", "radiogroup");
  await expect(page.locator('[id^="layout-"]')).toHaveText(["Tablette", "Téléphone"]);
  await expect(page.locator("#layout-tablet")).toHaveAttribute("aria-checked", "true");
  await page.locator("#layout-phone").click();
  await expect(page.locator("#layout-phone")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("#layout-tablet")).toHaveAttribute("aria-checked", "false");
  await expect(page.locator("html")).toHaveClass(/layout-phone/);
  await expect(page.locator("html")).not.toHaveClass(/layout-tablet/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!).layout)).toBe("phone");
  await page.locator("#layout-tablet").click();
  await expect(page.locator("html")).toHaveClass(/layout-tablet/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!).layout)).toBe("tablet");
  expect(errors).toEqual([]);
});

for (const [layout, width, height] of [["phone", 390, 844], ["tablet", 1024, 768]] as const) {
  test(`format par défaut au premier lancement : ${layout === "phone" ? "téléphone" : "tablette"} en ${width}×${height}, puis mémorisé`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await silence(page);
    await page.clock.install();
    await page.goto("/");
    await page.clock.runFor(500);
    await expect(page.locator("html")).toHaveClass(new RegExp(`layout-${layout}`));
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!).layout)).toBe(layout);
    // Une fois choisi, le format reste, même si la fenêtre change d'orientation
    await page.setViewportSize({ width: height, height: width });
    await page.reload();
    await page.clock.runFor(500);
    await expect(page.locator("html")).toHaveClass(new RegExp(`layout-${layout}`));
  });
}
