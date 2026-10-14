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

/** « Démarrer », puis « Lancer » avec le scénario proposé (le dernier choisi, Sixième sens par défaut). */
async function launch(page: Page) {
  await page.locator("#startBtn").click();
  await page.locator("#launchBtn").click();
}

/** « Démarrer la simulation », puis les panneaux Bienvenue et Protocole : la partie commence. */
async function startSimulation(page: Page) {
  await launch(page);
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await page.locator("#welcomeNext").click();
  for (const n of [1, 2, 3, 4]) await page.locator(`#rule${n}Next`).click();
  await expect(page.locator("#rule4")).not.toHaveClass(/show/);
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
  await expect(page.getByRole("button", { name: "Valider" })).toBeVisible();
}

test("accueil, puis panneaux Bienvenue et Protocole, puis choix de la salle de départ", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("#home")).toHaveClass(/show/);
  await expect(page.locator("#home h2")).toHaveText("NOSTROMO II");

  await launch(page);
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await expect(page.locator("#welcome h2")).toHaveText("BIENVENUE À BORD, AGENTS.");
  await page.locator("#welcomeNext").click();
  // Une règle par panneau, de 1/4 à 4/4, chacune avec sa scène animée tirée du vrai plan.
  const titles = ["POSITION DE DÉPART", "DÉPLACEMENTS", "FERMETURE", "FIN DE L'ENTRAÎNEMENT"];
  for (const [i, title] of titles.entries()) {
    const panel = page.locator(`#rule${i + 1}`);
    await expect(panel).toHaveClass(/show/);
    await expect(panel.locator(".rule-count")).toHaveText(`${i + 1}/4`);
    await expect(panel.locator(".rule-title")).toHaveText(title);
    await expect(panel.locator(".rule-scene .room").first()).toBeVisible();
    await expect(panel.locator(".rule-scene .pawn")).toHaveCount(1);
    await expect(panel).not.toContainText("contamin");
    await expect(panel).not.toContainText("minute");
    if (i < 3) await page.locator(`#rule${i + 1}Next`).click();
  }
  await expect(page.locator("#rule1")).toContainText("Seul le Coordinateur en connaît l'ordre de fermeture.");
  for (const n of [4, 3, 2, 1]) await page.locator(`#rule${n}Back`).click();
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await page.locator("#welcomeNext").click();
  for (const n of [1, 2, 3, 4]) await page.locator(`#rule${n}Next`).click();
  await expect(page.locator("#rule4")).not.toHaveClass(/show/);
  await expect(page.locator(".room.reach")).toHaveCount(ROOM_IDS.filter(k => !room(k).toxic).length);
  // Plus de choix de protocole dans l'app.
  await expect(page.locator("#pick, #protos")).toHaveCount(0);

  // Plus de bouton Menu sur l'écran de jeu : seulement les Réglages.
  await expect(page.locator("#menuBtn")).toHaveCount(0);
  await page.locator("#setBtn").click();
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
  await clickRoom(page, "cockpit"); // 3e salle : ignorée, sans message
  await expect(page.locator(".room.selected")).toHaveCount(2);
  await expect(page.locator('[data-room="cockpit"]')).not.toHaveClass(/selected/);
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
  // Téléphone : un pont à la fois, l'onglet PONT 2 affiche l'autre.
  if (test.info().project.name === "telephone") {
    await expect(page.locator("#deck2")).toBeHidden();
    await page.locator("#deckTab2").click();
    await expect(page.locator("#deck1")).toBeHidden();
  }
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
  await expect(page.locator(".action-bar").getByRole("button", { name: "Valider" })).toHaveAttribute("id", "closeBtn");
  await expect(page.locator(".action-bar #closeBtn")).toHaveAttribute("aria-label", "Valider");
  await expect(page.locator(".action-bar #undoBtn")).toHaveAccessibleName("Pas arrière");
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
  await launch(page);
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
  await launch(page);
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
  await expect(page.locator("#protocolMessage")).toHaveText("DÉPLACEMENTS EN COURS"); // pas de compteur visible
  await page.locator("#undoBtn").click();
  await expect(page.locator(".path-line")).toHaveCount(1);
  await closeRoom(page, "atelier");
  await expect(page.locator(".path-line")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("les panneaux d'accueil tiennent dans l'écran sans défilement (téléphones et ordinateurs portables)", async ({ page }) => {
  await open(page);
  await launch(page);
  for (const size of [{ width: 375, height: 667 }, { width: 390, height: 844 }, { width: 412, height: 915 }, { width: 1280, height: 720 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(size);
    for (const [id, next] of [["welcome", "#welcomeNext"], ["rule1", "#rule1Next"], ["rule2", "#rule2Next"], ["rule3", "#rule3Next"], ["rule4", ""]] as const) {
      await expect(page.locator(`#${id}`)).toHaveClass(/show/);
      const fits = await page.locator(`#${id} .panel`).evaluate(el => ({
        scroll: el.scrollHeight <= el.clientHeight + 1,
        inside: el.getBoundingClientRect().bottom <= window.innerHeight + 1,
      }));
      expect(fits, `${id} à ${size.width}×${size.height}`).toEqual({ scroll: true, inside: true });
      if (next) await page.locator(next).click();
    }
    // retour au panneau de bienvenue pour la taille suivante
    for (const n of [4, 3, 2, 1]) await page.locator(`#rule${n}Back`).click();
  }
});

test("plus de minuteur ; musique d'alerte pendant la partie (si la musique est activée)", async ({ page }) => {
  const errors = await open(page, { ...FAST, music: true });
  await startSimulation(page);
  expect(await page.evaluate(() => window.nostromo!.audio.alertPlaying)).toBe(false);
  await placeAgent(page, "vie");
  await expect(page.locator("#trainingTimer")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.nostromo!.audio.alertPlaying)).toBe(true);
  await page.clock.runFor(400_000); // bien plus de 5 minutes : rien ne s'arrête
  expect(await page.evaluate(() => window.nostromo!.audio.alertPlaying)).toBe(true);
  await expect(page.locator("#closeBtn")).toBeEnabled();
  expect(errors).toEqual([]);
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

test("réglages en onglets : Affichage, Audio, Alerte, Système ; dernier onglet mémorisé ; clavier", async ({ page }) => {
  const errors = await open(page);
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
  await expect(page.locator("#alertVoiceChk, #alertCountdownChk")).toHaveCount(0);
  await page.locator("#alertPreview").click();
  await page.clock.runFor(5000);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!));
  expect(saved).toMatchObject({ alertVariant: "detector", settingsTab: "alert" });
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
  await closeRoom(page, "entrepot1", "entrepot2");
  await closeRoom(page, "entrepot3", "entrepot4");
  await closeRoom(page, "cockpit", "reunion");
  for (const id of ["entrepot1", "entrepot2", "entrepot3", "entrepot4", "cockpit", "reunion", "armurerie", "labo"] as const) {
    // Téléphone : un pont à la fois ; on affiche celui de la salle pour mesurer sa forme.
    if (test.info().project.name === "telephone") await page.locator(`#deckTab${room(id).deck}`).click();
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

test("5 déplacements au maximum, sans compteur visible ; Annuler et Valider restent possibles", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await placeAgent(page, "cockpit");
  for (const id of ["vie", "cockpit", "vie", "cockpit", "vie"] as const) await clickRoom(page, id);
  await expect(page.locator(".room.reach")).toHaveCount(0);
  await clickRoom(page, "cuisine");
  await expect(page.locator(".path-step")).toHaveCount(5); // le 6e pas est refusé
  await expect(page.locator("body")).not.toContainText("/ 5");
  await page.locator("#undoBtn").click();
  await expect(page.locator(".path-step")).toHaveCount(4);
  await expect(page.locator(".room.reach").first()).toBeVisible();
  await page.locator("#closeBtn").click();
  await page.clock.runFor(4000);
  await expect(page.locator("#protocolMessage")).toHaveText("COORDINATEUR : TOUCHEZ LA SALLE À FERMER");
});

test("logo Weyland Corp en filigrane : transition, bienvenue, et discret sur l'écran de jeu", async ({ page }) => {
  await open(page, { ...FAST, transitions: true });
  await launch(page);
  await expect(page.locator("#trans .weyland-logo")).toBeVisible();
  await page.clock.runFor(10_000);
  await expect(page.locator("#welcome .weyland-logo")).toBeVisible();
  // Couleur du style d'écran
  const color = await page.locator("#welcome .weyland-logo").evaluate(el => getComputedStyle(el).color);
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
  expect(color).toBe(await page.evaluate(c => { const d = document.createElement("div"); d.style.color = c; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; }, accent));
  await page.locator("#welcomeNext").click();
  for (const n of [1, 2, 3, 4]) await page.locator(`#rule${n}Next`).click();
  const faint = page.locator(".weyland-logo.logo-faint");
  await expect(faint).toHaveCount(1);
  expect(await faint.evaluate(el => getComputedStyle(el).pointerEvents)).toBe("none");
  expect(Number(await faint.evaluate(el => getComputedStyle(el).opacity))).toBeLessThan(0.1);
  // Les salles restent cliquables à travers le logo
  await clickRoom(page, "vie");
  await page.locator('[data-room="cockpit"]').click();
  await expect(page.locator("#pawn")).toHaveAttribute("visibility", "visible");
});

test("le numéro de build est affiché dans les réglages", async ({ page }) => {
  await open(page);
  await page.locator("#homeSetBtn").click();
  await page.locator("#tab-system").click();
  await expect(page.locator("#versionInfo")).toHaveText(/v\d+\.\d+\.\d+ · BUILD \d+ \([0-9a-f]+\) DU \d{2}\/\d{2}\/\d{4}/);
});

test("retour à l'accueil par les Réglages, avec confirmation : alarme et voix s'arrêtent", async ({ page }) => {
  const errors = await open(page, { ...FAST, music: true });
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
  expect(errors).toEqual([]);
});

test("réglages : boutons du bas alignés sur une seule rangée, de même taille", async ({ page }) => {
  const errors = await open(page);
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
  expect(errors).toEqual([]);
});

test("écran de fin : rapport sur un moniteur, lignes une à une, tampon, puis Continuer ramène à l'accueil", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await placeAgent(page, "cockpit");
  await closeRoom(page, "cockpit");
  await page.clock.runFor(1_000);
  await expect(page.locator("#end")).toHaveClass(/show/);
  await expect(page.locator("#end .monitor-label")).toHaveText("MU/TH/UR 6000 · RAPPORT DE FIN DE SESSION");
  await expect(page.locator("#endStamp")).toHaveCount(0); // rapport en cours de génération
  await page.clock.runFor(2_000);
  await expect(page.locator("#endStamp")).toHaveText("DOSSIER CLOS");
  await expect(page.locator("#end .end-line:not(.shown)")).toHaveCount(0);
  // Un seul bouton : Continuer (on rejoue depuis l'accueil).
  await expect(page.locator("#end button")).toHaveCount(1);
  await page.locator("#endNext").click();
  await expect(page.locator("#home")).toHaveClass(/show/);
  await expect(page.locator("#home").getByRole("button", { name: "Démarrer" })).toBeVisible();
});

/** Boutons visibles (hors onglets, styles d'écran et cartes d'alerte, qui gardent leur texte). */
async function checkIconButtons(page: Page, scope: string) {
  const buttons = page.locator(`${scope} button.icon-btn:visible`);
  expect(await buttons.count(), scope).toBeGreaterThan(0);
  const all = await page.locator(`${scope} button:visible:not([role="tab"], [role="radio"], .theme)`).evaluateAll(els => els.map(b => ({
    id: b.id,
    name: b.getAttribute("aria-label"),
    title: b.getAttribute("title"),
    text: b.textContent!.trim(),
    svg: !!b.querySelector("svg"),
    size: Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height),
    square: Math.abs(b.getBoundingClientRect().width - b.getBoundingClientRect().height) < 1,
  })));
  for (const b of all) {
    expect(b.name, `${scope} #${b.id}`).toBeTruthy();
    expect(b.title, `${scope} #${b.id}`).toBeTruthy();
    expect(b, `${scope} #${b.id}`).toMatchObject({ text: "", svg: true, square: true });
    expect(b.size, `${scope} #${b.id}`).toBeGreaterThanOrEqual(56);
  }
}

test("boutons icône seule : nom accessible et icône SVG partout", async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator("#home")).toHaveClass(/show/);
  await checkIconButtons(page, "#home");
  await expect(page.getByRole("button", { name: "Démarrer" })).toBeVisible();
  await expect(page.locator("#home").getByRole("button", { name: "Réglages" })).toBeVisible();

  await page.locator("#homeSetBtn").click();
  await checkIconButtons(page, "#settings");
  await expect(page.getByRole("button", { name: "Fermer" })).toBeVisible();
  await page.getByRole("button", { name: "Fermer" }).click();

  await launch(page);
  await expect(page.locator("#welcome")).toHaveClass(/show/);
  await checkIconButtons(page, "#welcome");
  await page.locator("#welcome").getByRole("button", { name: "Continuer" }).click();
  for (const n of [1, 2, 3, 4]) {
    await expect(page.locator(`#rule${n}`)).toHaveClass(/show/);
    await checkIconButtons(page, `#rule${n}`);
    await expect(page.locator(`#rule${n}`).getByRole("button", { name: "Retour" })).toBeVisible();
    await page.locator(`#rule${n}`).getByRole("button", { name: "Continuer" }).click();
  }

  // Écran de jeu : en-tête et barre d'actions
  await checkIconButtons(page, "header");
  await checkIconButtons(page, ".action-bar");
  await expect(page.getByRole("button", { name: "Valider" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Pas arrière" })).toBeDisabled();
  await expect(page.locator("header").getByRole("button", { name: "Réglages" })).toBeVisible();
  // Bordure et icône de la couleur du style d'écran
  const accent = await page.evaluate(() => { const d = document.createElement("div"); d.style.color = getComputedStyle(document.documentElement).getPropertyValue("--accent"); document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
  const style = await page.locator("#setBtn").evaluate(b => ({ border: getComputedStyle(b).borderTopColor, color: getComputedStyle(b).color, glow: getComputedStyle(b).boxShadow }));
  expect(style.border).toBe(accent);
  expect(style.color).toBe(accent);
  expect(style.glow).not.toBe("none");

  // En partie, dans les Réglages : Accueil puis Oui / Non
  await clickRoom(page, "cockpit");
  await page.locator("#closeBtn").click();
  await page.locator("#setBtn").click();
  await checkIconButtons(page, "#settings");
  await page.getByRole("button", { name: "Accueil" }).click();
  await checkIconButtons(page, "#settings");
  await expect(page.getByRole("button", { name: "Oui" })).toBeVisible();
  await page.getByRole("button", { name: "Non" }).click();
  await page.locator("#setClose").click();
  expect(errors).toEqual([]);
});

test("bouton Son / Muet dans l'en-tête : coupe ou remet la musique (aria-pressed)", async ({ page }) => {
  const errors = await open(page);
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
  await expect(page.locator(".layouts")).toHaveAttribute("role", "radiogroup");
  await expect(page.locator(".layout-card")).toHaveText(["Tablette", "Téléphone"]);
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

test("scénario « Une simple formalité » : choix au lancement, RH, contrat à faire défiler et signé par empreinte, puis examen", async ({ page }) => {
  const errors = await open(page);
  // Plus de choix dans les Réglages ; par défaut au lancement : scénario « Sixième sens ».
  await page.locator("#homeSetBtn").click();
  await expect(page.locator("#tab-scenario")).toHaveCount(0);
  await page.locator("#setClose").click();
  await page.locator("#startBtn").click();
  await expect(page.locator("#scenario-training")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("#scenarioDesc")).toContainText("Psychic Agent en formation");
  await expect(page.locator("#trainingGuidePdf")).toHaveAttribute("download", "nostromo-guide-mj-entrainement.pdf");
  await page.locator("#scenario-recruitment").click();
  await expect(page.locator("#scenario-recruitment")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("#sheetsPdf")).toHaveAttribute("download", "nostromo-fiche-reyes-homme.pdf");
  await expect(page.locator("#sheetsFemPdf")).toHaveAttribute("download", "nostromo-fiche-reyes-femme.pdf");
  await expect(page.locator("#sheetsMjPdf")).toHaveAttribute("download", "nostromo-aide-mj-recrutement.pdf");
  await expect(page.locator("#guidePdf")).toHaveAttribute("download", "nostromo-guide-mj-recrutement.pdf");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!).scenario)).toBe("recruitment");
  await expect(page.locator("#scenarioDesc")).toContainText("signe un contrat");
  // « Retour » revient à l'accueil en gardant le choix
  await page.locator("#scenarioBack").click();
  await expect(page.locator("#startBtn")).toBeVisible();
  // Le choix du scénario tient dans l'écran (téléphones et ordinateurs portables)
  await page.locator("#startBtn").click();
  for (const size of [{ width: 375, height: 667 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(size);
    const fits = await page.locator(".scenario-choice").evaluate(el => el.scrollHeight <= el.clientHeight + 1 && el.getBoundingClientRect().bottom <= innerHeight + 1);
    expect(fits, `${size.width}×${size.height}`).toBe(true);
  }
  await page.locator("#scenarioBack").click();
  await launch(page);
  await expect(page.locator("#hr")).toHaveClass(/show/);
  await expect(page.locator("#welcome")).not.toHaveClass(/show/);
  await expect(page.locator("#hr")).toContainText("48 000 crédits");
  await page.locator("#hrNext").click();

  // Contrat : le lecteur d'empreinte ne s'active qu'en bas du contrat.
  await expect(page.locator("#contract")).toHaveClass(/show/);
  const scroll = page.locator("#contractScroll");
  expect(await scroll.evaluate(el => el.scrollHeight > el.clientHeight * 2)).toBe(true);
  await expect(page.locator("#fingerprint")).toBeDisabled();
  await expect(page.locator("#contractNext")).toBeDisabled();
  // Le panneau tient dans l'écran : seul le contrat défile.
  expect(await page.locator(".contract-panel").evaluate(el => el.getBoundingClientRect().bottom <= innerHeight + 1)).toBe(true);
  await scroll.evaluate(el => { el.scrollTop = el.scrollHeight; el.dispatchEvent(new Event("scroll")); });
  await expect(page.locator("#fingerprint")).toBeEnabled();

  // Appui trop court : pas de signature.
  const pad = (await page.locator("#fingerprint").boundingBox())!;
  await page.mouse.move(pad.x + pad.width / 2, pad.y + pad.height / 2);
  await page.mouse.down();
  await page.clock.runFor(600);
  await page.mouse.up();
  await page.clock.runFor(2000);
  await expect(page.locator("#contractNext")).toBeDisabled();
  // Appui long : contrat signé.
  await page.mouse.down();
  await page.clock.runFor(1600);
  await page.mouse.up();
  await expect(page.locator("#fingerprintMsg")).toHaveText("CONTRAT SIGNÉ · EMPREINTE ENREGISTRÉE");
  await page.locator("#contractNext").click();

  // Le Coordinateur présente l'examen, puis la partie se joue comme d'habitude.
  await expect(page.locator("#rule1")).toHaveClass(/show/);
  await expect(page.locator("#rule1")).toContainText("EXAMEN D'APTITUDE");
  await page.locator("#rule1Back").click();
  await expect(page.locator("#contract")).toHaveClass(/show/);
  await expect(page.locator("#contractNext")).toBeEnabled(); // reste signé
  await page.locator("#contractNext").click();
  await expect(page.locator("#rule3")).not.toContainText("xénomorphe");
  for (const n of [1, 2, 3, 4]) await page.locator(`#rule${n}Next`).click();
  await placeAgent(page, "cockpit");
  await closeRoom(page, "cockpit");
  await page.clock.runFor(2_000);
  await expect(page.locator("#endTitle")).toHaveText("CANDIDATURE CLOSE");
  expect(errors).toEqual([]);
});

test("scénario « Session disciplinaire » : e-mail du Lieutenant D.R. à la C.R.F., intercepté par la direction, session disciplinaire, sanction", async ({ page }) => {
  const errors = await open(page);
  await page.locator("#startBtn").click();
  await expect(page.locator("#scenario-training")).toHaveAttribute("aria-checked", "true");
  await page.locator("#scenario-infiltrated").click();
  await expect(page.locator("#scenario-infiltrated")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("#infiltratedPdf")).toHaveAttribute("href", "fiches/nostromo-fiche-lieutenant-dr-homme.pdf");
  await expect(page.locator("#infiltratedPdf")).toHaveAttribute("download", "nostromo-fiche-lieutenant-dr-homme.pdf");
  await expect(page.locator("#infiltratedFemPdf")).toHaveAttribute("download", "nostromo-fiche-lieutenant-dr-femme.pdf");
  await expect(page.locator("#infiltratedMjPdf")).toHaveAttribute("download", "nostromo-aide-mj-infiltre.pdf");
  await expect(page.locator("#infiltratedGuidePdf")).toHaveAttribute("download", "nostromo-guide-mj-infiltre.pdf");
  // Les cartes des petits rôles (IA, Xénomorphes) : les mêmes dans chaque scénario
  await expect(page.locator("#rolesPdf")).toHaveAttribute("download", "nostromo-cartes-roles.pdf");
  await page.locator("#rolesPdfRead").click();
  await expect(page.locator("#docText")).toContainText("IA PROTOCOLE");
  await expect(page.locator("#docText")).toContainText("Entrepôt 4");
  await expect(page.locator("#docText svg")).toHaveCount(0);
  await page.locator("#docClose").click();
  await page.locator("#scenario-training").click();
  await expect(page.locator("#rolesPdf")).toHaveAttribute("href", "fiches/nostromo-cartes-roles.pdf");
  await page.locator("#scenario-infiltrated").click();
  // Le guide du MJ se lit aussi dans l'app : son texte, au style de l'app, sans pages A4 ni en-têtes d'impression
  await page.locator("#infiltratedGuidePdfRead").click();
  await expect(page.locator("#docViewer")).toHaveClass(/show/);
  await expect(page.locator("#docText")).toContainText("Lieutenant D.R.");
  await expect(page.locator("#docText .page, #docText header.header, #docText footer.footer, #docText img")).toHaveCount(0);
  expect(await page.locator("#docText").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await expect(page.locator("#docPdf")).toHaveAttribute("download", "nostromo-guide-mj-infiltre.pdf");
  await page.locator("#docClose").click();
  await expect(page.locator("#docViewer")).not.toHaveClass(/show/);
  // Le prétiré en version femme : seulement la fiche joueur, accordée au féminin, sans l'aide du MJ
  await page.locator("#infiltratedFemPdfRead").click();
  await expect(page.locator("#docText")).toContainText("Agent de renseignement infiltrée");
  await expect(page.locator("#docText")).not.toContainText("AIDE DU MJ");
  await expect(page.locator("#docPdf")).toHaveAttribute("download", "nostromo-fiche-lieutenant-dr-femme.pdf");
  await page.locator("#docClose").click();
  await expect(page.locator("#scenarioDesc")).toContainText("Lieutenant D.R.");
  await page.locator("#launchBtn").click();
  await expect(page.locator("#email")).toHaveClass(/show/);
  await expect(page.locator("#emailSubject")).toHaveText("Nostromo II – rapport d'infiltration");
  await expect(page.locator("#email")).toContainText("QG terrestre de la Civil Resistance Force");
  await expect(page.locator("#emailIntercepted")).toContainText("INTERCEPTÉ");
  await expect(page.locator("#emailIntercepted")).toContainText("prochaine session d'entraînement, sans dérogation");
  await expect(page.locator("#email .redacted").first()).toBeVisible();
  // L'e-mail tient dans l'écran (seul son corps peut défiler).
  expect(await page.locator(".email-panel").evaluate(el => el.getBoundingClientRect().bottom <= innerHeight + 1)).toBe(true);
  expect(await page.locator("#email .monitor").evaluate(el => el.getBoundingClientRect().right <= innerWidth + 1)).toBe(true);
  await page.locator("#emailNext").click();

  await expect(page.locator("#rule1")).toContainText("SESSION DISCIPLINAIRE");
  await page.locator("#rule1Back").click();
  await expect(page.locator("#email")).toHaveClass(/show/);
  await page.locator("#emailNext").click();
  await expect(page.locator("#rule4")).toContainText("FIN DE LA SESSION");
  for (const n of [1, 2, 3, 4]) await page.locator(`#rule${n}Next`).click();
  await placeAgent(page, "cockpit");
  await closeRoom(page, "cockpit");
  await page.clock.runFor(2_000);
  await expect(page.locator("#endTitle")).toHaveText("SANCTION APPLIQUÉE");
  expect(errors).toEqual([]);
});

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
  await expect(page.locator("#docText")).toContainText("GM");
  await page.locator("#docClose").click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#lang-en")).toHaveAttribute("aria-checked", "true");
  expect(errors).toEqual([]);
});
