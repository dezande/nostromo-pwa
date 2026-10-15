// Génère les documents imprimables des scénarios « Sixième sens », « Une simple formalité » et « Session disciplinaire » (A4, noir et blanc,
// règles du 3D6 Système de François Cedelle, licence ORC)
// à partir des pages HTML de fiches/, dans public/fiches/ :
//   - le prétiré de chaque scénario (fiches.html : Daniel ou Sofia Reyes ; infiltre.html : Lieutenant D.R. ;
//     psychic-agent.html : Psychic Agent), en trois PDF : la fiche joueur recto verso en version homme
//     (pages 1–2), en version femme (pages 3–4, recopiées par fiches/pretire.js) et l'aide du Superviseur (page 5 et suivante) ;
//     lisibles en A4 comme réduits en A5 (fiches/pretire.css) ;
//   - le guide du Superviseur de chaque scénario, de 2 à 4 pages ;
//   - les cartes des petits rôles des spectateurs (roles.html : IA et Xénomorphes), format poker, 9 par page ;
//   - la version anglaise de chacun (pages suffixées -en, PDF aux noms anglais) ;
//   - les documents du Superviseur (aide, guide) aussi en miroir (suffixe -miroir / -mirrored, même nom que dans
//     src/data/sheets.ts) : posés sur la table, les joueurs en face ne les lisent pas, comme leur texte dans l'app.
// Le <title> de la page HTML devient le titre du PDF (ou celui de la partie, pour un prétiré).
// Chaque page A4 est un élément .page de hauteur fixe : un contenu qui dépasse fait échouer le script.
// Usage : npm run fiches [-- --png <dossier>]   (--png : enregistre aussi une capture de chaque page)
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "fiches");
const output = join(root, "public", "fiches");
// Les trois PDF d'un prétiré : version homme, version femme, aide du Superviseur. Tous les PDF d'un scénario
// portent son titre en préfixe (slug), pour qu'ils se rangent ensemble une fois téléchargés.
const pretire = (slug, nom, scenario) => [
  { pdf: `nostromo-${slug}-fiche-homme.pdf`, from: 1, to: 2, title: `Nostromo II — ${nom}, version homme (${scenario})` },
  { pdf: `nostromo-${slug}-fiche-femme.pdf`, from: 3, to: 4, title: `Nostromo II — ${nom}, version femme (${scenario})` },
  { pdf: `nostromo-${slug}-aide-superviseur.pdf`, from: 5, title: `Nostromo II — Aide du Superviseur (${scenario})`, mirror: true },
];
// Les mêmes, pour la version anglaise.
const pregen = (slug, name, scenario) => [
  { pdf: `nostromo-${slug}-sheet-male.pdf`, from: 1, to: 2, title: `Nostromo II — ${name}, male version (${scenario})` },
  { pdf: `nostromo-${slug}-sheet-female.pdf`, from: 3, to: 4, title: `Nostromo II — ${name}, female version (${scenario})` },
  { pdf: `nostromo-${slug}-supervisor-aid.pdf`, from: 5, title: `Nostromo II — Supervisor Aid (${scenario})`, mirror: true },
];
// La version miroir d'un PDF du Superviseur : son nom et son titre, dans la langue du document.
const mirrored = (pdf, title, en) => ({
  pdf: pdf.replace(/\.pdf$/, en ? "-mirrored.pdf" : "-miroir.pdf"),
  title: `${title} ${en ? "(mirrored)" : "(miroir)"}`,
  mirror: true,
});
const documents = [
  { html: "fiches.html", pages: [5, 6], parts: pretire("une-simple-formalite", "Reyes", "Une simple formalité") },
  { html: "guide-superviseur.html", pdf: "nostromo-une-simple-formalite-guide-superviseur.pdf", pages: [2, 4], mirror: true },
  { html: "infiltre.html", pages: [5, 6], parts: pretire("session-disciplinaire", "Lieutenant D.R.", "Session disciplinaire") },
  { html: "guide-superviseur-infiltre.html", pdf: "nostromo-session-disciplinaire-guide-superviseur.pdf", pages: [2, 4], mirror: true },
  { html: "psychic-agent.html", pages: [5, 6], parts: pretire("sixieme-sens", "Psychic Agent", "Sixième sens") },
  { html: "guide-superviseur-entrainement.html", pdf: "nostromo-sixieme-sens-guide-superviseur.pdf", pages: [2, 4], mirror: true },
  { html: "roles.html", pdf: "nostromo-cartes-roles.pdf", pages: [2, 2] },
  // Version anglaise : mêmes pages HTML suffixées -en, PDF aux noms anglais.
  { html: "fiches-en.html", pages: [5, 6], parts: pregen("a-mere-formality", "Reyes", "A Mere Formality") },
  { html: "guide-superviseur-en.html", pdf: "nostromo-a-mere-formality-supervisor-guide.pdf", pages: [2, 4], mirror: true },
  { html: "infiltre-en.html", pages: [5, 6], parts: pregen("disciplinary-session", "Lieutenant D.R.", "Disciplinary Session") },
  { html: "guide-superviseur-infiltre-en.html", pdf: "nostromo-disciplinary-session-supervisor-guide.pdf", pages: [2, 4], mirror: true },
  { html: "psychic-agent-en.html", pages: [5, 6], parts: pregen("sixth-sense", "Psychic Agent", "Sixth Sense") },
  { html: "guide-superviseur-entrainement-en.html", pdf: "nostromo-sixth-sense-supervisor-guide.pdf", pages: [2, 4], mirror: true },
  { html: "roles-en.html", pdf: "nostromo-role-cards.pdf", pages: [2, 2] },
];

const pngIndex = process.argv.indexOf("--png");
const pngDir = pngIndex > -1 ? resolve(process.argv[pngIndex + 1]) : null;

// Chromium de Playwright s'il est installé, sinon le Chrome de la machine.
async function launch() {
  try { return await chromium.launch(); } catch { return chromium.launch({ channel: "chrome" }); }
}

await mkdir(output, { recursive: true });
if (pngDir) await mkdir(pngDir, { recursive: true });

const browser = await launch();
try {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.emulateMedia({ media: "print" });
  for (const doc of documents) {
    await page.goto(pathToFileURL(join(source, doc.html)).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // Version miroir : chaque page retournée sur son axe vertical (la mise en page, elle, ne bouge pas)
    await page.addStyleTag({ content: "html.miroir .page { transform: scaleX(-1); }" });

    const pages = await page.evaluate(() => [...document.querySelectorAll(".page")]
      .map(el => el.scrollHeight - el.clientHeight));
    const [min, max] = doc.pages;
    if (pages.length < min || pages.length > max) {
      throw new Error(`fiches/${doc.html} : ${pages.length} page(s), attendu de ${min} à ${max}`);
    }
    pages.forEach((depasse, i) => {
      if (depasse > 1) throw new Error(`fiches/${doc.html} : la page ${i + 1} dépasse le format A4 de ${depasse} px`);
    });
    // Cartes (roles.html) : chaque carte garde aussi sa taille fixe.
    const cards = await page.evaluate(() => [...document.querySelectorAll(".card .frame")]
      .map(el => el.scrollHeight - el.clientHeight));
    cards.forEach((depasse, i) => {
      if (depasse > 1) throw new Error(`fiches/${doc.html} : la carte ${i + 1} dépasse de ${depasse} px`);
    });

    const en = doc.html.endsWith("-en.html");
    for (const part of doc.parts ?? [{ pdf: doc.pdf, from: 1, mirror: doc.mirror }]) {
      const to = part.to ?? pages.length;
      const title = part.title ?? await page.title();
      const versions = [{ pdf: part.pdf, title, mirror: false }];
      if (part.mirror) versions.push(mirrored(part.pdf, title, en));
      for (const version of versions) {
        await page.evaluate(({ title, mirror }) => { document.title = title; document.documentElement.classList.toggle("miroir", mirror); }, version);
        const file = join(output, version.pdf);
        await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, pageRanges: `${part.from}-${to}` });
        const n = to - part.from + 1;
        console.log(`PDF : ${file} (${n} page${n > 1 ? "s" : ""})`);
      }
    }
    await page.evaluate(() => document.documentElement.classList.remove("miroir"));

    if (pngDir) {
      const elements = await page.$$(".page");
      for (const [i, el] of elements.entries()) {
        const png = join(pngDir, `${doc.html.replace(/\.html$/, "")}-p${i + 1}.png`);
        await el.screenshot({ path: png });
        console.log(`PNG : ${png}`);
      }
    }
  }
} finally {
  await browser.close();
}
