// Scénarios « Une simple formalité » et « Session disciplinaire ».
import { test, expect, open, launch, placeAgent, closeRoom, FAST } from "./helpers";

test("scénario « Une simple formalité » : choix au lancement, RH, contrat à faire défiler et signé par empreinte, puis examen", async ({ page }) => {
  await open(page);
  // Par défaut au lancement : scénario « Sixième sens », deuxième carte (le mode sans scénario, le plus simple, est en tête) ; chaque carte a son icône.
  await page.locator("#startBtn").click();
  await expect(page.locator("#scenario-training")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".scenario-cards .alert-card")).toHaveCount(4);
  expect(await page.locator(".scenario-cards .alert-card").evaluateAll(cards => cards.map(c => c.id))).toEqual(["scenario-free", "scenario-training", "scenario-recruitment", "scenario-infiltrated"]);
  await expect(page.locator(".scenario-cards .alert-card strong .ic svg")).toHaveCount(4);
  await expect(page.locator("#scenarioDesc")).toContainText("Psychic Agent en formation");
  await expect(page.locator("#trainingGuidePdf")).toHaveAttribute("download", "nostromo-sixieme-sens-guide-superviseur.pdf");
  await page.locator("#scenario-recruitment").click();
  await expect(page.locator("#scenario-recruitment")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("#sheetsPdf")).toHaveAttribute("download", "nostromo-une-simple-formalite-fiche-homme.pdf");
  await expect(page.locator("#sheetsFemPdf")).toHaveAttribute("download", "nostromo-une-simple-formalite-fiche-femme.pdf");
  await expect(page.locator("#sheetsMjPdf")).toHaveAttribute("download", "nostromo-une-simple-formalite-aide-superviseur.pdf");
  await expect(page.locator("#guidePdf")).toHaveAttribute("download", "nostromo-une-simple-formalite-guide-superviseur.pdf");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("nostromo-settings")!).scenario)).toBe("recruitment");
  await expect(page.locator("#scenarioDesc")).toContainText("signe un contrat");
  // « Retour » revient à l'accueil en gardant le choix
  await page.locator("#scenarioBack").click();
  await expect(page.locator("#startBtn")).toBeVisible();
  // Le choix du scénario tient dans l'écran (téléphones et ordinateurs portables) ; la mise en page suit le
  // changement de taille avec un léger retard, d'où l'attente
  await page.locator("#startBtn").click();
  for (const size of [{ width: 375, height: 667 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(size);
    await expect.poll(() => page.locator(".scenario-choice").evaluate(el => el.scrollHeight <= el.clientHeight + 1 && el.getBoundingClientRect().bottom <= innerHeight + 1),
      { message: `${size.width}×${size.height}` }).toBe(true);
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
});

test("scénario « Session disciplinaire » : e-mail du Lieutenant D.R. à la C.R.F., intercepté par la direction, session disciplinaire, sanction", async ({ page }) => {
  await open(page);
  await page.locator("#startBtn").click();
  await expect(page.locator("#scenario-training")).toHaveAttribute("aria-checked", "true");
  await page.locator("#scenario-infiltrated").click();
  await expect(page.locator("#scenario-infiltrated")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("#infiltratedPdf")).toHaveAttribute("href", "fiches/nostromo-session-disciplinaire-fiche-homme.pdf");
  await expect(page.locator("#infiltratedPdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-fiche-homme.pdf");
  await expect(page.locator("#infiltratedFemPdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-fiche-femme.pdf");
  await expect(page.locator("#infiltratedMjPdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-aide-superviseur.pdf");
  await expect(page.locator("#infiltratedGuidePdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-guide-superviseur.pdf");
  // Les cartes des petits rôles (IA, Xénomorphes) : les mêmes dans chaque scénario, comme le PDF tout en un (sans lecture dans l'app)
  await expect(page.locator("#rolesPdf")).toHaveAttribute("download", "nostromo-cartes-roles.pdf");
  await expect(page.locator("#allPdf")).toHaveAttribute("download", "nostromo-tous-les-documents.pdf");
  await expect(page.locator("#allPdf")).toHaveAttribute("href", "fiches/nostromo-tous-les-documents.pdf");
  await expect(page.locator("#allPdfRead")).toHaveCount(0);
  await page.locator("#rolesPdfRead").click();
  await expect(page.locator("#docText")).toContainText("IA PROTOCOLE");
  await expect(page.locator("#docText")).toContainText("Entrepôt 4");
  await expect(page.locator("#docText svg")).toHaveCount(0);
  await page.locator("#docClose").click();
  await page.locator("#scenario-training").click();
  await expect(page.locator("#rolesPdf")).toHaveAttribute("href", "fiches/nostromo-cartes-roles.pdf");
  await page.locator("#scenario-infiltrated").click();
  // Le guide du Superviseur se lit aussi dans l'app : son texte, au style de l'app, sans pages A4 ni en-têtes d'impression
  await page.locator("#infiltratedGuidePdfRead").click();
  await expect(page.locator("#docViewer")).toHaveClass(/show/);
  await expect(page.locator("#docText")).toContainText("Lieutenant D.R.");
  await expect(page.locator("#docText .page, #docText header.header, #docText footer.footer, #docText img")).toHaveCount(0);
  // Les scènes clés sont dessinées (cinq vignettes pour ce guide), dans la couleur du texte
  await expect(page.locator("#docText .scenes .illu svg")).toHaveCount(5);
  expect(await page.locator("#docText .scenes svg").first().evaluate(el => getComputedStyle(el).stroke === getComputedStyle(el).color)).toBe(true);
  expect(await page.locator("#docText").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await expect(page.locator("#docPdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-guide-superviseur.pdf");
  // Miroir (les joueurs en face ne lisent pas) : le texte est retourné, le PDF devient la version miroir, et le texte reste lisible dans sa boîte
  const transform = () => page.locator("#docText").evaluate(el => getComputedStyle(el).transform);
  expect(await transform()).toBe("none");
  await page.locator("#docMirror").click();
  await expect(page.locator("#docMirror")).toHaveAttribute("aria-pressed", "true");
  expect(await transform()).toBe("matrix(-1, 0, 0, 1, 0, 0)");
  await expect(page.locator("#docPdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-guide-superviseur-miroir.pdf");
  expect(await page.locator("#docText").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.locator("#docClose").click();
  await expect(page.locator("#docViewer")).not.toHaveClass(/show/);
  // Le réglage vaut aussi pour les liens PDF du choix du scénario, mais pas pour les prétirés ni les cartes des rôles
  await expect(page.locator("#infiltratedGuidePdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-guide-superviseur-miroir.pdf");
  await expect(page.locator("#infiltratedMjPdf")).toHaveAttribute("href", "fiches/nostromo-session-disciplinaire-aide-superviseur-miroir.pdf");
  await expect(page.locator("#infiltratedPdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-fiche-homme.pdf");
  await expect(page.locator("#rolesPdf")).toHaveAttribute("download", "nostromo-cartes-roles.pdf");
  await expect(page.locator("#allPdf")).toHaveAttribute("download", "nostromo-tous-les-documents.pdf");
  // Le prétiré en version femme : seulement la fiche joueur, accordée au féminin, sans l'aide du Superviseur
  await page.locator("#infiltratedFemPdfRead").click();
  await expect(page.locator("#docText")).toContainText("Agent de renseignement infiltrée");
  // Symbole du sexe en SVG de la couleur du style, pas en caractère (emoji coloré sur iPad)
  await expect(page.locator("#docText .sex svg")).toHaveCount(1);
  await expect(page.locator("#docText")).not.toContainText("♀");
  await expect(page.locator("#docText")).not.toContainText("AIDE DU SUPERVISEUR");
  await expect(page.locator("#docPdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-fiche-femme.pdf");
  await expect(page.locator("#docMirror")).toHaveCount(0); // pas de miroir pour le joueur
  expect(await transform()).toBe("none");
  await page.locator("#docClose").click();
  await expect(page.locator("#scenarioDesc")).toContainText("Lieutenant D.R.");
  await page.locator("#launchBtn").click();
  await expect(page.locator("#email")).toHaveClass(/show/);
  await expect(page.locator("#emailSubject")).toHaveText("Nostromo II – rapport d'infiltration");
  await expect(page.locator("#email")).toContainText("QG terrestre de la Civil Resistance Force");
  await expect(page.locator("#emailIntercepted")).toContainText("INTERCEPTÉ");
  await expect(page.locator("#emailIntercepted")).toContainText("Dominique RASK, Psychic Agent en formation"); // nom, prénom et poste de couverture
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
});

test("sans scénario : la partie commence dès le lancement, rapport neutre", async ({ page }) => {
  await open(page);
  await page.locator("#startBtn").click();
  await expect(page.locator("#scenarioDesc")).not.toContainText("Partie directe");
  // Ni documents ni cartes des petits rôles ; leur place reste réservée : aucune carte ne bouge ni ne change de taille
  const cards = page.locator(".scenario-cards .alert-card");
  const boxes = await cards.evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()));
  await page.locator("#scenario-free").click();
  await expect(page.locator("#scenarioDesc")).toContainText("Partie directe");
  await expect(page.locator("#sheets")).toBeHidden();
  expect(await cards.evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()))).toEqual(boxes);
  await page.locator("#launchBtn").click();
  await expect(page.locator("#home")).not.toHaveClass(/show/);
  await expect(page.locator("#welcome")).not.toHaveClass(/show/);
  await expect(page.locator("#rule1")).not.toHaveClass(/show/);
  await placeAgent(page, "cockpit");
  await closeRoom(page, "cockpit");
  await page.clock.runFor(2_000);
  await expect(page.locator("#endTitle")).toHaveText("AGENT ÉLIMINÉ");
  await expect(page.locator("#endStamp")).toHaveText("SIMULATION TERMINÉE");
});

test("cartes des scénarios : quatre par ligne quand elles tiennent, sinon deux par ligne, jamais trois et une", async ({ page }) => {
  await open(page);
  await page.locator("#startBtn").click();
  const perRow = () => page.locator(".scenario-cards .alert-card").evaluateAll(cards => {
    const rows = new Map<number, number>();
    for (const c of cards) { const top = Math.round(c.getBoundingClientRect().top); rows.set(top, (rows.get(top) ?? 0) + 1); }
    return [...rows.values()];
  });
  await page.setViewportSize({ width: 1024, height: 768 });
  expect(await perRow()).toEqual([4]);
  await page.setViewportSize({ width: 600, height: 800 }); // trois tiendraient : on en met deux par ligne
  expect(await perRow()).toEqual([2, 2]);
  await page.setViewportSize({ width: 375, height: 667 });
  expect(await perRow()).toEqual([2, 2]);
});

test("choix du scénario en paysage : icône, nom, niveau et durée (ligne orange) restent dans leur carte", async ({ page }) => {
  await open(page);
  await page.locator("#startBtn").click();
  for (const size of [{ width: 812, height: 375 }, { width: 1024, height: 768 }, { width: 375, height: 667 }]) {
    await page.setViewportSize(size);
    const inside = await page.locator(".scenario-cards .alert-card").evaluateAll(cards => cards.map(card => {
      const box = card.getBoundingClientRect();
      return [...card.querySelectorAll(".scenario-meta, strong, strong .ic")].every(el => el.getBoundingClientRect().right <= box.right + 0.5)
        && card.scrollWidth <= card.clientWidth;
    }));
    expect(inside, `${size.width}×${size.height}`).toEqual([true, true, true, true]);
  }
});

test("PDF en A5 à côté du PDF : livret pour le guide, deux exemplaires par feuille pour les autres, en miroir avec le réglage, rien pour les cartes", async ({ page }) => {
  await open(page, { ...FAST, mirror: true });
  await page.locator("#startBtn").click();
  await page.locator("#scenario-infiltrated").click();
  await expect(page.locator("#infiltratedGuidePdf")).toHaveAttribute("download", "nostromo-session-disciplinaire-guide-superviseur-miroir.pdf");
  await expect(page.locator("#infiltratedGuidePdfA5")).toHaveAttribute("download", "nostromo-session-disciplinaire-guide-superviseur-livret-miroir.pdf");
  await expect(page.locator("#infiltratedGuidePdfA5")).toHaveText("Livret");
  await expect(page.locator("#infiltratedMjPdfA5")).toHaveAttribute("href", "fiches/nostromo-session-disciplinaire-aide-superviseur-a5-miroir.pdf");
  await expect(page.locator("#infiltratedPdfA5")).toHaveAttribute("download", "nostromo-session-disciplinaire-fiche-homme-a5.pdf");
  await expect(page.locator("#infiltratedPdfA5")).toHaveText("A5");
  await expect(page.locator("#infiltratedFemPdfA5")).toHaveAttribute("download", "nostromo-session-disciplinaire-fiche-femme-a5.pdf");
  await expect(page.locator("#rolesPdfA5")).toHaveCount(0);
  // La liseuse propose les deux PDF ; sans le miroir, le livret à l'endroit
  await page.locator("#infiltratedGuidePdfRead").click();
  await expect(page.locator("#docA5")).toHaveText("Livret");
  await expect(page.locator("#docA5")).toHaveAttribute("aria-label", "Guide du Superviseur en PDF livret miroir");
  await page.locator("#docMirror").click();
  await expect(page.locator("#docA5")).toHaveAttribute("download", "nostromo-session-disciplinaire-guide-superviseur-livret.pdf");
  await expect(page.locator("#docA5")).toHaveAttribute("aria-label", "Guide du Superviseur en PDF livret");
  await page.locator("#docClose").click();
  await expect(page.locator("#infiltratedMjPdfA5")).toHaveAttribute("download", "nostromo-session-disciplinaire-aide-superviseur-a5.pdf");
  // Les cartes n'ont que leur PDF, et la liseuse non plus
  await page.locator("#rolesPdfRead").click();
  await expect(page.locator("#docA5")).toHaveCount(0);
});
