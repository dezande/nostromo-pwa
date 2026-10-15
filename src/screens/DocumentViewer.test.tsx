// Texte d'un document lu dans l'app : extrait d'une page HTML du dossier fiches/, remis en forme ;
// et la liseuse elle-même : texte du Superviseur en miroir, bascule sur place, PDF miroir.
import { act } from "preact/test-utils";
import { lang } from "../i18n";
import { settings } from "../state/settings";
import { openDocument, type ScenarioDocument } from "../state/ui";
import { $, mount } from "../test/render";
import { resetState } from "../test/state";
import { SHEETS, findSheet, localized } from "../data/sheets";
import { DocumentViewer, documentText, pdfFile, pdfLabel } from "./DocumentViewer";

const HTML = `<!doctype html><html lang="fr"><head><link rel="stylesheet" href="pretire.css"></head><body>
<main class="page joueur">
  <header class="header"><img src="logo.svg" alt="Weyland Corp"><div class="corp">WEYLAND-YUTANI CORP</div></header>
  <div class="title">
    <h1>DOSSIER DE CANDIDATURE</h1>
    <div class="sub"><span data-f="FICHE JOUEUSE">FICHE JOUEUR</span> · SCÉNARIO</div>
    <div class="sub">PAGE 1 / 2</div>
  </div>
  <section class="sec">
    <h2><i class="ic" data-ic="badge"></i>01 · Identité <span data-f="de la candidate">du candidat</span></h2>
    <dl class="kv">
      <dt>NOM</dt><dd><span class="name" data-f="Sofia REYES">Daniel REYES</span></dd>
      <dt>SEXE</dt><dd><span data-f='Femme <i class="ic" data-ic="femme"></i>'>Homme <i class="ic" data-ic="homme"></i></span></dd>
      <dt>AFFECTATION</dt><dd><span class="redact" style="--w:40mm"></span></dd>
    </dl>
    <div class="idcode"><span class="barcode" data-code="WYC21840612"></span></div>
  </section>
  <section class="sec">
    <div class="traits">
      <div class="trait"><i class="ic" data-ic="physique"></i><div><div class="t-name">PHYSIQUE</div><div class="t-hint">dé ≤ 3 = succès</div></div><span class="t-val">3</span></div>
    </div>
    <div class="energy"><div class="lab"><i class="ic" data-ic="pe"></i>PE 5</div><span class="track" data-n="5"></span></div>
  </section>
  <footer class="footer">Pied de page imprimé</footer>
</main>
<main class="page">
  <header class="header"><img src="logo.svg" alt=""></header>
  <h1>AIDE DU SUPERVISEUR</h1>
  <div class="box"><div class="toc">Sommaire <span class="dots"></span> 2</div></div>
  <p>Réservé au Superviseur.</p>
</main>
</body></html>`;

/** Le texte produit, analysé pour y chercher des éléments. */
const parse = (text: string) => Object.assign(document.createElement("div"), { innerHTML: text });

beforeEach(() => { resetState(); settings.mirror.value = false; });

test("garde le contenu des pages, sans la mise en page imprimée : en-têtes, pieds, images, code-barres, sommaire, tailles en mm", () => {
  const out = parse(documentText(HTML));
  expect(out.textContent).toContain("Daniel REYES");
  expect(out.textContent).toContain("AIDE DU SUPERVISEUR");
  expect(out.textContent).toContain("Réservé au Superviseur.");
  expect(out.querySelector(".page, header.header, footer.footer, img, .barcode, .toc, .dots")).toBeNull();
  expect(out.querySelector("[style]")).toBeNull();
  expect(out.textContent).not.toContain("PAGE 1 / 2"); // numéro de page du PDF
  expect(out.textContent).toContain("DOSSIER DE CANDIDATURE");
  expect(out.textContent).not.toContain("Pied de page imprimé");
});

test("seulement les pages demandées : la fiche du joueur, ou l'aide du Superviseur", () => {
  const player = parse(documentText(HTML, { pages: ".page.joueur" }));
  expect(player.textContent).toContain("Daniel REYES");
  expect(player.textContent).not.toContain("AIDE DU SUPERVISEUR");
  const aid = parse(documentText(HTML, { pages: ".page:not(.joueur)" }));
  expect(aid.textContent).toContain("AIDE DU SUPERVISEUR");
  expect(aid.textContent).not.toContain("Daniel REYES");
});

test("version femme : les textes au féminin (data-f) remplacent le masculin", () => {
  const out = parse(documentText(HTML, { feminine: true }));
  expect(out.textContent).toContain("Sofia REYES");
  expect(out.textContent).toContain("FICHE JOUEUSE");
  expect(out.textContent).toContain("Identité de la candidate");
  expect(out.textContent).toContain("Femme");
  expect(out.textContent).not.toContain("Daniel REYES");
  expect(out.textContent).not.toContain("Homme");
  expect(out.querySelectorAll(".sex svg")).toHaveLength(1); // le symbole féminin, venu du data-f
});

test("symbole du sexe en SVG de la couleur du style (pas de caractère ♂ / ♀), les autres icônes retirées", () => {
  const out = parse(documentText(HTML));
  const sex = out.querySelector(".sex")!;
  expect(sex.getAttribute("aria-hidden")).toBe("true");
  expect(sex.querySelector("svg")!.getAttribute("stroke")).toBe("currentColor");
  expect(sex.querySelector("svg")!.getAttribute("viewBox")).toBe("0 0 24 24");
  expect(out.querySelectorAll(".ic")).toHaveLength(0);
  expect(out.textContent).not.toMatch(/[♂♀]/);
});

test("caractéristiques : explication du test, jauge sur 5 (.t-pips), seuil en clair, cases d'énergie", () => {
  const out = parse(documentText(HTML));
  expect(out.querySelector(".traits-help")!.textContent).toContain("3 dés");
  const pips = out.querySelector(".t-pips")!;
  expect(pips.previousElementSibling!.textContent).toBe("3"); // juste après la valeur
  expect(pips.getAttribute("aria-label")).toBe("3 sur 5");
  expect(pips.querySelectorAll("i")).toHaveLength(5);
  expect(pips.querySelectorAll("i.on")).toHaveLength(3);
  expect(out.querySelector(".t-hint")!.textContent).toBe("succès : 1–3");
  expect(out.querySelectorAll(".energy .track i")).toHaveLength(5);
});

test("en anglais : explication et jauge traduites", () => {
  lang.value = "en";
  const out = parse(documentText(HTML.replace("dé ≤ 3 = succès", "die ≤ 3 = success")));
  expect(out.querySelector(".traits-help")!.textContent).toContain("3 dice");
  expect(out.querySelector(".t-pips")!.getAttribute("aria-label")).toBe("3 out of 5");
  expect(out.querySelector(".t-hint")!.textContent).toBe("success: 1–3");
});

// --- Le PDF proposé

test("le PDF proposé suit le réglage miroir pour un document du Superviseur, jamais pour un prétiré", () => {
  const guide = findSheet("trainingGuidePdf")!;
  const pregen = findSheet("trainingPdf")!;
  expect(pdfFile(guide)).toBe("nostromo-guide-superviseur-entrainement.pdf");
  expect(pdfLabel(guide)).toBe("Guide du Superviseur en PDF");
  settings.mirror.value = true;
  expect(pdfFile(guide)).toBe("nostromo-guide-superviseur-entrainement-miroir.pdf");
  expect(pdfLabel(guide)).toBe("Guide du Superviseur en PDF miroir");
  expect(pdfFile(pregen)).toBe("nostromo-fiche-psychic-agent-homme.pdf");
  expect(pdfLabel(pregen)).toBe("Prétiré homme en PDF");
});

test("en anglais : le PDF miroir anglais et son nom accessible", () => {
  lang.value = "en";
  settings.mirror.value = true;
  const aid = localized(SHEETS.recruitment.find(s => s.kind === "aid")!);
  expect(pdfFile(aid)).toBe("nostromo-supervisor-aid-recruitment-mirrored.pdf");
  expect(pdfLabel(aid)).toBe("Supervisor aid as mirrored PDF");
});

// --- La liseuse

const GUIDE: ScenarioDocument = { id: "trainingGuidePdf", name: "Guide du Superviseur", html: "guide-superviseur-entrainement.html",
  file: "nostromo-guide-superviseur-entrainement.pdf", mirrorFile: "nostromo-guide-superviseur-entrainement-miroir.pdf" };
const PREGEN: ScenarioDocument = { id: "trainingPdf", name: "Prétiré homme", html: "psychic-agent.html", pages: ".page.joueur", file: "nostromo-fiche-psychic-agent-homme.pdf" };

/** Ouvre un document dans la liseuse, la page HTML étant servie par un faux fetch. */
async function view(doc: ScenarioDocument) {
  globalThis.fetch = jest.fn(async () => ({ ok: true, text: async () => HTML })) as unknown as typeof fetch;
  openDocument.value = doc;
  mount(<DocumentViewer />);
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
}

test("document du Superviseur : texte en miroir quand le réglage est actif, bouton sur place pour le changer, PDF miroir", async () => {
  await view(GUIDE);
  expect($("#docText").textContent).toContain("AIDE DU SUPERVISEUR");
  expect($("#docText").classList.contains("mirror")).toBe(false);
  expect($("#docMirror").getAttribute("aria-pressed")).toBe("false");
  expect($("#docPdf").getAttribute("download")).toBe("nostromo-guide-superviseur-entrainement.pdf");
  act(() => { $("#docMirror").click(); });
  expect(settings.mirror.value).toBe(true);
  expect($("#docText").classList.contains("mirror")).toBe(true);
  expect($("#docMirror").getAttribute("aria-pressed")).toBe("true");
  expect($("#docPdf").getAttribute("download")).toBe("nostromo-guide-superviseur-entrainement-miroir.pdf");
  expect($("#docPdf").getAttribute("href")).toBe("fiches/nostromo-guide-superviseur-entrainement-miroir.pdf");
  expect($("#docPdf").getAttribute("aria-label")).toBe("Guide du Superviseur en PDF miroir");
  act(() => { $("#docMirror").click(); });
  expect(settings.mirror.value).toBe(false);
  expect($("#docText").classList.contains("mirror")).toBe(false);
});

test("prétiré du joueur : jamais en miroir, pas de bouton, PDF ordinaire même si le réglage est actif", async () => {
  settings.mirror.value = true;
  await view(PREGEN);
  expect($("#docText").textContent).toContain("Daniel REYES");
  expect($("#docText").classList.contains("mirror")).toBe(false);
  expect($("#docMirror")).toBeNull();
  expect($("#docPdf").getAttribute("download")).toBe("nostromo-fiche-psychic-agent-homme.pdf");
});

test("en anglais : nom du bouton miroir traduit", async () => {
  lang.value = "en";
  await view(GUIDE);
  expect($("#docMirror").getAttribute("aria-label")).toBe("Mirrored text");
  expect($("#docPdf").getAttribute("aria-label")).toBe("Guide du Superviseur as PDF");
});
