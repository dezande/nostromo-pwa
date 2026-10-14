// Génère les documents imprimables des scénarios « Entraînement », « Recrutement » et « Infiltré » (A4, noir et blanc,
// règles du 3D6 Système de François Cedelle, licence ORC)
// à partir des pages HTML de fiches/, dans public/fiches/ :
//   - nostromo-fiches-recrutement.pdf : le prétiré du scénario Recrutement (Jordan Reyes) et l'aide du MJ (RH, Coordinateur) ;
//   - nostromo-guide-mj-recrutement.pdf : le guide du MJ du scénario Recrutement, de 2 à 4 pages ;
//   - nostromo-fiche-lieutenant-dr.pdf : le prétiré du scénario « Infiltré » (Lieutenant D.R.) et l'aide du MJ ;
//   - nostromo-guide-mj-infiltre.pdf : le guide du MJ du scénario « Infiltré », de 2 à 4 pages ;
//   - nostromo-fiche-psychic-agent.pdf : le prétiré du scénario « Entraînement » (Psychic Agent) et l'aide du MJ ;
//   - nostromo-guide-mj-entrainement.pdf : le guide du MJ du scénario « Entraînement », de 2 à 4 pages.
// Prétirés (fiches/pretire.css) : fiche joueur recto verso en version homme puis femme (pages recopiées par
// fiches/pretire.js), puis l'aide du MJ sur une feuille à part ; lisibles en A4 comme réduits en A5.
// Le <title> de chaque page HTML devient le titre du PDF.
// Chaque page A4 est un élément .page de hauteur fixe : un contenu qui dépasse fait échouer le script.
// Usage : npm run fiches [-- --png <dossier>]   (--png : enregistre aussi une capture de chaque page)
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "fiches");
const output = join(root, "public", "fiches");
const documents = [
  { html: "fiches.html", pdf: "nostromo-fiches-recrutement.pdf", pages: [5, 6] },
  { html: "guide-mj.html", pdf: "nostromo-guide-mj-recrutement.pdf", pages: [2, 4] },
  { html: "infiltre.html", pdf: "nostromo-fiche-lieutenant-dr.pdf", pages: [5, 6] },
  { html: "guide-mj-infiltre.html", pdf: "nostromo-guide-mj-infiltre.pdf", pages: [2, 4] },
  { html: "psychic-agent.html", pdf: "nostromo-fiche-psychic-agent.pdf", pages: [5, 6] },
  { html: "guide-mj-entrainement.html", pdf: "nostromo-guide-mj-entrainement.pdf", pages: [2, 4] },
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

    const pages = await page.evaluate(() => [...document.querySelectorAll(".page")]
      .map(el => el.scrollHeight - el.clientHeight));
    const [min, max] = doc.pages;
    if (pages.length < min || pages.length > max) {
      throw new Error(`fiches/${doc.html} : ${pages.length} page(s), attendu de ${min} à ${max}`);
    }
    pages.forEach((depasse, i) => {
      if (depasse > 1) throw new Error(`fiches/${doc.html} : la page ${i + 1} dépasse le format A4 de ${depasse} px`);
    });

    const file = join(output, doc.pdf);
    await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log(`PDF : ${file} (${pages.length} page${pages.length > 1 ? "s" : ""})`);

    if (pngDir) {
      const elements = await page.$$(".page");
      for (const [i, el] of elements.entries()) {
        const png = join(pngDir, `${doc.pdf.replace(/\.pdf$/, "")}-p${i + 1}.png`);
        await el.screenshot({ path: png });
        console.log(`PNG : ${png}`);
      }
    }
  }
} finally {
  await browser.close();
}
