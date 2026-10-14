// Écrans autour de la partie : transitions, panneaux d'accueil, logo, écran de fin, boutons icône.
import { test, expect, type Page } from "@playwright/test";
import { FAST, clickRoom, open, launch, startSimulation, placeAgent, closeRoom } from "./helpers";

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

test("écran de fin : rapport sur un moniteur, lignes une à une, tampon, puis Continuer ramène à l'accueil", async ({ page }) => {
  await open(page);
  await startSimulation(page);
  await placeAgent(page, "cockpit");
  // closeRoom avance déjà l'horloge de 3 s : l'écran de fin (2,8 s après la fermeture) vient de s'afficher,
  // le tampon n'arrive que REPORT_MS (1,5 s) plus tard. Ne pas avancer davantage ici (le temps réel s'écoule aussi).
  await closeRoom(page, "cockpit");
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
