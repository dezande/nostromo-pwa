// @ts-check
import { test, expect, type Page } from "@playwright/test";
import { ADJ, ROOM_IDS, room, type RoomId } from "../src/data/ship";
import { PROTOCOLS } from "../src/data/protocols";
import { THEMES, DEFAULT_BG } from "../src/data/themes";
import type { Settings } from "../src/state/settings";

// Partie rapide : compte à rebours minimal et pas d'annonce vocale.
const FAST: Partial<Settings> = { countdown: 3, voice: false, wakeLock: false, transitions: false };
const audioState = (page: Page) => page.evaluate(() => ({ playing: window.nostromo!.audio.playing, state: window.nostromo!.audio.state }));

async function open(page: Page, settings = FAST) {
  const errors: string[] = [];
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

async function startSimulation(page: Page) {
  await page.locator("#startBtn").click();
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  await expect(page.locator("#pick")).toHaveClass(/show/);
}

/** Salles mises en avant (accessibles) sur le plan. */
const reachableRooms = (page: Page) => page.locator(".room.reach").evaluateAll(els => els.map(e => e.getAttribute("data-room")).sort());

const clickRoom = (page: Page, k: RoomId) => page.locator(`[data-room="${k}"]`).dispatchEvent("click");

/** Choisit la salle de départ puis la confirme avec « Valider ». */
async function placeAgent(page: Page, k: RoomId) {
  await clickRoom(page, k);
  await page.locator("#closeBtn").click();
}

async function closeRoom(page: Page) {
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
    const closedRooms = new Set(PROTOCOLS[id].steps.flat());
    const survivor = ROOM_IDS.find(k => !room(k).toxic && !closedRooms.has(k))!;
    expect(survivor).toBeTruthy();

    await startSimulation(page);
    await page.locator("#protos .proto").nth(id).click();
    await placeAgent(page, survivor);
    await expect(page.locator("#pawn, #pawn2").locator("visible=true")).toHaveCount(1);

    for (let step = 1; step <= 8; step++) {
      await closeRoom(page);
      await expect(page.locator(".room.closed")).toHaveCount(PROTOCOLS[id].steps.slice(0, step).flat().length);
    }
    await page.clock.runFor(2_000);
    await expect(page.locator("#end")).toHaveClass(/show/);
    await expect(page.locator("#endTitle")).toHaveText("AGENT SURVIVANT");
    expect(errors).toEqual([]);
  });
}

test("l'agent dans une salle qui ferme est éliminé", async ({ page }) => {
  const errors = await open(page);
  const first = PROTOCOLS[0].steps[0][0];
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await placeAgent(page, first);
  await closeRoom(page);
  await page.clock.runFor(2_000);
  await expect(page.locator("#endTitle")).toHaveText("AGENT ÉLIMINÉ");
  expect(errors).toEqual([]);
});

test("déplacement vers une salle voisine puis annulation", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await placeAgent(page, "cockpit");
  expect(await reachableRooms(page)).toEqual([...ADJ.cockpit].sort());
  await expect(page.locator("#undoBtn")).toBeDisabled();
  await clickRoom(page, "vie");
  expect(await reachableRooms(page)).toEqual([...ADJ.vie].sort());
  // Une salle non reliée : le pion ne bouge pas.
  const far = ROOM_IDS.find(k => k !== "vie" && !ADJ.vie.has(k))!;
  await clickRoom(page, far);
  expect(await reachableRooms(page)).toEqual([...ADJ.vie].sort());
  await page.locator("#undoBtn").click();
  expect(await reachableRooms(page)).toEqual([...ADJ.cockpit].sort());
  await expect(page.locator("#undoBtn")).toBeDisabled();
});

test("conduit d'aération : couloir visible, praticable entre dortoir et entrepôt", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").nth(2).click(); // le protocole n°3 ne ferme les entrepôts qu'à la fin
  const vent = page.locator('[data-vent="dortoir1-entrepot1"]');
  await expect(vent).toBeVisible();
  await expect(vent).toHaveText("VENTILATION");
  await placeAgent(page, "dortoir1");
  await expect(vent).toHaveClass(/open/);
  expect(await reachableRooms(page)).toContain("entrepot1");
  await clickRoom(page, "entrepot1");
  await expect(page.locator("#deck1 .path-line")).toHaveCount(3); // dortoir → couloir → entrepôt
  await expect(page.locator("#deck1 .path-step")).toHaveText(["1"]);
});

test("l'écran de jeu montre les deux ponts et la barre d'actions, sans panneau coordinateur", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await expect(page.locator("#deck1")).toBeVisible();
  await expect(page.locator("#deck2")).toBeVisible();
  // Fenêtre d'informations au-dessus du pont 2.
  await expect(page.locator("#infoPanel")).toBeVisible();
  const info = (await page.locator("#infoPanel").boundingBox())!;
  const deck2 = (await page.locator("#deck2").boundingBox())!;
  expect(info.y + info.height).toBeLessThanOrEqual(deck2.y);
  // Sur grand écran, la colonne de droite (informations + pont 2) a la même hauteur que le pont 1.
  if (test.info().project.name === "ordinateur") {
    const left = (await page.locator(".deck:has(#deck1)").boundingBox())!;
    const right = (await page.locator(".deck:has(#deck2)").boundingBox())!;
    expect(Math.abs(info.y - left.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(right.y + right.height - (left.y + left.height))).toBeLessThanOrEqual(1);
  }
  await expect(page.locator(".coordinator")).toHaveCount(0);
  await expect(page.locator("#status, #aip, #resetBtn")).toHaveCount(0);
  await expect(page.locator(".action-bar #closeBtn")).toHaveText("VALIDER");
  await expect(page.locator(".action-bar #closeBtn")).toBeDisabled();
  await clickRoom(page, "cockpit");
  await expect(page.locator(".action-bar #closeBtn")).toBeEnabled();
});

test("le bouton Menu est sans effet pendant le compte à rebours", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await placeAgent(page, "cockpit");
  await page.locator("#closeBtn").click();
  await page.clock.runFor(500);
  await expect(page.locator("#count")).toHaveClass(/show/);
  await page.evaluate(() => document.getElementById("menuBtn")!.click());
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
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
    const theme = THEMES[i];
    expect(bg).toBe(theme.font ? theme.bg : DEFAULT_BG);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!).theme);
    expect(saved).toBe(i);
  }
  expect(errors).toEqual([]);
});

test("la musique démarre à l'ouverture et se règle dans les réglages", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("#home")).toHaveClass(/show/);
  expect((await audioState(page)).playing).toBe(true);
  await expect.poll(async () => (await audioState(page)).state).toBe("running");
  await expect(page.locator("#musicBtn")).toHaveCount(0);

  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#musicChk")).toBeChecked();
  await page.locator("#musicChk").uncheck();
  expect((await audioState(page)).playing).toBe(false);
  await page.locator("#sfxRange").fill("40");
  await expect(page.locator("#sfxVal")).toHaveText("40 %");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!));
  expect(saved.music).toBe(false);
  expect(saved.sfxVolume).toBe(0.4);
  expect(errors).toEqual([]);
});

test("musique coupée : pas d'écran « touchez pour commencer »", async ({ page }) => {
  await open(page, { ...FAST, music: false });
  await expect(page.locator("#press")).not.toHaveClass(/show/);
  expect((await audioState(page)).playing).toBe(false);
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
  await expect(page.locator(".room.reach")).toHaveCount(ROOM_IDS.filter(k => !room(k).toxic).length);
  await expect(page.locator("#transLines")).toContainText("PROTOCOLE N°2");
  expect(errors).toEqual([]);
});

test("fenêtre du protocole : choix de la salle de départ puis position enregistrée", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await expect(page.locator("#infoPanel h2")).toHaveText("PROTOCOLE A.I.P.");
  await page.clock.runFor(3000);
  await expect(page.locator("#protocolMessage")).toHaveText("AGENT, CHOISISSEZ VOTRE SALLE DE DÉPART");
  await expect(page.locator(".room.pulse")).toHaveCount(ROOM_IDS.filter(k => !room(k).toxic).length);
  await clickRoom(page, "cockpit");
  await page.clock.runFor(4000);
  await expect(page.locator("#protocolMessage")).toContainText("SALLE DE DÉPART : COCKPIT");
  // On peut encore changer de salle, même éloignée, tant qu'on n'a pas validé.
  await clickRoom(page, "entrepot4");
  await page.clock.runFor(4000);
  await expect(page.locator("#protocolMessage")).toContainText("SALLE DE DÉPART : ENTREPÔT 4");
  await expect(page.locator("#pawn2")).toHaveAttribute("visibility", "visible");
  await page.locator("#closeBtn").click();
  await page.clock.runFor(3000);
  await expect(page.locator("#protocolMessage")).toHaveText("POSITION ENREGISTRÉE : ENTREPÔT 4");
  await expect(page.locator(".room.pulse")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("chemin du pion : tracé, trajet en texte, annulation et remise à zéro après validation", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click(); // le protocole n°1 ferme d'abord l'atelier
  await placeAgent(page, "vie");
  await clickRoom(page, "dortoir1");
  await clickRoom(page, "reunion");
  await expect(page.locator(".path-line")).toHaveCount(2);
  await expect(page.locator(".path-step")).toHaveText(["1", "2"]);
  await page.clock.runFor(5000);
  await expect(page.locator("#protocolMessage")).toHaveText("SALLE DE VIE → DORTOIR 1 → SALLE DE RÉUNION · 2 DÉPLACEMENTS");
  await page.locator("#undoBtn").click();
  await expect(page.locator(".path-line")).toHaveCount(1);
  await closeRoom(page);
  await expect(page.locator(".path-line")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("le numéro de build est affiché dans les réglages", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#versionInfo")).toHaveText(/v\d+\.\d+\.\d+ · BUILD \d+ \([0-9a-f]+\) DU \d{2}\/\d{2}\/\d{4}/);
});

test("le menu met la partie en pause et permet de la reprendre", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await placeAgent(page, "cockpit");
  await page.locator("#menuBtn").click();
  await expect(page.locator("#home")).toHaveClass(/show/);
  await expect(page.locator("#resumeBtn")).toBeVisible();
  await expect(page.locator("#startLbl")).toHaveText("NOUVELLE SIMULATION");
  await page.locator("#resumeBtn").click();
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  await expect(page.locator("#pawn")).toHaveAttribute("visibility", "visible");
  expect(await reachableRooms(page)).toEqual([...ADJ.cockpit].sort());

  // Nouvelle simulation pendant une partie : il faut confirmer.
  await page.locator("#menuBtn").click();
  await page.locator("#startBtn").click();
  await expect(page.locator("#startLbl")).toContainText("CONFIRMER");
  await expect(page.locator("#home")).toHaveClass(/show/);
  await page.locator("#startBtn").click();
  await expect(page.locator("#pick")).toHaveClass(/show/);
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  expect(errors).toEqual([]);
});

test("menu depuis l'écran de fin, sans bouton Reprendre", async ({ page }) => {
  await open(page);
  const first = PROTOCOLS[0].steps[0][0];
  await startSimulation(page);
  await page.locator("#protos .proto").first().click();
  await placeAgent(page, first);
  await closeRoom(page);
  await page.clock.runFor(2_000);
  await page.locator("#endMenuBtn").click();
  await expect(page.locator("#home")).toHaveClass(/show/);
  await expect(page.locator("#resumeBtn")).toBeHidden();
  await expect(page.locator("#startLbl")).toHaveText("DÉMARRER LA SIMULATION");
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
