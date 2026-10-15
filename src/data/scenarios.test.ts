import { lang } from "../i18n";
import { SCENARIOS, SCENARIO_IDS, scenarioText } from "./scenarios";

const FR = SCENARIOS.fr;

test("trois scénarios, l'entraînement en premier, puis le mode sans scénario", () => {
  expect(SCENARIO_IDS).toEqual(["training", "recruitment", "infiltrated", "free"]);
  expect(Object.keys(SCENARIOS.en)).toEqual(SCENARIO_IDS);
});

test.each(Object.entries({ ...FR, ...Object.fromEntries(Object.entries(SCENARIOS.en).map(([k, v]) => [`${k} (en)`, v])) }))(
  "%s : 4 règles et deux rapports de fin avec la salle", (_id, s) => {
    expect(s.rules).toHaveLength(4);
    expect(s.win.lines.join(" ")).toContain("{room}");
    expect(s.dead.lines.join(" ")).toContain("{room}");
  });

test("Session disciplinaire : survie avec un message de la C.R.F.", () => {
  const s = FR.infiltrated;
  expect(s.firstPanel).toBe("email");
  expect(s.lastPanel).toBe("email");
  expect(s.rules[3].title).toBe("FIN DE LA SESSION");
  expect(s.rules.flatMap(r => r.points).join(" ")).not.toContain("entraînement");
  expect(s.win.note?.from).toContain("C.R.F.");
  expect(SCENARIOS.en.infiltrated.rules[3].title).toBe("END OF THE SESSION");
  expect(SCENARIOS.en.infiltrated.rules.flatMap(r => r.points).join(" ")).not.toContain("training");
});

test("Sans scénario : pas de panneau d'introduction", () => {
  expect(FR.free.firstPanel).toBeNull();
  expect(SCENARIOS.en.free.firstPanel).toBeNull();
});

test("aucun texte ne parle de parité", () => {
  const all = JSON.stringify(SCENARIOS).toLowerCase();
  for (const word of ["parité", "pair", "impair", "parity", "even", "odd"]) expect(all).not.toMatch(new RegExp(`\\b${word}\\b`));
});

test("difficulté croissante pour le joueur, avec une durée indicative", () => {
  expect(Object.values(FR).map(s => s.level)).toEqual(["Débutant", "Intermédiaire", "Confirmé", "Tous niveaux"]);
  expect(Object.values(SCENARIOS.en).map(s => s.level)).toEqual(["Beginner", "Intermediate", "Experienced", "Any level"]);
  for (const s of Object.values(FR)) expect(s.duration).toMatch(/\d+.*min/);
});

test("version anglaise : mêmes panneaux et scènes, textes traduits", () => {
  for (const id of SCENARIO_IDS) {
    const fr = FR[id], en = SCENARIOS.en[id];
    expect([en.firstPanel, en.lastPanel, en.duration]).toEqual([fr.firstPanel, fr.lastPanel, fr.duration]);
    expect(en.rules.map(r => r.scene)).toEqual(fr.rules.map(r => r.scene));
    expect(en.name).not.toBe(fr.name);
  }
});

test("scenarioText suit la langue de l'app", () => {
  lang.value = "en";
  expect(scenarioText("recruitment").name).toBe("A Mere Formality");
  lang.value = "fr";
  expect(scenarioText("recruitment").name).toBe("Une simple formalité");
});
