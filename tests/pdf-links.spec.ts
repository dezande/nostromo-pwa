// Chaque document du choix du scénario (accueil) existe dans le build : PDF (français et anglais, en miroir
// pour les documents du Superviseur, en A5 pour tous sauf les cartes, et les deux ensemble), PDF « tout en un »
// par langue, et page HTML lue dans l'app, servis tels quels (pas la page de l'app à leur place). Et 404.html,
// qui ouvre l'écran demandé sur GitHub Pages, est bien une copie de index.html.
import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { PDFDict, PDFDocument, PDFName } from "pdf-lib";
import { ALL_DOCUMENTS, ROLES, SHEETS } from "../src/data/sheets";

const sheets = [...Object.values(SHEETS).flat(), ROLES];
const pdfs = sheets.flatMap(s => [s.file, s.mirrorFile, s.a5?.file, s.a5?.mirrorFile, s.en.file, s.en.mirrorFile, s.en.a5?.file, s.en.a5?.mirrorFile])
  .filter((f): f is string => !!f)
  .concat(Object.values(ALL_DOCUMENTS));
const pages = [...new Set(sheets.flatMap(s => [s.html, s.en.html]))];

test("les PDF des documents, en français et en anglais, existent et sont bien des PDF", async ({ request }) => {
  // 13 documents × 2 langues, + 6 documents du Superviseur × 2 langues en miroir, + 12 documents × 2 langues en A5,
  // + 6 documents du Superviseur × 2 langues en A5 miroir, + le tout en un × 2 langues
  expect(pdfs.length).toBeGreaterThanOrEqual(76);
  expect(new Set(pdfs).size).toBe(pdfs.length);
  for (const file of pdfs) {
    const res = await request.get(`fiches/${file}`);
    expect(res.status(), file).toBe(200);
    expect((await res.body()).subarray(0, 5).toString(), file).toBe("%PDF-");
  }
});

test("le PDF tout en un de chaque langue rassemble les pages A4 de tous les documents, avec des signets", async ({ request }) => {
  for (const [language, file] of Object.entries(ALL_DOCUMENTS)) {
    const a4 = sheets.map(s => (language === "en" ? s.en.file : s.file));
    const expected = (await Promise.all(a4.map(async f => PDFDocument.load(await (await request.get(`fiches/${f}`)).body()))))
      .reduce((n, doc) => n + doc.getPageCount(), 0);
    const all = await PDFDocument.load(await (await request.get(`fiches/${file}`)).body());
    expect(all.getPageCount(), file).toBe(expected);
    expect(all.getTitle(), file).toContain(language === "en" ? "All documents" : "Tous les documents");
    // Un signet par scénario (3) et un pour les cartes : la racine des signets compte au moins ces quatre entrées
    const outlines = all.catalog.lookup(PDFName.of("Outlines"), PDFDict);
    expect(String(outlines.lookup(PDFName.of("Count"))), file).toBe("16"); // 3 scénarios × 4 documents, 3 scénarios, les cartes
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
