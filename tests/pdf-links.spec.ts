// Chaque document du choix du scénario (accueil) existe dans le build : PDF (français et anglais, et en miroir
// pour les documents du Superviseur) et page HTML
// lue dans l'app, servis tels quels (pas la page de l'app à leur place). Et 404.html, qui ouvre l'écran
// demandé sur GitHub Pages, est bien une copie de index.html.
import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { ROLES, SHEETS } from "../src/data/sheets";

const sheets = [...Object.values(SHEETS).flat(), ROLES];
const pdfs = sheets.flatMap(s => [s.file, s.en.file, s.mirrorFile, s.en.mirrorFile]).filter((f): f is string => !!f);
const pages = [...new Set(sheets.flatMap(s => [s.html, s.en.html]))];

test("les PDF des documents, en français et en anglais, existent et sont bien des PDF", async ({ request }) => {
  expect(pdfs.length).toBeGreaterThanOrEqual(38); // 13 documents × 2 langues, + 6 documents du Superviseur × 2 langues en miroir
  expect(new Set(pdfs).size).toBe(pdfs.length);
  for (const file of pdfs) {
    const res = await request.get(`fiches/${file}`);
    expect(res.status(), file).toBe(200);
    expect((await res.body()).subarray(0, 5).toString(), file).toBe("%PDF-");
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
