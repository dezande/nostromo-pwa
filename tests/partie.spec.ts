// Partie : salle de départ, déplacements, fermetures, fin, plan et chemin du pion.
import { test, expect } from "@playwright/test";
import { ADJ, ROOM_IDS, room } from "../src/data/ship";
import { reachableRooms, clickRoom, open, launch, startSimulation, placeAgent, closeRoom } from "./helpers";

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
