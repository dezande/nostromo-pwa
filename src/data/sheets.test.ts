// Documents des scénarios : l'aide et le guide du Superviseur ont un PDF miroir, dans les deux langues ;
// les guides portent une bande de scènes clés identique en français et en anglais.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROLES, SHEETS } from "./sheets";
import "../../fiches/scenes.js"; // pose nostromoScenes : les dessins disponibles

const all = [...Object.values(SHEETS).flat(), ROLES];

test("seuls l'aide et le guide du Superviseur ont un PDF miroir, dans les deux langues, au nom distinct", () => {
  for (const sheet of all) {
    const supervisor = sheet.kind === "aid" || sheet.kind === "guide";
    expect([sheet.id, !!sheet.mirrorFile, !!sheet.en.mirrorFile]).toEqual([sheet.id, supervisor, supervisor]);
    if (!supervisor) continue;
    expect(sheet.mirrorFile).toBe(sheet.file.replace(".pdf", "-miroir.pdf"));
    expect(sheet.en.mirrorFile).toBe(sheet.en.file.replace(".pdf", "-mirrored.pdf"));
  }
  const files = all.flatMap(s => [s.file, s.en.file, s.mirrorFile, s.en.mirrorFile]).filter(Boolean);
  expect(new Set(files).size).toBe(files.length);
});

// Scènes clés des guides du Superviseur : la bande de vignettes (fiches/scenes.js) doit être la même en anglais,
// et ne demander que des dessins qui existent.
const fiche = (name: string) => readFileSync(resolve(__dirname, "../../fiches", name), "utf8");
const scenes = (html: string) => [...fiche(html).matchAll(/data-illu="([^"]+)"/g)].map(m => m[1]);

test("chaque guide a ses scènes clés, les mêmes dessins dans le même ordre en anglais, tous définis dans scenes.js", () => {
  const drawings = nostromoScenes.NOMS;
  for (const guide of all.filter(s => s.kind === "guide")) {
    const fr = scenes(guide.html);
    expect(fr.length).toBeGreaterThanOrEqual(4);
    expect(scenes(guide.en.html)).toEqual(fr);
    for (const name of fr) expect(drawings).toContain(name);
    expect(fiche(guide.html)).toContain('<script src="scenes.js"></script>');
    expect(fiche(guide.en.html)).toContain('<script src="scenes.js"></script>');
  }
});
