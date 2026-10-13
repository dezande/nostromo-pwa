import { SCENARIOS } from "./scenarios";

test("trois scénarios, l'entraînement en premier", () => {
  expect(Object.keys(SCENARIOS)).toEqual(["training", "recruitment", "infiltrated"]);
});

test.each(Object.entries(SCENARIOS))("%s : 4 règles et deux rapports de fin avec la salle", (_id, s) => {
  expect(s.rules).toHaveLength(4);
  expect(s.win.lines.join(" ")).toContain("{room}");
  expect(s.dead.lines.join(" ")).toContain("{room}");
});

test("Infiltré : session disciplinaire, survie avec un message de la C.R.F.", () => {
  const s = SCENARIOS.infiltrated;
  expect(s.firstPanel).toBe("archives");
  expect(s.lastPanel).toBe("email");
  expect(s.rules[3].title).toBe("FIN DE LA SESSION");
  expect(s.rules.flatMap(r => r.points).join(" ")).not.toContain("entraînement");
  expect(s.win.note?.from).toContain("C.R.F.");
});

test("aucun texte ne parle de parité", () => {
  const all = JSON.stringify(SCENARIOS).toLowerCase();
  for (const word of ["parité", "pair", "impair"]) expect(all).not.toContain(word);
});
