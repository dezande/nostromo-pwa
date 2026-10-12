// @ts-check
import { test, expect, type Page } from "@playwright/test";
import { ADJ, ROOM_IDS, room, type RoomId } from "../src/data/ship";
import { THEMES, DEFAULT_BG } from "../src/data/themes";
import type { Settings } from "../src/state/settings";

// Partie rapide : compte à rebours minimal et pas d'annonce vocale.
// Musique coupée par défaut : les tests vont plus vite (sauf ceux qui testent la musique).
const FAST: Partial<Settings> = { voice: false, wakeLock: false, transitions: false, music: false };
const audioState = (page: Page) => page.evaluate(() => ({ playing: window.nostromo!.audio.playing, state: window.nostromo!.audio.state }));

/** Aucune voix réelle pendant les tests : la synthèse vocale de macOS passerait outre le mode muet. */
async function silence(page: Page) {
  await page.addInitScript(() => {
    const fake = { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices: () => [], speaking: false, pending: false, paused: false, addEventListener() {}, removeEventListener() {} };
    Object.defineProperty(window, "speechSynthesis", { value: fake, configurable: true });
  });
}

async function open(page: Page, settings = FAST) {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(s => localStorage.setItem("nostromo-settings", JSON.stringify(s)), settings);
  await silence(page);
  await page.clock.install();
  await page.goto("/");
  // Écran « touchez pour commencer » si le navigateur bloque le son au chargement.
  await page.clock.runFor(500);
  if (await page.locator("#press").evaluate(e => e.classList.contains("show"))) await page.locator("#press").click();
  await expect(page.locator("#press")).not.toHaveClass(/show/);
  return errors;
}

/** « Démarrer la simulation », puis les panneaux Bienvenue et Protocole : la partie commence. */
async function startSimulation(page: Page) {
  await page.locator("#startBtn").click();
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await page.locator("#welcomeNext").click();
  await page.locator("#briefingNext").click();
  await page.locator("#briefing2Next").click();
  await expect(page.locator("#briefing2")).not.toHaveClass(/show/);
}

/** Salles mises en avant (accessibles) sur le plan. */
const reachableRooms = (page: Page) => page.locator(".room.reach").evaluateAll(els => els.map(e => e.getAttribute("data-room")).sort());

const clickRoom = (page: Page, k: RoomId) => page.locator(`[data-room="${k}"]`).dispatchEvent("click");

/** Choisit la salle de départ puis la confirme avec « Valider ». */
async function placeAgent(page: Page, k: RoomId) {
  await clickRoom(page, k);
  await page.locator("#closeBtn").click();
}

/** Fin des déplacements, le Coordinateur touche la ou les salles à fermer, puis « Valider ». */
async function closeRoom(page: Page, ...rooms: RoomId[]) {
  await page.locator("#closeBtn").click();
  for (const k of rooms) await clickRoom(page, k);
  await page.locator("#closeBtn").click();
  await page.clock.runFor(3_000); // claquement et cri du xénomorphe
  await expect(page.locator("#closeBtn")).not.toHaveText("");
}

test("accueil, puis panneaux Bienvenue et Protocole, puis choix de la salle de départ", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("#home")).toHaveClass(/show/);
  await expect(page.locator("#home h2")).toHaveText("NOSTROMO II");

  await page.locator("#startBtn").click();
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await expect(page.locator("#welcome h2")).toHaveText("BIENVENUE À BORD, AGENT.");
  await page.locator("#welcomeNext").click();
  await expect(page.locator("#briefing")).toHaveClass(/show/);
  await expect(page.locator("#briefing .briefing-steps li")).toHaveCount(2);
  await expect(page.locator("#briefing")).toContainText("Seul le Coordinateur en connaît l'ordre de fermeture.");
  await page.locator("#briefingNext").click();
  await expect(page.locator("#briefing2")).toHaveClass(/show/);
  await expect(page.locator("#briefing2 .briefing-steps li")).toHaveCount(2);
  await expect(page.locator("#briefing2")).toContainText("L'entraînement dure 5 minutes.");
  await expect(page.locator("#briefing")).not.toContainText("contamin");
  await expect(page.locator("#briefing2")).not.toContainText("contamin");
  await page.locator("#briefing2Back").click();
  await page.locator("#briefingBack").click();
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await page.locator("#welcomeNext").click();
  await page.locator("#briefingNext").click();
  await page.locator("#briefing2Next").click();
  await expect(page.locator("#briefing2")).not.toHaveClass(/show/);
  await expect(page.locator(".room.reach")).toHaveCount(ROOM_IDS.filter(k => !room(k).toxic).length);
  // Plus de choix de protocole dans l'app.
  await expect(page.locator("#pick, #protos")).toHaveCount(0);

  await page.locator("#menuBtn").click();
  await expect(page.locator("#home")).toHaveClass(/show/);
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#settings")).toHaveClass(/show/);
  await page.locator("#setClose").click();
  await expect(page.locator("#settings")).not.toHaveClass(/show/);
  expect(errors).toEqual([]);
});

test("le Coordinateur ferme les salles une par une ; après 8 fermetures, l'agent survit", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
  await placeAgent(page, "serre");
  const others = ROOM_IDS.filter(k => !room(k).toxic && k !== "serre");
  for (let step = 1; step <= 8; step++) {
    await closeRoom(page, others[step - 1]);
    await expect(page.locator(".room.closed")).toHaveCount(step);
  }
  await page.clock.runFor(2_000);
  await expect(page.locator("#end")).toHaveClass(/show/);
  await expect(page.locator("#endTitle")).toHaveText("AGENT SURVIVANT");
  expect(errors).toEqual([]);
});

test("le Coordinateur choisit la salle à fermer : salles possibles, choix de deux salles, Annuler", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await placeAgent(page, "vie");
  await page.locator("#closeBtn").click(); // déplacements terminés
  await page.clock.runFor(4000);
  await expect(page.locator("#protocolMessage")).toHaveText("COORDINATEUR : TOUCHEZ LA SALLE À FERMER");
  await expect(page.locator("#closeBtn")).toBeDisabled();
  await expect(page.locator(".room.target")).toHaveCount(ROOM_IDS.filter(k => !room(k).toxic).length);
  await expect(page.locator('[data-room="labo"]')).not.toHaveClass(/target/);
  await clickRoom(page, "cuisine");
  await clickRoom(page, "atelier");
  await expect(page.locator(".room.selected")).toHaveCount(2);
  await page.clock.runFor(4000);
  await expect(page.locator("#protocolMessage")).toContainText("SALLE À FERMER : CUISINE + ATELIER");
  // Annuler : retour aux déplacements, sans fermeture.
  await page.locator("#undoBtn").click();
  await expect(page.locator(".room.selected")).toHaveCount(0);
  expect(await reachableRooms(page)).toEqual([...ADJ.vie].sort());
  await closeRoom(page, "cuisine", "atelier");
  await expect(page.locator(".room.closed")).toHaveCount(2);
});

test("l'agent dans une salle qui ferme est éliminé", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
  await placeAgent(page, "cockpit");
  await closeRoom(page, "cockpit");
  await page.clock.runFor(2_000);
  await expect(page.locator("#endTitle")).toHaveText("AGENT ÉLIMINÉ");
  expect(errors).toEqual([]);
});

test("déplacement vers une salle voisine puis annulation", async ({ page }) => {
  await open(page);
  await startSimulation(page);
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
  const vent = page.locator('[data-vent="dortoir1-entrepot1"]');
  await expect(vent).toBeVisible();
  await expect(vent.locator("tspan")).toHaveText(["PASSAGE", "VENTILATION"]);
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

test("fermeture immédiate : pas de compte à rebours, la salle fermée garde une croix rouge", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
  await placeAgent(page, "cockpit");
  await page.locator("#closeBtn").click(); // déplacements terminés
  await clickRoom(page, "cuisine");
  await page.locator("#closeBtn").click(); // fermeture
  // Fermée tout de suite, sans écran de compte à rebours.
  await expect(page.locator('[data-room="cuisine"]')).toHaveClass(/closed/);
  await expect(page.locator("#count")).toHaveCount(0);
  await expect(page.locator('[data-room="cuisine"] .toxic-cross')).toHaveCount(2);
  await page.clock.runFor(10_000);
  await expect(page.locator('[data-room="cuisine"] .toxic-cross')).toHaveCount(2); // la croix reste
  expect(errors).toEqual([]);
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
  const errors = await open(page, { ...FAST, music: true });
  await expect(page.locator("#home")).toHaveClass(/show/);
  expect((await audioState(page)).playing).toBe(true);
  await expect.poll(async () => (await audioState(page)).state).toBe("running");
  await expect(page.locator("#musicBtn")).toHaveCount(0);

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
  expect(errors).toEqual([]);
});

test("musique coupée : pas d'écran « touchez pour commencer »", async ({ page }) => {
  await open(page, { ...FAST, music: false });
  await expect(page.locator("#press")).not.toHaveClass(/show/);
  expect((await audioState(page)).playing).toBe(false);
});

test("faux écran de transition au démarrage, puis panneau de bienvenue", async ({ page }) => {
  const errors = await open(page, { ...FAST, transitions: true });
  await page.locator("#startBtn").click();
  await expect(page.locator("#trans")).toHaveClass(/show/);
  await expect(page.locator("#transHd")).toHaveText("INITIALISATION DE LA SIMULATION");
  await page.clock.runFor(10_000);
  await expect(page.locator("#trans")).not.toHaveClass(/show/);
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await expect(page.locator("#transLines")).toContainText("CONNEXION AU VAISSEAU-BASE");

  await expect(page.locator("#welcome")).toContainText("Votre future mission");
  expect(errors).toEqual([]);
});

test("toucher l'écran passe la transition", async ({ page }) => {
  await open(page, { ...FAST, transitions: true });
  await page.locator("#startBtn").click();
  await expect(page.locator("#trans")).toHaveClass(/show/);
  await page.clock.runFor(100);
  await page.locator("#trans").click();
  await expect(page.locator("#trans")).not.toHaveClass(/show/);
  await expect(page.locator("#welcome")).toHaveClass(/show/);
});

test("fenêtre du protocole : choix de la salle de départ puis position enregistrée", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
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
  await placeAgent(page, "vie");
  await clickRoom(page, "dortoir1");
  await clickRoom(page, "reunion");
  await expect(page.locator(".path-line")).toHaveCount(2);
  await expect(page.locator(".path-step")).toHaveText(["1", "2"]);
  await page.clock.runFor(5000);
  await expect(page.locator("#protocolMessage")).toHaveText("SALLE DE VIE → DORTOIR 1 → SALLE DE RÉUNION · 2 DÉPLACEMENTS");
  await page.locator("#undoBtn").click();
  await expect(page.locator(".path-line")).toHaveCount(1);
  await closeRoom(page, "atelier");
  await expect(page.locator(".path-line")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("les panneaux d'accueil tiennent dans l'écran sans défilement (téléphones et ordinateurs portables)", async ({ page }) => {
  await open(page);
  await page.locator("#startBtn").click();
  for (const size of [{ width: 375, height: 667 }, { width: 390, height: 844 }, { width: 412, height: 915 }, { width: 1280, height: 720 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(size);
    for (const [id, next] of [["welcome", "#welcomeNext"], ["briefing", "#briefingNext"], ["briefing2", "#briefing2Back"]] as const) {
      await expect(page.locator(`#${id}`)).toHaveClass(/show/);
      const fits = await page.locator(`#${id} .panel`).evaluate(el => ({
        scroll: el.scrollHeight <= el.clientHeight + 1,
        inside: el.getBoundingClientRect().bottom <= window.innerHeight + 1,
      }));
      expect(fits, `${id} à ${size.width}×${size.height}`).toEqual({ scroll: true, inside: true });
      if (id !== "briefing2") await page.locator(next).click();
    }
    // retour au panneau de bienvenue pour la taille suivante
    await page.locator("#briefing2Back").click();
    await page.locator("#briefingBack").click();
  }
});

test("minuteur de 5 minutes : démarre à la validation, alarme à zéro, la partie continue", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
  await expect(page.locator("#trainingTimer")).toHaveCount(0);
  await placeAgent(page, "vie");
  await expect(page.locator("#trainingTimer")).toHaveText("05:00");
  await page.clock.runFor(60_000);
  await expect(page.locator("#trainingTimer")).toHaveText("04:00");
  await page.clock.runFor(185_000);
  await expect(page.locator("#trainingTimer")).toHaveText("00:55");
  await expect(page.locator("#trainingTimer")).toHaveClass(/urgent/);
  await page.clock.runFor(60_000);
  await expect(page.locator("#trainingTimer")).toHaveText("00:00");
  await expect(page.locator("#trainingTimer")).toHaveClass(/expired/);
  // La partie n'est pas bloquée.
  await clickRoom(page, "cuisine");
  await expect(page.locator("#pawn")).toHaveAttribute("visibility", "visible");
  await expect(page.locator("#closeBtn")).toBeEnabled();
  expect(errors).toEqual([]);
});

test("réglages en onglets : Affichage, Audio, Alerte, Système ; dernier onglet mémorisé ; clavier", async ({ page }) => {
  const errors = await open(page);
  await page.locator("#homeSetBtn").click();
  await expect(page.getByRole("tab")).toHaveText(["AFFICHAGE", "AUDIO", "ALERTE", "SYSTÈME"]);
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
  await page.locator("#alertCountdownChk").uncheck();
  await page.locator("#alertPreview").click();
  await page.clock.runFor(5000);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!));
  expect(saved).toMatchObject({ alertVariant: "detector", alertVoice: true, alertCountdown: false, settingsTab: "alert" });
  // Le dernier onglet est mémorisé (enregistré ci-dessus, et rouvert à la réouverture)
  await page.locator("#setClose").click();
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#tab-alert")).toHaveAttribute("aria-selected", "true");
  expect(errors).toEqual([]);
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

test("la croix des salles fermées reste dans la forme de chaque salle (entrepôts compris)", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await placeAgent(page, "serre");
  await closeRoom(page, "entrepot1", "entrepot2", "entrepot3", "entrepot4", "cockpit", "reunion");
  for (const id of ["entrepot1", "entrepot2", "entrepot3", "entrepot4", "cockpit", "reunion", "armurerie", "labo"]) {
    const ok = await page.locator(`[data-room="${id}"]`).evaluate(g => {
      const shape = g.querySelector("rect, polygon") as SVGGeometryElement;
      return [...g.querySelectorAll(".toxic-cross")].every(l => {
        const line = l as SVGLineElement;
        const pts = [[line.x1, line.y1], [line.x2, line.y2]].map(([x, y]) => new DOMPoint(x.baseVal.value, y.baseVal.value));
        return pts.every(p => shape.isPointInFill(p));
      }) && g.querySelectorAll(".toxic-cross").length === 2;
    });
    expect(ok, id).toBe(true);
  }
});

test("le numéro de build est affiché dans les réglages", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  await page.locator("#tab-system").click();
  await expect(page.locator("#versionInfo")).toHaveText(/v\d+\.\d+\.\d+ · BUILD \d+ \([0-9a-f]+\) DU \d{2}\/\d{2}\/\d{4}/);
});

test("le menu met la partie en pause et permet de la reprendre", async ({ page }) => {
  const errors = await open(page);
  await startSimulation(page);
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
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  expect(errors).toEqual([]);
});

test("menu depuis l'écran de fin, sans bouton Reprendre", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await placeAgent(page, "cockpit");
  await closeRoom(page, "cockpit");
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
