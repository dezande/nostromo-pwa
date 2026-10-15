// Documents des scénarios : l'aide et le guide du Superviseur ont un PDF miroir, dans les deux langues.
import { ROLES, SHEETS } from "./sheets";

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
