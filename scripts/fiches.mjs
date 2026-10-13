// Génère les fiches de personnage du scénario « RECRUTEMENT » en PDF (A4, noir et blanc)
// à partir des pages HTML de fiches/, dans public/fiches/.
// Usage : npm run fiches [-- candidat rh coordinateur] [--png <dossier> : capture de chaque fiche en plus]
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "fiches");
const output = join(root, "public", "fiches");
const toutes = ["candidat", "rh", "coordinateur"];
// Option : noms de fiches à générer (ex. npm run fiches -- candidat), sinon toutes.
const demandees = process.argv.slice(2).filter((arg, i, args) => !arg.startsWith("--") && args[i - 1] !== "--png");
const fiches = demandees.length ? toutes.filter(name => demandees.includes(name)) : toutes;

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
  for (const name of fiches) {
    await page.goto(pathToFileURL(join(source, `${name}.html`)).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // Une fiche = une page A4 : on refuse un contenu qui dépasse du cadre.
    const depasse = await page.evaluate(() => {
      const fiche = document.querySelector(".page");
      return fiche.scrollHeight - fiche.clientHeight;
    });
    if (depasse > 1) throw new Error(`fiches/${name}.html dépasse la page A4 de ${depasse} px`);
    const file = join(output, `fiche-${name}.pdf`);
    await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log(`PDF : ${file}`);
    if (pngDir) {
      const png = join(pngDir, `fiche-${name}.png`);
      await page.screenshot({ path: png, fullPage: true });
      console.log(`PNG : ${png}`);
    }
  }
} finally {
  await browser.close();
}
