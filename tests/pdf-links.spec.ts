// Chaque document du choix du scénario (accueil) existe dans le build : PDF (français et anglais, en miroir
// pour les documents du Superviseur, en A5 pour tous sauf les cartes, et les deux ensemble), livret complet de
// chaque scénario et page HTML lue dans l'app, servis tels quels (pas la page de l'app à leur place). Et 404.html,
// qui ouvre l'écran demandé sur GitHub Pages, est bien une copie de index.html.
import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { PDFDict, PDFDocument, PDFName } from "pdf-lib";
import { BOOKLETS, ROLES, SHEETS } from "../src/data/sheets";
import type { Scenario } from "../src/state/settings";

const sheets = [...Object.values(SHEETS).flat(), ROLES];
const booklets = Object.values(BOOKLETS).filter(b => !!b);
const pdfs = sheets.flatMap(s => [s.file, s.mirrorFile, s.a5?.file, s.a5?.mirrorFile, s.en.file, s.en.mirrorFile, s.en.a5?.file, s.en.a5?.mirrorFile])
  .filter((f): f is string => !!f)
  .concat(booklets.flatMap(b => [b.fr.file, b.en.file]));
const pages = [...new Set(sheets.flatMap(s => [s.html, s.en.html]))];

test("les PDF des documents, en français et en anglais, existent et sont bien des PDF", async ({ request }) => {
  // 13 documents × 2 langues, + 6 documents du Superviseur × 2 langues en miroir, + 12 documents × 2 langues en A5,
  // + 6 documents du Superviseur × 2 langues en A5 miroir, + 3 livrets complets × 2 langues
  expect(pdfs.length).toBeGreaterThanOrEqual(80);
  expect(new Set(pdfs).size).toBe(pdfs.length);
  for (const file of pdfs) {
    const res = await request.get(`fiches/${file}`);
    expect(res.status(), file).toBe(200);
    expect((await res.body()).subarray(0, 5).toString(), file).toBe("%PDF-");
  }
});

test("le livret complet d'un scénario enchaîne ses feuilles A5 (guide en livret, prétirés, aide), à l'endroit, avec un signet par document", async ({ request }) => {
  const load = async (file: string) => PDFDocument.load(await (await request.get(`fiches/${file}`)).body());
  for (const scenario of ["training", "recruitment", "infiltrated"] as Scenario[]) {
    for (const language of ["fr", "en"] as const) {
      const { file } = BOOKLETS[scenario]![language];
      const a5 = SHEETS[scenario].map(s => (language === "en" ? s.en : s).a5!);
      const sheets = await Promise.all(a5.map(v => load(v.file)));
      const all = await load(file);
      expect(all.getPageCount(), file).toBe(sheets.reduce((n, doc) => n + doc.getPageCount(), 0));
      expect(all.getPageCount(), file).toBeGreaterThanOrEqual(8); // une feuille recto verso par document au moins
      expect(all.getTitle(), file).toContain(language === "en" ? "Full booklet" : "Livret complet");
      expect(all.getTitle(), file).not.toMatch(/miroir|mirrored/);
      const outlines = all.catalog.lookup(PDFName.of("Outlines"), PDFDict);
      expect(String(outlines.lookup(PDFName.of("Count"))), file).toBe(String(a5.length)); // un signet par document
    }
  }
});

test("les pages HTML des documents (lues dans l'app) répondent en HTML, avec leurs pages", async ({ request }) => {
  expect(pages.length).toBeGreaterThanOrEqual(14);
  for (const file of pages) {
    const res = await request.get(`fiches/${file}`);
    expect(res.status(), file).toBe(200);
    expect(res.headers()["content-type"], file).toMatch(/^text\/html/);
    const html = await res.text();
    expect(html, file).toContain('class="page');
    expect(html, file).not.toContain('id="app"'); // pas la page de l'app
  }
});

test("404.html du build : copie de index.html (adresses des écrans sur GitHub Pages)", () => {
  expect(existsSync("dist/404.html")).toBe(true);
  expect(readFileSync("dist/404.html", "utf8")).toBe(readFileSync("dist/index.html", "utf8"));
});
