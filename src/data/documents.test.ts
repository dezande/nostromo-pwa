import { AGENT_ID, DOC_REFS, reportNumber } from "./documents";

test("matricule de l'agent au format 7A-2093", () => {
  expect(AGENT_ID).toMatch(/^[1-9][A-Z]-\d{4}$/);
  expect(DOC_REFS.welcome).toContain(`DOSSIER AGENT N° ${AGENT_ID}`);
});

test("numéro de rapport : format fixe, tiré au hasard", () => {
  expect(reportNumber(true)).toMatch(/^ENT-\d{3}-[A-Z]$/);
  expect(reportNumber(false)).toMatch(/^INC-\d{3}-[A-Z]$/);
  expect(new Set(Array.from({ length: 20 }, () => reportNumber(true))).size).toBeGreaterThan(1);
});

test("fiches du protocole numérotées", () => {
  expect(DOC_REFS.rule(3)).toContain("113-03");
});
